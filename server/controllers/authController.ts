import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/jwtUtils';

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, farmName, location } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      res.status(400).json({ 
        error: 'User already exists with that email or username' 
      });
      return;
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      farmName: farmName || '',
      location: location || ''
    });

    // Save user to database
    await user.save();

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        location: user.location
      },
      token
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: error.message || 'Server error during registration' 
    });
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        location: user.location
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: error.message || 'Server error during login' 
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        farmName: user.farmName,
        location: user.location,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      error: error.message || 'Server error fetching user' 
    });
  }
};