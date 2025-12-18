# Type Generation and Runtime Validation

This directory contains the TypeScript type generation script and runtime validation setup.

## Type Generation

### Setup

The project uses `openapi-typescript` to generate TypeScript types from the backend OpenAPI specification.

```bash
npm run generate-types
```

### How It Works

1. The script fetches the OpenAPI spec from the backend at `/api/docs/openapi.json`
2. Generates TypeScript types using `openapi-typescript`
3. Saves types to `src/types/api-generated.ts`
4. Creates a local copy of the spec at `openapi-spec.json` for reference

### Prerequisites

- Backend must be running (default: http://localhost:4000)
- Backend must expose OpenAPI spec at `/api/docs/openapi.json`

### Usage in Code

```typescript
import type { paths } from '@/types/api-generated';

// Extract types for specific endpoints
type LoginResponse = paths['/admin/login']['post']['responses']['200']['content']['application/json'];
type GetUsersResponse = paths['/admin/users']['get']['responses']['200']['content']['application/json'];
```

## Runtime Validation

### Setup

The project uses Zod for runtime type validation of API responses.

### Usage

```typescript
import { validateResponse, PaginatedUsersResponseSchema } from '@/lib/validation';

// In RTK Query endpoint
getUsers: builder.query({
  query: ({ page = 1, limit = 10 }) => ({
    url: '/admin/users',
    params: { page, limit },
  }),
  transformResponse: (response) => {
    // Validate response at runtime
    return validateResponse(PaginatedUsersResponseSchema, response);
  },
}),
```

### Benefits

- **Compile-time safety**: TypeScript catches type errors during development
- **Runtime safety**: Zod validates actual API responses match expected schema
- **Better errors**: Clear validation errors when API response shape changes
- **Auto-completion**: Full IDE support for API types

## Adding New Schemas

When adding new API endpoints:

1. **Regenerate types**: Run `npm run generate-types`
2. **Add runtime schema**: Create Zod schema in `src/lib/validation.ts`
3. **Update RTK Query**: Add `transformResponse` with validation

Example:

```typescript
// 1. Add Zod schema
export const NewEndpointResponseSchema = z.object({
  status: z.number(),
  data: z.object({
    // your fields here
  }),
});

// 2. Add to RTK Query
newEndpoint: builder.query({
  query: () => '/new-endpoint',
  transformResponse: (response) => 
    validateResponse(NewEndpointResponseSchema, response),
}),
```

## Type vs Runtime Checking

- **Generated types**: Static checking at compile time, zero runtime cost
- **Zod validation**: Runtime checking, catches unexpected API changes in production

Use both for maximum safety!
