import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'agri_vibrant_jwt_secret_key';

// Token expiration time
const EXPIRES_IN = '7d'; // 7 days

// Payload interface
export interface JwtPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Generate a JWT token for a user
 * @param user - User object from database
 * @returns JWT token
 */
export const generateToken = (user: IUser): string => {
  // Payload contains user information that will be encoded in token
  const payload: JwtPayload = {
    id: user._id ? user._id.toString() : '',
    username: user.username,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

/**
 * Verify a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    console.error('JWT Verification Error:', error);
    return null;
  }
};