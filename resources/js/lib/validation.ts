import { LOT_SIZE } from './constants';

/** Kiểm tra số lượng mua/bán hợp lệ (bội số của LOT_SIZE) */
export function isValidQuantity(quantity: number): boolean {
    return Number.isInteger(quantity) && quantity > 0 && quantity % LOT_SIZE === 0;
}

/** Kiểm tra giá trị hợp lệ (số dương) */
export function isValidPrice(price: number): boolean {
    return typeof price === 'number' && price > 0 && isFinite(price);
}

/** Kiểm tra email hợp lệ */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Làm tròn giá về bội số gần nhất của 100 (lên trên) */
export function roundUpToLot(quantity: number): number {
    return Math.ceil(quantity / LOT_SIZE) * LOT_SIZE;
}
