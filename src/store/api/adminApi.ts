// src/store/api/adminApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type {
  PaginatedUsersResponse,
  PaginatedMachinesResponse,
  PaginatedProductsResponse,
  PaginatedOrdersResponse,
  PaginatedFeedbackResponse,
  PaginatedCouponsResponse,
  CouponDetails,
  CouponUsageResponse,
  CouponCreatePayload,
  CouponUpdatePayload,
  CouponResponse,
  PaginatedVouchersResponse,
  VoucherDetails,
  VoucherRedemptionResponse,
  VoucherCreatePayload,
  VoucherUpdatePayload,
  VoucherResponse,
  StepChallengesListResponse,
  StepChallengeDetailsResponse,
  StepChallengeCreatePayload,
  StepChallengeUpdatePayload,
  StepChallengeResponse,
  StepChallengeParticipantsResponse,
  StepChallengeLeaderboardResponse,
  StepChallengeFinalizeResponse,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include', // Enable cookies
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Add CSRF token from state for mutation requests
      const csrfToken = (getState() as RootState).auth.csrfToken;
      
      // For mutations, add CSRF token from cookie if not in state
      if (endpoint && !['query', 'Query'].some(s => endpoint.includes(s))) {
        const cookieCsrfToken = csrfToken || 
          (typeof document !== 'undefined' ? 
            document.cookie
              .split('; ')
              .find(row => row.startsWith('csrf_token='))
              ?.split('=')[1] : undefined);
        
        if (cookieCsrfToken) {
          headers.set('x-csrf-token', cookieCsrfToken);
        }
      }
      
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Users',
    'Machines',
    'Products',
    'Orders',
    'Campaigns',
    'Categories',
    'Feedback',
    'Content',
    'ActivityLogs',
    'Notifications',
    'Sessions',
    'Cache',
    'Analytics',
    'Coupons',
    'Vouchers',
    'StepChallenges',
  ],
  endpoints: (builder) => ({
    // Auth
    login: builder.mutation({
      query: (credentials: { email: string; password: string }) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    changePassword: builder.mutation({
      query: (data: { currentPassword: string; newPassword: string }) => ({
        url: '/admin/auth/change-password',
        method: 'PUT',
        body: data,
      }),
    }),

    // Dashboard
    getDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Dashboard'],
    }),
    getChartData: builder.query({
      query: () => '/admin/dashboard/charts',
      providesTags: ['Dashboard'],
    }),

    // Users
    getUsers: builder.query<
      PaginatedUsersResponse,
      | {
          page?: number;
          limit?: number;
          status?: number;
          search?: string;
        }
      | undefined
    >({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['Users'],
    }),
    getUserDetails: builder.query({
      query: (userId: string) => `/admin/users/${userId}`,
      providesTags: ['Users'],
    }),
    deleteUser: builder.mutation({
      query: (userId: string) => ({
        url: `/admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),
    suspendUser: builder.mutation({
      query: ({ userId, status }: { userId: string; status: number }) => ({
        url: `/admin/users/${userId}/suspend`,
        method: 'POST',
        body: { status },
      }),
      invalidatesTags: ['Users'],
    }),

    // Machines
    getMachines: builder.query<
      PaginatedMachinesResponse,
      | {
          page?: number;
          limit?: number;
          status?: string;
          search?: string;
        }
      | undefined
    >({
      query: (params = {}) => ({
        url: '/admin/machines',
        params,
      }),
      providesTags: ['Machines'],
    }),
    getMachineProducts: builder.query({
      query: (machineId: string) => `/admin/machines/${machineId}/products`,
      providesTags: ['Machines'],
    }),
    regenerateQR: builder.mutation({
      query: (machineId: string) => ({
        url: `/admin/machines/${machineId}/qr`,
        method: 'POST',
      }),
    }),

    // Products
    getProducts: builder.query<
      PaginatedProductsResponse,
      | {
          page?: number;
          limit?: number;
          search?: string;
        }
      | undefined
    >({
      query: (params = {}) => ({
        url: '/admin/products',
        params,
      }),
      providesTags: ['Products'],
    }),
    getProductDetails: builder.query({
      query: (productId: string) => `/admin/products/${productId}`,
      providesTags: ['Products'],
    }),

    // Orders
    getOrders: builder.query<
      PaginatedOrdersResponse,
      | {
          page?: number;
          limit?: number;
          status?: string;
          search?: string;
          userId?: string;
        }
      | undefined
    >({
      query: (params = {}) => ({
        url: '/admin/orders',
        params,
      }),
      providesTags: ['Orders'],
    }),
    getOrderDetails: builder.query({
      query: (orderId: string) => `/admin/orders/${orderId}`,
      providesTags: ['Orders'],
    }),

    // Campaigns
    getCampaigns: builder.query({
      query: () => '/admin/campaigns',
      providesTags: ['Campaigns'],
    }),
    createCampaign: builder.mutation({
      query: (formData: FormData) => ({
        url: '/admin/campaigns',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Campaigns'],
    }),
    updateCampaign: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/admin/campaigns/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Campaigns'],
    }),
    deleteCampaign: builder.mutation({
      query: (id: string) => ({
        url: `/admin/campaigns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Campaigns'],
    }),
    getCampaignById: builder.query({
      query: (id: string) => `/admin/campaigns/${id}`,
      providesTags: ['Campaigns'],
    }),

    // Categories
    getCategories: builder.query({
      query: () => '/admin/categories',
      providesTags: ['Categories'],
    }),
    getCategoryById: builder.query({
      query: (id: string) => `/admin/categories/${id}`,
      providesTags: ['Categories'],
    }),
    getCategoryProducts: builder.query({
      query: (id: string) => `/admin/categories/${id}/products`,
      providesTags: ['Categories', 'Products'],
    }),
    createCategory: builder.mutation({
      query: (formData: FormData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, formData }: { id: string; formData: FormData }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Categories'],
    }),

    // Feedback
    getFeedback: builder.query<
      PaginatedFeedbackResponse,
      | {
          page?: number;
          limit?: number;
          search?: string;
        }
      | undefined
    >({
      query: (params = {}) => ({
        url: '/admin/feedback',
        params,
      }),
      providesTags: ['Feedback'],
    }),

    // Content
    getContent: builder.query({
      query: () => '/admin/content',
      providesTags: ['Content'],
    }),
    updateContent: builder.mutation({
      query: (data) => ({
        url: '/admin/content',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Content'],
    }),

    // Profile
    getProfile: builder.query({
      query: () => '/admin/profile',
    }),
    updateProfile: builder.mutation({
      query: (formData: FormData) => ({
        url: '/admin/profile',
        method: 'PUT',
        body: formData,
      }),
    }),

    // Activity Logs
    getActivityLogs: builder.query({
      query: (params = {}) => ({
        url: '/admin/activity-logs',
        params,
      }),
      providesTags: ['ActivityLogs'],
    }),

    // Notifications
    getNotifications: builder.query({
      query: (params = {}) => ({
        url: '/admin/notifications',
        params,
      }),
      providesTags: ['Notifications'],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id: string) => ({
        url: `/admin/notifications/${id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/admin/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Analytics
    getSalesTrends: builder.query({
      query: (period: string = '30d') => `/admin/analytics/sales-trends?period=${period}`,
      providesTags: ['Analytics'],
    }),
    getUserGrowth: builder.query({
      query: (period: string = '30d') => `/admin/analytics/user-growth?period=${period}`,
      providesTags: ['Analytics'],
    }),
    getProductPerformance: builder.query({
      query: (limit: number = 10) => `/admin/analytics/product-performance?limit=${limit}`,
      providesTags: ['Analytics'],
    }),
    getMachineUtilization: builder.query({
      query: () => '/admin/analytics/machine-utilization',
      providesTags: ['Analytics'],
    }),
    getOrderStatus: builder.query({
      query: () => '/admin/analytics/order-status',
      providesTags: ['Analytics'],
    }),

    // Sessions Management
    getSession: builder.query({
      query: () => '/admin/sessions',
      providesTags: ['Sessions'],
    }),
    revokeAllSessions: builder.mutation({
      query: () => ({
        url: '/admin/sessions/revoke-all',
        method: 'POST',
      }),
      invalidatesTags: ['Sessions'],
    }),

    // Cache Management
    getCacheStats: builder.query({
      query: () => '/admin/cache/stats',
      providesTags: ['Cache'],
    }),
    clearCache: builder.mutation({
      query: () => ({
        url: '/admin/cache/clear',
        method: 'POST',
      }),
      invalidatesTags: ['Cache'],
    }),

    // Coupon Management
    getCoupons: builder.query<
      PaginatedCouponsResponse,
      {
        page?: number;
        limit?: number;
        status?: 'active' | 'inactive' | 'all';
        search?: string;
      } | undefined
    >({
      query: (params) => ({
        url: '/admin/coupons',
        params: params || undefined,
      }),
      providesTags: ['Coupons'],
    }),

    getCouponDetails: builder.query<
      { success: boolean; data: CouponDetails },
      string
    >({
      query: (id) => `/admin/coupons/${id}`,
      providesTags: (result, error, id) => [{ type: 'Coupons', id }],
    }),

    createCoupon: builder.mutation<CouponResponse, CouponCreatePayload>({
      query: (data) => ({
        url: '/admin/coupons',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Coupons'],
    }),

    updateCoupon: builder.mutation<CouponResponse, { id: string; data: CouponUpdatePayload }>({
      query: ({ id, data }) => ({
        url: `/admin/coupons/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Coupons',
        { type: 'Coupons', id },
      ],
    }),

    deleteCoupon: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),

    deactivateCoupon: builder.mutation<CouponResponse, string>({
      query: (id) => ({
        url: `/admin/coupons/${id}/deactivate`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Coupons',
        { type: 'Coupons', id },
      ],
    }),

    getCouponUsage: builder.query<
      CouponUsageResponse,
      {
        id: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/coupons/${id}/usage`,
        params,
      }),
      providesTags: (result, error, { id }) => [{ type: 'Coupons', id }],
    }),

    // Voucher Management
    getVouchers: builder.query<
      PaginatedVouchersResponse,
      {
        page?: number;
        limit?: number;
        status?: 'active' | 'inactive' | 'all';
        search?: string;
      } | undefined
    >({
      query: (params) => ({
        url: '/admin/vouchers',
        params: params || undefined,
      }),
      providesTags: ['Vouchers'],
    }),

    getVoucherDetails: builder.query<
      { success: boolean; data: VoucherDetails },
      string
    >({
      query: (id) => `/admin/vouchers/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vouchers', id }],
    }),

    createVoucher: builder.mutation<VoucherResponse, VoucherCreatePayload>({
      query: (data) => ({
        url: '/admin/vouchers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Vouchers'],
    }),

    updateVoucher: builder.mutation<VoucherResponse, { id: string; data: VoucherUpdatePayload }>({
      query: ({ id, data }) => ({
        url: `/admin/vouchers/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Vouchers',
        { type: 'Vouchers', id },
      ],
    }),

    deleteVoucher: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admin/vouchers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vouchers'],
    }),

    toggleVoucherStatus: builder.mutation<VoucherResponse, string>({
      query: (id) => ({
        url: `/admin/vouchers/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'Vouchers',
        { type: 'Vouchers', id },
      ],
    }),

    getVoucherRedemptions: builder.query<
      VoucherRedemptionResponse,
      {
        id: string;
        page?: number;
        limit?: number;
      }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/vouchers/${id}/redemptions`,
        params,
      }),
      providesTags: (result, error, { id }) => [{ type: 'Vouchers', id }],
    }),

    // ============ Step Challenges ============
    getStepChallenges: builder.query<
      StepChallengesListResponse,
      { page?: number; limit?: number; search?: string; status?: string; machineId?: string }
    >({
      query: (params = {}) => ({
        url: '/admin/step-challenges',
        params,
      }),
      providesTags: ['StepChallenges'],
    }),

    getStepChallengeDetails: builder.query<StepChallengeDetailsResponse, string>({
      query: (id) => `/admin/step-challenges/${id}`,
      providesTags: (result, error, id) => [{ type: 'StepChallenges', id }],
    }),

    createStepChallenge: builder.mutation<StepChallengeResponse, StepChallengeCreatePayload>({
      query: (data) => ({
        url: '/admin/step-challenges',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['StepChallenges'],
    }),

    updateStepChallenge: builder.mutation<
      StepChallengeResponse,
      { id: string; data: StepChallengeUpdatePayload }
    >({
      query: ({ id, data }) => ({
        url: `/admin/step-challenges/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'StepChallenges',
        { type: 'StepChallenges', id },
      ],
    }),

    deleteStepChallenge: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/admin/step-challenges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['StepChallenges'],
    }),

    toggleStepChallengeStatus: builder.mutation<StepChallengeResponse, string>({
      query: (id) => ({
        url: `/admin/step-challenges/${id}/toggle`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'StepChallenges',
        { type: 'StepChallenges', id },
      ],
    }),

    getStepChallengeLeaderboard: builder.query<
      StepChallengeLeaderboardResponse,
      { id: string; limit?: number }
    >({
      query: ({ id, limit = 50 }) => ({
        url: `/admin/step-challenges/${id}/leaderboard`,
        params: { limit },
      }),
      providesTags: (result, error, { id }) => [{ type: 'StepChallenges', id }],
    }),

    getStepChallengeParticipants: builder.query<
      StepChallengeParticipantsResponse,
      { id: string; page?: number; limit?: number }
    >({
      query: ({ id, ...params }) => ({
        url: `/admin/step-challenges/${id}/participants`,
        params,
      }),
      providesTags: (result, error, { id }) => [{ type: 'StepChallenges', id }],
    }),

    finalizeStepChallenge: builder.mutation<StepChallengeFinalizeResponse, string>({
      query: (id) => ({
        url: `/admin/step-challenges/${id}/finalize`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        'StepChallenges',
        { type: 'StepChallenges', id },
      ],
    }),
  }),
});

export const {
  useLoginMutation,
  useChangePasswordMutation,
  useGetDashboardQuery,
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useDeleteUserMutation,
  useSuspendUserMutation,
  useGetMachinesQuery,
  useGetMachineProductsQuery,
  useRegenerateQRMutation,
  useGetProductsQuery,
  useGetProductDetailsQuery,
  useGetOrdersQuery,
  useGetOrderDetailsQuery,
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryProductsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useGetFeedbackQuery,
  useGetContentQuery,
  useUpdateContentMutation,
  useGetActivityLogsQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetSalesTrendsQuery,
  useGetUserGrowthQuery,
  useGetProductPerformanceQuery,
  useGetMachineUtilizationQuery,
  useGetOrderStatusQuery,
  useGetSessionQuery,
  useRevokeAllSessionsMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetChartDataQuery,
  useGetCacheStatsQuery,
  useClearCacheMutation,
  useGetCouponsQuery,
  useGetCouponDetailsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useDeactivateCouponMutation,
  useGetCouponUsageQuery,
  useGetVouchersQuery,
  useGetVoucherDetailsQuery,
  useCreateVoucherMutation,
  useUpdateVoucherMutation,
  useDeleteVoucherMutation,
  useToggleVoucherStatusMutation,
  useGetVoucherRedemptionsQuery,
  // Step Challenges
  useGetStepChallengesQuery,
  useGetStepChallengeDetailsQuery,
  useCreateStepChallengeMutation,
  useUpdateStepChallengeMutation,
  useDeleteStepChallengeMutation,
  useToggleStepChallengeStatusMutation,
  useGetStepChallengeLeaderboardQuery,
  useGetStepChallengeParticipantsQuery,
  useFinalizeStepChallengeMutation,
} = adminApi;
