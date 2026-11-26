# 🤟 SignVerse — Bridging Sign Language and Digital Conversations

SignVerse is an AI-powered multimodal communication platform designed to enable seamless, accessible digital interaction for deaf, mute, and hearing individuals. The platform integrates real-time American Sign Language (ASL) gesture recognition, live speech-to-text captioning, text-to-speech synthesis, Discord-like community networking, and WebRTC video conferencing into a single unified web application.

---

## 👥 Team & Responsibilities

| Member | Role | GitHub Profile | Primary Responsibility |
|---|---|---|---|
| **Kaivalya Krishna** | Backend & AI Infrastructure Lead | [@KaivalyaKrishna](https://github.com/KaivalyaKrishna) | Complete Node.js backend, MongoDB schemas, WebRTC signaling, Socket.io, ML microservice architecture, API security |
| **Ira Mal** | Frontend Lead | [@Iram-25](https://github.com/Iram-25) | React.js / Vite user interface, video call layouts, community chat channels, accessible UI components |
| **Ishita Maurya** | Integration Lead | [@ishitamaurya1010-cyber](https://github.com/ishitamaurya1010-cyber) | Frontend-to-Backend linking, Axios API clients, WebSocket event binding, meeting state management |
| **Jayantika Sharma** | Computer Vision & Model Lead | [@Jayantika-Sharma](https://github.com/Jayantika-Sharma) | Camera gesture capture, MediaPipe landmark pipelines, Kaggle deep learning model training |

---

## 🏛️ System Architecture


---

## 🚀 Quick Start Guide (Running the Full System)

### 1. Backend Server (Node.js)
```bash
cd backend
npm install
npm run dev

cd frontend/signverse-react
npm install
npm run dev

cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

