import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from './ProductContext';
import { useUser } from './UserContext';
import { toast } from "sonner";
import { orderService, planService } from '../services/api';

export interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface PlanUpgradeRequest {
  id: string;
  reseller_id: string;
  reseller_name: string;
  reseller_email: string;
  current_plan: 'free' | 'basic' | 'vip';
  requested_plan: 'free' | 'basic' | 'vip';
  status: 'pending' | 'approved' | 'rejected';
  created_at: Date;
}

export interface ShippingInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  carrier: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  reseller_id: string;
  reseller_name: string;
  reseller_email: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  created_at: Date;
  message?: string;
  reply?: string;
  shipping?: ShippingInfo;
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
  checkout: (shippingInfo: ShippingInfo, revenue: number) => Promise<void>;
  orders: Order[];
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  addOrderReply: (id: string, reply: string) => Promise<void>;
  planUpgradeRequests: PlanUpgradeRequest[];
  fetchPlanRequests: () => Promise<void>;
  requestPlanUpgrade: (currentPlan: 'free' | 'basic' | 'vip', requestedPlan: 'free' | 'basic' | 'vip') => Promise<void>;
  approvePlanUpgrade: (requestId: string) => Promise<void>;
  rejectPlanUpgrade: (requestId: string) => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [planUpgradeRequests, setPlanUpgradeRequests] = useState<PlanUpgradeRequest[]>([]);
  const [loading, setLoading] = useState(false);
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
      
      // Load orders and plan requests when user is authenticated
      fetchOrders();
      fetchPlanRequests();
    }
  }, [user?.id]);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (user?.id && cartItems.length) {
      localStorage.setItem(`kamao-cart-${user.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let data;
      
      if (user.role === 'admin') {
        data = await orderService.getAllOrders();
      } else if (user.role === 'reseller') {
        data = await orderService.getResellerOrders(user.id);
      }
      
      // Convert dates
      const ordersWithDates = data.map((o: any) => ({
        ...o,
        created_at: new Date(o.created_at)
      }));
      
      setOrders(ordersWithDates);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Error fetching orders');
      setLoading(false);
    }
  };

  // Fetch plan upgrade requests from API
  const fetchPlanRequests = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      let data;
      
      if (user.role === 'admin') {
        data = await planService.getAllPlanRequests();
      } else if (user.role === 'reseller') {
        data = await planService.getResellerPlanRequests(user.id);
      }
      
      // Convert dates
      const requestsWithDates = data.map((r: any) => ({
        ...r,
        created_at: new Date(r.created_at)
      }));
      
      setPlanUpgradeRequests(requestsWithDates);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching plan requests:', error);
      toast.error(error.response?.data?.message || 'Error fetching plan requests');
      setLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === product.id);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevItems, { product_id: product.id, quantity, product }];
      }
    });
    toast.success(`Added ${product.name} to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product_id !== productId));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product_id === productId ? { ...item, quantity } : item
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

  const checkout = async (shippingInfo: ShippingInfo, revenue: number) => {
    if (!user) {
      toast.error("Please login to checkout");
      return;
    }
    
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    try {
      setLoading(true);
      
      const orderData = {
        items: cartItems,
        reseller_id: user.id,
        reseller_name: user.name,
        reseller_email: user.email,
        total: cartTotal,
        shipping: shippingInfo,
        revenue
      };
      
      await orderService.createOrder(orderData);
      clearCart();
      await fetchOrders(); // Refresh orders after checkout
      toast.success("Order placed successfully");
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating order:', error);
      toast.error(error.response?.data?.message || 'Error placing order');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      setLoading(true);
      await orderService.updateOrderStatus(id, status);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, status: status as any } : order
        )
      );
      
      toast.success(`Order status updated to ${status}`);
      setLoading(false);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Error updating order status');
      setLoading(false);
    }
  };

  const addOrderReply = async (id: string, reply: string) => {
    try {
      setLoading(true);
      await orderService.addOrderReply(id, reply);
      
      // Update local state
      setOrders(prev => 
        prev.map(order => 
          order.id === id ? { ...order, reply } : order
        )
      );
      
      toast.success("Reply added to order");
      setLoading(false);
    } catch (error: any) {
      console.error('Error adding reply to order:', error);
      toast.error(error.response?.data?.message || 'Error adding reply to order');
      setLoading(false);
    }
  };

  const requestPlanUpgrade = async (currentPlan: 'free' | 'basic' | 'vip', requestedPlan: 'free' | 'basic' | 'vip') => {
    if (!user) {
      toast.error("Please login to request a plan upgrade");
      return;
    }
    
    try {
      setLoading(true);
      
      const requestData = {
        reseller_id: user.id,
        reseller_name: user.name,
        reseller_email: user.email,
        current_plan: currentPlan,
        requested_plan: requestedPlan
      };
      
      await planService.createPlanRequest(requestData);
      await fetchPlanRequests(); // Refresh requests after creating a new one
      toast.success("Plan upgrade request submitted successfully");
      setLoading(false);
    } catch (error: any) {
      console.error('Error requesting plan upgrade:', error);
      toast.error(error.response?.data?.message || 'Error requesting plan upgrade');
      setLoading(false);
    }
  };

  const approvePlanUpgrade = async (requestId: string) => {
    try {
      setLoading(true);
      await planService.approvePlanRequest(requestId);
      
      // Update only the request status in local state
      setPlanUpgradeRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: 'approved' } : request
        )
      );
      
      toast.success("Plan upgrade request approved. The user's plan has been updated on the server.");
      setLoading(false);
      
      // Refresh data after approval
      fetchPlanRequests();
      
      // Note: User will need to log out and log back in to see their updated plan
      // The plan is updated on the server but not in the current user's local state
    } catch (error: any) {
      console.error('Error approving plan request:', error);
      toast.error(error.response?.data?.message || 'Error approving plan upgrade request');
      setLoading(false);
    }
  };

  const rejectPlanUpgrade = async (requestId: string) => {
    try {
      setLoading(true);
      await planService.rejectPlanRequest(requestId);
      
      // Update local state
      setPlanUpgradeRequests(prev => 
        prev.map(request => 
          request.id === requestId ? { ...request, status: 'rejected' } : request
        )
      );
      
      toast.success("Plan upgrade request rejected");
      setLoading(false);
    } catch (error: any) {
      console.error('Error rejecting plan request:', error);
      toast.error(error.response?.data?.message || 'Error rejecting plan upgrade request');
      setLoading(false);
    }
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
      fetchOrders,
      updateOrderStatus,
      addOrderReply,
      planUpgradeRequests,
      fetchPlanRequests,
      requestPlanUpgrade,
      approvePlanUpgrade,
      rejectPlanUpgrade,
      loading
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
