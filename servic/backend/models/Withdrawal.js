const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  bankDetails: {
    accountName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String }
  },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
