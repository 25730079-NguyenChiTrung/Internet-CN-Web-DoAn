import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Briefcase } from 'lucide-react';

export default function Portfolio() {
    return (
        <AppLayout>
            <Head title="Danh mục đầu tư" />
            <PageHeader
                title="Danh mục đầu tư"
                description="Theo dõi các cổ phiếu bạn đang nắm giữ"
                breadcrumbs={[{ label: 'Tổng quan', href: '/dashboard' }, { label: 'Danh mục' }]}
            />
            <EmptyState
                icon={<Briefcase className="h-8 w-8" />}
                title="Danh mục trống"
                description="Bạn chưa có cổ phiếu nào. Hãy bắt đầu mua để xây dựng danh mục."
            />
        </AppLayout>
    );
}
