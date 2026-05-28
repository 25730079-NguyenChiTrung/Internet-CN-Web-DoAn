import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Eye,
    Pencil,
    Plus,
    Power,
    Search,
    Trash2,
    X,
} from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { PriceChange } from '@/components/shared/price-change';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { InertiaPageProps } from '@/types/inertia';
import type { Paginated, Stock } from '@/types/models';

type StatusFilter = 'all' | 'active' | 'inactive';
type SortKey = 'price' | 'change';
type SortDirection = 'asc' | 'desc';

interface Filters {
    search: string;
    status: '' | 'active' | 'inactive';
    sort: '' | SortKey;
    direction: SortDirection;
}

interface Props extends InertiaPageProps {
    stocks: Paginated<Stock>;
    filters: Filters;
}

function cleanParams(params: Record<string, string>): Record<string, string> {
    return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ''));
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
    if (!active) {
        return <ArrowUpDown className="h-3.5 w-3.5" />;
    }

    return direction === 'asc' ? (
        <ArrowUp className="h-3.5 w-3.5" />
    ) : (
        <ArrowDown className="h-3.5 w-3.5" />
    );
}

export default function AdminStocksIndex({ stocks, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState<StatusFilter>(
        filters.status === '' ? 'all' : filters.status,
    );
    const debouncedSearch = useDebounce(search, 350);
    const hasFilters = Boolean(filters.search || filters.status);

    useEffect(() => {
        const normalizedSearch = debouncedSearch.trim();
        const normalizedStatus = status === 'all' ? '' : status;

        if (normalizedSearch === filters.search && normalizedStatus === filters.status) {
            return;
        }

        router.get(
            '/admin/stocks',
            cleanParams({
                search: normalizedSearch,
                status: normalizedStatus,
                sort: filters.sort,
                direction: filters.sort ? filters.direction : '',
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    }, [debouncedSearch, filters.direction, filters.search, filters.sort, filters.status, status]);

    const visitWithParams = (overrides: Partial<Record<keyof Filters, string>>) => {
        const nextStatus = status === 'all' ? '' : status;

        router.get(
            '/admin/stocks',
            cleanParams({
                search: search.trim(),
                status: nextStatus,
                sort: filters.sort,
                direction: filters.sort ? filters.direction : '',
                ...overrides,
            }),
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const sortBy = (sort: SortKey) => {
        const direction = filters.sort === sort && filters.direction === 'asc' ? 'desc' : 'asc';

        visitWithParams({ sort, direction });
    };

    const resetFilters = () => {
        setSearch('');
        setStatus('all');
        router.get(
            '/admin/stocks',
            {},
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Admin - Quản lý cổ phiếu" />
            <PageHeader
                title="Quản lý cổ phiếu"
                description="Theo dõi, tìm kiếm và quản lý trạng thái các mã cổ phiếu niêm yết"
                breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Cổ phiếu' }]}
                actions={
                    <Button asChild>
                        <Link href="/admin/stocks/create">
                            <Plus className="h-4 w-4" />
                            Thêm mã CK
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-9"
                            placeholder="Tìm theo mã hoặc tên công ty"
                            aria-label="Tìm kiếm cổ phiếu"
                        />
                    </div>

                    <div className="flex gap-2 sm:w-auto">
                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as StatusFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-44" aria-label="Lọc trạng thái">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                <SelectItem value="inactive">Tạm ngưng</SelectItem>
                            </SelectContent>
                        </Select>

                        {hasFilters && (
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={resetFilters}
                                aria-label="Xóa bộ lọc"
                                title="Xóa bộ lọc"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {stocks.data.length > 0 ? (
                    <div className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-28">Mã CK</TableHead>
                                    <TableHead className="min-w-64">Tên công ty</TableHead>
                                    <TableHead>Sàn</TableHead>
                                    <TableHead className="min-w-36 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto px-2"
                                            onClick={() => sortBy('price')}
                                        >
                                            Giá hiện tại
                                            <SortIcon
                                                active={filters.sort === 'price'}
                                                direction={filters.direction}
                                            />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="min-w-32 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto px-2"
                                            onClick={() => sortBy('change')}
                                        >
                                            % thay đổi
                                            <SortIcon
                                                active={filters.sort === 'change'}
                                                direction={filters.direction}
                                            />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="min-w-44 text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stocks.data.map((stock) => (
                                    <TableRow key={stock.id}>
                                        <TableCell>
                                            <div className="font-semibold tracking-wide">
                                                {stock.symbol}
                                            </div>
                                            {stock.sector && (
                                                <div className="mt-1 max-w-32 truncate text-xs text-muted-foreground">
                                                    {stock.sector}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="max-w-72 truncate font-medium">
                                                {stock.company_name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{stock.exchange}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {formatCurrency(stock.current_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <PriceChange
                                                value={stock.change_percent}
                                                className="justify-end"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={stock.is_active ? 'default' : 'secondary'}
                                                className={cn(
                                                    stock.is_active &&
                                                        'bg-emerald-600 hover:bg-emerald-600/80',
                                                )}
                                            >
                                                {stock.is_active ? 'Hoạt động' : 'Tạm ngưng'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled
                                                    aria-label={`Xem ${stock.symbol}`}
                                                    title="Xem chi tiết sẽ triển khai sau"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link
                                                        href={`/admin/stocks/${stock.id}/edit`}
                                                        aria-label={`Sửa ${stock.symbol}`}
                                                        title={`Sửa ${stock.symbol}`}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled
                                                    aria-label={`Chuyển trạng thái ${stock.symbol}`}
                                                    title="Toggle active sẽ triển khai sau"
                                                >
                                                    <Power className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled
                                                    aria-label={`Xóa ${stock.symbol}`}
                                                    title="Xóa sẽ triển khai sau"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="rounded-lg border bg-card">
                        <EmptyState
                            icon={<Search className="h-8 w-8" />}
                            title="Không tìm thấy cổ phiếu"
                            description="Thử đổi từ khóa tìm kiếm hoặc trạng thái lọc."
                            action={
                                hasFilters ? (
                                    <Button type="button" variant="outline" onClick={resetFilters}>
                                        Xóa bộ lọc
                                    </Button>
                                ) : undefined
                            }
                        />
                    </div>
                )}

                <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {stocks.meta.total > 0
                            ? `Hiển thị ${stocks.meta.from}-${stocks.meta.to} trên ${stocks.meta.total} mã cổ phiếu`
                            : 'Không có mã cổ phiếu nào'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!stocks.links.prev}
                            onClick={() => stocks.links.prev && router.visit(stocks.links.prev)}
                        >
                            Trước
                        </Button>
                        <span className="min-w-24 text-center">
                            Trang {stocks.meta.current_page}/{stocks.meta.last_page}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!stocks.links.next}
                            onClick={() => stocks.links.next && router.visit(stocks.links.next)}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
