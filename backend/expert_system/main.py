from fastapi import FastAPI
from pydantic import BaseModel
import torch
import pickle
import numpy as np
import faiss
import nltk
from nltk.tokenize import word_tokenize
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from transformers import T5ForConditionalGeneration, T5Tokenizer
from typing import List

# ✅ Ensure punkt is available
nltk.download("punkt")

# ✅ Load BM25, Text Chunks, and FAISS Index
with open("bm25_index.pkl", "rb") as f:
    bm25 = pickle.load(f)

with open("text_chunks.pkl", "rb") as f:
    text_chunks = pickle.load(f)

faiss_index = faiss.read_index("faiss_index.bin")

# ✅ Load models
embedding_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base", resume_download=True)

# ✅ FastAPI app init
app = FastAPI()

# ✅ Request schema
class QueryRequest(BaseModel):
    query: str

# ✅ Hybrid FAISS + BM25 search
def hybrid_search(query_text: str, top_k=10, faiss_weight=0.7, bm25_weight=0.3):
    query_embedding = embedding_model.encode([query_text], convert_to_numpy=True)
    D, faiss_indices = faiss_index.search(query_embedding, top_k)
    faiss_scores = 1 / (D[0] + 1e-5)

    try:
        tokenized_query = word_tokenize(query_text.lower())
    except LookupError:
        nltk.download("punkt")
        tokenized_query = query_text.lower().split()

    bm25_scores_all = bm25.get_scores(tokenized_query)
    bm25_top_indices = np.argsort(bm25_scores_all)[::-1][:top_k]

    hybrid_scores = {}
    for i, idx in enumerate(faiss_indices[0]):
        hybrid_scores[idx] = faiss_weight * faiss_scores[i]
    for idx in bm25_top_indices:
        hybrid_scores[idx] = hybrid_scores.get(idx, 0) + bm25_weight * bm25_scores_all[idx]

    top_indices = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    return [(idx, text_chunks[idx]) for idx, _ in top_indices[:top_k]]

# ✅ Rerank with T5
def rerank_with_t5(query: str, candidates: List[tuple], top_n=3) -> List[str]:
    rerank_inputs = [f"Query: {query}\nPassage: {text}" for _, text in candidates]
    scores = []
    for input_text in rerank_inputs:
        inputs = t5_tokenizer(input_text, return_tensors="pt", truncation=True, padding=True).to("cpu")
        with torch.no_grad():
            outputs = t5_model.generate(**inputs, max_length=5)
        score_text = t5_tokenizer.decode(outputs[0], skip_special_tokens=True)
        score = 1 if "yes" in score_text.lower() else 0
        scores.append(score)

    reranked = sorted(zip(candidates, scores), key=lambda x: x[1], reverse=True)
    return [text for (_, text), _ in reranked[:top_n]]

# ✅ FastAPI endpoint
@app.post("/query")
def query_endpoint(request: QueryRequest):
    query = request.query
    hybrid_results = hybrid_search(query, top_k=10)
    reranked_passages = rerank_with_t5(query, hybrid_results, top_n=3)

    if not reranked_passages:
        return {"query": query, "reranked_passages": ["⚠️ No relevant information found."], "summary": ""}

    return {
        "query": query,
        "reranked_passages": [f"{i+1}. {text}" for i, text in enumerate(reranked_passages)],
        "summary": ""
    }
