import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwtUtils';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Middleware to authenticate JWT token
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authorization denied, no token provided' });
      return;
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ error: 'Token is invalid or expired' });
      return;
    }
    
    // Add user from payload to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Middleware to check admin role
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied, admin privileges required' });
    return;
  }
  next();
};