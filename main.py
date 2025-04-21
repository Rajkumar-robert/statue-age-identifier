from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import torch
import torch.nn as nn
import pickle
import numpy as np
import faiss
import nltk
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from transformers import T5ForConditionalGeneration, T5Tokenizer
from PIL import Image
from io import BytesIO
import torchvision.transforms as transforms
import torchvision.models as models

# ========== CORS CONFIG ==========
app = FastAPI()
origins = [
    "http://localhost:3000",  # local Next.js dev
    "http://127.0.0.1:3000",
    "https://your-frontend-domain.com",  # replace with deployed domain if any
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== HYBRID MODEL ==========
IMG_DIM = 2048
META_FEATURES = [
    'Main Material', 'Context', 'Material & Technique', 'Geographic Context',
    'Cultural Context', 'Object Type'
]
META_DIM = len(META_FEATURES)
HIDDEN_DIM = 256

class FusionMultiTaskModel(nn.Module):
    def __init__(self, img_dim, meta_dim, hidden_dim, num_classes):
        super().__init__()
        self.img_fc = nn.Linear(img_dim, hidden_dim)
        self.meta_fc = nn.Linear(meta_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.3)
        self.shared = nn.Linear(hidden_dim * 2, hidden_dim)
        self.reg_head = nn.Linear(hidden_dim, 1)
        self.cls_head = nn.Linear(hidden_dim, num_classes)

    def forward(self, img_feat, meta_feat):
        x1 = self.relu(self.img_fc(img_feat))
        x2 = self.relu(self.meta_fc(meta_feat))
        x = torch.cat((x1, x2), dim=1)
        x = self.dropout(self.relu(self.shared(x)))
        return self.reg_head(x), self.cls_head(x)

with open("label_encoders.pkl", "rb") as f:
    label_encoders = pickle.load(f)
with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)
with open("label_encoder.pkl", "rb") as f:
    classification_label_encoder = pickle.load(f)

model = FusionMultiTaskModel(IMG_DIM, META_DIM, HIDDEN_DIM, len(classification_label_encoder.classes_))
model.load_state_dict(torch.load("fusion_model.pth", map_location="cpu"))
model.eval()

inception = models.inception_v3(pretrained=True, aux_logits=False)
inception.fc = nn.Identity()
for param in inception.parameters():
    param.requires_grad = False
inception.eval()

transform = transforms.Compose([
    transforms.Resize((299, 299)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

def extract_image_features(image: Image.Image) -> torch.Tensor:
    image = transform(image).unsqueeze(0)
    with torch.no_grad():
        features = inception(image)
    return features

def preprocess_metadata_input(meta_dict: dict) -> torch.Tensor:
    encoded = []
    for feature in META_FEATURES:
        value = meta_dict.get(feature)
        if value is None:
            raise HTTPException(status_code=400, detail=f"Missing required metadata: {feature}")
        le = label_encoders.get(feature)
        try:
            encoded_val = le.transform([value])[0]
        except ValueError:
            encoded_val = le.transform(["Unknown"])[0]
        encoded.append(encoded_val)
    scaled = scaler.transform([encoded]).astype(np.float32)
    return torch.tensor(scaled)

def map_period(year: float) -> str:
    if year < -3000:
        return "Prehistoric India"
    elif -3000 <= year < -600:
        return "Ancient Civilizations"
    elif -600 <= year < -320:
        return "Mahajanapadas & Early Empires"
    elif -320 <= year < 550:
        return "Classical India"
    elif 550 <= year < 1206:
        return "Post-Gupta to Early Medieval"
    elif 1206 <= year < 1526:
        return "Delhi Sultanate"
    elif 1526 <= year < 1857:
        return "Mughal Empire & Regional Powers"
    elif 1857 <= year < 1947:
        return "British Period"
    else:
        return "Independent India"

class PredictResponse(BaseModel):
    predicted_year: float
    predicted_period: str
    estimated_age: float

@app.post("/predict", response_model=PredictResponse)
async def predict(
    file: UploadFile = File(...),
    main_material: str = Form(...),
    context: str = Form(...),
    material_and_technique: str = Form(...),
    geographic_context: str = Form(...),
    cultural_context: str = Form(...),
    gallery_name: str = Form(...),
    object_type: str = Form(...),
    museum_name: str = Form(...),
    classification: str = Form(...)
):
    meta_dict = {
        'Main Material': main_material,
        'Context': context,
        'Material & Technique': material_and_technique,
        'Geographic Context': geographic_context,
        'Cultural Context': cultural_context,
        'Gallery Name': gallery_name,
        'Object Type': object_type,
        'Museum Name': museum_name,
        'Classification': classification
    }

    image = Image.open(BytesIO(await file.read())).convert("RGB")
    img_feat = extract_image_features(image)
    meta_feat = preprocess_metadata_input(meta_dict)

    with torch.no_grad():
        reg_output, cls_output = model(img_feat, meta_feat)
        predicted_year = float(np.expm1(reg_output.item()))
        predicted_period = classification_label_encoder.inverse_transform([torch.argmax(cls_output).item()])[0]
        current_year = datetime.now().year
        estimated_age = current_year - predicted_year

    return {
        "predicted_year": round(predicted_year, 2),
        "predicted_period": predicted_period,
        "estimated_age": round(estimated_age, 2)
    }

# ========== EXPERT SYSTEM ==========
nltk.download("punkt")

with open("bm25_index.pkl", "rb") as f:
    bm25 = pickle.load(f)
with open("text_chunks.pkl", "rb") as f:
    text_chunks = pickle.load(f)
faiss_index = faiss.read_index("faiss_index.bin")

embedding_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")

class QueryRequest(BaseModel):
    query: str

@app.post("/query")
def query_endpoint(request: QueryRequest):
    query = request.query
    hybrid_results = hybrid_search(query)
    reranked = rerank_with_t5(query, hybrid_results, top_n=3)
    summary = summarize_passages(reranked)
    numbered_passages = [f"{i+1}. {text}" for i, text in enumerate(reranked)]
    return {
        "query": query,
        "reranked_passages": numbered_passages,
        "summary": summary
    }

def hybrid_search(query_text, top_k=10, faiss_weight=0.7, bm25_weight=0.3):
    query_embedding = embedding_model.encode([query_text], convert_to_numpy=True)
    D, faiss_indices = faiss_index.search(query_embedding, top_k)
    faiss_scores = 1 / (D[0] + 1e-5)
    tokenized_query = word_tokenize(query_text.lower())
    bm25_scores_all = bm25.get_scores(tokenized_query)
    bm25_top_indices = np.argsort(bm25_scores_all)[::-1][:top_k]

    hybrid_scores = {}
    for i, idx in enumerate(faiss_indices[0]):
        hybrid_scores[idx] = faiss_weight * faiss_scores[i]
    for idx in bm25_top_indices:
        hybrid_scores[idx] = hybrid_scores.get(idx, 0) + bm25_weight * bm25_scores_all[idx]

    top_indices = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    return [(idx, text_chunks[idx]) for idx, _ in top_indices[:top_k]]

def rerank_with_t5(query, candidates, top_n=5):
    rerank_inputs = [
        f"Query: {query}\nPassage: {text}" for _, text in candidates
    ]
    scores = []
    for input_text in rerank_inputs:
        inputs = t5_tokenizer(input_text, return_tensors="pt", truncation=True, padding=True).to("cpu")
        with torch.no_grad():
            outputs = t5_model.generate(**inputs, max_length=5)
        score_text = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
        score = 1 if "yes" in score_text.lower() else 0
        scores.append(score)
    reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [text for (idx, text), _ in reranked[:top_n]]

def summarize_passages(passages):
    combined_text = " ".join(passages)
    input_text = f"summarize: {combined_text}"
    inputs = t5_tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512).to("cpu")
    with torch.no_grad():
        summary_ids = t5_model.generate(**inputs, max_length=100)
    return t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
