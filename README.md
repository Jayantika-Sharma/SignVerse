# 🤟 SignVerse — Bridging Sign Language and Digital Conversations

SignVerse is an AI-powered multimodal communication platform designed to enable seamless, accessible digital interaction for deaf, mute, and hearing individuals. The platform integrates real-time American Sign Language (ASL) gesture recognition, live speech-to-text captioning, text-to-speech synthesis, Discord-like community networking, and WebRTC video conferencing into a single unified web application.

---

## 👥 Team & Responsibilities

| Member | Role | GitHub Profile | Primary Responsibility |
|---|---|---|---|
| **Ira Mal** | Frontend Lead | [@Iram-25](https://github.com/Iram-25) | React.js / Vite user interface, video call layouts, community chat channels, accessible UI components |
| **Ishita Maurya** | Integration Lead | [@ishitamaurya1010-cyber](https://github.com/ishitamaurya1010-cyber) | Frontend-to-Backend linking, Axios API clients, WebSocket event binding, meeting state management |
| **Jayantika Sharma** | Computer Vision & Model Lead | [@Jayantika-Sharma](https://github.com/Jayantika-Sharma) | Camera gesture capture, MediaPipe landmark pipelines, Kaggle deep learning model training |
| **Kaivalya Krishna** | Backend & AI Infrastructure Lead | [@KaivalyaKrishna](https://github.com/KaivalyaKrishna) | Complete Node.js backend, MongoDB schemas, WebRTC signaling, Socket.io, ML microservice architecture, API security |

---

## 🏛️ System Architecture

[React 19 Frontend (:5173)] │ ├─── HTTP REST APIs ────► [Node.js Express Server (:5000)] ──► [MongoDB Database] │ │ ├─── WebSockets (Socket.io) ────────┤ (Signaling, Chat, Presence) │ │ └─── Live Camera Frames (8 FPS) ────┼──► [FastAPI ML Service (:8000)] │ ▼ [Trained Model (.keras)] (1D-CNN + BiLSTM, 87.5% Acc)

---
## 🚀 Quick Start Guide (Running the Full System)
### 1. Backend Server (Node.js)
```bash
cd backend
npm install
npm run dev
Runs on: http://localhost:5000
Features: JWT Auth, MongoDB, WebRTC Signaling, Socket.io Chat, Media Uploads.
2. Frontend Application (React / Vite)
bash
cd frontend/signverse-react
npm install
npm run dev
Runs on: http://localhost:5173
Automatically proxies all /api/* requests to port 5000.
3. ML Inference Microservice (Python FastAPI)
bash
cd ml-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
Runs on: http://localhost:8000
Interactive API Documentation: http://localhost:8000/docs
📡 API Reference for Frontend Integration (Ishita's Guide)
Authentication
POST /api/auth/register (or /api/register) — Register new account
POST /api/auth/login (or /api/login) — Log in and receive JWT token
GET /api/auth/me — Get logged-in user profile (Bearer Token required)
PUT /api/auth/preferences — Update sign language preferences (text, speech, both)
Community & Chat
GET /api/channels — List all channels
POST /api/channels — Create new channel
GET /api/messages/:channelId — Get message history
POST /api/messages — Send message (text, media, or gesture-interpreted)
POST /api/messages/upload — Upload files, images, or audio
Video Meetings (WebRTC)
POST /api/meetings — Create new video meeting room code
GET /api/meetings/:roomCode — Fetch meeting details and status
PUT /api/meetings/:roomCode/end — End active meeting
Sign Detection
POST /api/predict — Accepts live JPEG frame buffer (8 FPS), returns { caption, confidence, final, boxes }
GET /api/gestures — Fetch supported dictionary signs (letters, numbers, words, phrases, statements)
⚡ Real-Time WebSocket Events (Socket.io)
Community Chat
join_channel / leave_channel — Join or leave a room
send_message ➔ broadcasts new_message
typing_start / typing_stop ➔ broadcasts user_typing

Video Meetings & WebRTC
join_meeting ➔ emits current_meeting_users, broadcasts user_joined_meeting
meeting_offer / meeting_answer / ice_candidate — Peer-to-peer WebRTC connection
broadcast_gesture_live ➔ broadcasts live_gesture_received (sub-second caption overlay)
broadcast_speech_caption ➔ broadcasts live_caption_received (STT captions)
raise_hand / send_meeting_reaction — In-call interactive controls