import { z } from 'zod';

// Common schemas
export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// User schema
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  status: z.number(),
  createdAt: z.string(),
});

// Machine schema
export const machineSchema = z.object({
  machine_u_id: z.string(),
  machine_name: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
});

// Product schema
export const productSchema = z.object({
  product_u_id: z.string(),
  description: z.string().optional().nullable(),
  brand_name: z.string().optional(),
  category: z.string().optional(),
});

// Order schema
export const orderSchema = z.object({
  order_id: z.string(),
  user_name: z.string().optional(),
  total_amount: z.number().optional(),
  status: z.string().optional(),
  created_at: z.string(),
});

// Feedback schema
export const feedbackSchema = z.object({
  id: z.string(),
  user_name: z.string().optional(),
  message: z.string(),
  rating: z.number().optional(),
  created_at: z.string(),
});

// Activity Log schema
export const activityLogSchema = z.object({
  id: z.string(),
  admin_name: z.string(),
  action: z.enum(['create', 'update', 'delete', 'login', 'logout']),
  entity: z.string(),
  entity_id: z.string().optional(),
  details: z.string().optional(),
  ip_address: z.string().optional(),
  created_at: z.string(),
});

// Notification schema
export const notificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['info', 'success', 'warning', 'error']),
  read: z.boolean(),
  link: z.string().optional(),
  created_at: z.string(),
});

// Paginated response schemas
export const paginatedUsersResponseSchema = z.object({
  data: z.object({
    users: z.array(userSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedMachinesResponseSchema = z.object({
  data: z.object({
    machines: z.array(machineSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedProductsResponseSchema = z.object({
  data: z.object({
    products: z.array(productSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedOrdersResponseSchema = z.object({
  data: z.object({
    orders: z.array(orderSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedFeedbackResponseSchema = z.object({
  data: z.object({
    feedback: z.array(feedbackSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedActivityLogsResponseSchema = z.object({
  data: z.object({
    logs: z.array(activityLogSchema),
    meta: paginationMetaSchema,
  }),
});

export const paginatedNotificationsResponseSchema = z.object({
  data: z.object({
    notifications: z.array(notificationSchema),
    meta: paginationMetaSchema,
    unreadCount: z.number(),
  }),
});

// Machine products schema (special structure)
export const machineProductSchema = z.object({
  slot: z.string(),
  quantity: z.number(),
  maxQuantity: z.number(),
  product: z.object({
    id: z.string(),
    description: z.string().nullable(),
    image: z.string(),
    brand: z.string(),
    category: z.string(),
  }),
});

export const machineProductsResponseSchema = z.object({
  products: z.array(machineProductSchema),
  machineId: z.string(),
});

// Generic response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string().optional(),
    success: z.boolean().optional(),
  });

// Helper function to validate and parse API responses
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('API Response Validation Error:', error.issues);
      throw new Error(
        `Invalid API response: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`
      );
    }
    throw error;
  }
}
