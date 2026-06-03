const express = require('express');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

const router = express.Router();

router.get('/testimonials', async (req, res) => {
  try {
    const workers = await User.find({ 
      role: 'worker', 
      isBlocked: { $ne: true },
      honourScore: { $gt: 70 }
    }).select('reviews skill name');
    let allReviews = [];
    
    workers.forEach(worker => {
      if (worker.reviews && worker.reviews.length > 0) {
        worker.reviews.forEach(review => {
          allReviews.push({
            id: review._id,
            content: review.comment,
            author: review.clientName || 'Anonymous Client',
            role: review.rating >= 4 ? 'Verified Homeowner' : 'Client',
            rating: review.rating,
            workerSkill: worker.skill,
            workerName: worker.name
          });
        });
      }
    });

    // Filter for high quality reviews (4-5 stars) and limit to 6
    const featuredReviews = allReviews
      .filter(r => r.rating >= 4)
      .sort(() => 0.5 - Math.random()) // Randomize for variety
      .slice(0, 6);

    res.json(featuredReviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all professionals (workers)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { 
      role: 'worker', 
      isBlocked: { $ne: true },
      honourScore: { $gt: 70 } // Automatically hide workers with low trust
    };
    
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

    // HONOR SCORE ADJUSTMENTS
    if (rating === 5) {
      worker.honourScore = Math.min(100, (worker.honourScore || 100) + 1); // 5-Star Rating: +1
    } else if (rating === 1) {
      worker.honourScore = Math.max(0, (worker.honourScore || 100) - 10); // 1-Star Rating: -10
      
      // Auto block if score falls below 70
      if (worker.honourScore < 70) {
        worker.isBlocked = true;
      }
    }

    await worker.save();

    // Mark booking as reviewed and close it
    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, { isReviewed: true, status: 'Closed' });
    }

    res.json({ message: 'Review added successfully', averageRating: worker.averageRating });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Request a service from a professional
router.post('/request', async (req, res) => {
  console.log('RECEIVED SERVICE REQUEST:', req.body);
  try {
    const { workerId, clientId, clientName, serviceName } = req.body;
    
    if (!workerId || !clientId || !serviceName) {
      return res.status(400).json({ message: 'WorkerId, ClientId, and ServiceName are required' });
    }

    const notification = new Notification({
      userId: workerId,
      messageEn: `Client ${clientName || 'User'} requested a new service: ${serviceName}`,
      messageHi: `ग्राहक ${clientName || 'यूजर'} ने एक नई सर्विस का अनुरोध किया: ${serviceName}`,
      type: 'service_request',
      relatedId: serviceName // Using relatedId to store the requested service name
    });

    await notification.save();
    res.status(201).json({ message: 'Service request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
