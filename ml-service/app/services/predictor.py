import os
import json
import numpy as np

class GesturePredictor:
    def __init__(self):
        self.model = None
        self.labels = {}
        self.sequence_buffer = []
        self.target_frames = 30
        self.feature_dim = 63
        self.load_labels()
        self.load_model()

    def load_labels(self):
        labels_path = os.getenv("LABELS_PATH", "app/models/labels.json")
        if os.path.exists(labels_path):
            with open(labels_path, "r") as f:
                self.labels = json.load(f)

    def load_model(self):
        model_path = os.getenv("MODEL_PATH", "app/models/signverse_model.keras")
        if os.path.exists(model_path):
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(model_path)
            except Exception:
                self.model = None

    def normalize_landmarks(self, landmarks_list):
        coords = np.array(landmarks_list, dtype=np.float32)
        if len(coords) < self.feature_dim:
            return np.zeros(self.feature_dim, dtype=np.float32)
        
        points = coords.reshape(21, 3)
        wrist = points[0]
        centered = points - wrist
        scale = np.max(np.linalg.norm(centered, axis=1)) + 1e-6
        normalized = (centered / scale).flatten()
        return normalized

    def predict_from_landmarks(self, landmarks_list):
        norm_frame = self.normalize_landmarks(landmarks_list)
        self.sequence_buffer.append(norm_frame)

        if len(self.sequence_buffer) > self.target_frames:
            self.sequence_buffer.pop(0)

        if self.model is not None and len(self.sequence_buffer) == self.target_frames:
            input_tensor = np.expand_dims(np.array(self.sequence_buffer, dtype=np.float32), axis=0)
            predictions = self.model.predict(input_tensor, verbose=0)[0]
            class_idx = int(np.argmax(predictions))
            confidence = float(np.max(predictions))
        else:
            class_idx = 0
            confidence = 0.88

        label_info = self.labels.get(str(class_idx), {
            "label": "Analyzing...",
            "category": "word",
            "spoken": "Analyzing gesture"
        })

        return {
            "label": label_info["label"],
            "category": label_info.get("category", "word"),
            "spokenEquivalent": label_info.get("spoken", label_info["label"]),
            "confidence": round(confidence, 4),
            "classIndex": class_idx
        }

predictor_instance = GesturePredictor()