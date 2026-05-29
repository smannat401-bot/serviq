const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Create a new booking
router.post('/', async (req, res) => {
  try {
    const booking = new Booking({
      ...req.body,
      paymentStatus: 'Held in Trust'
    });
    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get bookings for a specific client
router.get('/client/:clientId', async (req, res) => {
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
router.get('/worker/:workerId', async (req, res) => {
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
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, cancelledBy, cancellationReason } = req.body;
    
    let updateData = { status };
    if (cancelledBy) updateData.cancelledBy = cancelledBy;
    if (cancellationReason) updateData.cancellationReason = cancellationReason;
    
    // Generate a 4-digit code when accepted
    if (status === 'Accepted') {
      updateData.completionCode = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Handle Worker Cancellation tracking (ONLY after acceptance)
    if (status === 'Cancelled' && cancelledBy === 'worker') {
      const worker = await User.findById(booking.worker);
      if (worker) {
        worker.cancellationCount = (worker.cancellationCount || 0) + 1;
        worker.honourScore = Math.max(0, (worker.honourScore || 100) - 5);
        
        // Auto block on 6th cancellation or when score reaches 70
        if (worker.cancellationCount >= 6 || worker.honourScore <= 70) {
          worker.isBlocked = true;
        }
        
        await worker.save();
      }
    }
    
    res.json({ message: `Booking marked as ${status}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify completion code and mark completed
router.patch('/:id/complete', async (req, res) => {
  try {
    const { code } = req.body;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.completionCode !== code) {
      return res.status(400).json({ message: 'Invalid completion code' });
    }
    
    // Calculate Commission (18% Platform, 82% Worker)
    // totalPrice might contain currency symbols, so we parse it
    const price = parseFloat((booking.totalPrice || "0").replace(/[^0-9.]/g, '')) || 0;
    const platformCommission = price * 0.18;
    const workerEarnings = price * 0.82;
    
    booking.status = 'Payment Released';
    booking.paymentStatus = 'Released to Worker';
    booking.platformCommission = platformCommission;
    booking.workerEarnings = workerEarnings;
    await booking.save();
    
    // Update Worker Wallet
    const worker = await User.findById(booking.worker);
    if (worker) {
      worker.walletBalance = (worker.walletBalance || 0) + workerEarnings;
      await worker.save();
      
      // Create Transaction Record
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
