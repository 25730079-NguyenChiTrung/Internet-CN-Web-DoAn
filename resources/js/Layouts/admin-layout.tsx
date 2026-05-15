import { type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, TrendingUp, Users, LogOut, ChevronRight, Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { InertiaPageProps } from '@/types/inertia';

interface AdminLayoutProps {
    children: ReactNode;
}

const sidebarItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/stocks', label: 'Cổ phiếu', icon: TrendingUp },
    { href: '/admin/users', label: 'Người dùng', icon: Users },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { auth } = usePage<InertiaPageProps>().props;
    const user = auth.user;

    return (
        <div className="flex min-h-screen bg-background">
            <Toaster position="top-right" />

            {/* Sidebar */}
            <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r bg-card">
                {/* Brand */}
                <div className="flex h-16 items-center gap-2 border-b px-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Stock Trading</p>
                        <p className="text-xs text-muted-foreground">Quản trị viên</p>
                    </div>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 space-y-1 p-3">
                    {sidebarItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            )}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                            <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />
                        </Link>
                    ))}
                </nav>

                <Separator />

                {/* User Info */}
                {user && (
                    <div className="p-3">
                        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">{user.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                        >
                            <LogOut className="h-4 w-4" />
                            Đăng xuất
                        </Link>
                    </div>
                )}
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col">
                {/* Top Bar */}
                <header className="flex h-16 items-center border-b bg-card px-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="mr-4 md:hidden"
                        aria-label="Menu"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex-1" />
                    {user && (
                        <span className="text-sm text-muted-foreground">
                            Xin chào,{' '}
                            <span className="font-medium text-foreground">{user.name}</span>
                        </span>
                    )}
                </header>

                <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
        </div>
    );
}
