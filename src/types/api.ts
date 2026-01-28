// API Response Types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: number;
  createdAt: string;
}

export interface Machine {
  machine_u_id: string;
  machine_name?: string;
  location?: string;
  status?: string;
}

export interface Product {
  product_u_id: string;
  description?: string;
  brand_name?: string;
  image?: string;
  category?: string;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  dispensed_quantity: number;
  price: number;
}

export interface Order {
  order_id: string;
  order_reference: string; // User-friendly reference like ORD-00001234
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  user_avatar?: string;
  machine_tag?: string;
  machine_location?: string;
  machine_image?: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  currency?: string;
  transaction_id?: string;
  charge_id?: string;
  earned_points?: number;
  redeemed_points?: number;
  redeemed_amount?: number;
  created_at: string;
  items?: OrderItem[];
}


export interface Feedback {
  id: string;
  user_name?: string;
  message: string;
  rating?: number;
  created_at: string;
}

// Paginated Response Types
export interface PaginatedUsersResponse {
  data: {
    users: User[];
    meta: PaginationMeta;
  };
}

export interface PaginatedMachinesResponse {
  data: {
    machines: Machine[];
    meta: PaginationMeta;
  };
}

export interface PaginatedProductsResponse {
  data: {
    products: Product[];
    meta: PaginationMeta;
  };
}

export interface PaginatedOrdersResponse {
  data: {
    orders: Order[];
    meta: PaginationMeta;
  };
}

export interface PaginatedFeedbackResponse {
  data: {
    feedback: Feedback[];
    meta: PaginationMeta;
  };
}

export interface ActivityLog {
  id: string;
  admin_name: string;
  action: string; // Flexible to support all backend action types (created, updated, deleted, login, logout, etc.)
  entity: string; // 'user', 'product', 'order', 'machine', etc.
  entity_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface PaginatedActivityLogsResponse {
  data: {
    logs: ActivityLog[];
    meta: PaginationMeta;
  };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
}

export interface PaginatedNotificationsResponse {
  data: {
    notifications: Notification[];
    meta: PaginationMeta;
    unreadCount: number;
  };
}

// Discount Coupon Types
export interface DiscountCoupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  max_uses_per_user?: number;
  max_total_uses?: number;
  current_total_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by_admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CouponUsage {
  id: string;
  coupon_id: string;
  user_id: string;
  payment_id?: string;
  discount_applied: number;
  original_amount: number;
  final_amount: number;
  used_at: string;
  user_name?: string;
  user_phone?: string;
}

export interface CouponStats {
  totalRedemptions: number;
  uniqueUsers: number;
  totalDiscountGiven: number;
  averageDiscount: number;
}

export interface CouponDetails {
  coupon: DiscountCoupon;
  stats: CouponStats;
}

export interface PaginatedCouponsResponse {
  success: boolean;
  data: {
    coupons: DiscountCoupon[];
    meta: PaginationMeta;
  };
}

export interface CouponUsageResponse {
  success: boolean;
  data: {
    history: CouponUsage[];
    meta: PaginationMeta;
  };
}
