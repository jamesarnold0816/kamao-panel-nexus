import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { User, UserPlan } from '../types/types';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      return res.status(500).json({ message: 'Error fetching users', error: error.message });
    }

    // Remove password from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).json(sanitizedUsers);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Get all resellers
export const getAllResellers = async (req: Request, res: Response) => {
  try {
    const { data: resellers, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'reseller');

    if (error) {
      return res.status(500).json({ message: 'Error fetching resellers', error: error.message });
    }

    // Remove password from response
    const sanitizedResellers = resellers.map(reseller => {
      const { password, ...resellerWithoutPassword } = reseller;
      return resellerWithoutPassword;
    });

    res.status(200).json(sanitizedResellers);
  } catch (error) {
    console.error('Error getting resellers:', error);
    res.status(500).json({ message: 'Server error while fetching resellers' });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error while fetching user' });
  }
};

// Update user
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Prevent updating sensitive fields
    const { password, role, ...safeUpdates } = updates;

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating user', error: error.message });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'User updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
};

// Update user plan
export const updateUserPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plan } = req.body;

    if (!plan || !['free', 'basic', 'vip'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan (free, basic, or vip) is required' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating user plan', error: error.message });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'User plan updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating user plan:', error);
    res.status(500).json({ message: 'Server error while updating user plan' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Error deleting user', error: error.message });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
}; 