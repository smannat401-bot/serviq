const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'admin@serviq.com';
    const newPassword = 'admin123';
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findOneAndUpdate(
      { email, role: 'admin' },
      { password: hashedPassword },
      { new: true }
    );

    if (user) {
      console.log(`Admin password reset for: ${email}`);
      console.log(`New Password: ${newPassword}`);
    } else {
      console.log('Admin user not found. Creating one...');
      const admin = new User({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log(`Admin user created: ${email}`);
      console.log(`Password: ${newPassword}`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

resetAdmin();
