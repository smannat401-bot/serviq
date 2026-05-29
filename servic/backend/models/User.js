const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'worker', 'admin'], required: true },
  phone: { type: String },
  walletBalance: { type: Number, default: 0 },
  
  // Worker specific fields
  skill: { type: String },
  experience: { type: Number },
  serviceArea: { type: String },
  bio: { type: String },
  aadharUrl: { type: String },
  profilePhoto: { type: String },
  
  // Pricing Control
  baseCharge: { type: Number, default: 0 },
  distanceRate: { type: Number, default: 0 }, // per km
  travelFee: { type: Number, default: 0 },
  
  // Cancellation & Trust Tracking
  cancellationCount: { type: Number, default: 0 },
  honourScore: { type: Number, default: 100 },
  isBlocked: { type: Boolean, default: false },

  availability: {
    days: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' }
  },
  catalog: [{
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true }
  }],
  reviews: [{
    rating: { type: Number, required: true },
    comment: { type: String },
    clientName: { type: String },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
