/**
 * Format a number as Vietnamese Dong currency.
 * Example: 1000000 → "1.000.000 ₫"
 */
export function formatCurrency(amount: number | string): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Format a percentage with sign prefix.
 * Example: 2.5 → "+2.50%", -1.3 → "-1.30%"
 */
export function formatPercent(value: number | string, decimals = 2): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00%';
    const sign = num > 0 ? '+' : '';
    return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators.
 * Example: 1234567 → "1.234.567"
 */
export function formatNumber(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format a date to DD/MM/YYYY.
 * Example: "2025-05-15" → "15/05/2025"
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(d);
}

/**
 * Format a datetime to DD/MM/YYYY HH:mm.
 * Example: "2025-05-15T14:30:00Z" → "15/05/2025, 14:30"
 */
export function formatDateTime(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
}
