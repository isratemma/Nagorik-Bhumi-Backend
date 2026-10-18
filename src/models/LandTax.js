const mongoose = require('mongoose');

const landTaxSchema = new mongoose.Schema(
  {
    taxId: {
      type: String,
      unique: true,
    },
    landRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LandRecord',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: {
      type: Number,
      required: [true, 'Tax year is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Tax amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidAt: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['bKash', 'Nagad', 'Bank Transfer', 'Online', 'Cash', null],
      default: null,
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Unpaid', 'Paid', 'Overdue'],
      default: 'Unpaid',
    },
    receiptNumber: String,
  },
  {
    timestamps: true,
  }
);

landTaxSchema.pre('save', async function (next) {
  if (!this.taxId) {
    const year = this.year || new Date().getFullYear();
    const count = await mongoose.model('LandTax').countDocuments();
    this.taxId = `TAX-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  // Auto-mark overdue
  if (this.status === 'Unpaid' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

module.exports = mongoose.model('LandTax', landTaxSchema);
