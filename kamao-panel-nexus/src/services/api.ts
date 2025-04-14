import axios from 'axios';

// Create axios instance with base URL and default headers
const API_URL = import.meta.env.VITE_API_URL || 'http://46.202.166.36:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kamao-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: async (email: string, password: string, role: string) => {
    const response = await api.post('/auth/login', { email, password, role });
    return response.data;
  },
  signup: async (name: string, email: string, password: string, role: string) => {
    const response = await api.post('/auth/signup', { name, email, password, role });
    return response.data;
  },
};

// User services
export const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  getAllResellers: async () => {
    const response = await api.get('/users/resellers');
    return response.data;
  },
  getUserById: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },
  updateUserPlan: async (id: string, plan: string) => {
    const response = await api.put(`/users/${id}/plan`, { plan });
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Product services
export const productService = {
  getAllProducts: async (queryParams?: { category?: string; search?: string; access_plan?: string }) => {
    const response = await api.get('/products', { params: queryParams });
    return response.data;
  },
  getCategories: async () => {
    const response = await api.get('/products/categories');
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  createProduct: async (productData: any) => {
    const response = await api.post('/products', productData);
    return response.data;
  },
  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Order services
export const orderService = {
  getAllOrders: async (status?: string) => {
    const response = await api.get('/orders', { params: { status } });
    return response.data;
  },
  getOrderById: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
  getResellerOrders: async (resellerId: string, status?: string) => {
    const response = await api.get(`/orders/reseller/${resellerId}`, { params: { status } });
    return response.data;
  },
  createOrder: async (orderData: any) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  addOrderReply: async (id: string, reply: string) => {
    const response = await api.put(`/orders/${id}/reply`, { reply });
    return response.data;
  },
};

// Plan upgrade request services
export const planService = {
  getAllPlanRequests: async (status?: string) => {
    const response = await api.get('/plan-requests', { params: { status } });
    return response.data;
  },
  getResellerPlanRequests: async (resellerId: string) => {
    const response = await api.get(`/plan-requests/reseller/${resellerId}`);
    return response.data;
  },
  createPlanRequest: async (requestData: any) => {
    const response = await api.post('/plan-requests', requestData);
    return response.data;
  },
  approvePlanRequest: async (id: string) => {
    const response = await api.put(`/plan-requests/${id}/approve`);
    return response.data;
  },
  rejectPlanRequest: async (id: string) => {
    const response = await api.put(`/plan-requests/${id}/reject`);
    return response.data;
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
    const response = await api.put('/admin/settings/company', data);
    return response.data;
  },
  
  /**
   * Get current company settings
   */
  getCompanySettings: async (): Promise<any> => {
    const response = await api.get('/admin/settings/company');
    return response.data;
  }
};

export default api; 