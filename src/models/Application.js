const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LandRecord',
    },
    type: {
      type: String,
      enum: [
        'Land Mutation',
        'Name Correction',
        'Land Survey',
        'Partition Deed',
        'Ownership Transfer',
        'Land Tax Clearance',
        'Other',
      ],
      required: [true, 'Application type is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'In Review', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Normal', 'High'],
      default: 'Normal',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    rejectionReason: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

applicationSchema.pre('save', async function (next) {
  if (!this.applicationId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Application').countDocuments();
    this.applicationId = `APP-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
