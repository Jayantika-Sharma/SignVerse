const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.log('[MongoDB] Running in offline/disconnected mode. Start MongoDB service or provide a valid Atlas URI in .env');
  }
};

module.exports = connectDB;