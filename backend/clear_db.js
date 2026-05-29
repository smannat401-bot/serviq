const mongoose = require('mongoose');
require('dotenv').config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for cleanup...');

    const collections = ['users', 'bookings', 'messages', 'otps', 'transactions', 'withdrawals'];
    
    for (const collectionName of collections) {
      try {
        await mongoose.connection.collection(collectionName).deleteMany({});
        console.log(`Cleared collection: ${collectionName}`);
      } catch (err) {
        console.log(`Collection ${collectionName} might not exist or error: ${err.message}`);
      }
    }

    console.log('Database cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

clearDatabase();
