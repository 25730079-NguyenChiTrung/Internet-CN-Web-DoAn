import { Head, router } from '@inertiajs/react';
import { TrendingUp } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { StockCard } from '@/components/shared/stock-card';
import { StockFilter, type StockFilters } from '@/components/user/stock-filter';
import { Button } from '@/components/ui/button';
import type { Exchange, Stock } from '@/types/models';

interface PageLink {
    page: number;
    url: string;
    active: boolean;
}

interface StocksPayload {
    data: Stock[];
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
    links: {
        prev: string | null;
        next: string | null;
        pages: PageLink[];
    };
}

interface StocksIndexProps {
    stocks: StocksPayload;
    filters: StockFilters;
    sectorOptions: string[];
    exchangeOptions: Exchange[];
}

function Pagination({ stocks }: { stocks: StocksPayload }) {
    if (stocks.meta.last_page <= 1) {
        return null;
    }

    return (
        <div className="mt-6 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Hiển thị {stocks.meta.from ?? 0}–{stocks.meta.to ?? 0} / {stocks.meta.total} mã
            </p>
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!stocks.links.prev}
                    onClick={() => stocks.links.prev && router.visit(stocks.links.prev)}
                >
                    Trước
                </Button>
                {stocks.links.pages.map((link) => (
                    <Button
                        key={link.page}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => router.visit(link.url)}
                    >
                        {link.page}
                    </Button>
                ))}
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!stocks.links.next}
                    onClick={() => stocks.links.next && router.visit(stocks.links.next)}
                >
                    Sau
                </Button>
            </div>
        </div>
    );
}

export default function StocksIndex({
    stocks,
    filters,
    sectorOptions,
    exchangeOptions,
}: StocksIndexProps) {
    return (
        <AppLayout>
            <Head title="Cổ phiếu" />
            <PageHeader
                title="Khám phá cổ phiếu"
                description="Xem danh sách mã cổ phiếu đang hoạt động, lọc theo ngành/sàn và mở chi tiết để xem biểu đồ giá."
            />

            <div className="space-y-6">
                <StockFilter
                    filters={filters}
                    sectorOptions={sectorOptions}
                    exchangeOptions={exchangeOptions}
                />

                {stocks.data.length > 0 ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {stocks.data.map((stock) => (
                                <StockCard
                                    key={stock.id}
                                    stock={stock}
                                    className="h-full"
                                    onClick={(selectedStock) =>
                                        router.visit(`/stocks/${selectedStock.symbol}`)
                                    }
                                />
                            ))}
                        </div>
                        <Pagination stocks={stocks} />
                    </>
                ) : (
                    <EmptyState
                        icon={<TrendingUp className="h-8 w-8" />}
                        title="Không tìm thấy mã cổ phiếu"
                        description="Thử xoá bớt bộ lọc hoặc tìm bằng mã/tên công ty khác."
                    />
                )}
            </div>
        </AppLayout>
    );
}
