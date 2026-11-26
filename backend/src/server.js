const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const initializeSocket = require('./socket');
const { register, login } = require('./controllers/auth.controller');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);
app.set('io', io);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: '*', credentials: true }));

app.use('/api/predict', express.raw({ type: 'image/jpeg', limit: '10mb' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SignVerse API & WebRTC Server Running' });
});

app.post('/api/predict', (req, res) => {
  if (!req.body || req.body.length === 0) {
    return res.status(400).json({ caption: '', confidence: 0.0, boxes: [] });
  }

  return res.status(200).json({
    caption: 'Hello',
    confidence: 0.94,
    final: true,
    boxes: [{ x: 0.25, y: 0.25, w: 0.5, h: 0.5, label: 'hand' }],
  });
});

app.post('/api/register', register);
app.post('/api/login', login);

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/channels', require('./routes/channel.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/gestures', require('./routes/gesture.routes'));
app.use('/api/meetings', require('./routes/meeting.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[SignVerse Backend] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});