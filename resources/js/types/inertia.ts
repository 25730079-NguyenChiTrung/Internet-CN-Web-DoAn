import type { User } from './models';

/** Props for authenticated pages (user is always present) */
export interface AuthPageProps {
    auth: {
        user: User;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    errors: Record<string, string>;
    ziggy: {
        location: string;
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
    };
}

/** Props for pages where user may or may not be logged in */
export interface GuestPageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    errors: Record<string, string>;
    ziggy: {
        location: string;
        url: string;
        port: number | null;
        defaults: Record<string, unknown>;
        routes: Record<string, unknown>;
    };
}

export type InertiaPageProps<T = Record<string, unknown>> = T & AuthPageProps;
