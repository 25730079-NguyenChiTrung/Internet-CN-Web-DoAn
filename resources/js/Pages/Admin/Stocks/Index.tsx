import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp } from 'lucide-react';

export default function AdminStocksIndex() {
    return (
        <AdminLayout>
            <Head title="Admin — Quản lý cổ phiếu" />
            <PageHeader
                title="Quản lý cổ phiếu"
                description="Thêm, sửa, xoá các mã cổ phiếu niêm yết"
                breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Cổ phiếu' }]}
            />
            <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="Chưa triển khai"
                description="Tính năng quản lý cổ phiếu sẽ được triển khai ở Phase 2."
            />
        </AdminLayout>
    );
}
