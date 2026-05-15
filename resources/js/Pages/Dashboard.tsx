import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { Wallet, TrendingUp, ClipboardList, BarChart2 } from 'lucide-react';
import type { InertiaPageProps } from '@/types/inertia';

type Props = InertiaPageProps;

export default function Dashboard({ auth }: Props) {
    return (
        <AppLayout>
            <Head title="Tổng quan" />
            <PageHeader
                title="Tổng quan"
                description={`Xin chào, ${auth.user?.name ?? 'bạn'}!`}
                breadcrumbs={[{ label: 'Tổng quan' }]}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Số dư khả dụng', value: '—', icon: Wallet },
                    { label: 'Giá trị danh mục', value: '—', icon: BarChart2 },
                    { label: 'Lãi/Lỗ hôm nay', value: '—', icon: TrendingUp },
                    { label: 'Giao dịch tháng này', value: '—', icon: ClipboardList },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <div className="mt-6">
                <EmptyState
                    icon={<BarChart2 className="h-8 w-8" />}
                    title="Chưa có dữ liệu"
                    description="Dữ liệu dashboard sẽ hiển thị khi bạn bắt đầu giao dịch."
                />
            </div>
        </AppLayout>
    );
}
