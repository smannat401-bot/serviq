const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create a new booking
router.post('/', verifyToken, async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      paymentStatus: 'Unpaid'
    });
    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for a specific client
router.get('/client/:clientId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ client: req.params.clientId })
      .populate('worker', 'name skill phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for a specific worker
router.get('/worker/:workerId', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ worker: req.params.workerId })
      .populate('client', 'name phone')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update booking status
router.patch('/:id/status', verifyToken, async (req, res) => {
  console.log(`UPDATING BOOKING ${req.params.id} STATUS TO: ${req.body.status}`);
  try {
    const { status, cancelledBy, cancellationReason } = req.body;
    
    let updateData = { status };
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;
    
    // Generate a 4-digit code when accepted or in progress (only if not already generated)
    if (status === 'Accepted' || status === 'In Progress') {
      const existingBooking = await Booking.findById(req.params.id);
      if (existingBooking && !existingBooking.completionCode) {
        updateData.completionCode = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Handle Worker Scoring logic
    if (status === 'Cancelled' && cancelledBy === 'worker') {
      const worker = await User.findById(booking.worker);
      if (worker) {
        worker.cancellationCount = (worker.cancellationCount || 0) + 1;
        
        let deduction = 5; // Default for confirmed booking
        
        // If cancelled before confirmation (was Pending)
        if (booking.status === 'Pending') {
          deduction = 2;
        } else {
          // Check if last-minute (within 2 hours)
          try {
            const appointmentDate = new Date(`${booking.date} ${booking.time}`);
            const now = new Date();
            const diffMs = appointmentDate - now;
            const diffHrs = diffMs / (1000 * 60 * 60);
            
            if (diffHrs < 2) {
              deduction = 8;
            }
          } catch (e) {
            console.error("Error calculating cancellation time:", e);
          }
        }
        
        // Repeated cancellations bonus deduction
        if (worker.cancellationCount > 3) {
          deduction += 2;
        }

        worker.honourScore = Math.max(0, (worker.honourScore || 100) - deduction);
        worker.jobStreak = 0; // Reset streak on cancellation
        
        // Auto block on 6th cancellation or when score reaches 70
        if (worker.cancellationCount >= 6 || worker.honourScore <= 70) {
          worker.isBlocked = true;
        }
        
        await worker.save();
      }
    } else if (status === 'Declined' && booking.status === 'Pending') {
      // Worker declined a pending request - small deduction if they do it frequently?
      // User didn't specify for Declined, but said "frequently rejects bookings after confirmation"
      // Rejections before confirmation usually don't penalize much, but let's stick to the prompt.
    }
    
    res.json({ message: `Booking marked as ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify completion code and mark completed
router.patch('/:id/complete', verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.completionCode !== code) {
      return res.status(400).json({ message: 'Invalid completion code' });
    }
    
    const price = parseFloat(String(booking.totalPrice || "0").replace(/[^0-9.]/g, '')) || 0;
    const platformCommission = price * 0.18;
    const workerEarnings = price * 0.82;
    
    booking.status = 'Payment Released';
    booking.paymentStatus = 'Released to Worker';
    booking.platformCommission = platformCommission;
    booking.workerEarnings = workerEarnings;
    await booking.save();
    
    const worker = await User.findById(booking.worker);
    if (worker) {
      worker.walletBalance = (worker.walletBalance || 0) + workerEarnings;
      
      // HONOR SCORE INCREASES
      worker.honourScore = Math.min(100, (worker.honourScore || 100) + 2); // +2 for completion
      worker.jobStreak = (worker.jobStreak || 0) + 1;
      worker.totalCompletedJobs = (worker.totalCompletedJobs || 0) + 1;
      
      // 10 successful jobs streak = +5 bonus points
      if (worker.jobStreak > 0 && worker.jobStreak % 10 === 0) {
        worker.honourScore = Math.min(100, worker.honourScore + 5);
      }

      await worker.save();
      
      await Transaction.create({
        userId: worker._id,
        amount: workerEarnings,
        type: 'Credit',
        description: `Payment released for ${booking.serviceName}`,
        relatedBookingId: booking._id
      });
    }
    
    res.json({ message: 'Payment released successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
