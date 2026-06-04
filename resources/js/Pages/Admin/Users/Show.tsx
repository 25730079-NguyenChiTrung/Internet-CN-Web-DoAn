import { FormEvent, useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Lock, LockOpen, Receipt, Wallet } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/lib/format';
import { cn, getInitials } from '@/lib/utils';
import type { InertiaPageProps } from '@/types/inertia';
import type { TransactionStatus, TransactionType, UserRole } from '@/types/models';

interface AdminUserDetail {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    balance: number;
    is_active: boolean;
    created_at: string;
    is_self: boolean;
}

interface PortfolioRow {
    id: number;
    symbol: string | null;
    company_name: string | null;
    quantity: number;
    avg_price: number;
    current_price: number;
    market_value: number;
}

interface TransactionRow {
    id: number;
    symbol: string | null;
    type: TransactionType;
    quantity: number;
    price: number;
    total: number;
    fee: number;
    status: TransactionStatus;
    created_at: string;
}

interface Props extends InertiaPageProps {
    user: AdminUserDetail;
    portfolios: PortfolioRow[];
    transactions: TransactionRow[];
}

const statusLabels: Record<TransactionStatus, string> = {
    pending: 'Chờ khớp',
    completed: 'Đã khớp',
    cancelled: 'Đã hủy',
};

export default function AdminUsersShow({ user, portfolios, transactions }: Props) {
    const [toggleOpen, setToggleOpen] = useState(false);
    const [toggleProcessing, setToggleProcessing] = useState(false);
    const [depositOpen, setDepositOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        amount: string;
    }>({ amount: '' });

    const confirmToggle = () => {
        router.patch(
            `/admin/users/${user.id}/toggle-active`,
            {},
            {
                preserveScroll: true,
                onStart: () => setToggleProcessing(true),
                onSuccess: () => setToggleOpen(false),
                onFinish: () => setToggleProcessing(false),
            },
        );
    };

    const submitDeposit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post(`/admin/users/${user.id}/deposit`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setDepositOpen(false);
            },
        });
    };

    const openDeposit = () => {
        reset();
        clearErrors();
        setDepositOpen(true);
    };

    return (
        <AdminLayout>
            <Head title={`Admin — ${user.name}`} />
            <PageHeader
                title="Chi tiết người dùng"
                description="Thông tin tài khoản, danh mục và lịch sử giao dịch"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Người dùng', href: '/admin/users' },
                    { label: user.name },
                ]}
                actions={
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/users">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Link>
                    </Button>
                }
            />

            <div className="space-y-6">
                {/* Phần trên — Thông tin tài khoản */}
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-xl font-bold tracking-tight">
                                        {user.name}
                                    </h2>
                                    <Badge
                                        variant={user.role === 'admin' ? 'default' : 'secondary'}
                                    >
                                        {user.role === 'admin' ? 'Admin' : 'User'}
                                    </Badge>
                                    <Badge
                                        variant={user.is_active ? 'default' : 'secondary'}
                                        className={cn(
                                            user.is_active &&
                                                'bg-emerald-600 hover:bg-emerald-600/80',
                                        )}
                                    >
                                        {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                    </Badge>
                                </div>
                                <p className="truncate text-sm text-muted-foreground">
                                    {user.email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Tạo ngày {formatDate(user.created_at)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="rounded-lg bg-muted/60 px-5 py-3">
                                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                    Số dư
                                </p>
                                <p className="text-2xl font-bold tabular-nums">
                                    {formatCurrency(user.balance)}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant={user.is_active ? 'destructive' : 'default'}
                                    disabled={user.is_self}
                                    title={
                                        user.is_self
                                            ? 'Không thể thay đổi trạng thái của chính mình'
                                            : undefined
                                    }
                                    onClick={() => setToggleOpen(true)}
                                >
                                    {user.is_active ? (
                                        <Lock className="h-4 w-4" />
                                    ) : (
                                        <LockOpen className="h-4 w-4" />
                                    )}
                                    {user.is_active ? 'Khóa tài khoản' : 'Mở tài khoản'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={user.is_self}
                                    title={
                                        user.is_self
                                            ? 'Không thể nạp tiền cho chính mình'
                                            : undefined
                                    }
                                    onClick={openDeposit}
                                >
                                    <Wallet className="h-4 w-4" />
                                    Nạp tiền
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Phần dưới — Portfolio hiện tại */}
                <div className="rounded-lg border bg-card">
                    <div className="border-b px-6 py-4">
                        <h3 className="text-base font-semibold">Danh mục hiện tại</h3>
                        <p className="text-sm text-muted-foreground">
                            Các mã cổ phiếu người dùng đang nắm giữ
                        </p>
                    </div>
                    {portfolios.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-24">Mã CK</TableHead>
                                    <TableHead className="min-w-56">Tên công ty</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                    <TableHead className="text-right">Giá TB</TableHead>
                                    <TableHead className="text-right">Giá HT</TableHead>
                                    <TableHead className="text-right">Giá trị thị trường</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {portfolios.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-semibold tracking-wide">
                                            {row.symbol ?? '—'}
                                        </TableCell>
                                        <TableCell className="max-w-72 truncate">
                                            {row.company_name ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatNumber(row.quantity)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(row.avg_price)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(row.current_price)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {formatCurrency(row.market_value)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={<Wallet className="h-8 w-8" />}
                            title="Chưa có cổ phiếu nào"
                            description="Người dùng này chưa nắm giữ mã cổ phiếu nào."
                        />
                    )}
                </div>

                {/* Phần dưới — 10 giao dịch gần nhất */}
                <div className="rounded-lg border bg-card">
                    <div className="border-b px-6 py-4">
                        <h3 className="text-base font-semibold">Giao dịch gần đây</h3>
                        <p className="text-sm text-muted-foreground">10 giao dịch mới nhất</p>
                    </div>
                    {transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Mã CK</TableHead>
                                    <TableHead className="text-right">Số lượng</TableHead>
                                    <TableHead className="text-right">Giá</TableHead>
                                    <TableHead className="text-right">Tổng</TableHead>
                                    <TableHead className="text-right">Phí</TableHead>
                                    <TableHead className="min-w-40">Thời gian</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    tx.type === 'buy' ? 'default' : 'secondary'
                                                }
                                                className={cn(
                                                    tx.type === 'buy'
                                                        ? 'bg-emerald-600 hover:bg-emerald-600/80'
                                                        : 'bg-rose-600 text-white hover:bg-rose-600/80',
                                                )}
                                            >
                                                {tx.type === 'buy' ? 'Mua' : 'Bán'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold tracking-wide">
                                            {tx.symbol ?? '—'}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatNumber(tx.quantity)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(tx.price)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {formatCurrency(tx.total)}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums text-muted-foreground">
                                            {formatCurrency(tx.fee)}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDateTime(tx.created_at)}
                                            <span className="ml-2 text-xs">
                                                {statusLabels[tx.status]}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <EmptyState
                            icon={<Receipt className="h-8 w-8" />}
                            title="Chưa có giao dịch"
                            description="Người dùng này chưa thực hiện giao dịch nào."
                        />
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={toggleOpen}
                onOpenChange={(open) => {
                    if (!open && !toggleProcessing) {
                        setToggleOpen(false);
                    }
                }}
                title={
                    user.is_active
                        ? `Khóa tài khoản ${user.name}?`
                        : `Mở khóa tài khoản ${user.name}?`
                }
                description={
                    user.is_active
                        ? 'Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa lại.'
                        : 'Người dùng sẽ có thể đăng nhập và sử dụng hệ thống bình thường.'
                }
                confirmLabel={user.is_active ? 'Khóa tài khoản' : 'Mở khóa'}
                onConfirm={confirmToggle}
                loading={toggleProcessing}
                variant={user.is_active ? 'destructive' : 'default'}
            />

            <Dialog
                open={depositOpen}
                onOpenChange={(open) => {
                    if (!open && !processing) {
                        setDepositOpen(false);
                    }
                }}
            >
                <DialogContent>
                    <form onSubmit={submitDeposit}>
                        <DialogHeader>
                            <DialogTitle>Nạp tiền ảo</DialogTitle>
                            <DialogDescription>
                                Nạp tiền ảo cho {user.email} để phục vụ mục đích demo. Số dư hiện
                                tại: {formatCurrency(user.balance)}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-2 py-4">
                            <Label htmlFor="amount">Số tiền (₫)</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                max="10000000000"
                                step="1"
                                value={data.amount}
                                onChange={(event) => setData('amount', event.target.value)}
                                placeholder="1000000"
                                autoFocus
                                aria-invalid={Boolean(errors.amount)}
                            />
                            {errors.amount ? (
                                <p className="text-sm text-destructive">{errors.amount}</p>
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    Tối thiểu 1 ₫, tối đa 10.000.000.000 ₫.
                                </p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={processing}
                                onClick={() => setDepositOpen(false)}
                            >
                                Huỷ
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Đang xử lý...' : 'Nạp tiền'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
