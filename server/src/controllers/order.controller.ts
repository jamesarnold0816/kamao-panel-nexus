import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { Order, OrderStatus } from '../types/types';

// Get all orders
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    let query = supabase.from('orders').select('*');

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Sort by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
};

// Get orders by reseller
export const getResellerOrders = async (req: Request, res: Response) => {
  try {
    const { resellerId } = req.params;
    const { status } = req.query;

    let query = supabase.from('orders')
      .select('*')
      .eq('reseller_id', resellerId);

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Sort by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: orders, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching reseller orders', error: error.message });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error getting reseller orders:', error);
    res.status(500).json({ message: 'Server error while fetching reseller orders' });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ message: 'Server error while fetching order' });
  }
};

// Create order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, reseller_id, reseller_name, reseller_email, total, message, shipping, revenue } = req.body;

    // Validate required fields
    if (!items || !reseller_id || !reseller_name || !reseller_email || !total) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const newOrder: Order = {
      id: uuidv4(),
      items,
      reseller_id,
      reseller_name,
      reseller_email,
      status: 'pending',
      total,
      created_at: new Date(),
      message,
      shipping,
      revenue
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([newOrder])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error creating order', error: error.message });
    }

    // Update product stock
    for (const item of items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();

      if (product) {
        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }
    }

    res.status(201).json({
      message: 'Order created successfully',
      order: data
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error while creating order' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required' });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating order status', error: error.message });
    }

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status' });
  }
};

// Add reply to order
export const addOrderReply = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Reply is required' });
    }

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update({ reply })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error adding reply to order', error: error.message });
    }

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.status(200).json({
      message: 'Reply added to order successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error adding reply to order:', error);
    res.status(500).json({ message: 'Server error while adding reply to order' });
  }
}; 