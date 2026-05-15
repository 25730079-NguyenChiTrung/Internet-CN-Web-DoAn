import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { ClipboardList } from 'lucide-react';

export default function Transactions() {
    return (
        <AppLayout>
            <Head title="Lịch sử giao dịch" />
            <PageHeader
                title="Lịch sử giao dịch"
                description="Tất cả các lệnh mua/bán của bạn"
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Giao dịch' }]}
            />
            <EmptyState
                icon={<ClipboardList className="h-8 w-8" />}
                title="Chưa có giao dịch"
                description="Lịch sử giao dịch sẽ xuất hiện tại đây sau khi bạn đặt lệnh."
            />
        </AppLayout>
    );
}
