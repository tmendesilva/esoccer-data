import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      // Add other options as needed, e.g., tls: true for SSL/TLS
    });
    // Enable Mongoose debug mode
    mongoose.set('debug', process.env.ENV === 'dev');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Closing MongoDB connection...');
  await mongoose.disconnect();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

export { connectDB, disconnectDB };
