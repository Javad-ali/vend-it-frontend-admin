/**
 * Runtime validation schemas using Zod
 * 
 * These schemas provide runtime type checking for API responses
 * to catch unexpected data shape changes from the backend
 */

import { z } from 'zod';

// Common schemas
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// Admin schemas
export const AdminSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  role: z.string().optional(),
});

export const AdminLoginResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    admin: AdminSchema,
    csrfToken: z.string().optional(),
  }),
});

// User schemas
export const UserSchema = z.object({
  id: z.string(),
  phone_number: z.string(),
  email: z.string().email().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  status: z.number(),
  created_at: z.string(),
});

export const PaginatedUsersResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    users: z.array(UserSchema),
    pagination: PaginationSchema,
  }),
});

// Machine schemas
export const MachineSchema = z.object({
  u_id: z.string(),
  machine_tag: z.string(),
  location_address: z.string(),
  location_lat: z.number().nullable().optional(),
  location_lng: z.number().nullable().optional(),
  machine_image_url: z.string().nullable().optional(),
  status: z.string().optional(),
});

export const PaginatedMachinesResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    machines: z.array(MachineSchema),
    pagination: PaginationSchema,
  }),
});

// Product schemas
export const ProductSchema = z.object({
  product_u_id: z.string(),
  description: z.string(),
  unit_price: z.number(),
  brand_name: z.string(),
  product_image_url: z.string().nullable().optional(),
});

export const PaginatedProductsResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    products: z.array(ProductSchema),
    pagination: PaginationSchema,
  }),
});

// Order schemas
export const OrderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  machine_id: z.string(),
  total_amount: z.number(),
  status: z.string(),
  created_at: z.string(),
});

export const PaginatedOrdersResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    orders: z.array(OrderSchema),
    pagination: PaginationSchema,
  }),
});

// Campaign schemas
export const CampaignSchema = z.object({
  id: z.string(),
  campaign_name: z.string(),
  campaign_image: z.string().nullable().optional(),
  start_date: z.string(),
  end_date: z.string(),
  is_active: z.boolean(),
});

// Feedback schemas
export const FeedbackSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  subject: z.string(),
  message: z.string(),
  created_at: z.string(),
});

export const PaginatedFeedbackResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  data: z.object({
    feedback: z.array(FeedbackSchema),
    pagination: PaginationSchema,
  }),
});

// Helper function to validate API responses
export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ API Response Validation Error:', {
        issues: error.issues,
        data,
      });
      throw new Error(`Invalid API response: ${error.issues.map(i => i.message).join(', ')}`);
    }
    throw error;
  }
}

// Export type inference helpers
export type Admin = z.infer<typeof AdminSchema>;
export type User = z.infer<typeof UserSchema>;
export type Machine = z.infer<typeof MachineSchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type Feedback = z.infer<typeof FeedbackSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;
