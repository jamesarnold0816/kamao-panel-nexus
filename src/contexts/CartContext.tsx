import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from './ProductContext';
import { useUser } from './UserContext';
import { toast } from "sonner";

export interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export interface PlanUpgradeRequest {
  id: string;
  resellerId: string;
  resellerName: string;
  resellerEmail: string;
  currentPlan: 'free' | 'basic' | 'vip';
  requestedPlan: 'free' | 'basic' | 'vip';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
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
  shipping?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    carrier: string;
  };
  revenue?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  checkout: (shippingInfo: Order['shipping'], revenue: number) => void;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (id: string, updates: Partial<Omit<Order, 'id' | 'createdAt'>>) => void;
  planUpgradeRequests: PlanUpgradeRequest[];
  requestPlanUpgrade: (resellerId: string, resellerName: string, resellerEmail: string, currentPlan: 'free' | 'basic' | 'vip', requestedPlan: 'free' | 'basic' | 'vip') => void;
  approvePlanUpgrade: (requestId: string) => void;
  rejectPlanUpgrade: (requestId: string) => void;
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
  const [planUpgradeRequests, setPlanUpgradeRequests] = useState<PlanUpgradeRequest[]>([]);
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
      
      // Load plan upgrade requests
      const savedRequests = localStorage.getItem('kamao-plan-requests');
      if (savedRequests) {
        try {
          const parsed = JSON.parse(savedRequests);
          // Convert string dates back to Date objects
          const requestsWithDates = parsed.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt)
          }));
          setPlanUpgradeRequests(requestsWithDates);
        } catch (e) {
          setPlanUpgradeRequests([]);
        }
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
  
  // Save plan upgrade requests to localStorage when they change
  useEffect(() => {
    if (planUpgradeRequests.length) {
      localStorage.setItem('kamao-plan-requests', JSON.stringify(planUpgradeRequests));
    }
  }, [planUpgradeRequests]);

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

  const checkout = (shippingInfo: Order['shipping'], revenue: number) => {
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
      createdAt: new Date(),
      shipping: shippingInfo,
      revenue: revenue
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

  const requestPlanUpgrade = (
    resellerId: string, 
    resellerName: string, 
    resellerEmail: string, 
    currentPlan: 'free' | 'basic' | 'vip', 
    requestedPlan: 'free' | 'basic' | 'vip'
  ) => {
    const newRequest: PlanUpgradeRequest = {
      id: `req-${Date.now()}`,
      resellerId,
      resellerName,
      resellerEmail,
      currentPlan,
      requestedPlan,
      status: 'pending',
      createdAt: new Date()
    };
    
    setPlanUpgradeRequests(prev => [newRequest, ...prev]);
    toast.success("Plan upgrade request submitted successfully");
  };
  
  const approvePlanUpgrade = (requestId: string) => {
    setPlanUpgradeRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      )
    );
    toast.success("Plan upgrade request approved");
  };
  
  const rejectPlanUpgrade = (requestId: string) => {
    setPlanUpgradeRequests(prev => 
      prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      )
    );
    toast.info("Plan upgrade request rejected");
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
      updateOrder,
      planUpgradeRequests,
      requestPlanUpgrade,
      approvePlanUpgrade,
      rejectPlanUpgrade
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
