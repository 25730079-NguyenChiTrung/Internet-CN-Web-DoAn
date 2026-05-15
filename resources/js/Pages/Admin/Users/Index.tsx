import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Users } from 'lucide-react';

export default function AdminUsersIndex() {
    return (
        <AdminLayout>
            <Head title="Admin — Quản lý người dùng" />
            <PageHeader
                title="Quản lý người dùng"
                description="Xem, khoá/mở khoá và nạp tiền cho người dùng"
                breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Người dùng' }]}
            />
            <EmptyState
                icon={<Users className="h-8 w-8" />}
                title="Chưa triển khai"
                description="Tính năng quản lý người dùng sẽ được triển khai ở Phase 2."
            />
        </AdminLayout>
    );
}
