import { type ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Toaster } from 'react-hot-toast';
import {
    LayoutDashboard,
    TrendingUp,
    Briefcase,
    ClipboardList,
    ChevronDown,
    LogOut,
    User,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format';
import type { InertiaPageProps } from '@/types/inertia';

interface AppLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { href: '/stocks', label: 'Cổ phiếu', icon: TrendingUp },
    { href: '/portfolio', label: 'Danh mục', icon: Briefcase },
    { href: '/transactions', label: 'Giao dịch', icon: ClipboardList },
];

export default function AppLayout({ children }: AppLayoutProps) {
    const { auth } = usePage<InertiaPageProps>().props;
    const user = auth.user;

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" />

            {/* Top Navbar */}
            <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="hidden font-bold text-foreground sm:block">
                            Stock Trading
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                                    'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* User Dropdown */}
                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <span className="hidden text-sm font-medium sm:block">
                                        {user.name}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                    <p className="mt-1 text-xs font-medium text-primary">
                                        Số dư: {formatCurrency(user.balance)}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Hồ sơ
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link
                                        href="/logout"
                                        method="post"
                                        as="button"
                                        className="w-full cursor-pointer text-destructive"
                                    >
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Đăng xuất
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>

            {/* Footer */}
            <footer className="mt-auto border-t py-6">
                <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
                    <p>© 2025 Stock Trading — Đồ án IE104 UIT. Chỉ dành cho mục đích học tập.</p>
                </div>
            </footer>
        </div>
    );
}
