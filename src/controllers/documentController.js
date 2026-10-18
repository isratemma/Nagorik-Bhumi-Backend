const Document = require('../models/Document');
const path = require('path');

// @desc    Get documents
// @route   GET /api/documents
// @access  Private
exports.getDocuments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const query = {};

    if (req.user && req.user.role === 'citizen') query.uploadedBy = req.user._id;
    if (status) query.status = status;
    if (type)   query.type   = type;

    const total = await Document.countDocuments(query);
    const documents = await Document.find(query)
      .populate('uploadedBy', 'fullName nid')
      .populate('relatedRecord', 'recordId title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), documents });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const ext = path.extname(req.file.originalname).toUpperCase().replace('.', '');
    const allowedFormats = ['PDF', 'JPG', 'JPEG', 'PNG'];
    if (!allowedFormats.includes(ext)) {
      return res.status(400).json({ success: false, message: 'Only PDF, JPG, PNG files are allowed' });
    }

    const doc = await Document.create({
      name:          req.body.name || req.file.originalname,
      type:          req.body.type || 'Other',
      format:        ext === 'JPEG' ? 'JPG' : ext,
      fileUrl:       `/uploads/${req.file.filename}`,
      fileSize:      req.file.size,
      uploadedBy:    req.user?._id || (await require('../models/User').findOne())?._id,
      relatedRecord: req.body.relatedRecord || null,
    });

    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify / reject document (admin/officer)
// @route   PATCH /api/documents/:id/verify
// @access  Admin/Officer
exports.verifyDocument = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.status = status;
    if (status === 'Verified') {
      doc.verifiedBy = req.user?._id || null;
      doc.verifiedAt = new Date();
    }
    if (status === 'Rejected') doc.rejectionReason = rejectionReason;
    await doc.save();

    res.status(200).json({ success: true, message: `Document ${status}`, document: doc });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (req.user.role === 'citizen' && doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await doc.deleteOne();
    res.status(200).json({ success: true, message: 'Document deleted' });
  } catch (err) {
    next(err);
  }
};
