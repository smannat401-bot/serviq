const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

const DB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/serviq';

async function createAdmin() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@serviq.com';
    const adminPassword = 'admin'; // Simple password for now, user can change later

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin account already exists:', adminEmail);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const newAdmin = new User({
      name: 'SERVIQ Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log('Successfully created Admin account!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
