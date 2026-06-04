import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div
            className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
        >
            {icon && (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="mb-1 text-lg font-semibold text-foreground">{title}</h3>
            {description && (
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">{description}</p>
            )}
            {action && <div>{action}</div>}
        </div>
    );
}
