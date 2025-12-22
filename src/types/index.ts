// Re-export API types as the single source of truth
// This file consolidates all type definitions to avoid duplicates

export * from './api';

// Legacy type aliases for backward compatibility
// These map the old type names to current API types
import type { 
  User as ApiUser,
  Machine as ApiMachine,
  Product as ApiProduct,
  Order as ApiOrder,
  Feedback as ApiFeedback,
  PaginationMeta
} from './api';

// Extended types for internal use
export interface UserDetails extends ApiUser {
  wallet?: number;
  loyalty?: number;
  country?: string;
  dob?: string;
  avatar?: string;
  isOtpVerified?: boolean;
}

export interface MachineSlot {
  slot: string;
  quantity: number;
  maxQuantity: number;
  product: {
    id: string;
    description: string | null;
    image: string;
    brand: string;
    category: string;
  } | null;
}

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
  created_at: string;
}

export interface Category {
  id: string;
  category_name: string;
  category_image?: string;
  description?: string;
  productCount?: number;
  status: number;
  created_at: string;
}

export interface Content {
  id: string;
  type: 'banner' | 'announcement' | 'faq' | 'terms' | 'privacy';
  title: string;
  content: string;
  image?: string;
  status: 'active' | 'inactive';
  order?: number;
  created_at: string;
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}
