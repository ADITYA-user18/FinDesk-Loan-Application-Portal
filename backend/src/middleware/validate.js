// ============================================================
// middleware/validate.js — Server-side input validation
// All inputs are validated before reaching the route handler.
// Returns 400 with a clear JSON error on bad data.
// ============================================================

const VALID_LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];
const VALID_STATUSES  = ['pending', 'approved', 'rejected'];

/**
 * Validates POST /api/applications body.
 */
function validateApplication(req, res, next) {
  const { name, mobile, amount, purpose, language } = req.body;
  const errors = [];

  // Name
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name: must be a non-empty string with at least 2 characters.');
  }

  // Mobile — 10-digit Indian mobile number
  if (!mobile || !/^[6-9]\d{9}$/.test(mobile.toString().trim())) {
    errors.push('mobile: must be a valid 10-digit Indian mobile number starting with 6–9.');
  }

  // Loan amount — minimum ₹1,000, maximum ₹1 Crore
  const parsedAmount = parseFloat(amount);
  if (!amount || isNaN(parsedAmount) || parsedAmount < 1000) {
    errors.push('amount: minimum loan amount is ₹1,000.');
  } else if (parsedAmount > 10_000_000) {
    errors.push('amount: cannot exceed ₹1,00,00,000 (1 Crore).');
  }

  // Purpose
  if (!purpose || typeof purpose !== 'string' || purpose.trim().length < 5) {
    errors.push('purpose: must be at least 5 characters long.');
  }
  if (purpose && purpose.trim().length > 500) {
    errors.push('purpose: cannot exceed 500 characters.');
  }

  // Language
  if (!language || !VALID_LANGUAGES.includes(language)) {
    errors.push(`language: must be one of ${VALID_LANGUAGES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please fix the following errors:',
      errors,
    });
  }

  next();
}

/**
 * Validates PATCH /api/applications/:id/status body.
 */
function validateStatusUpdate(req, res, next) {
  const { status } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status: must be one of ${VALID_STATUSES.join(', ')}.`,
      errors: [`Invalid status value: "${status}"`],
    });
  }

  next();
}

/**
 * Validates ?status= query parameter on GET /api/applications.
 */
function validateStatusFilter(req, res, next) {
  const { status } = req.query;

  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Query param "status" must be one of: ${VALID_STATUSES.join(', ')}.`,
    });
  }

  next();
}

module.exports = { validateApplication, validateStatusUpdate, validateStatusFilter };
