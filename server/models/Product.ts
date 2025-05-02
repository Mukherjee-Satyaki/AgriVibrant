import mongoose, { Schema, Document } from 'mongoose';

// Product interface
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
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
}

// Product Schema
const productSchema = new Schema({
  name: {
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
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
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
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  priceChange: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically updates the timestamps
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;