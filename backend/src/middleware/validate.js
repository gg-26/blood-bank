const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['donor', 'admin', 'hospital']).withMessage('Invalid role'),
  body('blood_group').optional().isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood group'),
  handleValidationErrors
];

/**
 * Validation rules for login
 */
const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for blood inventory
 */
const validateBloodInventory = [
  body('blood_type').isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood type'),
  body('collection_date').optional().isISO8601().withMessage('Invalid date format'),
  body('expiration_date').optional().isISO8601().withMessage('Invalid date format'),
  // For the demo, storage_location_id is optional; backend will resolve it for hospital users.
  body('storage_location_id').optional().isUUID().withMessage('Valid hospital ID is required'),
  body('status').optional().isIn(['available', 'reserved', 'used', 'expired']).withMessage('Invalid status'),
  handleValidationErrors
];

/**
 * Validation rules for blood request
 */
const validateRequest = [
  body('blood_type_needed').isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood type'),
  body('units_required').isInt({ min: 1 }).withMessage('Units required must be at least 1'),
  body('urgency_level').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateBloodInventory,
  validateRequest,
  handleValidationErrors
};

