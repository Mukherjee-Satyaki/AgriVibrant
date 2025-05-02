import connectDB from "./index";
import mongoose from "mongoose";
import Product from "../server/models/Product";
import { Auction } from "../server/models/Auction";

// Seed function
async function seed() {
  try {
    console.log("Starting seed process...");
    
    // Connect to MongoDB
    await connectDB();

    // Check if products collection already has data
    const existingProductsCount = await Product.countDocuments();
    if (existingProductsCount === 0) {
      console.log("Seeding products...");
      await seedProducts();
    } else {
      console.log("Products collection already has data, skipping...");
    }

    // Check if auctions collection already has data
    const existingAuctionsCount = await Auction.countDocuments();
    if (existingAuctionsCount === 0) {
      console.log("Seeding auctions...");
      await seedAuctions();
    } else {
      console.log("Auctions collection already has data, skipping...");
    }

    console.log("Seed process completed successfully.");
  } catch (error) {
    console.error("Error during seed process:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

async function seedProducts() {
  const products = [
    {
      name: "Organic Tomatoes",
      description: "Fresh organic tomatoes grown without pesticides. Perfect for salads and cooking.",
      price: 45,
      unit: "kg",
      category: "vegetables",
      seller: "Central Valley Farms",
      location: "Karnataka",
      imageUrl: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716",
      priceChange: 5
    },
    {
      name: "Premium Basmati Rice",
      description: "High-quality aromatic basmati rice. Long grain and perfect texture when cooked.",
      price: 120,
      unit: "kg",
      category: "grains",
      seller: "Northern Rice Fields",
      location: "Punjab",
      imageUrl: "https://images.unsplash.com/photo-1579113800032-c38bd7635818",
      priceChange: -2
    },
    {
      name: "Himalayan Apples",
      description: "Sweet and crisp apples from Himalayan orchards. Rich in flavor and nutrients.",
      price: 85,
      unit: "kg",
      category: "fruits",
      seller: "Mountain Orchards",
      location: "Himachal Pradesh",
      imageUrl: "https://images.unsplash.com/photo-1550828520-4cb496926fc9",
      priceChange: 8
    },
    {
      name: "Organic Milk",
      description: "Fresh A2 milk from grass-fed cows. No hormones or antibiotics.",
      price: 60,
      unit: "liter",
      category: "dairy",
      seller: "Green Valley Dairy",
      location: "Maharashtra",
      imageUrl: "https://images.unsplash.com/photo-1603638725748-ca86077a50b5",
      priceChange: 0
    },
    {
      name: "Fresh Green Peas",
      description: "Sweet and tender green peas, freshly harvested.",
      price: 70,
      unit: "kg",
      category: "vegetables",
      seller: "Organic Greens Co.",
      location: "Uttar Pradesh",
      imageUrl: "https://images.unsplash.com/photo-1563191799-2c7e8c185bb3",
      priceChange: 3
    },
    {
      name: "Alphonso Mangoes",
      description: "The king of mangoes, known for their rich flavor and aroma.",
      price: 450,
      unit: "dozen",
      category: "fruits",
      seller: "Ratnagiri Farms",
      location: "Maharashtra",
      imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078",
      priceChange: 12
    },
    {
      name: "Black Pepper",
      description: "Premium quality black pepper known for its strong aroma and flavor.",
      price: 550,
      unit: "kg",
      category: "spices",
      seller: "Kerala Spice Gardens",
      location: "Kerala",
      imageUrl: "https://images.unsplash.com/photo-1518646168441-12b1a4fa9c90",
      priceChange: -1
    },
    {
      name: "Farm Fresh Eggs",
      description: "Free-range eggs from naturally raised hens.",
      price: 90,
      unit: "dozen",
      category: "dairy",
      seller: "Happy Hens Farm",
      location: "Tamil Nadu",
      imageUrl: "https://images.unsplash.com/photo-1583167101236-5e10acd0a5ad",
      priceChange: 4
    }
  ];

  // Insert products using MongoDB
  await Product.insertMany(products);
  console.log(`✅ Added ${products.length} products to MongoDB`);
}

async function seedAuctions() {
  const now = new Date();
  
  // For active auctions
  const fourHoursLater = new Date(now);
  fourHoursLater.setHours(fourHoursLater.getHours() + 4);
  
  const twoHoursLater = new Date(now);
  twoHoursLater.setHours(twoHoursLater.getHours() + 2);
  
  const sixHoursLater = new Date(now);
  sixHoursLater.setHours(sixHoursLater.getHours() + 6);
  
  const activeAuctions = [
    {
      productName: "Premium Organic Wheat - 500kg Lot",
      description: "High-quality organic wheat grown without pesticides or synthetic fertilizers. Perfect for baking bread and making pastries.",
      startingBid: 12000,
      currentBid: 14250,
      quantity: 500,
      unit: "kg",
      category: "grains_pulses",
      seller: "Golden Farms",
      imageUrl: "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1",
      startTime: now,
      endTime: fourHoursLater,
      status: "active",
      bidCount: 8
    },
    {
      productName: "Alphonso Mangoes - Premium Grade",
      description: "The finest Alphonso mangoes from Ratnagiri region. Known for their unmatched sweetness and aroma.",
      startingBid: 18000,
      currentBid: 21800,
      quantity: 200,
      unit: "dozen",
      category: "fruits_vegetables",
      seller: "Ratnagiri Farms",
      imageUrl: "https://images.unsplash.com/photo-1596797038530-2c107229654b",
      startTime: now,
      endTime: twoHoursLater,
      status: "active",
      bidCount: 12
    },
    {
      productName: "Kashmiri Saffron - Grade A (500g)",
      description: "Authentic Kashmiri saffron known for its distinct aroma, flavor, and color. Harvested from the finest crocus flowers.",
      startingBid: 100000,
      currentBid: 125000,
      quantity: 0.5,
      unit: "kg",
      category: "spices",
      seller: "Himalayan Spices",
      imageUrl: "https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2",
      startTime: now,
      endTime: sixHoursLater,
      status: "active",
      bidCount: 5
    }
  ];

  // For upcoming auctions
  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(twoDaysLater.getDate() + 2);
  
  const threeDaysLater = new Date(now);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  const fiveDaysLater = new Date(now);
  fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
  
  const upcomingAuctions = [
    {
      productName: "Premium Coffee Beans",
      description: "High-altitude grown Arabica coffee beans with rich flavor profile. Medium roast with notes of chocolate and caramel.",
      startingBid: 8500,
      currentBid: 8500, // Set currentBid to startingBid for upcoming auctions
      quantity: 100,
      unit: "kg",
      category: "organic",
      seller: "Nilgiri Estates",
      imageUrl: "https://images.unsplash.com/photo-1599690925058-90e1a0b56154",
      startTime: twoDaysLater,
      endTime: new Date(twoDaysLater.getTime() + 24 * 60 * 60 * 1000), // 24 hours after start
      status: "scheduled",
      bidCount: 0
    },
    {
      productName: "Organic Wild Honey",
      description: "Pure wild honey harvested from forest beehives. Unprocessed and rich in natural enzymes and antioxidants.",
      startingBid: 12000,
      currentBid: 12000, // Set currentBid to startingBid for upcoming auctions
      quantity: 50,
      unit: "liter",
      category: "organic",
      seller: "Forest Naturals",
      imageUrl: "https://images.unsplash.com/photo-1615485500856-4eaeb6b39593",
      startTime: threeDaysLater,
      endTime: new Date(threeDaysLater.getTime() + 24 * 60 * 60 * 1000), // 24 hours after start
      status: "scheduled",
      bidCount: 0
    },
    {
      productName: "Premium Cashews",
      description: "Large, whole cashew nuts with superior flavor and crunch. Perfect for snacking or adding to recipes.",
      startingBid: 35000,
      currentBid: 35000, // Set currentBid to startingBid for upcoming auctions
      quantity: 200,
      unit: "kg",
      category: "organic",
      seller: "Coastal Nuts Co.",
      imageUrl: "https://images.unsplash.com/photo-1601836751569-c7a785938d86",
      startTime: fiveDaysLater,
      endTime: new Date(fiveDaysLater.getTime() + 24 * 60 * 60 * 1000), // 24 hours after start
      status: "scheduled",
      bidCount: 0
    }
  ];

  // Combine and insert all auctions using MongoDB
  const allAuctions = [...activeAuctions, ...upcomingAuctions];
  await Auction.insertMany(allAuctions);
  console.log(`✅ Added ${allAuctions.length} auctions to MongoDB`);
}

// Run the seed function
seed().catch(console.error);
