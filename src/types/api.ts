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
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
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
