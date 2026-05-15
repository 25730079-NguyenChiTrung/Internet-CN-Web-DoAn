export const EXCHANGES = ['HOSE', 'HNX', 'UPCOM'] as const;
export type Exchange = (typeof EXCHANGES)[number];

export const TRANSACTION_TYPES = ['buy', 'sell'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export const TRANSACTION_STATUSES = ['pending', 'completed', 'cancelled'] as const;
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** Lot size theo quy định thị trường chứng khoán Việt Nam */
export const LOT_SIZE = 100;

/** Phí giao dịch: 0.15% giá trị giao dịch */
export const TRANSACTION_FEE_RATE = 0.0015;

export const SECTOR_LABELS: Record<string, string> = {
    'Tài chính': 'Tài chính',
    'Công nghệ thông tin': 'Công nghệ',
    'Thực phẩm & Đồ uống': 'Thực phẩm',
    'Vật liệu cơ bản': 'Vật liệu',
    'Bất động sản': 'Bất động sản',
    'Dầu khí': 'Dầu khí',
    'Bán lẻ': 'Bán lẻ',
    'Tiện ích': 'Tiện ích',
    'Công nghiệp': 'Công nghiệp',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    buy: 'Mua',
    sell: 'Bán',
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
    pending: 'Chờ xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã huỷ',
};
