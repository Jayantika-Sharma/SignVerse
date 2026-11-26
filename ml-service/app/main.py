import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routes.gesture import router as gesture_router

load_dotenv()

app = FastAPI(
    title="SignVerse AI Inference Engine",
    description="Microservice for ASL gesture classification across letters, numbers, words, phrases, and statements",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gesture_router)

@app.get("/")
def root():
    return {
        "message": "SignVerse ML Microservice is operational",
        "documentation": "/docs"
    }