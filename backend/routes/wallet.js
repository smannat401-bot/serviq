const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Withdrawal = require('../models/Withdrawal');

const router = express.Router();

// Get wallet balance
router.get('/balance/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ balance: user.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get transactions
router.get('/transactions/:userId', async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.params.userId })
      .populate('relatedBookingId', 'serviceName date')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request withdrawal
router.post('/withdraw', async (req, res) => {
  try {
    const { workerId, amount, bankDetails } = req.body;
    
    const worker = await User.findById(workerId);
    if (!worker) return res.status(404).json({ message: 'Worker not found' });
    
    if ((worker.walletBalance || 0) < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Deduct balance immediately
    worker.walletBalance -= amount;
    await worker.save();
    
    // Create Withdrawal Request
    const withdrawal = new Withdrawal({
      workerId,
      amount,
      bankDetails,
      status: 'Pending'
    });
    await withdrawal.save();
    
    // Create Transaction Record
    await Transaction.create({
      userId: workerId,
      amount: amount,
      type: 'Debit',
      description: 'Withdrawal Request'
    });
    
    res.status(201).json({ message: 'Withdrawal requested successfully', withdrawal });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
