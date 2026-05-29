const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');

// Initialize Razorpay
// Note: Requires RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'test_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret'
});

// Create Order Route
router.post('/create-order', async (req, res) => {
  console.log('HIT /create-order', req.body);
  try {
    const { amount } = req.body;
    
    // Check if we are using test keys
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId || keyId === 'test_key' || keyId === 'rzp_test_mock') {
      console.log('Using mock order creation for testing...');
      return res.json({
        id: `order_mock_${Date.now()}`,
        amount: amount * 100,
        currency: "INR",
        receipt: `receipt_${Date.now()}`
      });
    }

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) return res.status(500).send("Some error occured");

    res.json(order);
  } catch (error) {
    console.error('Error creating razorpay order:', error);
    res.status(500).send(error);
  }
});


// Verify Payment Route
router.post('/verify', async (req, res) => {
  console.log('HIT /verify', req.body);
  try {
    // These come from the frontend Razorpay checkout success handler
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData
    } = req.body;


    // Check if it's a mock order
    const isMock = razorpay_order_id.startsWith('order_mock_') && razorpay_signature === 'mock_signature';

    let isSignatureValid = false;

    if (isMock) {
      isSignatureValid = true;
    } else {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(sign.toString())
        .digest("hex");
      isSignatureValid = (razorpay_signature === expectedSign);
    }

    if (isSignatureValid) {
      // Payment is verified
      // Generate 4-digit completion code
      const completionCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Create Booking with Held in Trust status
      const newBooking = new Booking({
        ...bookingData,
        status: 'Pending',
        paymentStatus: 'Held in Trust',
        completionCode,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      await newBooking.save();
      const populatedBooking = await Booking.findById(newBooking._id).populate('client', 'name phone');
      
      if (!populatedBooking) {
        throw new Error('Booking saved but could not be retrieved for notification.');
      }

      // Create Notification record
      const Notification = require('../models/Notification');
      const clientName = (populatedBooking.client && populatedBooking.client.name) ? populatedBooking.client.name : 'A client';
      
      const notification = new Notification({
        userId: bookingData.worker,
        messageEn: `New booking request from ${clientName}.`,
        messageHi: `${clientName} ने आपको नई सर्विस के लिए बुक किया है।`,
        type: 'booking',
        relatedId: newBooking._id
      });
      await notification.save();

      // Emit Real-time notification
      const io = req.app.get('io');
      const userSockets = req.app.get('userSockets');
      const workerSocketId = userSockets[bookingData.worker];
      
      if (workerSocketId) {
        console.log(`Emitting new_booking to worker socket: ${workerSocketId}`);
        io.to(workerSocketId).emit('new_booking', {
          booking: populatedBooking,
          notification: notification
        });
      } else {
        console.log(`Worker socket not found for worker ID: ${bookingData.worker}`);
      }

      return res.status(200).json({ message: "Payment verified successfully", booking: newBooking });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

// Verify Payment for an Existing Booking (Pay After Work Flow)
router.post('/verify-booking-payment', async (req, res) => {
  console.log('HIT /verify-booking-payment', req.body);
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    const isMock = razorpay_order_id.startsWith('order_mock_') && razorpay_signature === 'mock_signature';
    let isSignatureValid = false;

    if (isMock) {
      isSignatureValid = true;
    } else {
      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_secret')
        .update(sign.toString())
        .digest("hex");
      isSignatureValid = (razorpay_signature === expectedSign);
    }

    if (!isSignatureValid) {
      return res.status(400).json({ message: "Invalid payment signature!" });
    }

    // Payment is verified, update the booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Generate completion code now (Only after payment)
    const completionCode = Math.floor(1000 + Math.random() * 9000).toString();

    booking.status = 'Waiting For Code';
    booking.paymentStatus = 'Held in Trust';
    booking.completionCode = completionCode;
    booking.razorpayOrderId = razorpay_order_id;
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;

    await booking.save();

    res.json({ message: "Payment successful. Code generated.", booking });
  } catch (error) {
    console.error('Error verifying booking payment:', error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
