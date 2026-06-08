// ============================================================
// middleware/authMiddleware.js — JWT verification
// Token lives in an httpOnly cookie (never exposed to JS).
// requireAuth  — any logged-in user
// requireAgent — only users with role='agent'
// optionalAuth — attaches user if logged in, but doesn't block
// ============================================================

const jwt  = require('jsonwebtoken');
const pool = require('../db/pool');

/**
 * Verify JWT from httpOnly cookie.
 * Attaches req.user = { id, name, mobile, role }
 */
async function requireAuth(req, res, next) {
  let token = req.cookies?.findesk_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated. Please log in.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch from DB so stale/deleted users are caught
    const result = await pool.query(
      'SELECT id, name, mobile, role FROM users WHERE id = $1',
      [payload.userId]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Session expired or invalid. Please log in again.',
    });
  }
}

/**
 * Must be agent role. Call after requireAuth.
 */
function requireAgent(req, res, next) {
  if (!req.user || req.user.role !== 'agent') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Agent role required.',
    });
  }
  next();
}

/**
 * Attaches user if cookie present, but never blocks the request.
 * Used by endpoints that behave differently for auth vs anon.
 */
async function optionalAuth(req, res, next) {
  let token = req.cookies?.findesk_token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, mobile, role FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rows.length) req.user = result.rows[0];
  } catch (_) {
    // Invalid token — ignore, continue as unauthenticated
  }
  next();
}

module.exports = { requireAuth, requireAgent, optionalAuth };
