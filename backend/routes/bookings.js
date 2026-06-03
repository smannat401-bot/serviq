const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Auto cancel pending bookings older than 5 minutes as 'No Response'
const checkPendingTimeouts = async () => {
  try {
    const timeoutLimit = 5 * 60 * 1000; // 5 minutes
    const threshold = new Date(Date.now() - timeoutLimit);
    const expiredBookings = await Booking.find({
      status: 'Pending',
      createdAt: { $lt: threshold }
    });
    
    for (const booking of expiredBookings) {
      booking.status = 'Cancelled';
      booking.cancelledBy = 'admin';
      booking.cancellationReason = 'No response to booking request';
      await booking.save();
      
      const worker = await User.findById(booking.worker);
      if (worker) {
        worker.honourScore = Math.max(0, (worker.honourScore || 100) - 3); // -3 for no response
        worker.jobStreak = 0; // Reset streak
        if (worker.honourScore < 70) {
          worker.isBlocked = true;
        }
        await worker.save();
      }
    }
  } catch (err) {
    console.error('Error auto-cancelling timed out bookings:', err);
  }
};

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
    await checkPendingTimeouts();
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
    await checkPendingTimeouts();
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
    
    const existingBooking = await Booking.findById(req.params.id);
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found' });
    
    const originalStatus = existingBooking.status;
    let updateData = { status };
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;
    
    // Generate a 4-digit code when accepted or in progress (only if not already generated)
    if (status === 'Accepted' || status === 'In Progress') {
      if (!existingBooking.completionCode) {
        updateData.completionCode = Math.floor(1000 + Math.random() * 9000).toString();
      }
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    // Handle Worker Scoring logic
    if (status === 'Cancelled' && cancelledBy === 'worker') {
      const worker = await User.findById(booking.worker);
      if (worker) {
        worker.cancellationCount = (worker.cancellationCount || 0) + 1;
        
        // Late Cancellation: -5 if it was already confirmed/accepted; -2 if it was Pending
        const deduction = originalStatus === 'Pending' ? 2 : 5;
        worker.honourScore = Math.max(0, (worker.honourScore || 100) - deduction);
        worker.jobStreak = 0; // Reset streak
        
        if (worker.honourScore < 70) {
          worker.isBlocked = true;
          console.log(`WORKER ${worker.name} HAS BEEN BLOCKED DUE TO HONOUR SCORE < 70`);
        }
        await worker.save();
      }
    } else if ((status === 'Declined' || status === 'Rejected') && originalStatus === 'Pending') {
      const worker = await User.findById(booking.worker);
      if (worker) {
        const deduction = 2; // Booking Rejected: -2
        const oldScore = worker.honourScore || 100;
        worker.honourScore = Math.max(0, oldScore - deduction);
        worker.jobStreak = 0; // Reset streak
        console.log(`WORKER ${worker.name} DECLINED REQUEST. HONOUR SCORE DECREASED FROM ${oldScore} TO ${worker.honourScore}`);
        
        if (worker.honourScore < 70) {
          worker.isBlocked = true;
          console.log(`WORKER ${worker.name} HAS BEEN BLOCKED DUE TO HONOUR SCORE < 70`);
        }
        await worker.save();
      }
    } else if (status === 'Accepted' && originalStatus === 'Pending') {
      const worker = await User.findById(booking.worker);
      if (worker) {
        const oldScore = worker.honourScore || 100;
        worker.honourScore = Math.min(100, oldScore + 1); // Booking Accepted: +1
        console.log(`WORKER ${worker.name} ACCEPTED REQUEST. HONOUR SCORE INCREASED FROM ${oldScore} TO ${worker.honourScore}`);
        await worker.save();
      }
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
      
      // 5 successful jobs streak = +3 bonus points
      if (worker.jobStreak > 0 && worker.jobStreak % 5 === 0) {
        worker.honourScore = Math.min(100, worker.honourScore + 3);
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
