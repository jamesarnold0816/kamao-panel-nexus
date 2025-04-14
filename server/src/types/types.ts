export type UserRole = 'admin' | 'reseller' | null;
export type UserPlan = 'free' | 'basic' | 'vip' | null;
export type AccessPlan = 'free' | 'basic' | 'vip' | 'all';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';
export type PlanUpgradeStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Not returned in responses
  role: UserRole;
  plan: UserPlan;
  created_at: Date;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  access_plan: AccessPlan;
  image: string;
  stock: number;
  created_at: Date;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
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
  status: OrderStatus;
  total: number;
  created_at: Date;
  message?: string;
  reply?: string;
  shipping?: ShippingInfo;
  revenue?: number;
}

export interface PlanUpgradeRequest {
  id: string;
  reseller_id: string;
  reseller_name: string;
  reseller_email: string;
  current_plan: UserPlan;
  requested_plan: UserPlan;
  status: PlanUpgradeStatus;
  created_at: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
} 