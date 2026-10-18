const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['Deed', 'Survey', 'Identity', 'Tax', 'Inheritance', 'Other'],
      required: [true, 'Document type is required'],
    },
    format: {
      type: String,
      enum: ['PDF', 'JPG', 'PNG', 'DOCX'],
      required: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileSize: {
      type: Number, // bytes
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relatedRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LandRecord',
    },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected'],
      default: 'Pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
