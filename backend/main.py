"""
Sentiment Analysis Dashboard — FastAPI Backend (Static Mode)
All data is pre-computed. No live inference. Just serves JSON files.
"""
import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sentiment Dashboard API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://sentiment-dashboard.vercel.app",
    "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_DIR = Path(__file__).parent / "data" / "exports"

def load(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{filename} not found. Run train_and_export.py first.")
    return json.loads(path.read_text())

@app.get("/")
def root():
    files = [f.name for f in DATA_DIR.glob("*.json")] if DATA_DIR.exists() else []
    return {"status": "ok", "mode": "static", "exported_files": files}

@app.get("/metrics")
def get_metrics():
    return load("metrics.json")

@app.get("/confusion-matrices")
def get_confusion_matrices():
    return load("confusion_matrices.json")

@app.get("/roc-curves")
def get_roc_curves():
    return load("roc_curves.json")

@app.get("/pr-curves")
def get_pr_curves():
    return load("pr_curves.json")

@app.get("/training-history")
def get_training_history():
    return load("training_history.json")

@app.get("/errors")
def get_errors(model: str = None, error_type: str = None, min_confidence: float = 0.0):
    data = load("error_samples.json")
    result = []
    for model_name, errors in data.items():
        for e in errors:
            if model and e.get("model", model_name) != model:
                continue
            if error_type and e.get("error_type", "") != error_type:
                continue
            if e.get("confidence", 0) < min_confidence:
                continue
            e["model"] = e.get("model", model_name)
            result.append(e)
    return result

@app.get("/lime-examples")
def get_lime_examples(model: str = None):
    data = load("lime_examples.json")
    if model:
        return [e for e in data if e.get("model") == model]
    return data

@app.get("/confidence-distribution")
def get_confidence_distribution():
    return load("confidence_dist.json")

@app.get("/feature-importance")
def get_feature_importance(model: str = None):
    data = load("feature_importance.json")
    if model and model in data:
        return {model: data[model]}
    return data

@app.get("/dataset/stats")
def get_dataset_stats():
    return load("dataset_stats.json")

@app.get("/model-agreement")
def get_model_agreement():
    return load("model_agreement.json")
