import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, ClipboardList, BarChart2 } from 'lucide-react';

interface AdminDashboardProps {
    stats: {
        total_users: number;
        total_stocks: number;
        today_transactions: number;
        total_volume: number;
    };
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    const nf = new Intl.NumberFormat('vi-VN');
    const cards = [
        { label: 'Tổng người dùng', value: nf.format(stats.total_users), icon: Users },
        { label: 'Mã cổ phiếu', value: nf.format(stats.total_stocks), icon: TrendingUp },
        {
            label: 'Giao dịch hôm nay',
            value: nf.format(stats.today_transactions),
            icon: ClipboardList,
        },
        { label: 'Tổng khối lượng', value: nf.format(stats.total_volume), icon: BarChart2 },
    ];

    return (
        <AdminLayout>
            <Head title="Admin — Dashboard" />
            <PageHeader title="Dashboard" description="Tổng quan hệ thống" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((stat) => (
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
        </AdminLayout>
    );
}
