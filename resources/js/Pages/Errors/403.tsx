import { Head, Link } from '@inertiajs/react';
import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error403() {
    return (
        <>
            <Head title="403 — Không có quyền truy cập" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
                <ShieldOff className="mb-4 h-16 w-16 text-destructive" />
                <h1 className="mb-2 text-4xl font-bold">403</h1>
                <p className="mb-6 text-muted-foreground">Bạn không có quyền truy cập trang này.</p>
                <Link href="/">
                    <Button>Về trang chủ</Button>
                </Link>
            </div>
        </>
    );
}
