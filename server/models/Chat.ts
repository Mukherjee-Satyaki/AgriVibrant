import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './User';
import { IPublicUser } from './PublicUser';

// Chat Session interface
export interface IChatSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;        // Reference to registered user if logged in
  publicUserId?: mongoose.Types.ObjectId;  // Reference to anonymous public user if not logged in
  createdAt: Date;
  lastActive: Date;
}

// Chat Conversation interface
export interface IChatConversation extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;   // Reference to chat session
  title: string;
  messageCount: number;                 // Track number of messages in conversation
  lastMessageAt: Date;                  // Track when last message was sent
  createdAt: Date;
}

// Chat Message interface
export interface IChatMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;  // Reference to conversation
  role: 'user' | 'assistant';              // Who sent the message
  content: string;                         // Message content
  createdAt: Date;
}

// Chat Session Schema
const chatSessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,     // Allow null/undefined
    index: true
  },
  publicUserId: {
    type: Schema.Types.ObjectId,
    ref: 'PublicUser',
    sparse: true,     // Allow null/undefined
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

// Ensure either userId or publicUserId is present
chatSessionSchema.pre('save', function(next) {
  if (!this.userId && !this.publicUserId) {
    return next(new Error('Either userId or publicUserId must be provided'));
  }
  next();
});

// Chat Conversation Schema
const chatConversationSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messageCount: {
    type: Number,
    default: 0
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chat Message Schema
const chatMessageSchema = new Schema({
  conversationId: {
    type: Schema.Types.ObjectId,
    ref: 'ChatConversation',
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
export const ChatSession = mongoose.model<IChatSession>('ChatSession', chatSessionSchema);
export const ChatConversation = mongoose.model<IChatConversation>('ChatConversation', chatConversationSchema);
export const ChatMessage = mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);