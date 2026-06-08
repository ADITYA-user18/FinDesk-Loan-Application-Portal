// ============================================================
// routes/summary.js — Dashboard aggregate stats
// GET /api/summary
// Returns: total apps, total loan amount, count per status
// ============================================================

const express = require('express');
const router  = express.Router();
const pool    = require('../db/pool');
const { requireAuth, requireAgent } = require('../middleware/authMiddleware');

router.get('/', requireAuth, requireAgent, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::INTEGER                                               AS total_applications,
        COALESCE(SUM(amount), 0)::NUMERIC                              AS total_amount,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER            AS pending_count,
        COUNT(*) FILTER (WHERE status = 'approved')::INTEGER           AS approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER           AS rejected_count,
        COALESCE(AVG(amount), 0)::NUMERIC                              AS average_amount,
        COALESCE(MAX(amount), 0)::NUMERIC                              AS max_amount
      FROM applications
    `);

    const stats = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        totalApplications: stats.total_applications,
        totalAmount:       parseFloat(stats.total_amount),
        averageAmount:     parseFloat(parseFloat(stats.average_amount).toFixed(2)),
        maxAmount:         parseFloat(stats.max_amount),
        byStatus: {
          pending:  stats.pending_count,
          approved: stats.approved_count,
          rejected: stats.rejected_count,
        },
      },
    });
  } catch (err) {
    console.error('[GET /api/summary] Error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error. Please try again later.',
    });
  }
});

module.exports = router;
