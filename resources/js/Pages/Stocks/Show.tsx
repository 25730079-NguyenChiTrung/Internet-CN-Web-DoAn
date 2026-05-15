import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { TrendingUp } from 'lucide-react';

interface Props {
    symbol: string;
}

export default function StocksShow({ symbol }: Props) {
    return (
        <AppLayout>
            <Head title={`Cổ phiếu ${symbol}`} />
            <PageHeader
                title={symbol}
                breadcrumbs={[{ label: 'Thị trường', href: '/stocks' }, { label: symbol }]}
            />
            <EmptyState
                icon={<TrendingUp className="h-8 w-8" />}
                title="Đang cập nhật"
                description="Chi tiết cổ phiếu sẽ hiển thị ở Phase 2."
            />
        </AppLayout>
    );
}
