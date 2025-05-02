import mongoose, { Schema, Document } from 'mongoose';

// Public User interface for anonymous visitors
export interface IPublicUser extends Document {
  _id: mongoose.Types.ObjectId;
  browserFingerprint: string;  // A unique identifier for the browser/device
  createdAt: Date;
  lastActive: Date;
}

// Public User Schema
const publicUserSchema = new Schema({
  browserFingerprint: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

// Create model
export const PublicUser = mongoose.model<IPublicUser>('PublicUser', publicUserSchema);