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

// ============================================================
// SECURITY LAYER 1: HELMET (HTTP Headers)
// ============================================================
// Protects against XSS, clickjacking, MIME sniffing, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// ============================================================
// SECURITY LAYER 2: RATE LIMITING (Prevents DDoS/Brute Force)
// ============================================================
// Global limiter - all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 200,                   // 200 requests per IP
  message: { 
    success: false, 
    message: 'Too many requests. Please try again later.' 
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Strict limiter for authentication (prevents password brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 20,                     // 20 attempts
  skipSuccessfulRequests: true,
  message: { 
    success: false, 
    message: 'Too many login attempts. Please try again later.' 
  },
});

// ============================================================
// SECURITY LAYER 3: CORS
// ============================================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow mobile apps, curl, Postman (requests with no origin)
    if (!origin) return callback(null, true);

    // Allow any localhost / 127.0.0.1 port (for Flutter web, React, Vite)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Parse JSON bodies
app.use(express.json());

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
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/otp/send', authLimiter);
app.use('/api/otp/verify', authLimiter);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/donations', require('./routes/donation'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/users', require('./routes/user'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/otp', emailOtpRoutes);

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

// Initialize auto-expiry job for abandoned pending donations
const { startAutoExpiryJob } = require('./services/autoExpiryService');

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  startAutoExpiryJob();
});