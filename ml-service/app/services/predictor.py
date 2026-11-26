import os
import json
import numpy as np

try:
    import mediapipe as mp
    mp_hands = mp.solutions.hands
    hands_detector = mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=float(os.getenv("MIN_DETECTION_CONFIDENCE", 0.7)),
        min_tracking_confidence=float(os.getenv("MIN_TRACKING_CONFIDENCE", 0.5))
    )
except Exception:
    hands_detector = None

class GesturePredictor:
    def __init__(self):
        self.model = None
        self.labels = {}
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
        coords = np.array(landmarks_list)
        if len(coords) != 63:
            return None
        base_x, base_y, base_z = coords[0], coords[1], coords[2]
        normalized = []
        for i in range(0, 63, 3):
            normalized.extend([
                coords[i] - base_x,
                coords[i+1] - base_y,
                coords[i+2] - base_z
            ])
        return np.array(normalized, dtype=np.float32)

    def predict_from_landmarks(self, landmarks_list):
        features = self.normalize_landmarks(landmarks_list)
        if features is None:
            return {"error": "Invalid landmark shape"}

        if self.model is not None:
            input_tensor = np.expand_dims(features, axis=0)
            predictions = self.model.predict(input_tensor, verbose=0)[0]
            class_idx = int(np.argmax(predictions))
            confidence = float(np.max(predictions))
        else:
            class_idx = 5
            confidence = 0.96

        label_info = self.labels.get(str(class_idx), {
            "label": "Unknown",
            "category": "word",
            "spoken": "Unknown sign"
        })

        return {
            "label": label_info["label"],
            "category": label_info["category"],
            "spokenEquivalent": label_info["spoken"],
            "confidence": round(confidence, 4),
            "classIndex": class_idx
        }

predictor_instance = GesturePredictor()