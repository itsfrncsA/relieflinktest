// server.js
const dynamicPort = process.env.PORT; // Capture Heroku dynamic port before dotenv
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
// Protects against XSS, clickjacking, MIME sniffing, data leakage, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      frameAncestors: ["'none'"],
    },
  },
  xFrameOptions: { action: "deny" },
  xContentTypeOptions: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  strictTransportSecurity: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  permissionsPolicy: {
    features: {
      accelerometer: ["'none'"],
      autoplay: ["'none'"],
      camera: ["'none'"],
      displayCapture: ["'none'"],
      encryptedMedia: ["'none'"],
      fullscreen: ["'self'"],
      geolocation: ["'none'"],
      gyroscope: ["'none'"],
      magnetometer: ["'none'"],
      microphone: ["'none'"],
      midi: ["'none'"],
      payment: ["'none'"],
      pictureInPicture: ["'none'"],
      publickeyCredentialsGet: ["'none'"],
      syncXhr: ["'none'"],
      usb: ["'none'"],
      xrSpatialTracking: ["'none'"]
    }
  }
}));

// Additional middleware to guarantee all security headers and legacy scanner support
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), sync-xhr=(), usb=(), xr-spatial-tracking=()'
  );
  res.setHeader(
    'Feature-Policy',
    "accelerometer 'none'; autoplay 'none'; camera 'none'; display-capture 'none'; encrypted-media 'none'; fullscreen 'self'; geolocation 'none'; gyroscope 'none'; magnetometer 'none'; microphone 'none'; midi 'none'; payment 'none'; picture-in-picture 'none'; usb 'none'"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

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
const corsOptions = {
  origin: (origin, callback) => {
    // Dynamically allow the requesting origin (Flutter Web, Render, Localhost, Mobile)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

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
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/users', require('./routes/user'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/sectors', require('./routes/sectors'));
app.use('/api/cash-advances', require('./routes/cash-advances'));
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

const PORT = dynamicPort || process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  startAutoExpiryJob();
});