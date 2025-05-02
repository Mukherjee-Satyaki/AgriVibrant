import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage, CreateProductInput, CreateAuctionInput } from "./storage";
import { z } from "zod";
import { 
  insertProductSchema, 
  insertAuctionSchema,
  insertBidSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { verifyToken, JwtPayload } from "./utils/jwtUtils";
import mongoose from "mongoose";
import { Bid } from "./models/Auction";

// Add user field to Express.Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix for all routes
  const apiPrefix = "/api";

  // Error handling middleware
  const handleErrors = (err: any, res: any) => {
    console.error('API Error:', err);
    
    if (err instanceof ZodError) {
      return res.status(400).json({ 
        error: "Validation error", 
        details: err.errors 
      });
    }
    
    return res.status(500).json({ 
      error: err.message || "Internal server error" 
    });
  };

  // Products routes
  app.get(`${apiPrefix}/products`, async (req, res) => {
    try {
      const category = req.query.category as string;
      const sortOrder = req.query.sortOrder as string;
      
      const products = await storage.getProducts(category, sortOrder);
      return res.json(products);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.post(`${apiPrefix}/products`, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      
      // Convert string values to appropriate types for MongoDB and use our CreateProductInput type
      const product = await storage.createProduct({
        name: productData.name,
        description: productData.description,
        price: Number(productData.price),
        unit: productData.unit,
        category: productData.category,
        seller: productData.seller,
        location: productData.location,
        imageUrl: productData.imageUrl,
        priceChange: productData.priceChange ? Number(productData.priceChange) : 0
      });
      
      return res.status(201).json(product);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    try {
      const productId = req.params.id;
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      return res.json(product);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  // Auctions routes
  app.get(`${apiPrefix}/auctions`, async (req, res) => {
    try {
      const category = req.query.category as string;
      const auctions = await storage.getAuctions(category);
      return res.json(auctions);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.post(`${apiPrefix}/auctions`, async (req, res) => {
    try {
      const auctionData = req.body;
      
      // Calculate end time based on duration
      const duration = req.body.duration;
      if (!duration || isNaN(duration)) {
        return res.status(400).json({ error: "Duration is required" });
      }
      
      // Determine start time - either now or scheduled
      let startTime = new Date();
      let status: 'active' | 'scheduled' | 'completed' = 'active';
      
      // Check if there's a scheduled start time
      if (auctionData.scheduledStart) {
        const scheduledTime = new Date(auctionData.scheduledStart);
        
        // If scheduled time is in the future, set status to 'scheduled'
        if (scheduledTime > startTime) {
          startTime = scheduledTime;
          status = 'scheduled';
        }
      }
      
      // Calculate end time based on start time and duration
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + parseInt(duration));
      
      // Convert string values to appropriate types for MongoDB and use our CreateAuctionInput type
      const parsedData = {
        productName: auctionData.productName,
        description: auctionData.description,
        startingBid: Number(auctionData.startingBid),
        currentBid: Number(auctionData.startingBid), // Initialize currentBid to startingBid
        quantity: Number(auctionData.quantity),
        unit: auctionData.unit,
        category: auctionData.category,
        seller: auctionData.seller,
        imageUrl: auctionData.imageUrl,
        status: status,
        startTime: startTime,
        endTime: endTime
      };
      
      // Validate the data with our schema
      const validatedData = insertAuctionSchema.parse(parsedData);
      
      const auction = await storage.createAuction(validatedData);
      
      return res.status(201).json(auction);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.get(`${apiPrefix}/auctions/upcoming`, async (req, res) => {
    try {
      const upcomingAuctions = await storage.getUpcomingAuctions();
      return res.json(upcomingAuctions);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.post(`${apiPrefix}/auctions/:id/bid`, async (req, res) => {
    try {
      const auctionId = req.params.id;
      const bidSchema = z.object({
        amount: z.coerce.number().positive("Bid amount must be positive"),
      });
      
      const { amount } = bidSchema.parse(req.body);
      
      // Validate the auction exists and is active
      const auction = await storage.getAuctionById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: "Auction not found" });
      }
      
      if (auction.status !== "active") {
        return res.status(400).json({ error: "This auction is no longer active" });
      }
      
      // Validate bid amount
      if (amount <= Number(auction.currentBid)) {
        return res.status(400).json({ 
          error: "Bid amount must be higher than current bid" 
        });
      }
      
      // Place the bid
      const bid = await storage.placeBid({
        auctionId,
        userId: null, // In a real app, get from authenticated user
        bidderName: "Anonymous Bidder",
        amount
      });
      
      return res.status(201).json(bid);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  app.post(`${apiPrefix}/auctions/:id/reminder`, async (req, res) => {
    try {
      const auctionId = req.params.id;
      
      // Validate the auction exists
      const auction = await storage.getAuctionById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: "Auction not found" });
      }
      
      // In a real app, we would store the reminder in the database
      // and send notifications when the auction starts
      
      return res.json({ 
        success: true, 
        message: "Reminder set successfully" 
      });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  app.get(`${apiPrefix}/auctions/:id/bids`, async (req, res) => {
    try {
      const auctionId = req.params.id;
      
      // Validate the auction exists
      const auction = await storage.getAuctionById(auctionId);
      if (!auction) {
        return res.status(404).json({ error: "Auction not found" });
      }
      
      // Get bid history from MongoDB using the imported Bid model
      const bids = await Bid.find({ auctionId: new mongoose.Types.ObjectId(auctionId) })
        .sort({ createdAt: -1 })  // Latest bids first
        .limit(10);               // Limit to 10 most recent bids
      
      // Convert MongoDB documents to BidResponse objects
      const bidResponses = bids.map((bid: any) => ({
        id: bid._id.toString(),
        auctionId: bid.auctionId.toString(),
        userId: bid.userId ? bid.userId.toString() : undefined,
        bidderName: bid.bidderName,
        amount: bid.amount,
        createdAt: bid.createdAt
      }));
      
      return res.json(bidResponses);
    } catch (err) {
      return handleErrors(err, res);
    }
  });

  // Add authentication middleware for chatbot routes
  app.use(`${apiPrefix}/chatbot`, (req, res, next) => {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      try {
        const decoded = verifyToken(token);
        if (decoded) {
          req.user = decoded;
          console.log(`User authenticated via JWT: ${decoded.id} (${decoded.username})`);
        }
      } catch (err) {
        console.log('Invalid token in chatbot route - continuing as anonymous user');
        // Don't return error, just continue without authentication
      }
    }
    next();
  });
  
  // Chatbot routes
  app.post(`${apiPrefix}/chatbot/session`, async (req, res) => {
    try {
      const sessionSchema = z.object({
        browserFingerprint: z.string().min(1, "Browser fingerprint cannot be empty"),
      });

      const { browserFingerprint } = sessionSchema.parse(req.body);
      
      // First, determine if this is a logged-in user or anonymous user
      let userId, publicUserId;
      
      if (req.user) {
        // For logged-in users, use their user ID
        userId = req.user.id;
        console.log(`Authenticated user with ID: ${userId} creating/retrieving chat session`);
      } else {
        // For anonymous users, create/get a public user with the browser fingerprint
        console.log(`Anonymous user with fingerprint: ${browserFingerprint}`);
        const publicUser = await storage.getOrCreatePublicUser(browserFingerprint);
        publicUserId = publicUser._id.toString();
        console.log(`Associated with public user ID: ${publicUserId}`);
      }
      
      // Get or create session with either userId or publicUserId
      const chatSession = await storage.getOrCreateChatSession(userId, publicUserId);
      
      return res.json({ session: chatSession });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  app.post(`${apiPrefix}/chatbot/conversation`, async (req, res) => {
    try {
      const conversationSchema = z.object({
        sessionId: z.string(),
        title: z.string().optional(),
      });
      
      const { sessionId, title } = conversationSchema.parse(req.body);
      
      // We don't need to call getOrCreateChatSession here, just verify the session exists
      // Create a new conversation linked to the session
      console.log(`Creating new conversation for chat session: ${sessionId}`);
      const conversation = await storage.createChatConversation(sessionId, title);
      
      return res.json({ conversation });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  app.get(`${apiPrefix}/chatbot/conversations/:sessionId`, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const conversations = await storage.getConversations(sessionId);
      
      return res.json({ conversations });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  // New endpoint to get all conversations for a logged-in user
  app.get(`${apiPrefix}/chatbot/user-conversations`, async (req, res) => {
    try {
      // This endpoint requires authentication
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const userId = req.user.id;
      console.log(`Fetching all conversations for authenticated user: ${userId}`);
      
      const conversations = await storage.getUserConversations(userId);
      
      return res.json({ conversations });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  app.get(`${apiPrefix}/chatbot/messages/:conversationId`, async (req, res) => {
    try {
      const conversationId = req.params.conversationId;
      const messages = await storage.getChatMessages(conversationId);
      
      return res.json({ messages });
    } catch (err) {
      return handleErrors(err, res);
    }
  });
  
  app.post(`${apiPrefix}/chatbot/message`, async (req, res) => {
    try {
      const messageSchema = z.object({
        conversationId: z.string(),
        message: z.string().min(1, "Message cannot be empty"),
      });
      
      const { conversationId, message } = messageSchema.parse(req.body);
      
      console.log(`Processing message in conversation: ${conversationId}`);
      
      // Process the message with conversation context
      // This will:
      // 1. Save the user message to the database
      // 2. Fetch previous messages for context
      // 3. Send the message + context to Gemini API
      // 4. Save the assistant's response to the database
      const response = await storage.processChatbotMessage(message, conversationId);
      
      console.log(`Generated response for message in conversation: ${conversationId}`);
      
      return res.json({ message: response });
    } catch (err) {
      console.error(`Error processing chat message:`, err);
      return handleErrors(err, res);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
