import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatPercent } from '@/lib/format';

interface PriceChangeProps {
    value: number;
    showIcon?: boolean;
    className?: string;
}

export function PriceChange({ value, showIcon = true, className }: PriceChangeProps) {
    const isUp = value > 0;
    const isDown = value < 0;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 font-medium tabular-nums',
                isUp && 'text-price-up',
                isDown && 'text-price-down',
                !isUp && !isDown && 'text-price-flat',
                className,
            )}
        >
            {showIcon && (
                <>
                    {isUp && <TrendingUp className="h-3.5 w-3.5" />}
                    {isDown && <TrendingDown className="h-3.5 w-3.5" />}
                    {!isUp && !isDown && <Minus className="h-3.5 w-3.5" />}
                </>
            )}
            {formatPercent(value)}
        </span>
    );
}
