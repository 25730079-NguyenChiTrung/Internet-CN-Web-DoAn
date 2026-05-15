import { Head, Link } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error500() {
    return (
        <>
            <Head title="500 — Lỗi máy chủ" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
                <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
                <h1 className="mb-2 text-4xl font-bold">500</h1>
                <p className="mb-6 text-muted-foreground">
                    Có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau.
                </p>
                <Link href="/">
                    <Button>Về trang chủ</Button>
                </Link>
            </div>
        </>
    );
}
