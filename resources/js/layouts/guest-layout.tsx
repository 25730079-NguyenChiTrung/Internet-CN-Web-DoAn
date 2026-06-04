import { type ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { TrendingUp } from 'lucide-react';

interface GuestLayoutProps {
    children: ReactNode;
}

export default function GuestLayout({ children }: GuestLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
            <Toaster position="top-right" />
            <div className="flex min-h-screen flex-col items-center justify-center px-4">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                        <TrendingUp className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                        Stock Trading
                    </span>
                </div>
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
