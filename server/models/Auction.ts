import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';

// Auction interface
export interface IAuction extends Document {
  _id: mongoose.Types.ObjectId;
  productName: string;
  description: string;
  startingBid: number;
  currentBid?: number;
  quantity: number;
  unit: string;
  category: string;
  seller: string;
  imageUrl?: string;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'scheduled' | 'completed';
  bidCount: number;
  createdAt: Date;
  remainingTime?: number; // Virtual property not stored in DB
}

// Bid interface
export interface IBid extends Document {
  _id: mongoose.Types.ObjectId;
  auctionId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  bidderName: string;
  amount: number;
  createdAt: Date;
}

// Auction Schema
const auctionSchema = new Schema({
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters']
  },
  startingBid: {
    type: Number,
    required: [true, 'Starting bid is required'],
    min: [0, 'Starting bid cannot be negative']
  },
  currentBid: {
    type: Number
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  seller: {
    type: String,
    required: [true, 'Seller name is required'],
    trim: true,
    minlength: [3, 'Seller name must be at least 3 characters']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required']
  },
  status: {
    type: String,
    enum: ['active', 'scheduled', 'completed'],
    default: 'active'
  },
  bidCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate remaining time as a virtual property
auctionSchema.virtual('remainingTime').get(function(this: IAuction) {
  const now = new Date();
  const diffMs = this.endTime.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 60000)); // Convert to minutes, min 0
});

// Ensure virtuals are included when converting to JSON
auctionSchema.set('toJSON', { virtuals: true });
auctionSchema.set('toObject', { virtuals: true });

// Bid Schema
const bidSchema = new Schema({
  auctionId: {
    type: Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  bidderName: {
    type: String,
    required: [true, 'Bidder name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [0, 'Bid amount cannot be negative']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Auction = mongoose.model<IAuction>('Auction', auctionSchema);
export const Bid = mongoose.model<IBid>('Bid', bidSchema);