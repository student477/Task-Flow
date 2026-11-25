const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of hanging
    });
    console.log(`[TaskFlow DB] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[TaskFlow DB Error] Failed to connect: ${error.message}`);
    console.warn(`[TaskFlow DB Warning] Ensure MONGODB_URI is set correctly in environment variables.`);
  }
};

module.exports = connectDB;
