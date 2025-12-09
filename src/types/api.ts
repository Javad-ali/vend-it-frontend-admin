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

export interface Order {
    order_id: string;
    user_name?: string;
    total_amount?: number;
    status?: string;
    created_at: string;
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
