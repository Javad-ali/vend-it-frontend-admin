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
  id: string;
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

export interface CouponCreatePayload {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  maxUsesPerUser?: number;
  maxTotalUses?: number | null;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface CouponUpdatePayload {
  code?: string;
  description?: string;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  maxUsesPerUser?: number;
  maxTotalUses?: number | null;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface CouponResponse {
  success: boolean;
  message: string;
  data: DiscountCoupon;
}


// Voucher Types
export interface Voucher {
  id: string;
  code: string;
  description?: string;
  amount: number;
  qr_code_url?: string;
  max_uses_per_user: number;
  max_total_uses?: number;
  current_total_uses: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by_admin_id?: string;
  created_at: string;
  updated_at: string;
}

export interface VoucherRedemption {
  id: string;
  user_name?: string;
  user_phone?: string;
  amount_credited: number;
  redeemed_at: string;
}

export interface VoucherStats {
  totalRedemptions: number;
  uniqueUsers: number;
  totalAmountCredited: number;
  averageAmount: number;
}

export interface VoucherDetails {
  voucher: Voucher;
  stats: VoucherStats;
}

export interface PaginatedVouchersResponse {
  success: boolean;
  data: {
    vouchers: Voucher[];
    meta: PaginationMeta;
  };
}

export interface VoucherRedemptionResponse {
  success: boolean;
  data: {
    redemptions: VoucherRedemption[];
    meta: PaginationMeta;
  };
}

export interface VoucherCreatePayload {
  code: string;
  description?: string;
  amount: number;
  maxUsesPerUser?: number;
  maxTotalUses?: number | null;
  validFrom: string;
  validUntil: string;
  isActive?: boolean;
}

export interface VoucherUpdatePayload {
  code?: string;
  description?: string;
  amount?: number;
  maxUsesPerUser?: number;
  maxTotalUses?: number | null;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface VoucherResponse {
  success: boolean;
  message: string;
  data: Voucher;
}

// Step Challenge Types
export interface BadgeThreshold {
  steps: number;
  badge_name: string;
  badge_icon: string;
}

export interface StepChallenge {
  id: string;
  name: string;
  description: string | null;
  machine_id: string | null;
  location_name: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  badge_thresholds: BadgeThreshold[];
  created_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StepChallengeParticipant {
  id: string;
  total_steps: number;
  last_step_update: string | null;
  registered_at: string;
  user: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string;
  };
}

export interface StepChallengeLeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  total_steps: number;
  last_update: string | null;
}

export interface StepChallengeStats {
  totalParticipants: number;
  totalSteps: number;
  averageSteps: number;
}

export interface StepChallengeCreatePayload {
  name: string;
  description?: string | null;
  machineId?: string | null;
  locationName?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  badgeThresholds?: BadgeThreshold[];
}

export interface StepChallengeUpdatePayload {
  name?: string;
  description?: string | null;
  machineId?: string | null;
  locationName?: string | null;
  locationLatitude?: number | null;
  locationLongitude?: number | null;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  badgeThresholds?: BadgeThreshold[];
}

export interface StepChallengeResponse {
  success: boolean;
  message: string;
  data: StepChallenge;
}

export interface StepChallengeDetailsResponse {
  success: boolean;
  message: string;
  data: {
    challenge: StepChallenge;
    stats: StepChallengeStats;
    topThree: StepChallengeLeaderboardEntry[];
  };
}

export interface StepChallengesListResponse {
  success: boolean;
  message: string;
  data: {
    challenges: StepChallenge[];
    meta: PaginationMeta;
  };
}

export interface StepChallengeParticipantsResponse {
  success: boolean;
  message: string;
  data: {
    participants: StepChallengeParticipant[];
    meta: PaginationMeta;
  };
}

export interface StepChallengeLeaderboardResponse {
  success: boolean;
  message: string;
  data: {
    leaderboard: StepChallengeLeaderboardEntry[];
  };
}

export interface UserBadge {
  id: string;
  user_id: string;
  challenge_id: string | null;
  badge_name: string;
  badge_type: 'steps' | 'ranking' | 'completion';
  badge_icon: string | null;
  steps_achieved: number | null;
  earned_at: string;
}

export interface StepChallengeFinalizeResponse {
  success: boolean;
  message: string;
  data: {
    challenge: StepChallenge;
    awardedBadges: UserBadge[];
  };
}
