const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  serviceName: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  lat: { type: Number },
  lng: { type: Number },
  basePrice: { type: String },
  distance: { type: Number, default: 0 },
  travelFee: { type: Number, default: 0 },
  totalPrice: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Accepted', 'On The Way', 'Working', 'Waiting For Payment', 'Completed', 'Waiting For Code', 'Payment Released', 'Declined', 'Cancelled', 'Disputed'], 
    default: 'Pending' 
  },
  cancelledBy: { type: String, enum: ['client', 'worker', 'admin'] },
  cancellationReason: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Held in Trust', 'Released to Worker', 'Refunded'],
    default: 'Unpaid'
  },
  platformCommission: { type: Number, default: 0 },
  workerEarnings: { type: Number, default: 0 },
  isReviewed: { type: Boolean, default: false },
  completionCode: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  razorpaySignature: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
