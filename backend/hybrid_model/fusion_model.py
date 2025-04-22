import torch
import torch.nn as nn
import torchvision.models as models

class FusionModel(nn.Module):
    def __init__(self, num_meta_features, num_classes):
        super(FusionModel, self).__init__()

        # Load pre-trained Inception v3 model
        inception = models.inception_v3(weights=models.Inception_V3_Weights.DEFAULT, aux_logits=True)
        # Freeze Inception layers if not fine-tuning
        for param in inception.parameters():
            param.requires_grad = False
        # Replace the final fully connected layer
        inception.fc = nn.Identity()
        self.inception = inception

        # Metadata processing branch
        self.meta_fc = nn.Sequential(
            nn.Linear(num_meta_features, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3)
        )

        # Fusion layer
        self.fusion_fc = nn.Sequential(
            nn.Linear(2048 + 64, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.4)
        )

        # Output heads
        self.regression_head = nn.Linear(256, 1)
        self.classification_head = nn.Linear(256, num_classes)

    def forward(self, image, metadata):
        # Image features
        x_img = self.inception(image)
        # Metadata features
        x_meta = self.meta_fc(metadata)
        # Concatenate features
        x = torch.cat((x_img, x_meta), dim=1)
        x = self.fusion_fc(x)
        # Outputs
        regression_output = self.regression_head(x)
        classification_output = self.classification_head(x)
        return regression_output, classification_output
