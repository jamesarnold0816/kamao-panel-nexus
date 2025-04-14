import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../config/supabase';
import { Product } from '../types/types';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, search, access_plan } = req.query;

    // Start query
    let query = supabase.from('products').select('*');

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply access plan filter
    if (access_plan) {
      // Handle plan hierarchy (vip can see basic and free, basic can see free)
      if (access_plan === 'vip') {
        query = query.in('access_plan', ['all', 'vip', 'basic', 'free']);
      } else if (access_plan === 'basic') {
        query = query.in('access_plan', ['all', 'basic', 'free']);
      } else if (access_plan === 'free') {
        query = query.in('access_plan', ['all', 'free']);
      }
    }

    const { data: products, error } = await query;

    if (error) {
      return res.status(500).json({ message: 'Error fetching products', error: error.message });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ message: 'Server error while fetching products' });
  }
};

// Get product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({ message: 'Server error while fetching product' });
  }
};

// Create product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, description, category, access_plan, image, stock } = req.body;
    console.log('Request body:', req.body);
    
    // Validate required fields
    if (!name || !price || !description || !category || !access_plan || stock === undefined) {
      console.error('Missing required fields:', { name, price, description, category, access_plan, stock });
      return res.status(400).json({ 
        message: 'All fields are required', 
        missing: Object.entries({ name, price, description, category, access_plan, stock })
          .filter(([_, value]) => value === undefined || value === '')
          .map(([key]) => key) 
      });
    }

    const newProduct: Product = {
      id: uuidv4(),
      name,
      price: parseFloat(price),
      description,
      category,
      access_plan,
      image: image || '/placeholder.svg',
      stock: parseInt(stock.toString()),
      created_at: new Date()
    };
    
    console.log('Attempting to create product:', newProduct);

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating product:', error);
      return res.status(500).json({ message: 'Error creating product', error: error.message });
    }

    console.log('Product created successfully:', data);
    res.status(201).json({
      message: 'Product created successfully',
      product: data
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error while creating product' });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ message: 'Error updating product', error: error.message });
    }

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error while updating product' });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ message: 'Error deleting product', error: error.message });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error while deleting product' });
  }
};

// Get product categories
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category');

    if (error) {
      return res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }

    // Extract unique categories
    const categories = [...new Set(data.map(item => item.category))];

    res.status(200).json(categories);
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ message: 'Server error while fetching categories' });
  }
}; 