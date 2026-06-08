// ============================================================
// routes/auth.js — Register, Login, Logout, Me
// POST /api/auth/register
// POST /api/auth/login
// POST /api/auth/logout
// GET  /api/auth/me
// ============================================================

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const router   = express.Router();
const pool     = require('../db/pool');
const { requireAuth } = require('../middleware/authMiddleware');

const COOKIE_NAME = 'findesk_token';

function getCookieOpts(req) {
  const host = req.headers.host || '';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  return {
    httpOnly: true,
    secure: !isLocal,
    sameSite: isLocal ? 'lax' : 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ─── POST /api/auth/register ─────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, mobile, password, role = 'borrower' } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('name: must be at least 2 characters.');
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile.toString().trim()))
    errors.push('mobile: must be a valid 10-digit Indian mobile number.');
  if (!password || password.length < 6)
    errors.push('password: must be at least 6 characters.');
  if (!['borrower', 'agent'].includes(role))
    errors.push('role: must be borrower or agent.');

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation failed.', errors });
  }

  try {
    // Check if mobile already registered
    const existing = await pool.query(
      'SELECT id FROM users WHERE mobile = $1',
      [mobile.trim()]
    );
    if (existing.rows.length) {
      return res.status(409).json({
        success: false,
        message: 'This mobile number is already registered. Please log in.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, mobile, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, mobile, role, created_at`,
      [name.trim(), mobile.trim(), passwordHash, role]
    );

    const user  = result.rows[0];
    const token = signToken(user.id);

    res.cookie(COOKIE_NAME, token, getCookieOpts(req));
    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    console.error('[POST /api/auth/register]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({
      success: false,
      message: 'Mobile number and password are required.',
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, mobile, role, password_hash FROM users WHERE mobile = $1',
      [mobile.toString().trim()]
    );

    if (!result.rows.length) {
      return res.status(401).json({
        success: false,
        message: 'Mobile number not registered. Please sign up.',
      });
    }

    const user        = result.rows[0];
    const passwordOk  = await bcrypt.compare(password, user.password_hash);

    if (!passwordOk) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.',
      });
    }

    const token = signToken(user.id);
    res.cookie(COOKIE_NAME, token, getCookieOpts(req));

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role },
    });
  } catch (err) {
    console.error('[POST /api/auth/login]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, getCookieOpts(req));
  return res.status(200).json({ success: true, message: 'Logged out.' });
});

// ─── GET /api/auth/me ────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user, // { id, name, mobile, role }
  });
});

module.exports = router;
