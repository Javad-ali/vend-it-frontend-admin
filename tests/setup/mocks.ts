// Mock data for testing (not a test file)

export const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    status: 1,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+0987654321',
    status: 0,
    createdAt: '2024-01-02T00:00:00Z',
  },
];

export const mockMachines = [
  {
    machine_u_id: 'M001',
    machine_name: 'Vending Machine 1',
    location: 'Building A',
    status: 'active',
  },
  {
    machine_u_id: 'M002',
    machine_name: 'Vending Machine 2',
    location: 'Building B',
    status: 'inactive',
  },
];

export const mockNotifications = [
  {
    id: '1',
    title: 'New Order',
    message: 'Order #123 has been placed',
    type: 'info' as const,
    read: false,
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'System Alert',
    message: 'Machine M001 is offline',
    type: 'warning' as const,
    read: true,
    created_at: '2024-01-01T09:00:00Z',
  },
];

export const mockActivityLogs = [
  {
    id: '1',
    admin_name: 'Admin User',
    action: 'create' as const,
    entity: 'user',
    entity_id: 'U123',
    details: 'Created new user John Doe',
    ip_address: '192.168.1.1',
    created_at: '2024-01-01T12:00:00Z',
  },
  {
    id: '2',
    admin_name: 'Admin User',
    action: 'delete' as const,
    entity: 'product',
    entity_id: 'P456',
    details: 'Deleted product XYZ',
    ip_address: '192.168.1.1',
    created_at: '2024-01-01T11:00:00Z',
  },
];

export const mockDashboardMetrics = {
  totalUsers: 1500,
  totalOrders: 5000,
  totalRevenue: 25000,
  activeMachines: 20,
};

export const mockPaginationMeta = {
  page: 1,
  limit: 10,
  total: 50,
  totalPages: 5,
};
