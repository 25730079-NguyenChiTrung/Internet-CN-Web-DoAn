import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp, ClipboardList, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
    return (
        <AdminLayout>
            <Head title="Admin — Dashboard" />
            <PageHeader title="Dashboard" description="Tổng quan hệ thống" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Tổng người dùng', value: '—', icon: Users },
                    { label: 'Mã cổ phiếu', value: '—', icon: TrendingUp },
                    { label: 'Giao dịch hôm nay', value: '—', icon: ClipboardList },
                    { label: 'Tổng khối lượng', value: '—', icon: DollarSign },
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
        </AdminLayout>
    );
}
