// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');                    // ← Security headers
const rateLimit = require('express-rate-limit');    // ← Rate limiting
const connectDB = require('./config/db');
const emailOtpRoutes = require('./routes/email-otp');

dotenv.config({ silent: true });

// Connect to MongoDB
connectDB();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

// ============================================================
// CORS (must run before rate limiting so preflight succeeds)
// ============================================================
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://relieflink-4w1g.onrender.com',
      'https://relieflink-4a13cb419236.herokuapp.com'
    ];
    
    // Allow all localhost origins (for local development)
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    // Check if origin is in production allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

// ============================================================
// SECURITY LAYER 1: HELMET (HTTP Headers)
// ============================================================
// Protects against XSS, clickjacking, MIME sniffing, etc.
// Disable crossOriginResourcePolicy so the frontend on port 3000 can request receipt images from port 5001.
app.use(helmet({ crossOriginResourcePolicy: false }));

// ============================================================
// SECURITY LAYER 2: RATE LIMITING (Prevents DDoS/Brute Force)
// ============================================================
// Global limiter - all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP
  skip: (req) => req.method === 'OPTIONS',
  message: { 
    success: false, 
    message: 'Too many requests. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
if (isProduction) {
  app.use(globalLimiter);
}

// Strict limiter for authentication (prevents password brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 5,                      // Only 5 attempts
  skip: (req) => req.method === 'OPTIONS',
  skipSuccessfulRequests: true,
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again later.' 
  },
});

// Parse JSON bodies
app.use(express.json());

// Serve static uploads folder for receipt images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============================================================
// EXPLICIT OPTIONS HANDLER (for CORS preflight)
// ============================================================
// Avoid registering '*' directly (some path parsers reject it).
// Instead handle OPTIONS requests via middleware and invoke the CORS handler.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Run the CORS middleware for preflight requests
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  return next();
});

// ============================================================
// SECURITY LAYER 4: SECURITY LOGGING
// ============================================================
// Logs suspicious activity (failed logins, rate limit hits)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log security events
    if (res.statusCode === 401 || res.statusCode === 429 || res.statusCode === 403) {
      console.log(`[SECURITY] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
    }
  });
  next();
});

// ============================================================
// ROUTES (with stricter rate limiting on auth routes)
// ============================================================
if (isProduction) {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/auth/register-mobile', authLimiter);
  app.use('/api/otp/send', authLimiter);
  app.use('/api/otp/verify', authLimiter);
}

app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donation'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/users', require('./routes/user'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/otp', emailOtpRoutes);
app.use('/api/blockchain', require('./routes/blockchain'));
app.use('/api/sectors', require('./routes/sector'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Catch all for invalid routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Synchronize database approved donations to blockchain on startup
const syncBlockchain = async () => {
  try {
    const { getBlockchain } = require('./blockchain');
    const Donation = require('./models/Donations');
    const blockchain = getBlockchain();
    
    // Find all approved donations chronologically
    const approvedDonations = await Donation.find({ verificationStatus: 'approved' }).sort({ createdAt: 1 });
    console.log(`📒 Startup Sync: Found ${approvedDonations.length} approved donations in MongoDB.`);
    
    let syncCount = 0;
    for (const d of approvedDonations) {
      // Check if unique database ID is already logged in blockchain
      if (!blockchain.getDonationById(d._id.toString())) {
        const block = blockchain.addDonation({
          donationId: d._id.toString(),
          donorName: d.donorName,
          amount: d.amount,
          paymentMethod: d.paymentMethod,
          referenceNumber: d.referenceNumber,
          destination: d.destination,
          status: d.verificationStatus
        });
        
        // Update blockId in database if not set
        if (!d.blockId) {
          d.blockId = block.id;
          await d.save();
        }
        syncCount++;
      } else if (!d.blockId) {
        // If block exists but blockId field in DB is missing, update DB
        const existingBlock = blockchain.getDonationById(d._id.toString());
        d.blockId = existingBlock.id;
        await d.save();
      }
    }
    if (syncCount > 0) {
      console.log(`✅ Blockchain synchronized: Added ${syncCount} new donation blocks.`);
    } else {
      console.log(`✅ Blockchain in absolute parity with database. No new blocks to sync.`);
    }
  } catch (err) {
    console.error('❌ Error synchronizing blockchain on boot:', err);
  }
};

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  syncBlockchain();
});