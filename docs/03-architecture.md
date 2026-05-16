# System Architecture

## Architectural Style

The system follows a **server-rendered single-page application (SPA)** pattern using the Inertia.js bridge between a Laravel backend and a React frontend.

This hybrid approach combines the developer experience of an SPA (component-based UI, no full page reloads, fast navigation) with the simplicity of a traditional server-side application (centralized routing, server-side validation, native session management).

## Request Flow

```
┌────────────┐                                              ┌───────────┐
│  Browser   │                                              │  Browser  │
│            │  1. User clicks Link                         │           │
│  (React)   ├──────────────────────────────────────────►   │  (React)  │
│            │                                              │           │
└────────────┘                                              └───────────┘
       │                                                          ▲
       │ 2. Inertia intercepts, sends XHR                         │
       │    with X-Inertia header                                 │ 8. Component renders
       ▼                                                          │
┌──────────────────────────────────────────────────────────────────┴──────┐
│                          Laravel Application                            │
│                                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐              │
│  │   Route     │ ──►│  Middleware  │ ──►│   Controller   │              │
│  └─────────────┘    └──────────────┘    └───────┬────────┘              │
│  3. Match route     4. Auth/role check          │                       │
│                                                 │ 5. Fetch via Model    │
│                                                 ▼                       │
│                                       ┌─────────────────┐               │
│                                       │  Eloquent ORM   │               │
│                                       └────────┬────────┘               │
│                                                │                        │
│                                                │ 6. SQL                 │
│                                                ▼                        │
│                                       ┌─────────────────┐               │
│                                       │     MySQL       │               │
│                                       └────────┬────────┘               │
│                                                │                        │
│                                                │ 7. Inertia::render     │
│                                                ▼                        │
│                                       ┌─────────────────┐               │
│                                       │ Inertia Response│               │
│                                       │ (JSON, props)   │               │
│                                       └────────┬────────┘               │
└────────────────────────────────────────────────┼────────────────────────┘
                                                 │
                                                 └──► Back to browser
```

## Layered Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Presentation                        │
│  React Components (resources/js/Pages/, components/)     │
│  • Renders UI                                            │
│  • Captures user input                                   │
│  • Triggers requests via Inertia                         │
└──────────────────────────────────────────────────────────┘
                            ▲
                            │ HTTP (handled by Inertia)
                            ▼
┌──────────────────────────────────────────────────────────┐
│                       Routing                            │
│  routes/web.php                                          │
│  • Maps URLs to controllers                              │
│  • Applies middleware                                    │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                     Middleware                           │
│  • Authentication                                        │
│  • Authorization (role check)                            │
│  • CSRF validation                                       │
│  • Rate limiting                                         │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                     Validation                           │
│  Form Requests (app/Http/Requests/)                      │
│  • Input rules                                           │
│  • Authorization rules                                   │
│  • Custom error messages                                 │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                      Controllers                         │
│  app/Http/Controllers/                                   │
│  • Thin orchestration                                    │
│  • Delegates to Services                                 │
│  • Returns Inertia responses                             │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                       Services                           │
│  app/Services/                                           │
│  • Business logic                                        │
│  • Multi-step operations                                 │
│  • Database transactions                                 │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                        Models                            │
│  app/Models/                                             │
│  • Eloquent ORM                                          │
│  • Relationships                                         │
│  • Query scopes                                          │
│  • Accessors/Mutators                                    │
└──────────────────────────────────────────────────────────┘
                            ▼
┌──────────────────────────────────────────────────────────┐
│                       Database                           │
│  MySQL                                                   │
└──────────────────────────────────────────────────────────┘
```

## Route Organization

URLs are organized by audience:

| Prefix                                      | Audience           | Authentication | Authorization  |
| ------------------------------------------- | ------------------ | -------------- | -------------- |
| `/` (root)                                  | Public             | Not required   | None           |
| `/stocks/*`                                 | Public             | Not required   | None           |
| `/login`, `/register`                       | Public             | Not required   | None           |
| `/dashboard`, `/portfolio`, `/transactions` | Authenticated user | Required       | Active account |
| `/admin/*`                                  | Administrator      | Required       | `role=admin`   |

This is enforced by Laravel middleware groups:

```php
// routes/web.php

// Public
Route::get('/', [HomeController::class, 'index']);
Route::get('/stocks', [StockController::class, 'index']);
Route::get('/stocks/{stock:symbol}', [StockController::class, 'show']);

// Authenticated user
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']);
    // ...
});

// Admin only
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('stocks', AdminStockController::class);
    Route::resource('users', AdminUserController::class)->only(['index', 'show', 'update']);
});
```

## Authentication & Authorization

### Authentication

Session-based authentication using Laravel Breeze:

- Login form submits credentials
- Server validates and creates session
- Session ID stored in `laravel_session` cookie (HttpOnly, SameSite=Lax)
- Subsequent requests authenticated by cookie

### Authorization

Two-level authorization:

1. **Route-level** (middleware): Coarse-grained, checks if user can access a route at all
2. **Resource-level** (Policies, future): Fine-grained, checks if user can perform action on specific resource

Currently, route-level authorization is implemented via the `admin` middleware:

```php
// app/Http/Middleware/EnsureUserIsAdmin.php
public function handle(Request $request, Closure $next): Response
{
    if (!$request->user() || $request->user()->role !== 'admin') {
        abort(403);
    }
    return $next($request);
}
```

## Inertia Bridge

### Server-Side (Controller)

```php
public function index()
{
    $stocks = Stock::active()->paginate(20);

    return Inertia::render('Stocks/Index', [
        'stocks' => $stocks,
        'filters' => request()->only('search'),
    ]);
}
```

### Client-Side (Page)

```tsx
// resources/js/Pages/Stocks/Index.tsx
export default function Index({ stocks, filters }: Props) {
    // Receive props from server
    // Render UI
}
```

### What Inertia Handles

- AJAX requests with proper headers
- CSRF token inclusion
- Browser history (back/forward buttons)
- Scroll position restoration
- Flash messages
- Validation errors

## State Management

### Server-side State

- Database (source of truth)
- Session (per-user, ephemeral)

### Client-side State

- **Page props**: From Inertia (always fresh on navigation)
- **Form state**: `useForm` hook
- **UI state**: `useState` for local interactions (modals, dropdowns)
- **No global state**: We do not use Redux/Zustand. Inertia + props is sufficient.

## Error Handling

### Backend

- `try/catch` in Controllers/Services
- Log errors with context
- Return user-friendly messages via flash (`back()->with('error', ...)`)

### Frontend

- Inertia automatically handles 422 (validation errors) and 500 (errors)
- Error pages: 403, 404, 500, 503 in `resources/js/Pages/Errors/`
- Toast notifications for transient errors

## Logging

- Application logs: `storage/logs/laravel.log`
- Security events: `storage/logs/security.log` (separate channel)
- Daily rotation in production

## Caching Strategy

No caching beyond Laravel defaults yet (future optimization).

## Build & Deployment

### Development

```bash
# Terminal 1: Laravel
php artisan serve

# Terminal 2: Vite (hot reload)
pnpm run dev
```

### Production

```bash
# Build assets
pnpm run build

# Cache configurations
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer install --no-dev --optimize-autoloader

# Migrate
php artisan migrate --force
```

## Cross-Cutting Concerns

### Internationalization

Strings displayed to end users are in Vietnamese. Internal code, comments, log messages, and error messages for developers are in English.

### Time Zones

- Database stores timestamps in UTC
- Display in `Asia/Ho_Chi_Minh` timezone
- Configured in `config/app.php`

### Money Handling

All monetary values use `DECIMAL(15,2)` in MySQL and the `decimal:2` cast in Eloquent models. Currency display is Vietnamese Dong (VND).

### File Storage

Local disk for now (`storage/app/public/`).
