const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/serviq';

async function fixAdmin() {
  try {
    await mongoose.connect(DB_URI);
    
    // Check what admins exist
    const admins = await User.find({ role: 'admin' });
    console.log(`Found ${admins.length} admins.`);
    for (let admin of admins) {
      console.log(`Admin email: ${admin.email}`);
      // Let's force reset the password for admin@serviq.com
      if (admin.email === 'admin@serviq.com') {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash('admin123', salt);
        await admin.save();
        console.log('Password forcefully reset to "admin123" for admin@serviq.com');
      }
    }

    if (admins.length === 0) {
      // Create if none exist
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      const newAdmin = new User({
        name: 'SERVIQ Admin',
        email: 'admin@serviq.com',
        password: hashedPassword,
        role: 'admin'
      });
      await newAdmin.save();
      console.log('Created new admin admin@serviq.com with password "admin123"');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

fixAdmin();
