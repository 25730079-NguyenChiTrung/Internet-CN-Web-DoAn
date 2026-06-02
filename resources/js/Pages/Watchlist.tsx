import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Star, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Watchlist, Stock } from '@/types/models';

interface Props {
    watchlists: Watchlist[];
    stocks: Stock[];
}

export default function WatchlistPage({ watchlists, stocks }: Props) {
    const [selectedStock, setSelectedStock] = useState<string>('');
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const watchedIds = new Set(watchlists.map((w) => w.stock_id));
    const availableStocks = stocks.filter((s) => !watchedIds.has(s.id));

    function handleAdd() {
        if (!selectedStock) return;
        router.post(
            '/watchlist',
            { stock_id: parseInt(selectedStock) },
            { onSuccess: () => setSelectedStock('') },
        );
    }

    function handleDelete(id: number) {
        setPendingDeleteId(id);
    }

    return (
        <AppLayout>
            <Head title="Theo dõi cổ phiếu" />
            <PageHeader
                title="Theo dõi cổ phiếu"
                description="Danh sách các cổ phiếu bạn đang theo dõi"
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Theo dõi' }]}
            />

            {/* Add form */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-base">Thêm cổ phiếu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-3">
                        <Select value={selectedStock} onValueChange={setSelectedStock}>
                            <SelectTrigger className="w-72">
                                <SelectValue placeholder="Chọn cổ phiếu..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableStocks.map((stock) => (
                                    <SelectItem key={stock.id} value={String(stock.id)}>
                                        {stock.symbol} — {stock.company_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleAdd} disabled={!selectedStock}>
                            Thêm
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {watchlists.length === 0 ? (
                <EmptyState
                    icon={<Star className="h-8 w-8" />}
                    title="Chưa theo dõi cổ phiếu nào"
                    description="Thêm cổ phiếu bên trên để bắt đầu theo dõi biến động giá."
                />
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Công ty</TableHead>
                                <TableHead>Sàn</TableHead>
                                <TableHead className="text-right">Giá hiện tại</TableHead>
                                <TableHead className="text-right">% Thay đổi</TableHead>
                                <TableHead>Ngày thêm</TableHead>
                                <TableHead className="w-16" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {watchlists.map((item) => {
                                const stock = item.stock!;
                                const pctUp = stock.change_percent > 0;
                                const pctDown = stock.change_percent < 0;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono font-semibold">
                                            {stock.symbol}
                                        </TableCell>
                                        <TableCell>{stock.company_name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{stock.exchange}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(stock.current_price)}
                                        </TableCell>
                                        <TableCell
                                            className={cn(
                                                'text-right font-medium',
                                                pctUp && 'text-green-600',
                                                pctDown && 'text-red-600',
                                            )}
                                        >
                                            {formatPercent(stock.change_percent)}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDateTime(item.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
            <ConfirmDialog
                open={pendingDeleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingDeleteId(null);
                }}
                title="Xóa khỏi danh sách theo dõi"
                description="Bạn có chắc muốn xóa cổ phiếu này khỏi danh sách theo dõi?"
                confirmLabel="Xóa"
                variant="destructive"
                onConfirm={() => {
                    if (pendingDeleteId !== null) router.delete(`/watchlist/${pendingDeleteId}`);
                    setPendingDeleteId(null);
                }}
            />
        </AppLayout>
    );
}
