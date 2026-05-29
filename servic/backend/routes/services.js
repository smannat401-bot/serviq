const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');

const router = express.Router();

// Get all professionals (workers)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { role: 'worker' };
    
    // Filter by category
    if (category) {
      query.skill = { $regex: new RegExp(category, 'i') };
    }
    
    // Filter by search query
    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, 'i') } },
        { skill: { $regex: new RegExp(search, 'i') } },
        { serviceArea: { $regex: new RegExp(search, 'i') } }
      ];
    }

    // Find workers and exclude passwords
    const workers = await User.find(query).select('-password');
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get professional by ID
router.get('/:id', async (req, res) => {
  try {
    const worker = await User.findById(req.params.id).select('-password');
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Professional not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add a review to a professional
router.post('/:id/review', async (req, res) => {
  try {
    const { rating, comment, clientId, clientName, bookingId } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const worker = await User.findById(req.params.id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Professional not found' });
    }

    // Add review
    worker.reviews.push({ rating, comment, clientName, clientId });

    // Calculate new average
    const totalRating = worker.reviews.reduce((sum, review) => sum + review.rating, 0);
    worker.averageRating = totalRating / worker.reviews.length;

    await worker.save();

    // Mark booking as reviewed
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { isReviewed: true });
    }

    res.json({ message: 'Review added successfully', averageRating: worker.averageRating });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
