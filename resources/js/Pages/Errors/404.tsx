import { Head, Link } from '@inertiajs/react';
import { SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error404() {
    return (
        <>
            <Head title="404 — Không tìm thấy trang" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
                <SearchX className="mb-4 h-16 w-16 text-muted-foreground" />
                <h1 className="mb-2 text-4xl font-bold">404</h1>
                <p className="mb-6 text-muted-foreground">Trang bạn tìm không tồn tại.</p>
                <Link href="/">
                    <Button>Về trang chủ</Button>
                </Link>
            </div>
        </>
    );
}
