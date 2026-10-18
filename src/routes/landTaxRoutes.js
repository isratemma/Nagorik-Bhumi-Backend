const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getLandTaxes,
  getLandTaxById,
  createLandTax,
  payLandTax,
} = require('../controllers/landTaxController');

// Public read
router.get('/',    getLandTaxes);
router.get('/:id', getLandTaxById);

// Protected write
router.post('/',        protect, authorize('admin'), createLandTax);
router.patch('/:id/pay',protect, payLandTax);

module.exports = router;
