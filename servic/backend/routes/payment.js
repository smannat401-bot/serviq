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
  try {
    const { amount } = req.body;
    
    // amount is expected in cents/paise
    const options = {
      amount: amount * 100, // Razorpay works in smallest currency unit
      currency: "USD",
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
  try {
    // These come from the frontend Razorpay checkout success handler
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingData
    } = req.body;

    // Verify Signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'test_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is verified
      // Generate 4-digit completion code
      const completionCode = Math.floor(1000 + Math.random() * 9000).toString();

      // Create Booking with Held in Trust status
      const newBooking = new Booking({
        ...bookingData,
        status: 'Accepted',
        paymentStatus: 'Held in Trust',
        completionCode,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });

      await newBooking.save();

      return res.status(200).json({ message: "Payment verified successfully", booking: newBooking });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

module.exports = router;
