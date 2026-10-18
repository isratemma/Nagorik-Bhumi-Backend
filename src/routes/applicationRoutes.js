const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const {
  getApplications,
  getApplicationById,
  createApplication,
  reviewApplication,
  deleteApplication,
} = require('../controllers/applicationController');

// Read routes — public (no auth needed)
router.get('/',    getApplications);
router.get('/:id', getApplicationById);

// Write routes — protected
router.post('/',            protect, createApplication);
router.patch('/:id/review', reviewApplication);   // approve / reject
router.delete('/:id',       deleteApplication);

module.exports = router;
