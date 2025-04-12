
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from './ProductContext';
import { useUser } from './UserContext';
import { toast } from "sonner";

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  items: CartItem[];
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  createdAt: Date;
  message?: string;
  reply?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  checkout: () => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Mock orders
const mockOrders: Order[] = [
  {
    id: 'ord-1',
    items: [
      {
        productId: '1',
        quantity: 2,
        product: {
          id: '1',
          name: 'Premium Smartphone',
          price: 12000,
          description: 'High-end smartphone with the latest features',
          category: 'Electronics',
          accessPlan: 'basic',
          image: '/placeholder.svg',
          stock: 50,
          createdAt: new Date()
        }
      }
    ],
    resellerId: 'r-1',
    resellerName: 'John Doe',
    resellerEmail: 'john@example.com',
    status: 'pending',
    total: 24000,
    createdAt: new Date(),
    message: 'Please expedite shipping'
  }
];

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useUser();
  
  // Load cart from localStorage on initial mount
  useEffect(() => {
    if (user?.id) {
      const savedCart = localStorage.getItem(`kamao-cart-${user.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          setCartItems([]);
        }
      }
      
      // Load orders
      const savedOrders = localStorage.getItem('kamao-orders');
      if (savedOrders) {
        try {
          const parsed = JSON.parse(savedOrders);
          // Convert string dates back to Date objects
          const ordersWithDates = parsed.map((o: any) => ({
            ...o,
            createdAt: new Date(o.createdAt)
          }));
          setOrders(ordersWithDates);
        } catch (e) {
          setOrders(mockOrders);
        }
      } else {
        setOrders(mockOrders);
      }
    }
  }, [user?.id]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (user?.id && cartItems.length) {
      localStorage.setItem(`kamao-cart-${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);
  
  // Save orders to localStorage when they change
  useEffect(() => {
    if (orders.length) {
      localStorage.setItem('kamao-orders', JSON.stringify(orders));
    }
  }, [orders]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevItems, { productId: product.id, quantity, product }];
      }
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (user?.id) {
      localStorage.removeItem(`kamao-cart-${user.id}`);
    }
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.quantity * item.product.price,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const checkout = () => {
    if (!user) {
      toast.error("Please login to checkout");
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: [...cartItems],
      resellerId: user.id,
      resellerName: user.name,
      resellerEmail: user.email,
      status: 'pending',
      total: cartTotal,
      createdAt: new Date()
    };
    
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    toast.success("Order placed successfully");
  };

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder = {
      ...order,
      id: `ord-${Date.now()}`,
      createdAt: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrder = (id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === id ? { ...order, ...updates } : order
      )
    );
    toast.success("Order updated successfully");
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount,
      checkout,
      orders,
      addOrder,
      updateOrder
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
