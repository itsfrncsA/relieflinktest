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

// Enable trust proxy for reverse proxies (Render, Heroku, Cloudflare, Nginx)
// Ensures express-rate-limit correctly tracks individual client IPs instead of the proxy IP
app.set('trust proxy', 1);

// ============================================================
// SECURITY LAYER 1: HELMET (HTTP Headers)
// ============================================================
// Protects against XSS, clickjacking, MIME sniffing, data leakage, etc.
app.use(helmet({
  crossOriginResourcePolicy: { policy: "same-site" },
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
  xFrameOptions: { action: "sameorigin" },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
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

// Explicit CSP header allowing inline styles and scripts for rendered confirmation pages
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      frameAncestors: ["'none'"]
    }
  })
);


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
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
});

// ============================================================
// SECURITY LAYER 2: RATE LIMITING (Prevents DDoS/Brute Force)
// ============================================================
// Global limiter - all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 3000,                  // 3000 requests per IP to support real-time dashboards and mobile polling
  skip: (req) => {
    // Skip rate limiting for static asset requests, health checks, and APK downloads
    return req.path.endsWith('.apk') || 
           req.path.startsWith('/uploads/') || 
           req.path.startsWith('/api/app/download') ||
           req.path === '/api/health';
  },
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

// Parse JSON & URL-encoded bodies (50mb limit for base64 receipts and proof uploads)
app.use(express.json({
  limit: '50mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static uploaded files (receipts, avatars, proofs)
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/otp', emailOtpRoutes);
app.use('/api/email-otp', emailOtpRoutes);
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
// App Version & In-App Auto-Updater
const fs = require('fs');

app.get('/api/app/version', (req, res) => {
  const protocol = req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const host = req.get('host') || 'localhost:5001';
  const downloadUrl = `${protocol}://${host}/ReliefLink.apk`;

  res.json({
    success: true,
    version: '1.0.6',
    versionCode: 1, // Set to 1 to prevent triggering auto-update dialog on devices
    minVersionCode: 1,
    apkUrl: downloadUrl,
    releaseNotes: 'Direct download available from the web dashboard.',
    releaseDate: '2026-10-21'
  });
});

// Direct APK download route
app.get(['/ReliefLink.apk', '/api/app/download'], (req, res) => {
  const candidatePaths = [
    path.join(__dirname, 'ReliefLink.apk'),
    path.join(__dirname, '..', 'ReliefLink.apk'),
    path.join(__dirname, '..', 'frontend', 'public', 'ReliefLink.apk')
  ];

  for (const apkPath of candidatePaths) {
    if (fs.existsSync(apkPath)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="ReliefLink.apk"');
      return res.sendFile(apkPath);
    }
  }

  res.status(404).json({ success: false, message: 'APK not found' });
});

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

// Initialize auto-expiry and PayMongo instant sync background jobs
const { startAutoExpiryJob } = require('./services/autoExpiryService');
const { startPayMongoSyncJob } = require('./services/paymongoSyncService');

const PORT = dynamicPort || process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  startAutoExpiryJob();
  startPayMongoSyncJob();
});