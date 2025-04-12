
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from "sonner";

export type AccessPlan = 'free' | 'basic' | 'vip' | 'all';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  accessPlan: AccessPlan;
  image: string;
  stock: number;
  createdAt: Date;
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  categories: string[];
  filteredProducts: (category?: string, search?: string, plan?: AccessPlan) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Smartphone',
    price: 12000,
    description: 'High-end smartphone with the latest features',
    category: 'Electronics',
    accessPlan: 'basic',
    image: '/placeholder.svg',
    stock: 50,
    createdAt: new Date()
  },
  {
    id: '2',
    name: 'Wireless Earbuds',
    price: 2500,
    description: 'Noise cancelling wireless earbuds',
    category: 'Electronics',
    accessPlan: 'free',
    image: '/placeholder.svg',
    stock: 100,
    createdAt: new Date()
  },
  {
    id: '3',
    name: 'Smart Watch',
    price: 8000,
    description: 'Fitness tracking smart watch',
    category: 'Electronics',
    accessPlan: 'vip',
    image: '/placeholder.svg',
    stock: 30,
    createdAt: new Date()
  },
  {
    id: '4',
    name: 'Designer Handbag',
    price: 15000,
    description: 'Luxury designer handbag',
    category: 'Fashion',
    accessPlan: 'vip',
    image: '/placeholder.svg',
    stock: 15,
    createdAt: new Date()
  },
  {
    id: '5',
    name: 'Running Shoes',
    price: 3500,
    description: 'Professional running shoes',
    category: 'Fashion',
    accessPlan: 'free',
    image: '/placeholder.svg',
    stock: 80,
    createdAt: new Date()
  },
  {
    id: '6',
    name: 'Smart Home Hub',
    price: 9000,
    description: 'Control all your smart home devices',
    category: 'Home',
    accessPlan: 'basic',
    image: '/placeholder.svg',
    stock: 25,
    createdAt: new Date()
  }
];

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // Load from localStorage or use mock data on first load
    const savedProducts = localStorage.getItem('kamao-products');
    if (savedProducts) {
      try {
        const parsed = JSON.parse(savedProducts);
        // Convert string dates back to Date objects
        const productsWithDates = parsed.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }));
        setProducts(productsWithDates);
      } catch (e) {
        setProducts(mockProducts);
      }
    } else {
      setProducts(mockProducts);
    }
  }, []);

  // Save products to localStorage when they change
  useEffect(() => {
    if (products.length) {
      localStorage.setItem('kamao-products', JSON.stringify(products));
    }
  }, [products]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
    toast.success("Product added successfully");
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => {
    setProducts(prev => 
      prev.map(product => 
        product.id === id ? { ...product, ...updates } : product
      )
    );
    toast.success("Product updated successfully");
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    toast.success("Product deleted successfully");
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = (category?: string, search?: string, plan?: AccessPlan) => {
    return products.filter(product => {
      const matchesCategory = !category || product.category === category;
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = !plan || 
        product.accessPlan === plan || 
        product.accessPlan === 'all' ||
        (plan === 'vip' && (product.accessPlan === 'basic' || product.accessPlan === 'free')) ||
        (plan === 'basic' && product.accessPlan === 'free');
        
      return matchesCategory && matchesSearch && matchesPlan;
    });
  };

  return (
    <ProductContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      categories, 
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
