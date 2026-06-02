import { Head, Link, router, usePage } from '@inertiajs/react';
import { LogIn, Star, StarOff, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { PriceChange } from '@/components/shared/price-change';
import { StockChart } from '@/components/shared/stock-chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatNumber } from '@/lib/format';
import type { PriceHistory, Stock, User } from '@/types/models';

interface StockWithHistory extends Stock {
    price_histories: PriceHistory[];
}

interface StocksShowProps {
    stock: StockWithHistory;
    watchlist_id: number | null;
}

function WatchlistPanel({ stock, watchlistId }: { stock: Stock; watchlistId: number | null }) {
    const { auth } = usePage().props;
    const user: User | null = auth.user;

    function follow() {
        router.post('/watchlist', { stock_id: stock.id }, { preserveScroll: true });
    }

    function unfollow() {
        if (!watchlistId) return;
        router.delete(`/watchlist/${watchlistId}`, { preserveScroll: true });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Theo dõi mã này</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Giá hiện tại</span>
                        <span className="font-semibold">{formatCurrency(stock.current_price)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Thay đổi</span>
                        <PriceChange value={stock.change_percent} />
                    </div>
                    {stock.sector && (
                        <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Ngành</span>
                            <span className="font-medium">{stock.sector}</span>
                        </div>
                    )}
                </div>

                {!user ? (
                    <Button asChild className="w-full">
                        <Link href="/login">
                            <LogIn className="h-4 w-4" />
                            Đăng nhập để theo dõi
                        </Link>
                    </Button>
                ) : watchlistId === null ? (
                    <Button className="w-full" onClick={follow}>
                        <Star className="h-4 w-4" />
                        Theo dõi
                    </Button>
                ) : (
                    <Button className="w-full" variant="outline" onClick={unfollow}>
                        <StarOff className="h-4 w-4" />
                        Đang theo dõi
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}

export default function StocksShow({ stock, watchlist_id }: StocksShowProps) {
    const priceHistories = stock.price_histories ?? [];

    return (
        <AppLayout>
            <Head title={`${stock.symbol} - ${stock.company_name}`} />
            <PageHeader
                title={stock.symbol}
                description={stock.company_name}
                breadcrumbs={[{ label: 'Cổ phiếu', href: '/stocks' }, { label: stock.symbol }]}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                                        {stock.logo_url ? (
                                            <img
                                                src={stock.logo_url}
                                                alt={stock.symbol}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <TrendingUp className="h-8 w-8" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="text-3xl font-bold tracking-tight">
                                                {stock.symbol}
                                            </h2>
                                            <Badge variant="secondary">{stock.exchange}</Badge>
                                            {stock.sector && (
                                                <Badge variant="outline">{stock.sector}</Badge>
                                            )}
                                            {!stock.is_active && (
                                                <Badge variant="destructive">Tạm ngưng</Badge>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {stock.company_name}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-3xl font-bold tabular-nums">
                                        {formatCurrency(stock.current_price)}
                                    </p>
                                    <PriceChange
                                        value={stock.change_percent}
                                        className="mt-1 justify-start text-base sm:justify-end"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Đóng cửa trước: {formatCurrency(stock.previous_close)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Biểu đồ giá 30 ngày</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <StockChart data={priceHistories} height={320} />
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="description">
                        <TabsList>
                            <TabsTrigger value="description">Mô tả công ty</TabsTrigger>
                            <TabsTrigger value="stats">Thống kê cơ bản</TabsTrigger>
                        </TabsList>
                        <TabsContent value="description">
                            <Card>
                                <CardContent className="p-6">
                                    <p className="leading-7 text-muted-foreground">
                                        {stock.description ||
                                            'Chưa có mô tả chi tiết cho mã cổ phiếu này.'}
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="stats">
                            <Card>
                                <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Giá hiện tại
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {formatCurrency(stock.current_price)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Giá đóng cửa trước
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {formatCurrency(stock.previous_close)}
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-muted-foreground">% thay đổi</p>
                                        <PriceChange
                                            value={stock.change_percent}
                                            className="mt-1 text-xl"
                                        />
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <p className="text-sm text-muted-foreground">
                                            Số điểm dữ liệu chart
                                        </p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {formatNumber(priceHistories.length)} ngày
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <WatchlistPanel stock={stock} watchlistId={watchlist_id} />
                </div>
            </div>
        </AppLayout>
    );
}
