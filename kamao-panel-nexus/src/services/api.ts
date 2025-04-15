import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 10000, // Increase timeout to 10 seconds
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kamao-token');
    
    if (token) {
      // Set the Authorization header with the Bearer token
      config.headers.Authorization = `Bearer ${token}`;
      
      // Debug log for development
      if (import.meta.env.DEV) {
        console.log(`Request to ${config.url} with token:`, token.substring(0, 10) + '...');
      }
    } else if (import.meta.env.DEV) {
      console.warn(`No auth token found for request to: ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);


// Auth services
export const authService = {
  login: async (email: string, password: string, role: string) => {
    try {
      const response = await api.post('/auth/login', { email, password, role });
      
      // Store the token in localStorage for subsequent API calls
      if (response.data && response.data.token) {
        localStorage.setItem('kamao-token', response.data.token);
      }
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      // For development, provide a mock login response
      throw error;
    }
  },
  signup: async (name: string, email: string, password: string, role: string) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password, role });
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  logout: () => {
    // Clear token on logout
    localStorage.removeItem('kamao-token');
  }
};

// User services
export const userService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching all users:', error);
      // Fallback handled by interceptor
      throw error;
    }
  },
  getAllResellers: async () => {
    try {
      const response = await api.get('/users/resellers');
      return response.data;
    } catch (error) {
      console.error('Error fetching all resellers:', error);
      
      // For development, return mock resellers if network error
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return [
          {
            id: '1',
            name: 'Demo Reseller 1',
            email: 'reseller1@example.com',
            role: 'reseller',
            plan: 'basic',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Demo Reseller 2',
            email: 'reseller2@example.com',
            role: 'reseller',
            plan: 'premium',
            createdAt: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
  },
  getUserById: async (id: string) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      
      // For development, provide a mock user for testing
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id,
          name: 'Demo User',
          email: 'user@example.com',
          role: 'reseller',
          plan: 'basic',
          createdAt: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  updateUser: async (id: string, userData: any) => {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  updateUserPlan: async (id: string, plan: string) => {
    try {
      const response = await api.put(`/users/${id}/plan`, { plan });
      return response.data;
    } catch (error) {
      console.error(`Error updating plan for user ${id}:`, error);
      throw error;
    }
  },
  deleteUser: async (id: string) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },
};

// Product services
export const productService = {
  getAllProducts: async (queryParams?: { category?: string; search?: string; access_plan?: string }) => {
    try {
      const response = await api.get('/products', { params: queryParams });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fall back to mock data already handled by interceptor
      throw error;
    }
  },
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fall back to mock data already handled by interceptor
      throw error;
    }
  },
  getProductById: async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      
      // For development, return mock product if network error
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id,
          name: `Mock Product ${id}`,
          description: 'This is a mock product for development',
          price: 999,
          image: '/placeholder.svg',
          category: 'Electronics',
          access_plan: 'basic'
        };
      }
      throw error;
    }
  },
  createProduct: async (productData: any) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  updateProduct: async (id: string, productData: any) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  deleteProduct: async (id: string) => {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

// Order services
export const orderService = {
  getAllOrders: async (status?: string) => {
    try {
      const response = await api.get('/orders', { params: { status } });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      
      // For development, return mock orders
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return [
          {
            id: '1',
            product_id: '1',
            product_name: 'Mock Product 1',
            reseller_id: '1',
            reseller_name: 'Demo Reseller',
            status: status || 'pending',
            quantity: 1,
            total_amount: 999,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            product_id: '2',
            product_name: 'Mock Product 2',
            reseller_id: '1',
            reseller_name: 'Demo Reseller',
            status: 'completed',
            quantity: 2,
            total_amount: 3998,
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ].filter(order => !status || order.status === status);
      }
      throw error;
    }
  },
  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      
      // For development, return a mock order
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id,
          product_id: '1',
          product_name: 'Mock Product 1',
          reseller_id: '1',
          reseller_name: 'Demo Reseller',
          status: 'pending',
          quantity: 1,
          total_amount: 999,
          created_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  getResellerOrders: async (resellerId: string, status?: string) => {
    try {
      const response = await api.get(`/orders/reseller/${resellerId}`, { params: { status } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for reseller ${resellerId}:`, error);
      
      // For development, return mock orders for this reseller
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return [
          {
            id: '1',
            product_id: '1',
            product_name: 'Mock Product 1',
            reseller_id: resellerId,
            reseller_name: 'Demo Reseller',
            status: status || 'pending',
            quantity: 1,
            total_amount: 999,
            created_at: new Date().toISOString()
          }
        ].filter(order => !status || order.status === status);
      }
      throw error;
    }
  },
  createOrder: async (orderData: any) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      
      // For development, return a mock order response
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id: Date.now().toString(),
          ...orderData,
          status: 'pending',
          created_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await api.put(`/orders/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      throw error;
    }
  },
  addOrderReply: async (id: string, reply: string) => {
    try {
      const response = await api.put(`/orders/${id}/reply`, { reply });
      return response.data;
    } catch (error) {
      console.error(`Error adding reply to order ${id}:`, error);
      throw error;
    }
  },
};

// Plan upgrade request services
export const planService = {
  getAllPlanRequests: async (status?: string) => {
    try {
      const response = await api.get('/plan-requests', { params: { status } });
      return response.data;
    } catch (error) {
      console.error('Error fetching all plan requests:', error);
      
      // For development, return mock plan requests
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return [
          {
            id: '1',
            reseller_id: '1',
            reseller_name: 'Demo Reseller',
            current_plan: 'basic',
            requested_plan: 'premium',
            status: status || 'pending',
            reason: 'Need more features for my business',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            reseller_id: '2',
            reseller_name: 'Demo Reseller 2',
            current_plan: 'free',
            requested_plan: 'basic',
            status: 'approved',
            reason: 'Starting my business',
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ].filter(req => !status || req.status === status);
      }
      throw error;
    }
  },
  getResellerPlanRequests: async (resellerId: string) => {
    try {
      const response = await api.get(`/plan-requests/reseller/${resellerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching plan requests for reseller ${resellerId}:`, error);
      
      // For development, return mock plan requests for this reseller
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return [
          {
            id: '1',
            reseller_id: resellerId,
            reseller_name: 'Demo Reseller',
            current_plan: 'basic',
            requested_plan: 'premium',
            status: 'pending',
            reason: 'Need more features for my business',
            created_at: new Date().toISOString()
          }
        ];
      }
      throw error;
    }
  },
  createPlanRequest: async (requestData: any) => {
    try {
      const response = await api.post('/plan-requests', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating plan request:', error);
      
      // For development, return a mock plan request response
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id: Date.now().toString(),
          ...requestData,
          status: 'pending',
          created_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  approvePlanRequest: async (id: string) => {
    try {
      const response = await api.put(`/plan-requests/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error(`Error approving plan request ${id}:`, error);
      
      // For development, return a mock approval response
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id,
          status: 'approved',
          approved_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
  rejectPlanRequest: async (id: string) => {
    try {
      const response = await api.put(`/plan-requests/${id}/reject`);
      return response.data;
    } catch (error) {
      console.error(`Error rejecting plan request ${id}:`, error);
      
      // For development, return a mock rejection response
      if (import.meta.env.DEV || import.meta.env.MODE === 'development' && 
         (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id,
          status: 'rejected',
          rejected_at: new Date().toISOString()
        };
      }
      throw error;
    }
  },
};

/**
 * Admin service for administrator operations
 */
export const adminService = {
  /**
   * Update company settings like name and logo
   */
  updateCompanySettings: async (data: { name: string; logoUrl: string }): Promise<any> => {
    try {
      const response = await api.put('/admin/settings/company', data);
      return response.data;
    } catch (error) {
      console.error('Error updating company settings:', error);
      throw error;
    }
  },
  
  /**
   * Get current company settings
   */
  getCompanySettings: async (): Promise<any> => {
    try {
      const response = await api.get('/admin/settings/company');
      return response.data;
    } catch (error) {
      console.error('Error getting company settings:', error);
      // Return default settings if API is unavailable
      if (error.message && error.message.includes('Network Error')) {
        console.log('Using fallback settings due to network error');
        return { name: 'Kamao', logoUrl: '/placeholder.svg' };
      }
      throw error;
    }
  }
};

export default api; 