import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { UserPlan } from '../types/types';

// Get all plan upgrade requests
export const getAllPlanRequests = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase.from('plan_upgrade_requests').select('*');

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Sort by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: requests, error } = await query;

    if (error) {
      console.error('Supabase error fetching plan requests:', error);
      return res.status(500).json({ message: 'Error fetching plan requests', error: error.message });
    }

    res.status(200).json(requests || []);
  } catch (error) {
    console.error('Error getting plan requests:', error);
    res.status(500).json({ message: 'Server error while fetching plan requests' });
  }
};

// Get plan requests by reseller
export const getResellerPlanRequests = async (req: Request, res: Response) => {
  try {
    const { resellerId } = req.params;

    const { data: requests, error } = await supabase
      .from('plan_upgrade_requests')
      .select('*')
      .eq('reseller_id', resellerId)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ message: 'Error fetching reseller plan requests', error: error.message });
    }

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error getting reseller plan requests:', error);
    res.status(500).json({ message: 'Server error while fetching reseller plan requests' });
  }
};

// Create plan upgrade request
export const createPlanRequest = async (req: Request, res: Response) => {
  try {
    const { reseller_id, reseller_name, reseller_email, current_plan, requested_plan } = req.body;

    // Validate required fields
    if (!reseller_id || !reseller_name || !reseller_email || !current_plan || !requested_plan) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate plan hierarchy
    if (current_plan === requested_plan) {
      return res.status(400).json({ message: 'Current plan and requested plan cannot be the same' });
    }

    // Check if there's already a pending request
    const { data: existingRequest } = await supabase
      .from('plan_upgrade_requests')
      .select('*')
      .eq('reseller_id', reseller_id)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists for this reseller' });
    }

    const newRequest = {
      id: uuidv4(),
      reseller_id,
      reseller_name,
      reseller_email,
      current_plan,
      requested_plan,
      status: 'pending',
      created_at: new Date()
    };

    const { data, error } = await supabase
      .from('plan_upgrade_requests')
      .insert([newRequest])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error creating plan request', error: error.message });
    }

    res.status(201).json({
      message: 'Plan upgrade request submitted successfully',
      request: data
    });
  } catch (error) {
    console.error('Error creating plan request:', error);
    res.status(500).json({ message: 'Server error while creating plan request' });
  }
};

// Approve plan upgrade request
export const approvePlanRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get the request
    const { data: request, error: requestError } = await supabase
      .from('plan_upgrade_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return res.status(404).json({ message: 'Plan upgrade request not found' });
    }

    // Update request status
    const { error: updateRequestError } = await supabase
      .from('plan_upgrade_requests')
      .update({ status: 'approved' })
      .eq('id', id);

    if (updateRequestError) {
      return res.status(500).json({ message: 'Error updating plan request', error: updateRequestError.message });
    }

    // Update user plan
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ plan: request.requested_plan })
      .eq('id', request.reseller_id);

    if (updateUserError) {
      return res.status(500).json({ message: 'Error updating user plan', error: updateUserError.message });
    }

    res.status(200).json({
      message: 'Plan upgrade request approved successfully'
    });
  } catch (error) {
    console.error('Error approving plan request:', error);
    res.status(500).json({ message: 'Server error while approving plan request' });
  }
};

// Reject plan upgrade request
export const rejectPlanRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('plan_upgrade_requests')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Error rejecting plan request', error: error.message });
    }

    res.status(200).json({
      message: 'Plan upgrade request rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting plan request:', error);
    res.status(500).json({ message: 'Server error while rejecting plan request' });
  }
}; 