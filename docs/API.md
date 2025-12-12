# Vend-IT Admin API Documentation

## Base URL
```
https://your-api-domain.com/api
```

## Authentication
All requests require Bearer token authentication:
```
Authorization: Bearer {admin_token}
```

---

## Endpoints

### Authentication

#### POST `/admin/auth/login`
Admin login

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "admin": {
    "id": "admin-uuid",
    "email": "admin@example.com",
    "name": "Admin Name"
  },
  "token": "jwt-token-string"
}
```

---

### Dashboard

#### GET `/admin/dashboard/stats`
Get dashboard statistics

**Response:**
```json
{
  "data": {
    "totalUsers": 1250,
    "totalMachines": 45,
    "totalRevenue": 125000,
    "totalOrders": 5432
  }
}
```

---

### Users

#### GET `/admin/users`
Get paginated users list

**Query Params:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search query

**Response:**
```json
{
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+123456789",
        "status": 1,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### GET `/admin/users/:id`
Get user by ID

---

### Machines

#### GET `/admin/machines`
Get paginated machines list

**Response:**
```json
{
  "data": {
    "machines": [
      {
        "machine_u_id": "machine-uuid",
        "machine_name": "Machine 1",
        "location": "Building A",
        "status": "active"
      }
    ],
    "meta": { ... }
  }
}
```

#### GET `/admin/machines/:id/products`
Get products in specific machine

**Response:**
```json
{
  "products": [
    {
      "slot": "1",
      "quantity": 5,
      "maxQuantity": 10,
      "product": {
        "id": "prod-uuid",
        "brand": "Product Brand",
        "category": "snacks",
        "image": "https://...",
        "description": "Product description"
      }
    }
  ],
  "machineId": "machine-uuid"
}
```

---

### Products

#### GET `/admin/products`
Get paginated products list

#### GET `/admin/products/:id`
Get product details

---

### Orders

#### GET `/admin/orders`
Get paginated orders list

**Response:**
```json
{
  "data": {
    "orders": [
      {
        "order_id": "order-uuid",
        "user_name": "John Doe",
        "total_amount": 25.50,
        "status": "completed",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": { ... }
  }
}
```

---

### Campaigns

#### GET `/admin/campaigns`
Get paginated campaigns list

#### GET `/admin/campaigns/:id`
Get campaign details

---

### Categories

#### GET `/admin/categories`
Get categories list

#### GET `/admin/categories/:id`
Get category details

#### GET `/admin/categories/:id/products`
Get products in category

---

### Feedback

#### GET `/admin/feedback`
Get paginated feedback list

---

### Notifications

#### GET `/admin/notifications`
Get admin notifications

**Response:**
```json
{
  "data": {
    "notifications": [...],
    "unreadCount": 5,
    "meta": { ... }
  }
}
```

#### PUT `/admin/notifications/:id/read`
Mark notification as read

---

### Activity Logs

#### GET `/admin/activity-logs`
Get admin activity logs

**Response:**
```json
{
  "data": {
    "logs": [
      {
        "id": "log-uuid",
        "admin_name": "Admin Name",
        "action": "create",
        "entity": "user",
        "entity_id": "user-uuid",
        "details": "Created new user",
        "ip_address": "192.168.1.1",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "meta": { ... }
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}
```

### 422 Validation Error
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"]
  }
}
```

### 500 Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting
- 100 requests per minute per IP
- 429 status code when exceeded

## Notes
- All dates are in ISO 8601 format
- Pagination starts at page 1
- Default page size is 10 items
