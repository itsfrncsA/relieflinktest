const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/relieflink';
    uri = uri.trim().split('\n')[0].trim(); // Sanitize any stray newline or copy-paste glitch
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected successfully to database");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    // Don't crash immediately so server can still serve health check
  }
};

module.exports = connectDB;
