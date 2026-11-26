# SignVerse Backend API Documentation

Welcome to the SignVerse backend service. This server handles authentication, real-time messaging, WebRTC signaling, media storage, and gesture prediction bridging.

## Port Configurations
* Backend Port: `5000`
* Frontend Port: `5173`
* ML Service Port: `8000`

## Available Scripts
```bash
npm install        # Install all dependencies
npm run dev        # Start development server with Nodemon (auto-reload)
npm start          # Run production server
```

## Core API Endpoints

### 1. Authentication
* `POST /api/auth/register` (or `/api/register`)
  * Body: `{ "name": "Name", "email": "email@example.com", "password": "password123" }`
* `POST /api/auth/login` (or `/api/login`)
  * Body: `{ "email": "email@example.com", "password": "password123" }`
* `GET /api/auth/me`
  * Headers: `Authorization: Bearer <token>`
* `PUT /api/auth/preferences`
  * Body: `{ "outputPreference": "both", "preferredSignLanguage": "ASL" }`

### 2. Live Gesture Detection
* `POST /api/predict`
  * Headers: `Content-Type: image/jpeg`
  * Body: Raw binary JPEG buffer
  * Response: `{ "caption": "Hello", "confidence": 0.88, "final": true, "boxes": [...] }`

### 3. Community Channels & Chat
* `GET /api/channels` — List all channels
* `POST /api/channels` — `{ "name": "general", "type": "public" }`
* `GET /api/messages/:channelId` — Get chat history
* `POST /api/messages` — `{ "channelId": "...", "content": "Hello!" }`
* `POST /api/messages/upload` — Multipart form-data with file

### 4. Video Conferencing (WebRTC)
* `POST /api/meetings` — `{ "title": "Team Sync" }`
* `GET /api/meetings/:roomCode` — Fetch meeting details
* `PUT /api/meetings/:roomCode/end` — Host ends the meeting

### 5. Speech & Captions
* `POST /api/speech/synthesize` — `{ "text": "Hello world" }`
* `POST /api/speech/log` — `{ "meetingRoomCode": "...", "transcript": "..." }`