# Folder Structure

## Project Root

```
stock-website/
├── app/                          # Application source (PHP)
├── bootstrap/                    # Framework bootstrap files
├── config/                       # Configuration files
├── database/                     # Migrations, seeders, factories
├── docs/                         # Project documentation
├── node_modules/                 # NPM dependencies (gitignored)
├── public/                       # Web root (entry point: index.php)
├── resources/                    # Frontend source (JS, CSS, views)
├── routes/                       # Route definitions
├── storage/                      # Logs, cache, uploaded files
├── tests/                        # Test suites
├── vendor/                       # Composer dependencies (gitignored)
├── .editorconfig                 # Editor configuration
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Template for .env
├── .gitignore
├── .prettierrc                   # Prettier configuration
├── artisan                       # Laravel CLI
├── AGENTS.md                     # AI agent workflow guide
├── CLAUDE.md                     # Project context for Claude Code
├── composer.json                 # PHP dependencies
├── composer.lock
├── eslint.config.js              # ESLint configuration
├── package.json                  # NPM dependencies
├── package-lock.json
├── phpunit.xml                   # PHPUnit configuration
├── README.md                     # Setup and overview
├── tailwind.config.js            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
├── vite.config.ts                # Vite build configuration
└── vitest.config.ts              # Vitest test configuration
```

## Application Layer (`app/`)

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Auth/                              # Authentication controllers (Breeze)
│   │   │   ├── AuthenticatedSessionController.php
│   │   │   ├── ConfirmablePasswordController.php
│   │   │   ├── EmailVerificationNotificationController.php
│   │   │   ├── EmailVerificationPromptController.php
│   │   │   ├── NewPasswordController.php
│   │   │   ├── PasswordController.php
│   │   │   ├── PasswordResetLinkController.php
│   │   │   ├── RegisteredUserController.php
│   │   │   └── VerifyEmailController.php
│   │   ├── Admin/                             # Administrator endpoints
│   │   │   ├── DashboardController.php
│   │   │   ├── StockController.php
│   │   │   └── UserController.php
│   │   ├── Controller.php                     # Base controller
│   │   ├── DashboardController.php            # User dashboard
│   │   ├── HomeController.php                 # Public home
│   │   ├── PortfolioController.php
│   │   ├── ProfileController.php
│   │   ├── StockController.php                # Public stock listing
│   │   ├── TransactionController.php
│   │   └── WatchlistController.php
│   ├── Middleware/
│   │   ├── EnsureUserIsAdmin.php              # Admin gate
│   │   ├── HandleAppearance.php
│   │   └── HandleInertiaRequests.php          # Inertia shared data
│   └── Requests/
│       ├── Auth/
│       │   └── LoginRequest.php
│       ├── BaseFormRequest.php                # Base for shared logic
│       ├── ProfileUpdateRequest.php
│       └── (more added per feature)
├── Models/
│   ├── PriceHistory.php
│   ├── Portfolio.php
│   ├── Stock.php
│   ├── Transaction.php
│   └── User.php
├── Providers/
│   ├── AppServiceProvider.php
│   └── AuthServiceProvider.php
└── Services/                                  # Business logic (extract here when controllers grow)
    └── (WatchlistService, etc. — add as needed)
```

## Database Layer (`database/`)

```
database/
├── factories/
│   ├── StockFactory.php
│   └── UserFactory.php                        # Laravel default
├── migrations/
│   ├── 0001_01_01_000000_create_users_table.php
│   ├── 0001_01_01_000001_create_cache_table.php
│   ├── 0001_01_01_000002_create_jobs_table.php
│   ├── 2025_xx_xx_create_stocks_table.php
│   ├── 2025_xx_xx_create_transactions_table.php
│   ├── 2025_xx_xx_create_portfolios_table.php
│   ├── 2025_xx_xx_create_price_histories_table.php
│   └── 2025_xx_xx_create_watchlists_table.php
└── seeders/
    ├── DatabaseSeeder.php                     # Orchestrator
    ├── PortfolioSeeder.php
    ├── PriceHistorySeeder.php
    ├── StockSeeder.php
    ├── TransactionSeeder.php
    └── UserSeeder.php
```

## Frontend Layer (`resources/js/`)

```
resources/js/
├── Pages/                                     # Inertia pages (PascalCase)
│   ├── Auth/
│   │   ├── ConfirmPassword.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ResetPassword.tsx
│   │   └── VerifyEmail.tsx
│   ├── Admin/
│   │   ├── Dashboard.tsx
│   │   ├── Stocks/
│   │   │   ├── Index.tsx
│   │   │   ├── Create.tsx
│   │   │   └── Edit.tsx
│   │   └── Users/
│   │       ├── Index.tsx
│   │       └── Show.tsx
│   ├── Errors/
│   │   ├── 403.tsx
│   │   ├── 404.tsx
│   │   └── 500.tsx
│   ├── Stocks/
│   │   ├── Index.tsx
│   │   └── Show.tsx
│   ├── Dashboard.tsx
│   ├── Portfolio.tsx
│   ├── Profile.tsx
│   ├── Transactions.tsx
│   ├── Watchlist.tsx
│   └── Welcome.tsx
├── components/                                # Reusable components (kebab-case)
│   ├── ui/                                    # shadcn/ui components
│   │   ├── alert.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── toast.tsx
│   └── shared/                                # Project-specific shared
│       ├── confirm-dialog.tsx
│       ├── data-table.tsx
│       ├── empty-state.tsx
│       ├── error-boundary.tsx
│       ├── loading-spinner.tsx
│       ├── nav-link.tsx
│       ├── page-header.tsx
│       ├── price-change.tsx
│       ├── stock-card.tsx
│       └── stock-chart.tsx
├── hooks/                                     # Custom React hooks
│   ├── use-debounce.ts
│   └── use-toast.ts
├── layouts/                                   # Page layouts
│   ├── admin-layout.tsx
│   ├── app-layout.tsx
│   └── guest-layout.tsx
├── lib/                                       # Utilities
│   ├── constants.ts
│   ├── format.ts
│   ├── utils.ts                               # cn() helper
│   └── validation.ts
├── types/                                     # TypeScript definitions
│   ├── global.d.ts
│   ├── inertia.ts
│   └── models.ts
└── app.tsx                                    # Inertia entry point
```

## Frontend Styling (`resources/css/`)

```
resources/css/
└── app.css                                    # Tailwind directives + theme
```

## Frontend Views (`resources/views/`)

```
resources/views/
└── app.blade.php                              # Inertia root template (only Blade file)
```

## Routes (`routes/`)

```
routes/
├── auth.php                                   # Authentication routes (Breeze)
├── console.php                                # Custom artisan commands
└── web.php                                    # Application routes
```

## Tests (`tests/`)

```
tests/
├── Feature/
│   ├── Auth/                                  # Authentication feature tests
│   ├── Middleware/
│   │   └── EnsureUserIsAdminTest.php
│   └── (more added per feature)
├── Unit/
│   └── Models/
│       └── UserTest.php
├── CreatesApplication.php
├── TestCase.php
└── Pest.php                                   # If using Pest (optional)
```

## Frontend Tests

```
resources/js/__tests__/
├── lib/
│   ├── format.test.ts
│   └── validation.test.ts
└── setup.ts                                   # Vitest setup
```

## Configuration (`config/`)

```
config/
├── app.php
├── auth.php
├── cache.php
├── database.php
├── inertia.php                                # Inertia configuration (if customized)
├── logging.php
├── mail.php
├── queue.php
├── services.php
└── session.php
```

## Storage (`storage/`)

```
storage/
├── app/
│   └── public/                                # Symlinked to public/storage
├── framework/
│   ├── cache/
│   ├── sessions/                              # Session files (default driver)
│   └── views/                                 # Cached Blade views
└── logs/
    ├── laravel.log                            # Application log
    └── security.log                           # Security events (separate channel)
```

## Public (`public/`)

```
public/
├── build/                                     # Vite build output (gitignored in dev)
├── storage/                                   # Symlink to storage/app/public
├── .htaccess
├── favicon.ico
├── index.php                                  # Application entry point
└── robots.txt
```

## Naming Conventions Summary

| Type                 | Convention                   | Example                                     |
| -------------------- | ---------------------------- | ------------------------------------------- |
| PHP class file       | PascalCase                   | `StockController.php`                       |
| PHP class            | PascalCase                   | `class StockController`                     |
| Migration file       | snake_case timestamped       | `2025_05_15_120000_create_stocks_table.php` |
| Eloquent Model       | PascalCase singular          | `Stock.php`, `class Stock`                  |
| Inertia Page         | PascalCase                   | `Stocks/Index.tsx`                          |
| React Component      | kebab-case file              | `stock-card.tsx`                            |
| React Component name | PascalCase                   | `function StockCard()`                      |
| Hook                 | kebab-case `use-*`           | `use-debounce.ts`                           |
| Utility (TS)         | kebab-case                   | `format.ts`, `utils.ts`                     |
| TypeScript type      | PascalCase                   | `interface Stock`, `type PageProps`         |
| Database table       | snake_case plural            | `stocks`, `price_histories`                 |
| Database column      | snake_case                   | `current_price`, `is_active`                |
| Route name           | dot-separated                | `admin.stocks.index`                        |
| Form Request         | PascalCase ends with Request | `StoreStockRequest`                         |

## File Ownership Map (for team coordination)

Each module is owned by one team member, responsible for both backend and frontend.

| Path                                             | Module                         |
| ------------------------------------------------ | ------------------------------ |
| `app/Http/Controllers/Admin/StockController.php` | M1: Admin Stocks CRUD          |
| `resources/js/Pages/Admin/Stocks/*`              | M1: Admin Stocks CRUD          |
| `app/Http/Controllers/Admin/UserController.php`  | M2: Admin Users Management     |
| `resources/js/Pages/Admin/Users/*`               | M2: Admin Users Management     |
| `app/Http/Controllers/StockController.php`       | M3: User Stocks Browser        |
| `resources/js/Pages/Stocks/*`                    | M3: User Stocks Browser        |
| `app/Http/Controllers/PortfolioController.php`   | M4: User Portfolio & Watchlist |
| `app/Http/Controllers/TransactionController.php` | M4: User Portfolio & Watchlist |
| `app/Http/Controllers/WatchlistController.php`   | M4: User Portfolio & Watchlist |
| `resources/js/Pages/Portfolio.tsx`               | M4: User Portfolio & Watchlist |
| `resources/js/Pages/Transactions.tsx`            | M4: User Portfolio & Watchlist |
| `resources/js/Pages/Watchlist.tsx`               | M4: User Portfolio & Watchlist |

See `docs/tasks/README.md` for full module descriptions and task details.
