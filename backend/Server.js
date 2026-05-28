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
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001', 'http://localhost:63089'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};
app.use(cors(corsOptions));

// ============================================================
// SECURITY LAYER 1: HELMET (HTTP Headers)
// ============================================================
// Protects against XSS, clickjacking, MIME sniffing, etc.
app.use(helmet());

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

// ============================================================
// EXPLICIT OPTIONS HANDLER (for CORS preflight)
// ============================================================
// Handle OPTIONS requests from all origins
app.options('*', cors(corsOptions));

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Server running on port ${PORT}`));