import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceChange } from './price-change';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { Stock } from '@/types/models';

interface StockCardProps {
    stock: Stock;
    onClick?: (stock: Stock) => void;
    className?: string;
}

export function StockCard({ stock, onClick, className }: StockCardProps) {
    return (
        <Card
            className={cn(
                'cursor-pointer transition-shadow hover:shadow-md',
                !onClick && 'cursor-default',
                className,
            )}
            onClick={() => onClick?.(stock)}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    onClick(stock);
                }
            }}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-foreground">
                                {stock.symbol}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                                {stock.exchange}
                            </Badge>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {stock.company_name}
                        </p>
                    </div>
                    <PriceChange value={stock.change_percent} />
                </div>
                <div className="mt-3">
                    <p className="text-xl font-semibold tabular-nums text-foreground">
                        {formatNumber(stock.current_price)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Đóng cửa trước: {formatCurrency(stock.previous_close)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
