import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    className,
}: PageHeaderProps) {
    return (
        <div className={cn('mb-6', className)}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                    className="mb-2 flex items-center gap-1 text-sm text-muted-foreground"
                    aria-label="Breadcrumb"
                >
                    {breadcrumbs.map((item, index) => (
                        <span key={index} className="flex items-center gap-1">
                            {index > 0 && <span>/</span>}
                            {item.href ? (
                                <a
                                    href={item.href}
                                    className="transition-colors hover:text-foreground"
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="text-foreground">{item.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
        </div>
    );
}
