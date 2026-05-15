import type { User } from './models';
import type { AuthPageProps } from './inertia';

export type { User };

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T &
    AuthPageProps;
