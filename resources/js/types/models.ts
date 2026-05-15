export type UserRole = 'user' | 'admin';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: UserRole;
    balance: number;
    is_active: boolean;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

export type Exchange = 'HOSE' | 'HNX' | 'UPCOM';

export interface Stock {
    id: number;
    symbol: string;
    company_name: string;
    sector: string | null;
    exchange: Exchange;
    current_price: number;
    previous_close: number;
    description: string | null;
    logo_url: string | null;
    is_active: boolean;
    change_percent: number;
    trend: 'up' | 'down' | 'flat';
    deleted_at: string | null;
    created_at: string;
    updated_at: string;
}

export type TransactionType = 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
    id: number;
    user_id: number;
    stock_id: number;
    type: TransactionType;
    quantity: number;
    price: number;
    total: number;
    fee: number;
    status: TransactionStatus;
    executed_at: string | null;
    created_at: string;
    updated_at: string;
    user?: User;
    stock?: Stock;
}

export interface Portfolio {
    id: number;
    user_id: number;
    stock_id: number;
    quantity: number;
    avg_price: number;
    created_at: string;
    updated_at: string;
    stock?: Stock;
}

export interface PriceHistory {
    id: number;
    stock_id: number;
    price: number;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface Paginated<T> {
    data: T[];
    meta: PaginationMeta;
    links: PaginationLinks;
}
