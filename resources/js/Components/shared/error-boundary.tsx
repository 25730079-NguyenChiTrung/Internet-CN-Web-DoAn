import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, info);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
                    <h2 className="mb-2 text-xl font-semibold text-destructive">Đã xảy ra lỗi</h2>
                    <p className="text-sm text-muted-foreground">
                        {this.state.error?.message ?? 'Vui lòng tải lại trang.'}
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
