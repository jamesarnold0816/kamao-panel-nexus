import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";
import { productService } from '../services/api';
import { useUser } from './UserContext';

export type AccessPlan = 'free' | 'basic' | 'vip' | 'all';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  access_plan: AccessPlan; // Changed to match server naming
  image: string;
  secondary_images?: string[]; // Array of secondary image URLs
  stock: number;
  created_at: Date; // Changed to match server naming
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  categories: string[];
  fetchProducts: (category?: string, search?: string, plan?: AccessPlan) => Promise<void>;
  fetchCategories: () => Promise<void>;
  loading: boolean;
  filteredProducts: Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  // Fetch products on initial load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch products when user changes (because access level may change)
  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user?.plan]);

  // Fetch all products from the API
  const fetchProducts = async (category?: string, search?: string, plan?: AccessPlan) => {
    try {
      setLoading(true);
      const queryParams = {
        category,
        search,
        access_plan: plan
      };
      
      const data = await productService.getAllProducts(queryParams);
      
      // Convert dates from strings to Date objects
      const productsWithDates = data.map((p: any) => ({
        ...p,
        created_at: new Date(p.created_at)
      }));
      
      setProducts(productsWithDates);
      setFilteredProducts(productsWithDates);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.response?.data?.message || 'Error fetching products');
      setLoading(false);
    }
  };

  // Fetch product categories
  const fetchCategories = async () => {
    try {
      const data = await productService.getCategories();
      setCategories(data);
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      toast.error(error.response?.data?.message || 'Error fetching categories');
    }
  };

  // Add a new product
  const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      setLoading(true);
      const response = await productService.createProduct(product);
      
      const newProduct = {
        ...response.product,
        created_at: new Date(response.product.created_at)
      };
      
      setProducts(prev => [...prev, newProduct]);
      toast.success("Product added successfully");
      setLoading(false);
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Error adding product');
      setLoading(false);
    }
  };

  // Update an existing product
  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>) => {
    try {
      setLoading(true);
      const response = await productService.updateProduct(id, updates);
      
      const updatedProduct = {
        ...response.product,
        created_at: new Date(response.product.created_at)
      };
      
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      
      toast.success("Product updated successfully");
      setLoading(false);
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Error updating product');
      setLoading(false);
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success("Product deleted successfully");
      setLoading(false);
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.response?.data?.message || 'Error deleting product');
      setLoading(false);
    }
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      categories,
      fetchProducts,
      fetchCategories,
      loading,
      filteredProducts
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
