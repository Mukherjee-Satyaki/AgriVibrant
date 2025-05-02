import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// MongoDB connection URL - includes database name
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/AgriVibrantDB';

// Connect to MongoDB
const connectDB = async (): Promise<typeof mongoose> => {
  try {
    // Enable strict query for better type safety
    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;