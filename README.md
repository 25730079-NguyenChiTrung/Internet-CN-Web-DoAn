# Stock Trading Website

A simulated stock trading platform built as the final project for the Internet & Web Technology course (IE104) at the University of Information Technology (UIT). The application provides a paper-trading environment — users browse Vietnamese stocks, analyze price charts, and execute simulated buy/sell orders with virtual funds. Administrators manage stock listings and user accounts through a dedicated panel.

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Backend  | Laravel 11 (PHP 8.2+)     |
| Frontend | React 18 + TypeScript 5   |
| Bridge   | Inertia.js v2             |
| Build    | Vite 5                    |
| Styling  | TailwindCSS 3 + shadcn/ui |
| Database | MySQL 8                   |
| Charts   | Recharts                  |
| Auth     | Laravel Breeze            |
| Icons    | Lucide React              |

## Quick Start

See **[docs/guides/getting-started.md](docs/guides/getting-started.md)** for the full setup guide (30 minutes from zero to running local).

**TL;DR**:

```bash
git clone <repository-url> stock-website && cd stock-website
composer install && pnpm install
cp .env.example .env && php artisan key:generate
php artisan db:create
php artisan migrate:fresh --seed
# Then in two terminals:
php artisan serve        # Terminal 1
pnpm run dev             # Terminal 2
```

Open **http://localhost:8000**

## Demo Accounts

All passwords are `password`.

| Email            | Role          | Balance       | Notes                                        |
| ---------------- | ------------- | ------------- | -------------------------------------------- |
| admin@uit.edu.vn | Admin         | —             | Full admin panel access. Cannot trade.       |
| user1@uit.edu.vn | User          | 100,000,000 ₫ | Standard account for general testing.        |
| user2@uit.edu.vn | User          | 50,000,000 ₫  | Low balance — test insufficient funds.       |
| user3@uit.edu.vn | User          | 200,000,000 ₫ | High balance — test large orders.            |
| user4@uit.edu.vn | User          | 0 ₫           | Zero balance — every buy should be rejected. |
| user5@uit.edu.vn | User (locked) | 75,000,000 ₫  | Login returns "Tài khoản đã bị khóa".        |

## Documentation

| Document                                                         | Description                              |
| ---------------------------------------------------------------- | ---------------------------------------- |
| [docs/01-project-overview.md](docs/01-project-overview.md)       | Project goals, scope, and stakeholders   |
| [docs/02-tech-stack.md](docs/02-tech-stack.md)                   | Technology choices and rationale         |
| [docs/03-architecture.md](docs/03-architecture.md)               | System architecture and request flow     |
| [docs/04-database-design.md](docs/04-database-design.md)         | Database schema and ERD                  |
| [docs/05-folder-structure.md](docs/05-folder-structure.md)       | Codebase organization and file ownership |
| [docs/06-coding-standards.md](docs/06-coding-standards.md)       | Style guides and conventions             |
| [docs/07-security-guidelines.md](docs/07-security-guidelines.md) | Security policies and practices          |

## For Team Members

Each feature module has its own task file with business requirements, acceptance criteria, and implementation hints:

| Module                       | File                                                                               |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| M1: Admin Stocks CRUD        | [docs/tasks/M1-admin-stocks-crud.md](docs/tasks/M1-admin-stocks-crud.md)           |
| M2: Admin Users Management   | [docs/tasks/M2-admin-users-management.md](docs/tasks/M2-admin-users-management.md) |
| M3: User Stocks Browser      | [docs/tasks/M3-user-stocks-browser.md](docs/tasks/M3-user-stocks-browser.md)       |
| M4: User Trading & Portfolio | [docs/tasks/M4-user-trading-portfolio.md](docs/tasks/M4-user-trading-portfolio.md) |

See [docs/tasks/README.md](docs/tasks/README.md) for module overview and coordination notes.

## Guides

| Guide                                                                | Description                             |
| -------------------------------------------------------------------- | --------------------------------------- |
| [docs/guides/getting-started.md](docs/guides/getting-started.md)     | Environment setup from scratch          |
| [docs/guides/contributing.md](docs/guides/contributing.md)           | Git workflow, commit format, PR process |
| [docs/guides/component-library.md](docs/guides/component-library.md) | Available UI components and utilities   |

## Available Commands

### Development

```bash
php artisan serve           # Start Laravel backend (http://localhost:8000)
pnpm run dev                # Start Vite dev server with hot reload
```

### Database

```bash
php artisan db:create                  # Create database (first-time setup)
php artisan migrate                    # Run pending migrations
php artisan migrate:fresh --seed       # Drop all tables, re-migrate, and seed
php artisan db:seed                    # Run seeders only
php artisan migrate:rollback           # Roll back the last migration batch
```

### Code Quality

```bash
pnpm run lint               # Lint TypeScript/React
pnpm run lint:fix           # Lint and auto-fix
pnpm run format             # Format with Prettier
pnpm run type-check         # TypeScript type checking
composer lint               # Check PHP code style (Pint dry-run)
composer format             # Auto-fix PHP code style (Pint)
```

### Build

```bash
pnpm run build              # Production asset build
```

## Project Structure

```
stock-website/
├── app/                      # PHP application code (Models, Controllers, Services)
├── database/
│   ├── migrations/           # Schema definitions
│   └── seeders/              # Demo data
├── docs/                     # Architecture, design docs, task files, guides
├── resources/
│   ├── css/                  # Tailwind imports
│   ├── js/
│   │   ├── Pages/            # Inertia React pages (PascalCase)
│   │   ├── components/       # Reusable React components (kebab-case)
│   │   ├── layouts/          # Page layouts
│   │   ├── lib/              # Utility functions
│   │   └── types/            # TypeScript definitions
│   └── views/                # Blade root template
└── routes/                   # Route definitions
```

See [docs/05-folder-structure.md](docs/05-folder-structure.md) for the complete layout.

## Viewing the Database

Open **http://localhost/phpmyadmin** (requires XAMPP MySQL running). Select the `stock_website` database from the left sidebar.

## Troubleshooting

**Migration fails with "database does not exist"** → Run `php artisan db:create` first (MySQL must be running), then retry.

**Cannot connect to MySQL** → Open XAMPP Control Panel and verify MySQL shows "Running". Check `.env` has `DB_HOST=127.0.0.1`, `DB_USERNAME=root`, `DB_PASSWORD=` (empty).

**Vite dev server doesn't connect** → Ensure both `php artisan serve` and `pnpm run dev` are running simultaneously.

**"Class not found" errors** → Run `composer dump-autoload`.

**Permissions errors on `storage/`** → Run `chmod -R 775 storage bootstrap/cache`.

## License

Educational project. Not for commercial use.
