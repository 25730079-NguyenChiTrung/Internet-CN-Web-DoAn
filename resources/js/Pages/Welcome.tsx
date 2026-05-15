import { Head, Link } from '@inertiajs/react';
import { TrendingUp, BarChart2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Welcome() {
    return (
        <>
            <Head title="Stock Trading — Mô phỏng chứng khoán" />
            <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
                <header className="border-b bg-background/80 backdrop-blur">
                    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-foreground">Stock Trading</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Đăng nhập
                                </Button>
                            </Link>
                            <Link href="/register">
                                <Button size="sm">Đăng ký</Button>
                            </Link>
                        </div>
                    </div>
                </header>

                <section className="mx-auto max-w-6xl px-4 py-24 text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
                        <BarChart2 className="h-3.5 w-3.5" />
                        Nền tảng mô phỏng giao dịch chứng khoán
                    </div>
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                        Học giao dịch chứng khoán
                        <br />
                        <span className="text-primary">an toàn &amp; miễn phí</span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                        Thực hành mua bán cổ phiếu với tiền ảo. Theo dõi danh mục, phân tích biến
                        động giá và phát triển kỹ năng đầu tư mà không cần rủi ro thực tế.
                    </p>
                    <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                        <Link href="/register">
                            <Button size="lg" className="px-8">
                                Bắt đầu miễn phí
                            </Button>
                        </Link>
                        <Link href="/stocks">
                            <Button size="lg" variant="outline" className="px-8">
                                Xem thị trường
                            </Button>
                        </Link>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 pb-24">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: TrendingUp,
                                title: 'Giao dịch thực tế',
                                desc: 'Mua bán 20 mã cổ phiếu Việt Nam với giá thị trường, áp dụng đúng quy tắc lô 100 cổ phiếu.',
                            },
                            {
                                icon: BarChart2,
                                title: 'Phân tích biểu đồ',
                                desc: 'Xem lịch sử giá 30 ngày với biểu đồ trực quan. Theo dõi xu hướng và ra quyết định sáng suốt.',
                            },
                            {
                                icon: Shield,
                                title: 'Hoàn toàn an toàn',
                                desc: 'Sử dụng tiền ảo, không rủi ro tài chính thực tế. Lý tưởng cho người mới học đầu tư.',
                            },
                        ].map((f) => (
                            <Card key={f.title} className="border-0 bg-card shadow-sm">
                                <CardContent className="p-6">
                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <f.icon className="h-5 w-5" />
                                    </div>
                                    <h3 className="mb-1 font-semibold text-foreground">
                                        {f.title}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                <footer className="border-t py-6 text-center text-sm text-muted-foreground">
                    <p>© 2025 Stock Trading — Đồ án IE104 UIT. Chỉ dành cho mục đích học tập.</p>
                </footer>
            </div>
        </>
    );
}
