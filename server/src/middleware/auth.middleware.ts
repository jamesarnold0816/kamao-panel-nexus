import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types/types';

// Extend Express Request interface to include user properties
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Verify the JWT token for protected routes
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Get token from "Bearer TOKEN"
    const secret = process.env.JWT_SECRET || 'fallback_secret';
    
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      
      // Add decoded user data to request object
      req.user = decoded as { id: string; email: string; role: UserRole };
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

// Check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

// Check if user is a reseller
export const isReseller = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (req.user.role !== 'reseller') {
      return res.status(403).json({ message: 'Access denied: Reseller privileges required' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }
};

// Check if user is either an admin or the specific reseller
export const isAdminOrSelf = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check either id or resellerId parameter
    const requestedUserId = req.params.id || req.params.resellerId;
    
    if (req.user.role === 'admin' || req.user.id === requestedUserId) {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'Authorization check failed' });
  }
}; 