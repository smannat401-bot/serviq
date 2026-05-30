const express = require('express');
const Message = require('../models/Message');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendNotificationToUser } = require('../utils/webPush');

const router = express.Router();

// Get messages for a specific booking
router.get('/:bookingId', async (req, res) => {
  try {
    const messages = await Message.find({ bookingId: req.params.bookingId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent conversations for a user (Client or Worker)
router.get('/conversations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    // Find all bookings where this user is involved
    const bookings = await Booking.find({
      $or: [{ client: userId }, { worker: userId }]
    }).populate('client worker', 'name profilePhoto');

    // For each booking, get the last message (if any)
    const conversations = await Promise.all(bookings.map(async (booking) => {
      const lastMessage = await Message.findOne({ bookingId: booking._id })
        .sort({ createdAt: -1 });
      
      const otherUser = booking.client._id.toString() === userId ? booking.worker : booking.client;

      return {
        bookingId: booking._id,
        serviceName: booking.serviceName,
        otherUser,
        lastMessage: lastMessage ? lastMessage.content : 'No messages yet',
        updatedAt: lastMessage ? lastMessage.createdAt : booking.updatedAt
      };
    }));

    // Sort conversations by latest message/update
    conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { bookingId, sender, receiver, content } = req.body;
    const message = new Message({ bookingId, sender, receiver, content });
    await message.save();
    
    try {
      const receiverUser = await User.findById(receiver);
      const senderUser = await User.findById(sender);
      if (receiverUser && senderUser) {
        await sendNotificationToUser(receiverUser, {
          title: `New message from ${senderUser.name}`,
          body: content,
          url: receiverUser.role === 'worker' ? '/worker-dashboard' : '/client-dashboard',
          icon: '/icons/icon-192x192.png'
        });
      }
    } catch (pushErr) {
      console.error('Failed to send push for message:', pushErr);
    }
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
