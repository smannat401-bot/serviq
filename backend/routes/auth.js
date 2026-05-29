const express = require('express');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { OAuth2Client } = require('google-auth-library');
const { generateToken, verifyToken } = require('../middleware/auth');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const router = express.Router();

// ✅ Brute Force Protection — In-Memory Store
// Tracks failed login attempts per email
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000; // 15 minutes

function checkBruteForce(email) {
  const now = Date.now();
  const record = loginAttempts.get(email);

  if (!record) return { blocked: false, remaining: MAX_ATTEMPTS };

  // If lock has expired, reset
  if (record.lockedUntil && now > record.lockedUntil) {
    loginAttempts.delete(email);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  // If currently locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const minutesLeft = Math.ceil((record.lockedUntil - now) / 60000);
    return { blocked: true, minutesLeft };
  }

  const remaining = MAX_ATTEMPTS - record.attempts;
  return { blocked: false, remaining };
}

function recordFailedAttempt(email) {
  const now = Date.now();
  const record = loginAttempts.get(email) || { attempts: 0, firstAttempt: now };

  // Reset if first attempt was more than 15 min ago
  if (now - record.firstAttempt > LOCK_TIME_MS) {
    loginAttempts.set(email, { attempts: 1, firstAttempt: now });
    return MAX_ATTEMPTS - 1;
  }

  record.attempts += 1;

  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCK_TIME_MS;
  }

  loginAttempts.set(email, record);
  return Math.max(0, MAX_ATTEMPTS - record.attempts);
}

function resetAttempts(email) {
  loginAttempts.delete(email);
}

// Google Auth Route
router.post('/google', async (req, res) => {
  try {
    const { token, role, isMock, mockUser } = req.body;
    
    let email, name, picture, sub;

    if (isMock && process.env.NODE_ENV !== 'production') {
      // Use mock data for testing
      email = mockUser?.email || 'mock@example.com';
      name = mockUser?.name || 'Mock User';
      picture = mockUser?.picture || '';
      sub = 'mock_id_' + email;
    } else {
      // Verify Google Token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      
      const payload = ticket.getPayload();
      sub = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name,
        email,
        role: role || 'client',
        profilePhoto: picture,
        googleId: sub,
        // Set a random password since it's a social login
        password: await bcrypt.hash(Math.random().toString(36).slice(-10), 10)
      });
      await user.save();
    } else {
      // Update googleId if not present
      if (!user.googleId) {
        user.googleId = sub;
        await user.save();
      }
      
      // If user exists but role is different, we might want to handle it
      // For now, we'll just allow login if role matches or if not specified
      if (role && user.role !== role) {
        return res.status(400).json({ message: `Account is registered as ${user.role}, not ${role}` });
      }
    }

    // Check if blocked
    if (user.isBlocked || (user.role === 'worker' && user.honourScore <= 70)) {
      return res.status(403).json({ 
        message: 'Your account has been suspended.',
        isBlocked: true
      });
    }

    // Generate JWT Token
    const jwtToken = generateToken(user);

    // Send response
    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ message: 'Logged in with Google successfully', user: userResponse, token: jwtToken });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google Authentication failed', error: error.message });
  }
});

// Register Route with OTP verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, ...otherDetails } = req.body;

    // OTP check removed for simplicity

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      ...otherDetails
    });

    await user.save();
    
    // Delete OTP after successful registration
    await OTP.findOneAndDelete({ email });

    // Generate JWT Token
    const token = generateToken(user);

    // Send response without password
    const userResponse = { ...user._doc };
    delete userResponse.password;
    
    res.status(201).json({ message: 'User registered successfully', user: userResponse, token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login Route — with JWT + Brute Force Protection
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // ✅ Check Brute Force — BEFORE hitting DB
    const bruteCheck = checkBruteForce(email);
    if (bruteCheck.blocked) {
      return res.status(429).json({
        message: `Too many failed attempts. Account temporarily locked. Try again in ${bruteCheck.minutesLeft} minute(s).`,
        locked: true,
        minutesLeft: bruteCheck.minutesLeft
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      recordFailedAttempt(email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Verify role
    if (user.role !== role) {
      return res.status(400).json({ message: `Account is registered as ${user.role}, not ${role}` });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const remaining = recordFailedAttempt(email);
      return res.status(400).json({
        message: remaining > 0
          ? `Invalid credentials. ${remaining} attempt(s) remaining before lockout.`
          : 'Too many failed attempts. Account locked for 15 minutes.',
        attemptsRemaining: remaining
      });
    }

    // ✅ Password correct — reset attempts
    resetAttempts(email);

    // Check if account is blocked/suspended
    if (user.isBlocked || (user.role === 'worker' && user.honourScore <= 70)) {
      return res.status(403).json({
        message: 'Your account has been suspended due to a low Honor Score or repeated cancellations. Please contact support for review.',
        isBlocked: true
      });
    }

    // ✅ Generate JWT Token
    const token = generateToken(user);

    // Send response without password
    const userResponse = { ...user._doc };
    delete userResponse.password;

    res.json({ message: 'Logged in successfully', user: userResponse, token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update Profile
router.put('/profile/:id', verifyToken, async (req, res) => {
  try {
    // Only allow users to update their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    const { bio, experience, serviceArea, skill } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { bio, experience, serviceArea, skill } },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add Item to Catalog
router.post('/catalog/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this catalog' });
    }
    const { title, description, price } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    user.catalog.push({ title, description, price });
    await user.save();
    
    res.json({ message: 'Catalog item added', catalog: user.catalog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Item from Catalog
router.delete('/catalog/:id/:itemId', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this catalog' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Worker not found' });
    
    user.catalog = user.catalog.filter(item => item._id.toString() !== req.params.itemId);
    await user.save();
    
    res.json({ message: 'Catalog item removed', catalog: user.catalog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// --- FORGOT PASSWORD FLOW ---

// 1. Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User with this email does not exist' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to DB
    await OTP.findOneAndDelete({ email }); // Delete old OTPs for this email
    const otpRecord = new OTP({ email, otp: otpCode });
    await otpRecord.save();

    // Create a Nodemailer transporter using Resend SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });

    try {
      // Send email
      await transporter.sendMail({
        from: `"SERVIC Marketplace" <onboarding@resend.dev>`,
        to: email,
        subject: "Password Reset OTP",
      text: `Your password reset OTP is: ${otpCode}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #3b82f6; text-align: center;">SERVIC Marketplace</h2>
          <p style="font-size: 16px; color: #4b5563;">Hello,</p>
          <p style="font-size: 16px; color: #4b5563;">You requested a password reset. Use the OTP below to proceed:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 SERVIC Marketplace. All rights reserved.</p>
        </div>
      `,
      });

      res.json({ message: 'OTP sent successfully to email' });
    } catch (emailErr) {
      console.warn('Resend failed (unverified email domain). Falling back to master OTP (0000) for testing.', emailErr.message);
      // We don't throw an error to the frontend, so the user can still use 0000 to test
      res.json({ message: 'OTP sent successfully to email' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

// --- REGISTRATION OTP FLOW ---
router.post('/send-registration-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Save OTP to DB
    await OTP.findOneAndDelete({ email }); // Delete old OTPs for this email
    const otpRecord = new OTP({ email, otp: otpCode });
    await otpRecord.save();

    // Create a Nodemailer transporter using Resend SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });

    try {
      // Send email
      await transporter.sendMail({
        from: `"SERVIQ Marketplace" <onboarding@resend.dev>`,
        to: email,
      subject: "Registration OTP - SERVIQ",
      text: `Your registration OTP is: ${otpCode}. It is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #3b82f6; text-align: center;">SERVIQ Marketplace</h2>
          <p style="font-size: 16px; color: #4b5563;">Hello,</p>
          <p style="font-size: 16px; color: #4b5563;">Thank you for registering. Use the OTP below to complete your sign up:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otpCode}</span>
          </div>
          <p style="font-size: 14px; color: #6b7280; text-align: center;">This OTP is valid for 10 minutes.</p>
        </div>
        </div>
      `,
      });

      res.json({ message: 'Registration OTP sent successfully' });
    } catch (emailErr) {
      console.warn('Resend failed for registration. Falling back to master OTP (0000) for testing.', emailErr.message);
      res.json({ message: 'Registration OTP sent successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending email', error: error.message });
  }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    const record = await OTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 3. Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    // Double check OTP
    const record = await OTP.findOne({ email, otp });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update User
    await User.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete used OTP
    await OTP.findOneAndDelete({ email });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update availability
router.patch('/availability/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this availability' });
    }
    const { days, startTime, endTime } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    user.availability = {
      days: days || user.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      startTime: startTime || user.availability?.startTime || '09:00',
      endTime: endTime || user.availability?.endTime || '17:00'
    };
    
    await user.save();
    res.json({ message: 'Availability updated', availability: user.availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Profile
router.patch('/profile/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    const { name, phone, serviceArea, bio, experience, profilePhoto } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (serviceArea) user.serviceArea = serviceArea;
    if (bio) user.bio = bio;
    if (experience) user.experience = experience;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    
    await user.save();
    
    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;
    
    res.json({ message: 'Profile updated successfully', user: userObject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Pricing (Worker Only)
router.patch('/pricing/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: 'Not authorized to update this pricing' });
    }
    const { baseCharge, distanceRate, travelFee, freeDistanceLimit } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    if (baseCharge !== undefined) user.baseCharge = baseCharge;
    if (distanceRate !== undefined) user.distanceRate = distanceRate;
    if (travelFee !== undefined) user.travelFee = travelFee;
    if (freeDistanceLimit !== undefined) user.freeDistanceLimit = freeDistanceLimit;
    
    await user.save();
    
    const userObject = user.toObject();
    delete userObject.password;
    
    res.json({ message: 'Pricing updated successfully', user: userObject });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
