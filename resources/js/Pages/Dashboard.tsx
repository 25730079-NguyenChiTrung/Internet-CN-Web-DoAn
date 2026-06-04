import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, BarChart2, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InertiaPageProps } from '@/types/inertia';

interface DashboardProps extends InertiaPageProps {
    stats: {
        balance: string;
        portfolio_value: string;
        unrealized_pnl: string;
        month_transactions: number;
    };
}

const formatVnd = (value: string) => `${new Intl.NumberFormat('vi-VN').format(Number(value))} đ`;

export default function Dashboard({ auth, stats }: DashboardProps) {
    const pnl = Number(stats.unrealized_pnl);

    return (
        <AppLayout>
            <Head title="Tổng quan" />
            <PageHeader
                title="Tổng quan"
                description={`Xin chào, ${auth.user?.name ?? 'bạn'}!`}
                breadcrumbs={[{ label: 'Tổng quan' }]}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Số dư khả dụng
                        </CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatVnd(stats.balance)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Giá trị danh mục
                        </CardTitle>
                        <BarChart2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{formatVnd(stats.portfolio_value)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Lãi/Lỗ tạm tính
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p
                            className={cn(
                                'text-2xl font-bold',
                                pnl > 0 && 'text-emerald-600',
                                pnl < 0 && 'text-red-600',
                            )}
                        >
                            {pnl > 0 ? '+' : ''}
                            {formatVnd(stats.unrealized_pnl)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Giao dịch tháng này
                        </CardTitle>
                        <ClipboardList className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{stats.month_transactions}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
