const LandTax = require('../models/LandTax');

// @desc    Get land taxes
// @route   GET /api/land-tax
// @access  Private
exports.getLandTaxes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, year } = req.query;
    const query = {};

    if (req.user && req.user.role === 'citizen') query.owner = req.user._id;
    if (status) query.status = status;
    if (year)   query.year   = Number(year);

    const total = await LandTax.countDocuments(query);
    const taxes = await LandTax.find(query)
      .populate('owner', 'fullName nid')
      .populate('landRecord', 'recordId title location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Total due amount
    const totalDue = await LandTax.aggregate([
      { $match: { ...query, status: { $in: ['Unpaid', 'Overdue'] } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.status(200).json({
      success: true,
      total,
      totalDue: totalDue[0]?.total ?? 0,
      page: Number(page),
      pages: Math.ceil(total / limit),
      taxes,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single tax record
// @route   GET /api/land-tax/:id
// @access  Private
exports.getLandTaxById = async (req, res, next) => {
  try {
    const tax = await LandTax.findById(req.params.id)
      .populate('owner', 'fullName nid mobile')
      .populate('landRecord', 'recordId title location');
    if (!tax) return res.status(404).json({ success: false, message: 'Tax record not found' });
    res.status(200).json({ success: true, tax });
  } catch (err) {
    next(err);
  }
};

// @desc    Create tax record (admin)
// @route   POST /api/land-tax
// @access  Admin
exports.createLandTax = async (req, res, next) => {
  try {
    const tax = await LandTax.create(req.body);
    res.status(201).json({ success: true, tax });
  } catch (err) {
    next(err);
  }
};

// @desc    Pay land tax
// @route   PATCH /api/land-tax/:id/pay
// @access  Private
exports.payLandTax = async (req, res, next) => {
  try {
    const { paymentMethod, transactionId } = req.body;
    const tax = await LandTax.findById(req.params.id);
    if (!tax) return res.status(404).json({ success: false, message: 'Tax record not found' });
    if (tax.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Tax already paid' });
    }

    tax.status        = 'Paid';
    tax.paidAt        = new Date();
    tax.paymentMethod = paymentMethod;
    tax.transactionId = transactionId;
    tax.receiptNumber = `RCP-${Date.now()}`;
    await tax.save();

    res.status(200).json({ success: true, message: 'Tax paid successfully', receiptNumber: tax.receiptNumber, tax });
  } catch (err) {
    next(err);
  }
};
