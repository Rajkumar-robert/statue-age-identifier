import io
import traceback
import os
import torchvision.models as models
from torchvision.models import Inception_V3_Weights
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from PIL import Image
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.models import inception_v3, Inception_V3_Weights
import joblib
from fusion_model import FusionModel
from torchvision.models import Inception_V3_Weights


# Initialize FastAPI app
app = FastAPI()

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths
encoder_path = "label_encoders"
scaler_path = "scaler.pkl"
model_path = "fusion_model_1.pth"

# Load label encoders
label_encoders = {}
if os.path.exists(encoder_path):
    for file in os.listdir(encoder_path):
        if file.endswith(".pkl"):
            col = file.replace(".pkl", "")
            label_encoders[col] = joblib.load(os.path.join(encoder_path, file))

# Load scaler
if not os.path.exists(scaler_path):
    raise FileNotFoundError(f"Scaler file not found at {scaler_path}")
scaler = joblib.load(scaler_path)

# Define metadata fields expected
metadata_fields = ['Main Material', 'Context', 'Material & Technique', 'Geographic Context',
                   'Cultural Context', 'Gallery Name', 'Object Type', 'Museum Name', 'Classification']

# Image preprocessing pipeline
transform = transforms.Compose([
    transforms.Resize((299, 299)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
])

# Load image feature extractor (InceptionV3)
weights = Inception_V3_Weights.DEFAULT
inception = models.inception_v3(weights=Inception_V3_Weights.DEFAULT, aux_logits=True)
inception.fc = nn.Identity()
inception.eval()
for param in inception.parameters():
    param.requires_grad = False

# Feature extraction function
def extract_image_features(image: Image.Image) -> torch.Tensor:
    image = transform(image).unsqueeze(0)
    with torch.no_grad():
        features = inception(image)
    return features

# Load trained fusion model
try:
    model = FusionModel(num_meta_features=9, num_classes=9)
    state_dict = torch.load(model_path, map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    main_material: Optional[str] = Form(None),
    context: Optional[str] = Form(None),
    material_technique: Optional[str] = Form(None),
    geographic_context: Optional[str] = Form(None),
    cultural_context: Optional[str] = Form(None),
    gallery_name: Optional[str] = Form(None),
    object_type: Optional[str] = Form(None),
    museum_name: Optional[str] = Form(None),
    classification: Optional[str] = Form(None)
):
    try:
        if image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_features = extract_image_features(img)

        # Prepare metadata
        input_metadata = [
            main_material, context, material_technique, geographic_context,
            cultural_context, gallery_name, object_type, museum_name, classification
        ]

        encoded = []
        for col_name, val in zip(metadata_fields, input_metadata):
            le = label_encoders.get(col_name)
            if le is None or val is None:
                encoded.append(0)
            else:
                try:
                    encoded.append(le.transform([val])[0])
                except:
                    encoded.append(0)

        meta_np = scaler.transform([encoded])
        meta_tensor = torch.tensor(meta_np, dtype=torch.float32)

        # Predict
        with torch.no_grad():
            year_output, class_output = model(img_features, meta_tensor)
            predicted_year = year_output.item()
            estimated_age = 2025 - predicted_year
            predicted_class = class_output.argmax(dim=1).item()

        # Map class index to historical period
        period_labels = [
            "Prehistoric India",
            "Ancient Civilizations",
            "Mahajanapadas & Early Empires",
            "Classical India",
            "Post-Gupta to Early Medieval",
            "Delhi Sultanate",
            "Mughal Empire & Regional Powers",
            "British Period",
            "Independent India"
        ]

        return {
            "predicted_year": round(predicted_year),
            "estimated_age": round(estimated_age),
            "period": period_labels[predicted_class]
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
