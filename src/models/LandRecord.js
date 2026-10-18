const mongoose = require('mongoose');

const landRecordSchema = new mongoose.Schema(
  {
    recordId: {
      type: String,
      unique: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
    title: {
      type: String,
      required: [true, 'Land title is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Residential', 'Agricultural', 'Commercial', 'Industrial', 'Other'],
      required: [true, 'Land type is required'],
    },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      upazila:  { type: String },
      union:    { type: String },
      mouza:    { type: String },
      address:  { type: String },
    },
    plotNumber: {
      type: String,
      required: [true, 'Plot number is required'],
    },
    khatianNumber: {
      type: String,
    },
    size: {
      value:  { type: Number, required: true },
      unit:   { type: String, enum: ['Katha', 'Bigha', 'Acre', 'Decimal'], default: 'Katha' },
      sqft:   { type: Number },
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    status: {
      type: String,
      enum: ['Draft', 'Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    rejectionReason: String,
    notes: String,
    photoUrl: String,
  },
  {
    timestamps: true,
  }
);

// Auto-generate recordId before saving — use max existing + 1 to avoid collision after deletions
landRecordSchema.pre('save', async function (next) {
  if (!this.recordId) {
    const last = await mongoose.model('LandRecord').findOne({}, { recordId: 1 }).sort({ recordId: -1 });
    let nextNum = 1;
    if (last && last.recordId) {
      const num = parseInt(last.recordId.replace('LN-', ''), 10);
      if (!isNaN(num)) nextNum = num + 1;
    }
    this.recordId = `LN-${String(nextNum).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('LandRecord', landRecordSchema);
