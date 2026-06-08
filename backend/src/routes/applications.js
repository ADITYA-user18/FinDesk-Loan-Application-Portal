// ============================================================
// routes/applications.js — All application-related API routes
//
// AUTH RULES:
//   POST   — any logged-in user (borrower or agent)
//   GET    — borrower sees own; agent sees all
//   PATCH  — agent only
//   GET /api/summary — agent sees all stats; borrower sees own
// ============================================================

const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');
const { validateApplication, validateStatusUpdate, validateStatusFilter } = require('../middleware/validate');
const { requireAuth, requireAgent } = require('../middleware/authMiddleware');

// ─────────────────────────────────────────────────────────────
// POST /api/applications — Submit a new loan application
// Requires: any authenticated user
// user_id linked from JWT so borrower's applications are tracked
// ─────────────────────────────────────────────────────────────
router.post('/', requireAuth, validateApplication, async (req, res) => {
  const { name, mobile, amount, purpose, language } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO applications (name, mobile, amount, purpose, language, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, mobile, amount, purpose, language, status, created_at`,
      [name.trim(), mobile.trim(), parseFloat(amount), purpose.trim(), language, req.user.id]
    );

    const application = result.rows[0];
    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully.',
      data: application,
      reference: application.id,
    });
  } catch (err) {
    console.error('[POST /api/applications]', err.message);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/applications — List applications
// Agent  → all applications
// Borrower → only their own (user_id = req.user.id)
// ─────────────────────────────────────────────────────────────
router.get('/', requireAuth, validateStatusFilter, async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;
  const isAgent = req.user.role === 'agent';

  const conditions = [];
  const params     = [];
  let   idx        = 1;

  // Borrowers only see their own applications
  if (!isAgent) {
    conditions.push(`user_id = $${idx++}`);
    params.push(req.user.id);
  }

  if (status) {
    conditions.push(`status = $${idx++}`);
    params.push(status);
  }

  if (search?.trim()) {
    conditions.push(`(LOWER(name) LIKE $${idx} OR mobile LIKE $${idx + 1})`);
    params.push(`%${search.trim().toLowerCase()}%`, `%${search.trim()}%`);
    idx += 2;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const pageNum  = Math.max(1, parseInt(page, 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const offset   = (pageNum - 1) * pageSize;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM applications ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(pageSize, offset);
    const result = await pool.query(
      `SELECT id, name, mobile, amount, purpose, language, status, created_at, user_id
       FROM applications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      role: req.user.role,
      pagination: { total, page: pageNum, limit: pageSize, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (err) {
    console.error('[GET /api/applications]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PATCH /api/applications/:id/status — Update status
// Agent only
// ─────────────────────────────────────────────────────────────
router.patch('/:id/status', requireAuth, requireAgent, validateStatusUpdate, async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return res.status(400).json({ success: false, message: 'Invalid application ID format.' });
  }

  try {
    const result = await pool.query(
      `UPDATE applications SET status = $1 WHERE id = $2
       RETURNING id, name, mobile, amount, purpose, language, status, created_at`,
      [status, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: `Application "${id}" not found.` });
    }

    return res.status(200).json({
      success: true,
      message: `Status updated to "${status}".`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('[PATCH /api/applications/:id/status]', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
