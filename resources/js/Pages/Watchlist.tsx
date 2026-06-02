import { Head, router } from '@inertiajs/react';
import { Eye, Trash2, TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { PriceChange } from '@/components/shared/price-change';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/lib/format';
import type { Watchlist } from '@/types/models';

interface WatchlistPageProps {
    watchlists: Watchlist[];
}

export default function WatchlistPage({ watchlists }: WatchlistPageProps) {
    return (
        <AppLayout>
            <Head title="Watchlist" />
            <PageHeader
                title="Watchlist"
                description="Theo dõi nhanh các mã cổ phiếu bạn quan tâm."
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Watchlist' }]}
            />

            {watchlists.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {watchlists.map((item) => {
                        const stock = item.stock;

                        if (!stock) {
                            return null;
                        }

                        return (
                            <Card key={item.id}>
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold">{stock.symbol}</span>
                                                <Badge variant="secondary">{stock.exchange}</Badge>
                                            </div>
                                            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                                                {stock.company_name}
                                            </p>
                                        </div>
                                        <PriceChange value={stock.change_percent} />
                                    </div>

                                    <div className="mt-4">
                                        <p className="text-xl font-semibold tabular-nums">
                                            {formatNumber(stock.current_price)}
                                        </p>
                                        {stock.sector && (
                                            <p className="text-xs text-muted-foreground">
                                                Ngành: {stock.sector}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => router.visit(`/stocks/${stock.symbol}`)}
                                        >
                                            <Eye className="h-4 w-4" />
                                            Chi tiết
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                router.delete(`/watchlist/${item.id}`, {
                                                    preserveScroll: true,
                                                })
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={<TrendingUp className="h-8 w-8" />}
                    title="Watchlist trống"
                    description="Mở chi tiết một mã cổ phiếu và bấm Theo dõi để thêm vào danh sách này."
                />
            )}
        </AppLayout>
    );
}
