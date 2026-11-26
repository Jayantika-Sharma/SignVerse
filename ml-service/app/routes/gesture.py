from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.predictor import predictor_instance

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

class LandmarkPayload(BaseModel):
    landmarks: List[float]
    signLanguage: str = "ASL"

@router.get("/health")
def ml_health():
    return {
        "status": "OK",
        "service": "SignVerse ML Inference Microservice",
        "modelLoaded": predictor_instance.model is not None,
        "totalClasses": len(predictor_instance.labels)
    }

@router.post("/predict")
def predict_gesture(payload: LandmarkPayload):
    if len(payload.landmarks) != 63:
        raise HTTPException(
            status_code=400,
            detail="Landmark vector must contain exactly 63 floats (21 points * 3 coordinates)"
        )
    result = predictor_instance.predict_from_landmarks(payload.landmarks)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result