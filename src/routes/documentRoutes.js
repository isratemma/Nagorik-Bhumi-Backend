const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const {
  getDocuments,
  uploadDocument,
  verifyDocument,
  deleteDocument,
} = require('../controllers/documentController');

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /pdf|jpg|jpeg|png/i;
  if (allowed.test(path.extname(file.originalname)) && /pdf|jpeg|jpg|png/i.test(file.mimetype))
    return cb(null, true);
  cb(new Error('Only PDF, JPG and PNG files are allowed'));
};

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });

// All public for now
router.get('/',              getDocuments);
router.post('/upload',       upload.single('file'), uploadDocument);
router.patch('/:id/verify',  verifyDocument);   // verify / reject
router.delete('/:id',        deleteDocument);

module.exports = router;
