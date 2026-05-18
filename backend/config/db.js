const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not defined in .env file');
      process.exit(1);
    }
    
    console.log('Connecting to MongoDB Atlas...');
    
    // Remove deprecated options - they're not needed in Mongoose 7+
    await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected to Atlas`);
    console.log(`✅ Database Host: ${mongoose.connection.host}`);
    console.log(`✅ Database Name: ${mongoose.connection.name || 'relieflink'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't exit the process on connection error in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
  }
};

module.exports = connectDB;