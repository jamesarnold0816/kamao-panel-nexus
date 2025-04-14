import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../types/types';

// Generate JWT token
export const generateToken = (user: Omit<User, 'password'>) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    }, 
    secret, 
    { expiresIn: '7d' }
  );
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}; 