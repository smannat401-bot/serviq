const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const User = require('./models/User');

const checkBookings = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const bookings = await Booking.find().populate('client worker');
    console.log(`Found ${bookings.length} bookings:`);
    
    bookings.forEach(b => {
      console.log(`- ID: ${b._id}, Service: ${b.serviceName}, Status: ${b.status}`);
      console.log(`  Client: ${b.client ? b.client.name : 'NULL'} (${b.client ? b.client._id : 'N/A'})`);
      console.log(`  Worker: ${b.worker ? b.worker.name : 'NULL'} (${b.worker ? b.worker._id : 'N/A'})`);
    });

    const users = await User.find();
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.name} (${u.email}) (${u._id}) - ${u.role}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkBookings();
