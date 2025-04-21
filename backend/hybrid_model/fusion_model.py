import torch
import torch.nn as nn

class FusionModel(nn.Module):
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
