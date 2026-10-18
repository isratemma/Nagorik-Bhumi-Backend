const express = require('express');
const router  = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
} = require('../controllers/authController');

// POST /api/auth/register
router.post('/register',
  [
    body('fullName').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
    body('nid').matches(/^\d{10}$|^\d{17}$/).withMessage('NID must be 10 or 17 digits'),
    body('dateOfBirth').isISO8601().withMessage('Invalid date of birth'),
    body('mobile').matches(/^01[3-9]\d{8}$/).withMessage('Invalid Bangladeshi mobile number'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post('/login',
  [
    body('nid').notEmpty().withMessage('NID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Protected routes
router.get('/me',               protect, getMe);
router.put('/me',               protect, updateMe);
router.put('/change-password',  protect, changePassword);

module.exports = router;
