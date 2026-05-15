import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp } from 'lucide-react';

export default function StocksIndex() {
    return (
        <AppLayout>
            <Head title="Danh sách cổ phiếu" />
            <PageHeader
                title="Thị trường"
                description="Danh sách các cổ phiếu đang niêm yết"
                breadcrumbs={[{ label: 'Thị trường' }]}
            />
            <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="Đang cập nhật"
                description="Danh sách cổ phiếu sẽ hiển thị ở Phase 2."
            />
        </AppLayout>
    );
}
