const express = require('express');
const router  = express.Router();
const {
  getLandRecords,
  getLandRecordById,
  createLandRecord,
  updateLandRecord,
  updateStatus,
  deleteLandRecord,
} = require('../controllers/landRecordController');

// All public for now — add auth after frontend JWT is wired
router.get('/',             getLandRecords);
router.get('/:id',          getLandRecordById);
router.post('/',            createLandRecord);
router.put('/:id',          updateLandRecord);
router.patch('/:id/status', updateStatus);     // approve / reject
router.delete('/:id',       deleteLandRecord);

module.exports = router;
