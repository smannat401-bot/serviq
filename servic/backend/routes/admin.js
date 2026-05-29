const express = require('express');
const Booking = require('../models/Booking');
const Withdrawal = require('../models/Withdrawal');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

// Get platform revenue and stats
router.get('/stats', async (req, res) => {
  try {
    const completedBookings = await Booking.find({ status: 'Payment Released' });
    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.platformCommission || 0), 0);
    const totalTransactions = completedBookings.length;
    
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalAllBookings = await Booking.countDocuments();
    
    res.json({ totalRevenue, totalTransactions, totalWorkers, totalAllBookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all withdrawals
router.get('/withdrawals', async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find()
      .populate('workerId', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(withdrawals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update withdrawal status (Approve/Reject)
router.patch('/withdrawals/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id);
    
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal not found' });
    
    if (withdrawal.status !== 'Pending') {
      return res.status(400).json({ message: 'Withdrawal is already processed' });
    }
    
    withdrawal.status = status;
    withdrawal.resolvedAt = new Date();
    await withdrawal.save();
    
    // If rejected, refund the wallet balance
    if (status === 'Rejected') {
      const worker = await User.findById(withdrawal.workerId);
      if (worker) {
        worker.walletBalance = (worker.walletBalance || 0) + withdrawal.amount;
        await worker.save();
        
        await Transaction.create({
          userId: worker._id,
          amount: withdrawal.amount,
          type: 'Credit',
          description: 'Refund for rejected withdrawal request'
        });
      }
    }
    
    res.json({ message: `Withdrawal ${status}`, withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all workers for monitoring
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .select('-password')
      .sort({ cancellationCount: -1 });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Block/Unblock worker
router.patch('/workers/:id/block', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const worker = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked },
      { new: true }
    ).select('-password');
    
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    
    res.json({ message: `Worker ${isBlocked ? 'blocked' : 'unblocked'}`, worker });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all cancelled bookings for monitoring
router.get('/cancellations', async (req, res) => {
  try {
    const cancellations = await Booking.find({ status: { $in: ['Cancelled', 'Declined'] } })
      .populate('worker', 'name email')
      .populate('client', 'name')
      .sort({ updatedAt: -1 });
    res.json(cancellations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
