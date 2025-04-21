import io
import traceback
from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from PIL import Image
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms
import joblib
import os
from fusion_model import FusionModel  # Ensure this file exists and has the model class

# Initialize FastAPI app
app = FastAPI()

# CORS middleware for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load encoders and scaler
label_encoders = {}
encoder_path = "label_encoders"
scaler_path = "scaler.pkl"
model_path = "fusion_model.pth"

# Load label encoders
if os.path.exists(encoder_path):
    for file in os.listdir(encoder_path):
        if file.endswith(".pkl"):
            col = file.replace(".pkl", "")
            label_encoders[col] = joblib.load(os.path.join(encoder_path, file))

# Load scaler
if not os.path.exists(scaler_path):
    raise FileNotFoundError(f"Scaler file not found at {scaler_path}")
scaler = joblib.load(scaler_path)

# Define image transform
transform = transforms.Compose([
    transforms.Resize((299, 299)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

# Define and load the model
try:
    model = FusionModel(
        img_dim=2048,       # Feature size from InceptionV3
        meta_dim=9,         # Number of metadata features
        hidden_dim=512,     # Hidden layer size (tune if needed)
        num_classes=9       # Number of historical periods
    )
    state_dict = torch.load("fusion_model.pth", map_location=torch.device("cpu"))
    model.load_state_dict(state_dict)
    model.eval()
except Exception as e:
    raise RuntimeError(f"Failed to load model: {e}")


# Define metadata fields expected
metadata_fields = ['Main Material', 'Context', 'Material & Technique', 'Geographic Context',
                   'Cultural Context', 'Gallery Name', 'Object Type', 'Museum Name', 'Classification']

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
        # Validate file
        if image.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(status_code=400, detail="Invalid image format.")

        image_bytes = await image.read()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0)

        # Dummy image features if needed — replace with actual CNN extractor if applicable
        img_features = torch.randn(1, 2048)  # Replace with your Inception feature extractor

        # Process metadata
        input_metadata = [
            main_material, context, material_technique, geographic_context,
            cultural_context, gallery_name, object_type, museum_name, classification
        ]

        encoded = []
        for col_name, val in zip(metadata_fields, input_metadata):
            le = label_encoders.get(col_name)
            if le is None or val is None:
                encoded.append(0)  # Use 0 for unknown or missing
            else:
                try:
                    encoded.append(le.transform([val])[0])
                except:
                    encoded.append(0)

        # Scale metadata
        meta_np = scaler.transform([encoded])
        meta_tensor = torch.tensor(meta_np, dtype=torch.float32)

        # Predict
        with torch.no_grad():
            output = model(img_features, meta_tensor)
            predicted_year = output[0].item()
            estimated_age = 2025 - predicted_year

        # Classify period based on predicted year
        def classify_period(year):
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

        return {
            "predicted_year": round(predicted_year),
            "estimated_age": round(estimated_age),
            "period": classify_period(predicted_year)
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
