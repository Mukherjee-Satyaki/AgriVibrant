import { z } from "zod";

// MongoDB Schema Validations for User
export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Must be a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'admin']).default('user'),
  farmName: z.string().optional(),
  location: z.string().optional()
});

export type InsertUser = z.infer<typeof userSchema>;

// MongoDB Schema Validations for Product
export const productSchema = z.object({
  name: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  seller: z.string().min(3, "Seller name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  imageUrl: z.string().optional(),
  priceChange: z.number().optional()
});

export const insertProductSchema = productSchema;
export type InsertProduct = z.infer<typeof productSchema>;

// MongoDB Schema Validations for Auction
export const auctionSchema = z.object({
  productName: z.string().min(3, "Product name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  startingBid: z.number().positive("Starting bid must be positive"),
  currentBid: z.number().optional(),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required"),
  category: z.string().min(1, "Category is required"),
  seller: z.string().min(3, "Seller name must be at least 3 characters"),
  imageUrl: z.string().optional(),
  startTime: z.date().default(() => new Date()),
  endTime: z.date(),
  status: z.enum(['active', 'scheduled', 'completed']).default('active'),
  bidCount: z.number().default(0)
});

export const insertAuctionSchema = auctionSchema;
export type InsertAuction = z.infer<typeof auctionSchema>;

// MongoDB Schema Validations for Bid
export const bidSchema = z.object({
  auctionId: z.string(),
  userId: z.string().optional(),
  bidderName: z.string().min(1, "Bidder name is required"),
  amount: z.number().positive("Bid amount must be positive")
});

export const insertBidSchema = bidSchema;
export type InsertBid = z.infer<typeof bidSchema>;

// MongoDB Schema Validations for Chat Session
export const chatSessionSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().min(1, "Session ID is required")
});

export const insertChatSessionSchema = chatSessionSchema;
export type InsertChatSession = z.infer<typeof chatSessionSchema>;

// MongoDB Schema Validations for Chat Conversation
export const chatConversationSchema = z.object({
  sessionId: z.string(), 
  title: z.string().default("New Conversation")
});

export const insertChatConversationSchema = chatConversationSchema;
export type InsertChatConversation = z.infer<typeof chatConversationSchema>;

// MongoDB Schema Validations for Chat Message
export const chatMessageSchema = z.object({
  conversationId: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, "Message content is required")
});

export const insertChatMessageSchema = chatMessageSchema;
export type InsertChatMessage = z.infer<typeof chatMessageSchema>;

// Type for upcoming auctions view (not stored in DB)
export type UpcomingAuction = {
  id: string;
  productName: string;
  seller: string;
  startingBid: number;
  quantity: number;
  unit: string;
  startsIn: string;
  imageUrl?: string;
};
