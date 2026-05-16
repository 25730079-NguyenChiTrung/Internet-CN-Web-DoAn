# Technology Stack

## Stack Overview

The application follows a server-rendered SPA architecture using Laravel as the backend with Inertia.js bridging server-side controllers to React components on the frontend.

## Backend

### Laravel 11

| Aspect   | Detail                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Version  | 11.x (latest stable)                                                                                                                        |
| Language | PHP 8.2+                                                                                                                                    |
| License  | MIT                                                                                                                                         |
| Why      | Mature MVC framework with built-in ORM, validation, routing, authentication, and migrations. Vibrant ecosystem and excellent documentation. |

**Key Features Used**:

- Eloquent ORM (with prepared statements, prevents SQL injection)
- Form Requests (validation layer)
- Middleware (request filtering, authorization)
- Database migrations and seeders
- Service container (dependency injection)

### MySQL 8

| Aspect         | Detail                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| Version        | 8.x                                                                                                             |
| Charset        | utf8mb4_unicode_ci                                                                                              |
| Storage Engine | InnoDB (ACID compliance)                                                                                        |
| Why            | Industry-standard relational database with strong ACID guarantees, JSON support, and wide hosting availability. |

## Frontend

### React 18

| Aspect     | Detail                                                                       |
| ---------- | ---------------------------------------------------------------------------- |
| Version    | 18.x                                                                         |
| Concurrent | Enabled                                                                      |
| Why        | Component-based architecture, large ecosystem, declarative state management. |

### TypeScript 5

| Aspect      | Detail                                                                                        |
| ----------- | --------------------------------------------------------------------------------------------- |
| Version     | 5.x                                                                                           |
| Strict Mode | Enabled                                                                                       |
| Why         | Type safety reduces runtime errors, improves IDE support, and serves as inline documentation. |

### Inertia.js v2

| Aspect  | Detail                                                                                                                                                                    |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version | 2.x                                                                                                                                                                       |
| Why     | Eliminates the need for a separate REST/GraphQL API while still using React for views. Server controls routing, data, and authorization. Sessions and CSRF work natively. |

**Trade-off**: Cannot serve mobile apps from the same backend without adding an API layer. Acceptable for this project's scope.

### Vite

| Aspect  | Detail                                                                                        |
| ------- | --------------------------------------------------------------------------------------------- |
| Version | 5.x (built into Laravel)                                                                      |
| Why     | Fast HMR, ES module-based, simple configuration. Laravel includes Vite plugin out of the box. |

## Styling

### TailwindCSS 3

| Aspect  | Detail                                                                                                        |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| Version | 3.x (NOT v4 alpha)                                                                                            |
| Why     | Utility-first approach speeds up development, reduces CSS bundle size with purging, consistent design tokens. |

**Decision**: TailwindCSS v4 is in alpha as of this writing. To avoid instability, we lock to v3 latest. Migration plan: re-evaluate after v4 GA + 6 months.

### shadcn/ui

| Aspect | Detail                                                                                                                   |
| ------ | ------------------------------------------------------------------------------------------------------------------------ |
| Type   | Component collection (not a library)                                                                                     |
| Why    | Accessible components built on Radix UI primitives. Code lives in our repository, fully customizable. No vendor lock-in. |

**How it works**: Components are copied into our codebase via CLI. They're styled with Tailwind and theme variables, fully editable.

## Data Visualization

### Recharts

| Aspect  | Detail                                                                                                                                                |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version | latest stable                                                                                                                                         |
| Why     | React-friendly charting library with declarative API. Supports line, area, bar, pie charts. Good performance for our use case (30-day price history). |

**Alternatives considered**:

- Chart.js: Not React-idiomatic
- Lightweight Charts: Specialized for financial data but adds complexity
- D3: Powerful but overkill

## Forms & Validation

### Inertia useForm Hook

The built-in `useForm` hook handles:

- Form state management
- Submission with CSRF tokens
- Loading states
- Validation error display
- Flash message handling

We do **not** use React Hook Form or Formik because Inertia's solution is integrated with the server-side validation.

## Icons

### Lucide React

| Aspect  | Detail                                                                             |
| ------- | ---------------------------------------------------------------------------------- |
| Version | latest                                                                             |
| Why     | Modern, consistent icon set. Tree-shakable (only imports used icons). ISC license. |

## Notifications

### react-hot-toast

| Aspect  | Detail                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------- |
| Version | latest                                                                                            |
| Why     | Simple, beautiful toast notifications with built-in animations. Smaller bundle than alternatives. |

## Date Handling

### date-fns

| Aspect  | Detail                                                                    |
| ------- | ------------------------------------------------------------------------- |
| Version | latest                                                                    |
| Why     | Modular (tree-shakable), immutable, locale-aware. Smaller than Moment.js. |

## Authentication

### Laravel Breeze

| Aspect  | Detail                                                                                                                                                                                         |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Version | latest                                                                                                                                                                                         |
| Preset  | inertia-react with TypeScript                                                                                                                                                                  |
| Why     | Official Laravel scaffolding for authentication. Provides login, registration, password reset, email verification, and profile management out of the box. Easier to maintain than custom auth. |

**Customizations needed**:

- Add `is_active` check during login
- Add role-based redirect after login

## Development Tools

### ESLint

TypeScript and React rules. Enforces code quality.

### Prettier

Code formatter. Plugin `prettier-plugin-tailwindcss` sorts Tailwind classes consistently.

### Husky + lint-staged

Pre-commit hook runs:

- ESLint on `*.{ts,tsx}` files
- Prettier on all staged files
- PHP CS Fixer on `*.php` files

### PHP CS Fixer

PHP code formatter with Laravel preset.

## Deployment

### Target Environment

For development and demo, the application runs locally with:

- **XAMPP** (provides PHP 8.2+, MySQL 8, Apache, and phpMyAdmin in one installer)
- **Node.js 20 LTS** (for Vite and pnpm)

Team members access phpMyAdmin at **<http://localhost/phpmyadmin>** after starting Apache and MySQL in the XAMPP Control Panel.

For production demo, deployment options:

- **Railway** or **Render** (PaaS, free tier)
- **DigitalOcean App Platform** (Pro features, $5/month)
- **Self-hosted VPS** with Nginx + PHP-FPM + MySQL

## Security Stack

| Aspect                   | Tool/Approach                           |
| ------------------------ | --------------------------------------- |
| Input validation         | Laravel Form Requests                   |
| SQL injection prevention | Eloquent ORM (parameterized)            |
| XSS prevention           | React auto-escaping                     |
| CSRF protection          | Laravel default + Inertia integration   |
| Password hashing         | bcrypt (Laravel default)                |
| Session security         | HttpOnly + Secure cookies in production |
| Rate limiting            | Laravel built-in throttle middleware    |
| Dependency auditing      | `composer audit`, `pnpm audit`          |

## Version Pinning Strategy

We use **caret (^) ranges** for minor/patch updates but pin **major versions**:

```json
{
    "require": {
        "laravel/framework": "^11.0"
    }
}
```

```json
{
    "dependencies": {
        "react": "^18.2.0",
        "@inertiajs/react": "^2.0.0"
    }
}
```

Lock files (`composer.lock`, `pnpm-lock.yaml`) are committed to ensure reproducible builds.

## Upgrade Cadence

| Frequency | Action                                |
| --------- | ------------------------------------- |
| Weekly    | Review `composer audit`, `pnpm audit` |
| Monthly   | Update patch versions of dependencies |
| Quarterly | Evaluate minor version updates        |
| Annually  | Major version reviews                 |

## Compatibility Matrix

| Component | Minimum                                       | Recommended |
| --------- | --------------------------------------------- | ----------- |
| PHP       | 8.2.0                                         | 8.3 latest  |
| Node.js   | 18.x                                          | 20.x LTS    |
| MySQL     | 8.0                                           | 8.0 latest  |
| Composer  | 2.x                                           | latest      |
| pnpm      | 10.x                                          | latest      |
| Browser   | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ | latest      |
