const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const initializeSocket = require('./socket');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

const io = initializeSocket(server);
app.set('io', io); 

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'SignVerse API & WebSocket Server Running' });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/channels', require('./routes/channel.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/gestures', require('./routes/gesture.routes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`[SignVerse Backend] Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});