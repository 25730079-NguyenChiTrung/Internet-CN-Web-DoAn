import { FormEvent } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

import AdminLayout from '@/layouts/admin-layout';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { InertiaPageProps } from '@/types/inertia';
import type { Exchange } from '@/types/models';

interface Props extends InertiaPageProps {
    sectors: string[];
    exchanges: Exchange[];
}

interface StockFormData {
    symbol: string;
    company_name: string;
    sector: string;
    exchange: Exchange;
    current_price: string;
    previous_close: string;
    description: string;
    logo: File | null;
}

function FieldError({ message }: { message?: string }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

export default function AdminStocksCreate({ sectors, exchanges }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm<StockFormData>({
        symbol: '',
        company_name: '',
        sector: '',
        exchange: 'HOSE',
        current_price: '',
        previous_close: '',
        description: '',
        logo: null,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        post('/admin/stocks', {
            forceFormData: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <AdminLayout>
            <Head title="Admin - Thêm mã cổ phiếu" />
            <PageHeader
                title="Thêm mã cổ phiếu"
                description="Tạo mã cổ phiếu mới để người dùng có thể theo dõi và giao dịch mô phỏng"
                breadcrumbs={[
                    { label: 'Dashboard', href: '/admin' },
                    { label: 'Cổ phiếu', href: '/admin/stocks' },
                    { label: 'Thêm mã CK' },
                ]}
                actions={
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/stocks">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại
                        </Link>
                    </Button>
                }
            />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                <div className="rounded-lg border bg-card p-6">
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="symbol">Mã cổ phiếu</Label>
                            <Input
                                id="symbol"
                                value={data.symbol}
                                onChange={(event) =>
                                    setData('symbol', event.target.value.toUpperCase())
                                }
                                maxLength={10}
                                placeholder="VNM"
                                autoComplete="off"
                                aria-invalid={Boolean(errors.symbol)}
                            />
                            <FieldError message={errors.symbol} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company_name">Tên công ty</Label>
                            <Input
                                id="company_name"
                                value={data.company_name}
                                onChange={(event) => setData('company_name', event.target.value)}
                                placeholder="Công ty Cổ phần..."
                                autoComplete="organization"
                                aria-invalid={Boolean(errors.company_name)}
                            />
                            <FieldError message={errors.company_name} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sector">Ngành</Label>
                            <Select
                                value={data.sector}
                                onValueChange={(value) => setData('sector', value)}
                            >
                                <SelectTrigger id="sector" aria-invalid={Boolean(errors.sector)}>
                                    <SelectValue placeholder="Chọn ngành" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectors.map((sector) => (
                                        <SelectItem key={sector} value={sector}>
                                            {sector}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.sector} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="exchange">Sàn giao dịch</Label>
                            <Select
                                value={data.exchange}
                                onValueChange={(value) => setData('exchange', value as Exchange)}
                            >
                                <SelectTrigger
                                    id="exchange"
                                    aria-invalid={Boolean(errors.exchange)}
                                >
                                    <SelectValue placeholder="Chọn sàn" />
                                </SelectTrigger>
                                <SelectContent>
                                    {exchanges.map((exchange) => (
                                        <SelectItem key={exchange} value={exchange}>
                                            {exchange}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={errors.exchange} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="current_price">Giá hiện tại</Label>
                            <Input
                                id="current_price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.current_price}
                                onChange={(event) => setData('current_price', event.target.value)}
                                placeholder="100000"
                                aria-invalid={Boolean(errors.current_price)}
                            />
                            <FieldError message={errors.current_price} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="previous_close">Giá đóng phiên trước</Label>
                            <Input
                                id="previous_close"
                                type="number"
                                min="0"
                                step="0.01"
                                value={data.previous_close}
                                onChange={(event) => setData('previous_close', event.target.value)}
                                placeholder="98000"
                                aria-invalid={Boolean(errors.previous_close)}
                            />
                            <FieldError message={errors.previous_close} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <textarea
                                id="description"
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                rows={5}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholder="Thông tin tóm tắt về công ty..."
                                aria-invalid={Boolean(errors.description)}
                            />
                            <FieldError message={errors.description} />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="logo">Logo</Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(event) =>
                                    setData('logo', event.target.files?.[0] ?? null)
                                }
                                aria-invalid={Boolean(errors.logo)}
                            />
                            <p className="text-sm text-muted-foreground">
                                Chấp nhận jpeg, png hoặc webp, tối đa 2MB.
                            </p>
                            <FieldError message={errors.logo} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/stocks">Huỷ</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        <Save className="h-4 w-4" />
                        {processing ? 'Đang lưu...' : 'Lưu mã CK'}
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
