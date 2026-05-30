import { Head, router } from '@inertiajs/react';
import { ClipboardList } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
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
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Paginated, Transaction, Stock } from '@/types/models';

type TransactionRow = Transaction & { stock: Stock };

interface Filters {
    type: string | null;
    status: string | null;
    date_from: string | null;
    date_to: string | null;
}

interface Props {
    transactions: Paginated<TransactionRow>;
    filters: Filters;
}

const ALL = '__all__';

function applyFilter(filters: Filters) {
    router.get(
        '/transactions',
        {
            type: filters.type ?? undefined,
            status: filters.status ?? undefined,
            date_from: filters.date_from ?? undefined,
            date_to: filters.date_to ?? undefined,
        },
        { preserveState: true, replace: true },
    );
}

export default function TransactionsPage({ transactions, filters }: Props) {
    const currentType = filters.type ?? ALL;
    const currentStatus = filters.status ?? ALL;

    function handleTypeChange(value: string) {
        applyFilter({ ...filters, type: value === ALL ? null : value });
    }

    function handleStatusChange(value: string) {
        applyFilter({ ...filters, status: value === ALL ? null : value });
    }

    function handleDateFromChange(e: React.ChangeEvent<HTMLInputElement>) {
        applyFilter({ ...filters, date_from: e.target.value || null });
    }

    function handleDateToChange(e: React.ChangeEvent<HTMLInputElement>) {
        applyFilter({ ...filters, date_to: e.target.value || null });
    }

    const { data, meta, links } = transactions;

    return (
        <AppLayout>
            <Head title="Lịch sử giao dịch" />
            <PageHeader
                title="Lịch sử giao dịch"
                description="Tất cả các lệnh mua/bán của bạn"
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Giao dịch' }]}
            />

            {/* Filters */}
            <div className="mb-4 flex flex-wrap gap-3">
                <Select value={currentType} onValueChange={handleTypeChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Loại lệnh" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tất cả</SelectItem>
                        <SelectItem value="buy">Mua</SelectItem>
                        <SelectItem value="sell">Bán</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={currentStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL}>Tất cả</SelectItem>
                        <SelectItem value="pending">Chờ khớp</SelectItem>
                        <SelectItem value="completed">Đã khớp</SelectItem>
                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                </Select>

                <Input
                    type="date"
                    className="w-40"
                    value={filters.date_from ?? ''}
                    onChange={handleDateFromChange}
                />
                <Input
                    type="date"
                    className="w-40"
                    value={filters.date_to ?? ''}
                    onChange={handleDateToChange}
                />
            </div>

            {data.length === 0 ? (
                <EmptyState
                    icon={<ClipboardList className="h-8 w-8" />}
                    title="Không có giao dịch"
                    description={
                        filters.type || filters.status || filters.date_from || filters.date_to
                            ? 'Không tìm thấy giao dịch nào phù hợp với bộ lọc.'
                            : 'Lịch sử giao dịch sẽ xuất hiện tại đây sau khi bạn đặt lệnh.'
                    }
                />
            ) : (
                <>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Symbol</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                    <TableHead className="text-right">Giá</TableHead>
                                    <TableHead className="text-right">Tổng</TableHead>
                                    <TableHead className="text-right">Phí</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    tx.type === 'buy'
                                                        ? 'border-green-200 bg-green-100 text-green-800'
                                                        : 'border-red-200 bg-red-100 text-red-800',
                                                )}
                                                variant="outline"
                                            >
                                                {tx.type === 'buy' ? 'Mua' : 'Bán'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono font-semibold">
                                            {tx.stock.symbol}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatNumber(tx.quantity)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(tx.price)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(tx.total)}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatCurrency(tx.fee)}
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={tx.status} />
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {tx.executed_at ? formatDateTime(tx.executed_at) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {meta.last_page > 1 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                {meta.from}–{meta.to} / {meta.total} giao dịch
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!links.prev}
                                    onClick={() => links.prev && router.get(links.prev)}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!links.next}
                                    onClick={() => links.next && router.get(links.next)}
                                >
                                    Sau
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; className: string }> = {
        pending: {
            label: 'Chờ khớp',
            className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        },
        completed: { label: 'Đã khớp', className: 'bg-green-100 text-green-800 border-green-200' },
        cancelled: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-600 border-gray-200' },
    };
    const c = config[status] ?? { label: status, className: '' };
    return (
        <Badge variant="outline" className={c.className}>
            {c.label}
        </Badge>
    );
}
