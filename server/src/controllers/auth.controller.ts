import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { LoginRequest, SignupRequest, User, UserPlan } from '../types/types';
import { generateToken, hashPassword, verifyPassword } from '../utils/auth';

// User login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role }: LoginRequest = req.body;

    // Validate request
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user in Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', role)
      .single();

    if (error || !users) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const user = users as User;
    const isPasswordValid = await verifyPassword(password, user.password as string);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      created_at: user.created_at
    });

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// User signup
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role }: SignupRequest = req.body;
    console.log(req.body);
    // Validate request
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // if (role === "admin") {
    //   return res.status(400).json({ message: 'Admin role is not allowed to sign up' });
    // }
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      plan: role === 'reseller' ? 'free' as UserPlan : null,
      created_at: new Date()
    };

    // Insert user into Supabase
    const { error } = await supabase
      .from('users')
      .insert([newUser]);

    if (error) {
      return res.status(500).json({ message: 'Error creating user', error: error.message });
    }

    // Generate token
    const { password: _, ...userWithoutPassword } = newUser;
    const token = generateToken(userWithoutPassword);

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
}; 