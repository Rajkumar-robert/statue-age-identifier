import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from fusion_model import FusionModel
import joblib

# === Load features and targets ===
X_img = np.load("train_features.npy")          # shape: (N, 2048)
X_meta = np.load("X_metadata_scaled.npy")      # shape: (N, 9)
y_years = np.load("y_regression.npy")          # shape: (N,)

# === Period Mapping ===
def map_to_period(year):
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

y_periods = np.array([map_to_period(y) for y in y_years])
le = LabelEncoder()
y_classes = le.fit_transform(y_periods)

# Save LabelEncoder for inference
joblib.dump(le, "label_encoder.pkl")

# === Train/Test Split ===
X_img_train, X_img_val, X_meta_train, X_meta_val, y_years_train, y_years_val, y_classes_train, y_classes_val = train_test_split(
    X_img, X_meta, y_years, y_classes, test_size=0.2, random_state=42
)

# === Convert to PyTorch Tensors ===
X_img_train = torch.tensor(X_img_train, dtype=torch.float32)
X_meta_train = torch.tensor(X_meta_train, dtype=torch.float32)
y_years_train = torch.tensor(y_years_train, dtype=torch.float32)
y_classes_train = torch.tensor(y_classes_train, dtype=torch.long)

X_img_val = torch.tensor(X_img_val, dtype=torch.float32)
X_meta_val = torch.tensor(X_meta_val, dtype=torch.float32)
y_years_val = torch.tensor(y_years_val, dtype=torch.float32)
y_classes_val = torch.tensor(y_classes_val, dtype=torch.long)

# === Model, Loss, Optimizer ===
model = FusionModel(num_meta_features=9, num_classes=len(le.classes_))
reg_criterion = nn.MSELoss()
cls_criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

# === Training Loop ===
epochs = 50
for epoch in range(epochs):
    model.train()
    optimizer.zero_grad()
    reg_output, cls_output = model(X_img_train, X_meta_train)
    loss_reg = reg_criterion(reg_output, y_years_train)
    loss_cls = cls_criterion(cls_output, y_classes_train)
    loss = loss_reg + loss_cls
    loss.backward()
    optimizer.step()

    # Evaluation
    model.eval()
    with torch.no_grad():
        val_reg, val_cls = model(X_img_val, X_meta_val)
        val_loss_reg = reg_criterion(val_reg, y_years_val)
        val_loss_cls = cls_criterion(val_cls, y_classes_val)
        val_loss = val_loss_reg + val_loss_cls

    print(f"Epoch {epoch+1}/{epochs} - Loss: {loss.item():.4f} - Val Loss: {val_loss.item():.4f}")

# === Save model ===
torch.save(model.state_dict(), "fusion_model_1.pth")
print("Model saved as fusion_model.pth")
