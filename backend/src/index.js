// ============================================================
// src/index.js — Vitto Loan Portal Backend Entry Point
//
// Tech: Node.js + Express + PostgreSQL
// Security: helmet, CORS, rate limiting
// ============================================================

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const morgan       = require('morgan');
const cookieParser = require('cookie-parser');

const applicationsRouter = require('./routes/applications');
const summaryRouter      = require('./routes/summary');
const authRouter         = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── HTTP Request Logger (Morgan) ────────────────────────────
// 'dev' format: METHOD URL STATUS TIME  (coloured in terminal)
// Shows 4xx/5xx in red so errors are instantly visible
if (process.env.NODE_ENV === 'production') {
  // Structured format for Render/Railway log aggregators
  app.use(morgan(':remote-addr :method :url :status :res[content-length]B - :response-time ms'));
} else {
  app.use(morgan('dev'));
}

// ─── Security middleware ─────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://fin-desk-loan-application-portal.vercel.app',
  'https://findesk-loan-application-portal.vercel.app',
];

if (process.env.FRONTEND_URL) {
  const envOrigins = process.env.FRONTEND_URL.split(',').map(o => o.trim().replace(/\/$/, ''));
  envOrigins.forEach(origin => {
    if (!allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin "${origin}" not allowed.`));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Required for httpOnly cookies to be sent cross-origin
}));

// ─── Cookie parser ─────────────────────────────────────────
app.use(cookieParser()); // Parses cookies so req.cookies.vitto_token works

// ─── Body parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.',
  },
});
app.use(limiter);

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Vitto Loan Portal API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth',         authRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/summary',      summaryRouter);

// ─── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route "${req.method} ${req.originalUrl}" not found.`,
  });
});

// ─── Global error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'An unexpected error occurred.',
  });
});

// ─── Start server ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║   Vitto Loan Portal API — Running      ║
  ║   Port: ${PORT}                           ║
  ║   Env:  ${(process.env.NODE_ENV || 'development').padEnd(30)}  ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
