const Application = require('../models/Application');

// @desc    Get applications
// @route   GET /api/applications
// @access  Private
exports.getApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};

    if (req.user && req.user.role === 'citizen') query.applicant = req.user._id;
    if (status) query.status = status;
    if (type)   query.type   = type;
    if (search) {
      query.$or = [
        { applicationId: { $regex: search, $options: 'i' } },
        { type:          { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('applicant', 'fullName nid mobile')
      .populate('landRecord', 'recordId title location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), applications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
exports.getApplicationById = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate('applicant', 'fullName nid mobile')
      .populate('landRecord', 'recordId title location')
      .populate('documents')
      .populate('reviewedBy', 'fullName');

    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    if (req.user && req.user.role === 'citizen' && app.applicant?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, application: app });
  } catch (err) {
    next(err);
  }
};

// @desc    Create application
// @route   POST /api/applications
// @access  Private
exports.createApplication = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
    }
    req.body.applicant = req.user._id;
    const application = await Application.create(req.body);
    res.status(201).json({ success: true, application });
  } catch (err) {
    next(err);
  }
};

// @desc    Review application — approve/reject
// @route   PATCH /api/applications/:id/review
// @access  Admin/Officer
exports.reviewApplication = async (req, res, next) => {
  try {
    const { status, rejectionReason, notes } = req.body;
    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

    app.status       = status;
    app.reviewedBy   = req.user?._id || null;
    app.reviewedAt   = new Date();
    if (rejectionReason) app.rejectionReason = rejectionReason;
    if (notes) app.notes = notes;
    await app.save();

    res.status(200).json({ success: true, message: `Application ${status}`, application: app });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Admin
exports.deleteApplication = async (req, res, next) => {
  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, message: 'Application deleted' });
  } catch (err) {
    next(err);
  }
};
