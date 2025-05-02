import mongoose from 'mongoose';
import { processAgriculturalQuery } from "./services/geminiService";
import Product, { IProduct } from './models/Product';
import { Auction, Bid, IAuction, IBid } from './models/Auction';
import { ChatSession, ChatConversation, ChatMessage, IChatSession, IChatConversation, IChatMessage } from './models/Chat';
import { PublicUser, IPublicUser } from './models/PublicUser';

// Type definitions for our response objects
export type ProductResponse = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  seller: string;
  location: string;
  imageUrl?: string;
  priceChange?: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  seller: string;
  location: string;
  imageUrl?: string;
  priceChange?: number;
};

export type AuctionResponse = {
  id: string;
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
  remainingTime: number;
};

export type CreateAuctionInput = {
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
  status?: 'active' | 'scheduled' | 'completed';
};

export type BidResponse = {
  id: string;
  auctionId: string;
  userId?: string;
  bidderName: string;
  amount: number;
  createdAt: Date;
};

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

export type ChatSessionResponse = {
  id: string;
  userId?: string;
  publicUserId?: string;
  createdAt: Date;
  lastActive: Date;
};

export type ChatConversationResponse = {
  id: string;
  sessionId: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
};

export type ChatMessageResponse = {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

// Agricultural knowledge base for chatbot
const agricultureKnowledge: Record<string, string> = {
  "tomato blight": `
Tomato blight is a common disease caused by fungi. Here's how to identify it early:

1. Dark spots on lower leaves that spread upward
2. Brown/black lesions on stems
3. Fruit develops dark, leathery patches
4. Leaves may curl and wither

To prevent tomato blight:
- Ensure good air circulation
- Water at soil level, not on foliage
- Remove affected plants immediately
- Use copper-based fungicides preventively
- Practice crop rotation`,

  "water conservation": `
Best practices for water conservation in agriculture:

1. Drip irrigation systems (90-95% efficiency)
2. Soil moisture sensors to optimize watering schedules
3. Rainwater harvesting systems
4. Mulching to reduce evaporation
5. Drought-resistant crop varieties
6. Conservation tillage to improve soil moisture retention
7. Scheduling irrigation during early morning or evening
8. Regular maintenance of irrigation systems to prevent leaks`,

  "organic tomato farming": `
For organic tomato farming, here are some best practices:

1. Start with healthy soil enriched with compost and organic matter
2. Use organic pest control methods like neem oil and beneficial insects
3. Practice crop rotation to prevent disease buildup
4. Stake plants early for better air circulation
5. Water consistently at soil level to prevent foliage diseases
6. Mulch with organic materials to retain moisture and suppress weeds`,

  "organic pest control": `
Effective organic pest control methods for tomatoes:

1. Companion planting (basil, marigolds, nasturtiums repel pests)
2. Neem oil spray (controls aphids, mites, and many insects)
3. Bacillus thuringiensis (BT) for caterpillars
4. Introduce beneficial insects like ladybugs and lacewings
5. Diatomaceous earth around plants for crawling insects
6. Garlic and hot pepper sprays as repellents
7. Regular monitoring and hand-picking pests
8. Sticky traps for flying insects`
};

// Helper function to convert MongoDB document to plain object with string ID
function documentToPlainObject<T extends mongoose.Document>(doc: T): any {
  const obj = doc.toObject();
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;
  return obj;
}

// Storage interface implementation
export const storage = {
  // Product operations
  async getProducts(category?: string, sortOrder?: string): Promise<ProductResponse[]> {
    let query = Product.find();
    
    // Apply category filter if provided and not 'all'
    if (category && category !== 'all') {
      query = query.where('category', category);
    }
    
    // Apply sorting
    if (sortOrder) {
      switch (sortOrder) {
        case 'price_asc':
          query = query.sort({ price: 1 });
          break;
        case 'price_desc':
          query = query.sort({ price: -1 });
          break;
        case 'newest':
        default:
          query = query.sort({ createdAt: -1 });
          break;
      }
    } else {
      // Default sorting
      query = query.sort({ createdAt: -1 });
    }
    
    const products = await query.exec();
    return products.map(documentToPlainObject);
  },
  
  async getProductById(id: string): Promise<ProductResponse | undefined> {
    try {
      const product = await Product.findById(id);
      if (!product) return undefined;
      return documentToPlainObject(product);
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return undefined;
    }
  },
  
  async createProduct(data: CreateProductInput): Promise<ProductResponse> {
    const product = new Product({
      ...data,
      priceChange: data.priceChange || 0
    });
    
    await product.save();
    return documentToPlainObject(product);
  },
  
  // Auction operations
  async getAuctions(category?: string): Promise<AuctionResponse[]> {
    const now = new Date();
    
    let query = Auction.find({
      status: 'active',
      endTime: { $gte: now }
    });
    
    // Apply category filter if provided and not 'all'
    if (category) {
      if (category === 'ending_soon') {
        // Sort by auctions ending soonest
        query = query.sort({ endTime: 1 });
      } else if (category !== 'all') {
        query = query.where('category', category);
      }
    }
    
    // Default sort by most recently created
    if (category !== 'ending_soon') {
      query = query.sort({ createdAt: -1 });
    }
    
    const auctions = await query.exec();
    
    // Calculate remaining time for each auction
    return auctions.map(auction => {
      const plainAuction = documentToPlainObject(auction);
      // The remainingTime is already calculated as a virtual property in the Auction model
      return plainAuction;
    });
  },
  
  async getUpcomingAuctions(): Promise<UpcomingAuction[]> {
    const now = new Date();
    
    const scheduledAuctions = await Auction.find({
      status: 'scheduled',
      startTime: { $gte: now }
    })
    .sort({ startTime: 1 })
    .limit(10)
    .exec();
    
    // Format upcoming auctions for display
    return scheduledAuctions.map(auction => {
      const startTime = auction.startTime;
      const diffMs = startTime.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let startsIn;
      if (diffDays > 0) {
        startsIn = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
      } else {
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        startsIn = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
      }
      
      return {
        id: auction._id ? auction._id.toString() : '',
        productName: auction.productName,
        seller: auction.seller,
        startingBid: auction.startingBid,
        quantity: auction.quantity,
        unit: auction.unit,
        startsIn,
        imageUrl: auction.imageUrl
      };
    });
  },
  
  async getAuctionById(id: string): Promise<AuctionResponse | undefined> {
    try {
      const auction = await Auction.findById(id);
      if (!auction) return undefined;
      
      return documentToPlainObject(auction);
    } catch (error) {
      console.error(`Error fetching auction with ID ${id}:`, error);
      return undefined;
    }
  },
  
  async createAuction(data: CreateAuctionInput): Promise<AuctionResponse> {
    const auction = new Auction({
      ...data,
      status: data.status || 'active', // Set initial status to active if not provided
      bidCount: 0
    });
    
    await auction.save();
    return documentToPlainObject(auction);
  },
  
  async placeBid(data: { auctionId: string, userId: string | null, bidderName: string, amount: number }): Promise<BidResponse> {
    // Use MongoDB session to ensure atomicity (similar to a transaction)
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Create the bid
      const bid = new Bid({
        auctionId: data.auctionId,
        userId: data.userId,
        bidderName: data.bidderName,
        amount: data.amount
      });
      
      await bid.save({ session });
      
      // Update the auction with new current bid and increment bid count
      await Auction.findByIdAndUpdate(
        data.auctionId,
        {
          $set: { currentBid: data.amount },
          $inc: { bidCount: 1 }
        },
        { session }
      );
      
      await session.commitTransaction();
      return documentToPlainObject(bid);
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  },
  
  // Public User operations
  async getOrCreatePublicUser(browserFingerprint: string): Promise<IPublicUser> {
    try {
      console.log(`Looking for public user with fingerprint: ${browserFingerprint}`);
      
      // Find existing public user by fingerprint
      let publicUser = await PublicUser.findOne({ browserFingerprint });
      
      if (publicUser) {
        console.log(`Found existing public user: ${publicUser._id}`);
        
        // Update last active timestamp
        publicUser.lastActive = new Date();
        await publicUser.save();
        
        return publicUser;
      }
      
      // Create new public user if not found
      console.log(`Creating new public user for fingerprint: ${browserFingerprint}`);
      publicUser = new PublicUser({
        browserFingerprint,
        lastActive: new Date()
      });
      
      await publicUser.save();
      console.log(`Created new public user: ${publicUser._id}`);
      
      return publicUser;
    } catch (error) {
      console.error('Error in getOrCreatePublicUser:', error);
      throw error;
    }
  },
  
  // Chat session operations
  async getOrCreateChatSession(userId?: string, publicUserId?: string): Promise<ChatSessionResponse> {
    try {
      if (!userId && !publicUserId) {
        throw new Error('Either userId or publicUserId must be provided');
      }
      
      // Try to find an existing session
      let existingSession;
      
      if (userId) {
        console.log(`Looking for chat session with user ID: ${userId}`);
        existingSession = await ChatSession.findOne({ userId: new mongoose.Types.ObjectId(userId) });
        
        if (existingSession) {
          console.log(`Found existing chat session for user ID: ${userId}`);
          
          // Update last active time
          existingSession.lastActive = new Date();
          await existingSession.save();
          
          return documentToPlainObject(existingSession);
        }
      }
      
      if (publicUserId) {
        console.log(`Looking for chat session with public user ID: ${publicUserId}`);
        existingSession = await ChatSession.findOne({ publicUserId: new mongoose.Types.ObjectId(publicUserId) });
        
        if (existingSession) {
          console.log(`Found existing chat session for public user ID: ${publicUserId}`);
          
          // If the user is now logged in (userId provided) but session was for anonymous user,
          // update the session to associate with the logged-in user
          if (userId && !existingSession.userId) {
            console.log(`Updating anonymous session to logged-in user: ${userId}`);
            existingSession.userId = new mongoose.Types.ObjectId(userId);
          }
          
          // Update last active time
          existingSession.lastActive = new Date();
          await existingSession.save();
          
          return documentToPlainObject(existingSession);
        }
      }
      
      // Create a new session if none was found
      console.log('Creating new chat session');
      const newSession = new ChatSession({
        userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
        publicUserId: publicUserId ? new mongoose.Types.ObjectId(publicUserId) : undefined,
        lastActive: new Date()
      });
      
      await newSession.save();
      console.log(`Created new chat session: ${newSession._id}`);
      
      return documentToPlainObject(newSession);
    } catch (error) {
      console.error('Error in getOrCreateChatSession:', error);
      throw error;
    }
  },
  
  async createChatConversation(sessionId: string, title: string = "New Conversation"): Promise<ChatConversationResponse> {
    try {
      // Find the session
      const session = await ChatSession.findById(sessionId);
      
      if (!session) {
        throw new Error(`Chat session with ID ${sessionId} not found`);
      }
      
      console.log(`Creating new conversation for session: ${session._id}`);
      
      // Create a conversation with proper structure
      const newConversation = new ChatConversation({
        sessionId: session._id,
        title: title || `Agricultural Conversation - ${new Date().toLocaleString()}`,
        messageCount: 0,
        lastMessageAt: new Date()
      });
      
      await newConversation.save();
      console.log(`Created new conversation: ${newConversation._id}`);
      
      // Update session last active time
      session.lastActive = new Date();
      await session.save();
      
      return documentToPlainObject(newConversation);
    } catch (error) {
      console.error('Error in createChatConversation:', error);
      throw error;
    }
  },
  
  async getConversations(sessionId: string): Promise<ChatConversationResponse[]> {
    try {
      console.log(`Fetching conversations for session: ${sessionId}`);
      
      // Find the session by ID
      const session = await ChatSession.findById(sessionId);
      
      if (!session) {
        console.log(`Session with ID ${sessionId} not found for conversation retrieval`);
        return []; // Return empty array instead of error for better UX
      }
      
      // Update session last active time
      session.lastActive = new Date();
      await session.save();
      
      // Fetch conversations sorted by most recent activity first
      const conversations = await ChatConversation.find({ sessionId: session._id })
        .sort({ lastMessageAt: -1 })
        .exec();
        
      console.log(`Found ${conversations.length} conversations for session: ${session._id}`);
      
      return conversations.map(documentToPlainObject);
    } catch (error) {
      console.error('Error in getConversations:', error);
      return []; // Return empty array for better UX
    }
  },
  
  // Get all conversations for a specific user
  async getUserConversations(userId: string): Promise<ChatConversationResponse[]> {
    try {
      console.log(`Fetching all conversations for user ID: ${userId}`);
      
      // Convert userId to ObjectId
      let userObjectId;
      try {
        userObjectId = new mongoose.Types.ObjectId(userId);
      } catch (err) {
        console.error(`Invalid ObjectId format for user ID: ${userId}`, err);
        return []; // Return empty array if userId is not a valid ObjectId
      }
      
      // Find the user's session
      const userSession = await ChatSession.findOne({ userId: userObjectId });
      
      if (!userSession) {
        console.log(`No chat session found for user ID: ${userId}`);
        return []; // Return empty array if no session found
      }
      
      // Update session last active time
      userSession.lastActive = new Date();
      await userSession.save();
      
      // Fetch conversations sorted by most recent activity first
      const conversations = await ChatConversation.find({ sessionId: userSession._id })
        .sort({ lastMessageAt: -1 })
        .exec();
      
      console.log(`Found ${conversations.length} conversations for user: ${userId}`);
      
      return conversations.map(documentToPlainObject);
    } catch (error) {
      console.error('Error in getUserConversations:', error);
      return []; // Return empty array for better UX
    }
  },
  
  async getChatMessages(conversationId: string): Promise<ChatMessageResponse[]> {
    try {
      console.log(`Fetching messages for conversation: ${conversationId}`);
      
      // Get conversation - handle both ObjectId and string IDs
      let conversation;
      try {
        conversation = await ChatConversation.findById(conversationId);
      } catch (err) {
        console.log(`Invalid ObjectId format for conversation ID: ${conversationId}`);
        return []; // Return empty array for invalid ID format
      }
      
      if (!conversation) {
        console.log(`Conversation with ID ${conversationId} not found for message retrieval`);
        return []; // Return empty array instead of error for better UX
      }
      
      const messages = await ChatMessage.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .exec();
        
      console.log(`Found ${messages.length} messages for conversation: ${conversation._id}`);
      
      return messages.map(documentToPlainObject);
    } catch (error) {
      console.error('Error in getChatMessages:', error);
      throw error;
    }
  },
  
  async saveChatMessage(conversationId: string, role: 'user' | 'assistant', content: string): Promise<ChatMessageResponse> {
    try {
      console.log(`Saving ${role} message for conversation: ${conversationId}`);
      
      // Use a MongoDB session to ensure atomicity for message saving and conversation updating
      const session = await mongoose.startSession();
      session.startTransaction();
      
      try {
        // Verify conversation exists
        const conversation = await ChatConversation.findById(conversationId).session(session);
        
        if (!conversation) {
          throw new Error(`Conversation with ID ${conversationId} not found`);
        }
        
        // Create and save the new message
        const newMessage = new ChatMessage({
          conversationId: conversation._id,
          role,
          content
        });
        
        await newMessage.save({ session });
        console.log(`Saved message: ${newMessage._id}`);
        
        // Update conversation metadata
        conversation.messageCount += 1;
        conversation.lastMessageAt = new Date();
        await conversation.save({ session });
        
        // Find the session to update lastActive
        const chatSession = await ChatSession.findById(conversation.sessionId).session(session);
        if (chatSession) {
          chatSession.lastActive = new Date();
          await chatSession.save({ session });
        }
        
        // Commit the transaction
        await session.commitTransaction();
        return documentToPlainObject(newMessage);
      } catch (error) {
        // If an error occurred, abort the transaction
        await session.abortTransaction();
        throw error;
      } finally {
        // End the session
        session.endSession();
      }
    } catch (error) {
      console.error('Error in saveChatMessage:', error);
      throw error;
    }
  },
  
  // Process a message and generate a response using the Gemini API
  async processChatbotMessage(
    message: string, 
    conversationId: string
  ): Promise<string> {
    try {
      console.log(`Processing message for conversation: ${conversationId}`);
      
      // Verify conversation exists
      const conversation = await ChatConversation.findById(conversationId);
      if (!conversation) {
        throw new Error(`Conversation with ID ${conversationId} not found`);
      }
      
      // First, save the user message to maintain proper order
      await this.saveChatMessage(conversationId, 'user', message);
      
      // Update conversation title if this is the first message
      if (conversation.messageCount <= 2) {
        // Generate a title based on the first user message
        const truncatedTitle = message.length > 30 
          ? message.substring(0, 30) + "..." 
          : message;
        
        conversation.title = truncatedTitle;
        await conversation.save();
      }
      
      // Get previous messages in this conversation for context (up to 10 most recent)
      const previousMessages = await ChatMessage.find({ conversationId: conversation._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .sort({ createdAt: 1 })
        .exec();
      
      console.log(`Using ${previousMessages.length} previous messages for context`);
      
      // Format messages for the Gemini API
      const conversationHistory = previousMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Use Gemini API through our service to generate response with context
      const response = await processAgriculturalQuery(message, conversationHistory);
      
      // Save the assistant response
      await this.saveChatMessage(conversationId, 'assistant', response);
      
      return response;
    } catch (error) {
      console.error('Error processing message with Gemini API:', error);
      
      // Define a default error message that is friendly and helpful
      let fallbackResponse = "I apologize, but I'm currently having trouble processing your request. Could you try asking about common agricultural topics like crop diseases, farming techniques, weather patterns, or organic farming?";
      
      // Attempt to use the fallback knowledge base first
      try {
        const messageLower = message.toLowerCase();
        
        // Search simple knowledge base for relevant information
        for (const [keyword, answer] of Object.entries(agricultureKnowledge)) {
          if (messageLower.includes(keyword)) {
            fallbackResponse = answer;
            console.log(`Using fallback response for keyword: ${keyword}`);
            break;
          }
        }
      } catch (keywordError) {
        console.error('Error in keyword matching fallback:', keywordError);
        // Continue with the default fallback message
      }
      
      // Save the fallback response to maintain conversation history
      try {
        // Note: User message was already saved at the beginning of the method
        await this.saveChatMessage(conversationId, 'assistant', fallbackResponse);
      } catch (dbError) {
        console.error('Error storing fallback chat message:', dbError);
        // Even if we can't save to DB, still return a response to user
      }
      
      return fallbackResponse;
    }
  }
};
