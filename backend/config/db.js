const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/relieflink';
    
    if (!process.env.MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI is not defined; using local MongoDB fallback: mongodb://127.0.0.1:27017/relieflink');
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

    // Automatically promote first existing admin to superadmin if no superadmin exists
    try {
      const User = require('../models/User');
      const superadminCount = await User.countDocuments({ role: 'superadmin' });
      if (superadminCount === 0) {
        const firstAdmin = await User.findOne({ role: 'admin' });
        if (firstAdmin) {
          firstAdmin.role = 'superadmin';
          // Save with validation disabled in case some older accounts have missing non-required fields
          await firstAdmin.save({ validateBeforeSave: false });
          console.log(`👑 Auto-promoted first existing admin (${firstAdmin.email}) to SuperAdmin in the database.`);
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ Could not perform auto-promotion check:', dbErr.message);
    }
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit in production; keep server bootable in local development.
    if (process.env.NODE_ENV === 'production') {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }
  }
};

module.exports = connectDB;