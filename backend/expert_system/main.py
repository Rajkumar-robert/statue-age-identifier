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
import re

# ✅ Download punkt (only if English is detected)
nltk.download("punkt", quiet=True)

# ✅ Load indexes
with open("bm25_index.pkl", "rb") as f:
    bm25 = pickle.load(f)

with open("text_chunks.pkl", "rb") as f:
    text_chunks = pickle.load(f)

faiss_index = faiss.read_index("faiss_index.bin")

# ✅ Load models
embedding_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
t5_tokenizer = T5Tokenizer.from_pretrained("google/flan-t5-base")
t5_model = T5ForConditionalGeneration.from_pretrained("google/flan-t5-base")

app = FastAPI()

class QueryRequest(BaseModel):
    query: str

# ✅ Language detector (simple heuristic)
def is_english(text):
    return bool(re.search(r'[a-zA-Z]', text))

# ✅ Hybrid Search (FAISS + BM25)
def hybrid_search(query_text, top_k=10, faiss_weight=0.7, bm25_weight=0.3):
    query_embedding = embedding_model.encode([query_text], convert_to_numpy=True)

    # FAISS search
    D, faiss_indices = faiss_index.search(query_embedding, top_k)
    faiss_scores = 1 / (D[0] + 1e-5)

    # BM25 search
    if is_english(query_text):
        try:
            tokenized_query = word_tokenize(query_text.lower(), language="english")
        except LookupError:
            nltk.download("punkt")
            tokenized_query = word_tokenize(query_text.lower(), language="english")
    else:
        tokenized_query = query_text.lower().split()  # Tamil: basic whitespace split

    bm25_scores_all = bm25.get_scores(tokenized_query)
    bm25_top_indices = np.argsort(bm25_scores_all)[::-1][:top_k]

    # Combine scores
    hybrid_scores = {}
    for i, idx in enumerate(faiss_indices[0]):
        hybrid_scores[idx] = faiss_weight * faiss_scores[i]

    for idx in bm25_top_indices:
        hybrid_scores[idx] = hybrid_scores.get(idx, 0) + bm25_weight * bm25_scores_all[idx]

    top_indices = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    return [(idx, text_chunks[idx]) for idx, _ in top_indices[:top_k]]

# ✅ Reranking
def rerank_with_t5(query, candidates, top_n=5):
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
    return [text for (idx, text), _ in reranked[:top_n]]

# ✅ Summarization
def summarize_passages(passages):
    combined_text = " ".join(passages)
    input_text = f"summarize: {combined_text}"
    inputs = t5_tokenizer(input_text, return_tensors="pt", truncation=True, padding=True, max_length=512).to("cpu")
    with torch.no_grad():
        summary_ids = t5_model.generate(**inputs, max_length=100)
    return t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)

# ✅ API Route
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
