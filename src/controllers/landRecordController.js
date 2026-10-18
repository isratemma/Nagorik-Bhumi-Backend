const LandRecord = require('../models/LandRecord');

// @desc    Get all land records (admin) or own records (citizen)
// @route   GET /api/land-records
// @access  Private
exports.getLandRecords = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search } = req.query;
    const query = {};

    // Citizens only see their own records
    if (req.user && req.user.role === 'citizen') query.owner = req.user._id;

    if (status) query.status = status;
    if (type)   query.type   = type;
    if (search) {
      query.$or = [
        { title:      { $regex: search, $options: 'i' } },
        { recordId:   { $regex: search, $options: 'i' } },
        { plotNumber: { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await LandRecord.countDocuments(query);
    const records = await LandRecord.find(query)
      .populate('owner', 'fullName nid mobile')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), records });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single land record
// @route   GET /api/land-records/:id
// @access  Private
exports.getLandRecordById = async (req, res, next) => {
  try {
    const record = await LandRecord.findById(req.params.id)
      .populate('owner', 'fullName nid mobile')
      .populate('documents')
      .populate('verifiedBy', 'fullName');

    if (!record) return res.status(404).json({ success: false, message: 'Land record not found' });

    // Citizens can only view their own records (only check if user is authenticated)
    if (req.user && req.user.role === 'citizen' && record.owner?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

// @desc    Create land record
// @route   POST /api/land-records
// @access  Public (for now — will require auth once frontend login is wired)
exports.createLandRecord = async (req, res, next) => {
  try {
    // Use logged-in user or a default demo user ID from DB
    if (req.user) {
      req.body.owner = req.user._id;
    } else {
      // Find the first user in DB to use as default owner
      const User = require('../models/User');
      const defaultUser = await User.findOne();
      if (!defaultUser) {
        return res.status(400).json({ success: false, message: 'No users found. Please run the seeder first.' });
      }
      req.body.owner = defaultUser._id;
    }
    const record = await LandRecord.create(req.body);
    res.status(201).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

// @desc    Update land record
// @route   PUT /api/land-records/:id
// @access  Private
exports.updateLandRecord = async (req, res, next) => {
  try {
    let record = await LandRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Land record not found' });

    // Only check ownership if user is logged in and is a citizen
    if (req.user && req.user.role === 'citizen' && record.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    record = await LandRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, record });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve / reject land record (admin/officer)
// @route   PATCH /api/land-records/:id/status
// @access  Admin/Officer
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const record = await LandRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Land record not found' });

    record.status = status;
    if (status === 'Verified') {
      record.verifiedBy = req.user?._id || null;
      record.verifiedAt = new Date();
    }
    if (status === 'Rejected') record.rejectionReason = rejectionReason;
    await record.save();

    res.status(200).json({ success: true, message: `Record ${status}`, record });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete land record
// @route   DELETE /api/land-records/:id
// @access  Admin
exports.deleteLandRecord = async (req, res, next) => {
  try {
    const record = await LandRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: 'Land record not found' });
    res.status(200).json({ success: true, message: 'Land record deleted' });
  } catch (err) {
    next(err);
  }
};
