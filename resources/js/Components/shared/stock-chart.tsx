import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { formatDate, formatNumber } from '@/lib/format';
import type { PriceHistory } from '@/types/models';

interface StockChartProps {
    data: PriceHistory[];
    height?: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
            <p className="text-xs text-muted-foreground">{label ? formatDate(label) : ''}</p>
            <p className="text-sm font-semibold">{formatNumber(payload[0].value)}</p>
        </div>
    );
}

export function StockChart({ data, height = 200 }: StockChartProps) {
    const chartData = data.map((item) => ({
        date: item.date,
        price: Number(item.price),
    }));

    const prices = chartData.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.99;
    const maxPrice = Math.max(...prices) * 1.01;

    const isUp =
        chartData.length >= 2 && chartData[chartData.length - 1].price >= chartData[0].price;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    tickFormatter={(v: string) => {
                        const d = new Date(v);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                    }}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                />
                <YAxis
                    domain={[minPrice, maxPrice]}
                    tickFormatter={(v: number) => formatNumber(v)}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="price"
                    stroke={isUp ? 'hsl(var(--price-up))' : 'hsl(var(--price-down))'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
