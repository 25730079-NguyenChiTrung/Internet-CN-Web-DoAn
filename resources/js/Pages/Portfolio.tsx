import { Head, Link } from '@inertiajs/react';
import { Briefcase, TrendingDown, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Portfolio, Stock } from '@/types/models';

interface HoldingRow extends Portfolio {
    current_value: string;
    cost_basis: string;
    unrealized_pnl: string;
    pnl_percent: string;
    stock: Stock;
}

interface Summary {
    total_value: string;
    total_cost: string;
    total_pnl: string;
    balance: string;
    total_assets: string;
}

interface Props {
    holdings: HoldingRow[];
    summary: Summary;
}

export default function PortfolioPage({ holdings, summary }: Props) {
    const totalPnlPositive = !summary.total_pnl.startsWith('-') && summary.total_pnl !== '0.00';
    const totalPnlNegative = summary.total_pnl.startsWith('-');

    const totalCostNum = parseFloat(summary.total_cost);
    const totalPnlPct =
        totalCostNum !== 0
            ? ((parseFloat(summary.total_pnl) / totalCostNum) * 100).toFixed(4)
            : '0.0000';

    return (
        <AppLayout>
            <Head title="Danh mục đầu tư" />
            <PageHeader
                title="Danh mục đầu tư"
                description="Theo dõi các cổ phiếu bạn đang nắm giữ"
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Danh mục' }]}
            />

            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng tài sản
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_assets)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Cash khả dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng vốn đầu tư
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatCurrency(summary.total_cost)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            P&amp;L tổng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p
                            className={cn(
                                'flex items-center gap-1 text-2xl font-bold',
                                totalPnlPositive && 'text-green-600',
                                totalPnlNegative && 'text-red-600',
                            )}
                        >
                            {totalPnlPositive && <TrendingUp className="h-5 w-5" />}
                            {totalPnlNegative && <TrendingDown className="h-5 w-5" />}
                            {formatCurrency(summary.total_pnl)}
                        </p>
                        <p
                            className={cn(
                                'text-sm font-medium',
                                totalPnlPositive && 'text-green-600',
                                totalPnlNegative && 'text-red-600',
                            )}
                        >
                            {formatPercent(totalPnlPct)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {holdings.length === 0 ? (
                <EmptyState
                    icon={<Briefcase className="h-8 w-8" />}
                    title="Danh mục trống"
                    description="Bạn chưa có cổ phiếu nào. Hãy bắt đầu mua để xây dựng danh mục."
                />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Công ty</TableHead>
                                <TableHead className="text-right">Số lượng</TableHead>
                                <TableHead className="text-right">Giá TB</TableHead>
                                <TableHead className="text-right">Giá HT</TableHead>
                                <TableHead className="text-right">Giá trị</TableHead>
                                <TableHead className="text-right">Lãi/Lỗ</TableHead>
                                <TableHead className="text-right">%</TableHead>
                                <TableHead>Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {holdings.map((h) => {
                                const pnlUp =
                                    !h.unrealized_pnl.startsWith('-') &&
                                    h.unrealized_pnl !== '0.00';
                                const pnlDown = h.unrealized_pnl.startsWith('-');
                                return (
                                    <TableRow key={h.id}>
                                        <TableCell className="font-mono font-semibold">
                                            {h.stock.symbol}
                                        </TableCell>
                                        <TableCell>{h.stock.company_name}</TableCell>
                                        <TableCell className="text-right">
                                            {formatNumber(h.quantity)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(h.avg_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(h.stock.current_price)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(h.current_value)}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-right font-medium',
                                                pnlUp && 'text-green-600',
                                                pnlDown && 'text-red-600',
                                            )}
                                        >
                                            {formatCurrency(h.unrealized_pnl)}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-right font-medium',
                                                pnlUp && 'text-green-600',
                                                pnlDown && 'text-red-600',
                                            )}
                                        >
                                            {formatPercent(h.pnl_percent)}
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/stocks/${h.stock.symbol}`}>
                                                <Button variant="outline" size="sm">
                                                    Xem chi tiết
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </AppLayout>
    );
}
