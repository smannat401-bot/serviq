const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageEn: { type: String, required: true },
  messageHi: { type: String, required: true },
  type: { type: String, enum: ['booking', 'payment', 'system', 'service_request'], default: 'booking' },
  isRead: { type: Boolean, default: false },
  relatedId: { type: String }, // Can be booking ID
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
