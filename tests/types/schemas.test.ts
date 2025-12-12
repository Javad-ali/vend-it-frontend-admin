import { z } from 'zod';
import {
  userSchema,
  machineSchema,
  productSchema,
  orderSchema,
  validateApiResponse,
  paginatedUsersResponseSchema,
  machineProductSchema,
} from '@/types/schemas';

describe('Zod Schemas', () => {
  describe('userSchema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        status: 1,
        createdAt: '2024-01-01',
      };
      
      const result = userSchema.parse(validUser);
      expect(result).toEqual(validUser);
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        id: '123',
        name: 'John Doe',
        email: 'not-an-email',
        status: 1,
        createdAt: '2024-01-01',
      };
      
      expect(() => userSchema.parse(invalidUser)).toThrow();
    });
  });

  describe('machineSchema', () => {
    it('should validate correct machine data', () => {
      const validMachine = {
        machine_u_id: 'machine-123',
        machine_name: 'Vending Machine 1',
        location: 'Building A',
        status: 'active',
      };
      
      const result = machineSchema.parse(validMachine);
      expect(result).toEqual(validMachine);
    });

    it('should allow optional fields', () => {
      const minimalMachine = {
        machine_u_id: 'machine-123',
      };
      
      const result = machineSchema.parse(minimalMachine);
      expect(result.machine_u_id).toBe('machine-123');
    });
  });

  describe('productSchema', () => {
    it('should validate correct product data', () => {
      const validProduct = {
        product_u_id: 'prod-123',
        description: 'Chocolate Bar',
        brand_name: 'Cadbury',
        category: 'snacks',
      };
      
      const result = productSchema.parse(validProduct);
      expect(result).toEqual(validProduct);
    });

    it('should allow null description', () => {
      const product = {
        product_u_id: 'prod-123',
        description: null,
      };
      
      const result = productSchema.parse(product);
      expect(result.description).toBeNull();
    });
  });

  describe('orderSchema', () => {
    it('should validate correct order data', () => {
      const validOrder = {
        order_id: 'order-123',
        user_name: 'John Doe',
        total_amount: 25.99,
        status: 'completed',
        created_at: '2024-01-01',
      };
      
      const result = orderSchema.parse(validOrder);
      expect(result).toEqual(validOrder);
    });
  });

  describe('machineProductSchema', () => {
    it('should validate machine product with nested structure', () => {
      const validMachineProduct = {
        slot: '1',
        quantity: 5,
        maxQuantity: 10,
        product: {
          id: 'prod-123',
          description: 'Chocolate',
          image: 'https://example.com/image.png',
          brand: 'Cadbury',
          category: 'snacks',
        },
      };
      
      const result = machineProductSchema.parse(validMachineProduct);
      expect(result).toEqual(validMachineProduct);
    });
  });

  describe('paginatedUsersResponseSchema', () => {
    it('should validate paginated response', () => {
      const validResponse = {
        data: {
          users: [
            {
              id: '1',
              name: 'John',
              email: 'john@example.com',
              status: 1,
              createdAt: '2024-01-01',
            },
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        },
      };
      
      const result = paginatedUsersResponseSchema.parse(validResponse);
      expect(result.data.users).toHaveLength(1);
      expect(result.data.meta.page).toBe(1);
    });
  });

  describe('validateApiResponse', () => {
    it('should return parsed data for valid response', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 'Test' };
      
      const result = validateApiResponse(schema, data);
      expect(result).toEqual(data);
    });

    it('should throw error with details for invalid response', () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 123 };
      
      expect(() => validateApiResponse(schema, data)).toThrow(/Invalid API response/);
    });

    it('should include validation error details', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number(),
      });
      const data = { email: 'not-email', age: 'not-number' };
      
      try {
        validateApiResponse(schema, data);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('email');
      }
    });
  });
});
