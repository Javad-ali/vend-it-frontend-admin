// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'sub-admin' | 'user';
  createdAt: string;
  updatedAt?: string;
}

// Machine Types
export interface Machine {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastSync?: string;
  products?: Product[];
  createdAt: string;
  updatedAt?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryId: string;
  category?: Category;
  stock: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

// Order Types
export interface Order {
  id: string;
  order_reference?: string; // User-friendly reference like ORD-00001234
  userId: string;
  user?: User;
  machineId: string;
  machine?: Machine;
  items: OrderItem[];
  total: number;
  status: 'CAPTURED' | 'CREDIT' | 'DEBIT' | 'pending' | 'failed' | 'refunded'; // Actual database values
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

// Campaign Types
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'expired';
  applicableProducts?: string[];
  createdAt: string;
  updatedAt?: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt?: string;
}

// Feedback Types
export interface Feedback {
  id: string;
  userId: string;
  user?: User;
  machineId?: string;
  machine?: Machine;
  rating: number;
  comment?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  updatedAt?: string;
}

// Content Types
export interface Content {
  id: string;
  type: 'banner' | 'announcement' | 'faq' | 'terms' | 'privacy';
  title: string;
  content: string;
  image?: string;
  status: 'active' | 'inactive';
  order?: number;
  createdAt: string;
  updatedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
