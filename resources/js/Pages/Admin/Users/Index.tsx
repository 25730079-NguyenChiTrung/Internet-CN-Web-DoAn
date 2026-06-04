import { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Search, Users, X } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/shared/page-header';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { formatCurrency, formatDate } from '@/lib/format';
import { cn, getInitials } from '@/lib/utils';
import type { InertiaPageProps } from '@/types/inertia';
import type { Paginated, UserRole } from '@/types/models';

type RoleFilter = 'all' | 'admin' | 'user';
type StatusFilter = 'all' | 'active' | 'locked';
type SortKey = 'created_at' | 'balance';
type SortDirection = 'asc' | 'desc';

interface AdminUserRow {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    balance: number;
    is_active: boolean;
    created_at: string;
}

interface Filters {
    search: string;
    role: '' | 'admin' | 'user';
    status: '' | 'active' | 'locked';
    sort: SortKey;
    direction: SortDirection;
}

interface Props extends InertiaPageProps {
    users: Paginated<AdminUserRow>;
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

export default function AdminUsersIndex({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [role, setRole] = useState<RoleFilter>(filters.role === '' ? 'all' : filters.role);
    const [status, setStatus] = useState<StatusFilter>(
        filters.status === '' ? 'all' : filters.status,
    );
    const debouncedSearch = useDebounce(search, 350);
    const hasFilters = Boolean(filters.search || filters.role || filters.status);

    const buildParams = (overrides: Partial<Record<keyof Filters, string>> = {}) =>
        cleanParams({
            search: search.trim(),
            role: role === 'all' ? '' : role,
            status: status === 'all' ? '' : status,
            sort: filters.sort,
            direction: filters.direction,
            ...overrides,
        });

    const visit = (params: Record<string, string>) => {
        router.get('/admin/users', params, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    useEffect(() => {
        const normalizedSearch = debouncedSearch.trim();
        const normalizedRole = role === 'all' ? '' : role;
        const normalizedStatus = status === 'all' ? '' : status;

        if (
            normalizedSearch === filters.search &&
            normalizedRole === filters.role &&
            normalizedStatus === filters.status
        ) {
            return;
        }

        visit(
            cleanParams({
                search: normalizedSearch,
                role: normalizedRole,
                status: normalizedStatus,
                sort: filters.sort,
                direction: filters.direction,
            }),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, role, status]);

    const sortBy = (sort: SortKey) => {
        const direction = filters.sort === sort && filters.direction === 'desc' ? 'asc' : 'desc';

        visit(buildParams({ sort, direction }));
    };

    const resetFilters = () => {
        setSearch('');
        setRole('all');
        setStatus('all');
        router.get(
            '/admin/users',
            {},
            { preserveScroll: true, preserveState: true, replace: true },
        );
    };

    return (
        <AdminLayout>
            <Head title="Admin — Quản lý người dùng" />
            <PageHeader
                title="Quản lý người dùng"
                description="Xem, khoá/mở khoá và nạp tiền ảo cho người dùng"
                breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Người dùng' }]}
            />

            <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center">
                    <div className="relative min-w-0 flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-9"
                            placeholder="Tìm theo tên hoặc email"
                            aria-label="Tìm kiếm người dùng"
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 sm:w-auto">
                        <Select
                            value={role}
                            onValueChange={(value) => setRole(value as RoleFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-36" aria-label="Lọc vai trò">
                                <SelectValue placeholder="Vai trò" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả vai trò</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={status}
                            onValueChange={(value) => setStatus(value as StatusFilter)}
                        >
                            <SelectTrigger className="w-full sm:w-40" aria-label="Lọc trạng thái">
                                <SelectValue placeholder="Trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                <SelectItem value="active">Đang hoạt động</SelectItem>
                                <SelectItem value="locked">Đã khóa</SelectItem>
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

                {users.data.length > 0 ? (
                    <div className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-64">Người dùng</TableHead>
                                    <TableHead>Vai trò</TableHead>
                                    <TableHead className="min-w-40 text-right">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="ml-auto px-2"
                                            onClick={() => sortBy('balance')}
                                        >
                                            Số dư
                                            <SortIcon
                                                active={filters.sort === 'balance'}
                                                direction={filters.direction}
                                            />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="min-w-36">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="px-2"
                                            onClick={() => sortBy('created_at')}
                                        >
                                            Ngày tạo
                                            <SortIcon
                                                active={filters.sort === 'created_at'}
                                                direction={filters.direction}
                                            />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                                                        {getInitials(user.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0">
                                                    <div className="truncate font-medium">
                                                        {user.name}
                                                    </div>
                                                    <div className="truncate text-xs text-muted-foreground">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    user.role === 'admin' ? 'default' : 'secondary'
                                                }
                                            >
                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {formatCurrency(user.balance)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.is_active ? 'default' : 'secondary'}
                                                className={cn(
                                                    user.is_active &&
                                                        'bg-emerald-600 hover:bg-emerald-600/80',
                                                )}
                                            >
                                                {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDate(user.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link
                                                        href={`/admin/users/${user.id}`}
                                                        aria-label={`Xem chi tiết ${user.name}`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Chi tiết
                                                    </Link>
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
                            icon={<Users className="h-8 w-8" />}
                            title="Không tìm thấy người dùng"
                            description="Thử đổi từ khóa tìm kiếm hoặc bộ lọc."
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
                        {users.meta.total > 0
                            ? `Hiển thị ${users.meta.from}-${users.meta.to} trên ${users.meta.total} người dùng`
                            : 'Không có người dùng nào'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!users.links.prev}
                            onClick={() => users.links.prev && router.visit(users.links.prev)}
                        >
                            Trước
                        </Button>
                        <span className="min-w-24 text-center">
                            Trang {users.meta.current_page}/{users.meta.last_page}
                        </span>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!users.links.next}
                            onClick={() => users.links.next && router.visit(users.links.next)}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
