# Stock Trading Website

A simulated stock trading platform built as the final project for the Internet & Web Technology course at the University of Information Technology (UIT).

## Overview

This application provides a paper-trading environment where users can browse Vietnamese stocks, analyze price movements via historical charts, and execute simulated buy/sell orders. Administrators manage stock listings and user accounts through a dedicated interface.

## Tech Stack

| Layer    | Technology                |
| -------- | ------------------------- |
| Backend  | Laravel 11 (PHP 8.2+)     |
| Frontend | React 18 + TypeScript     |
| Bridge   | Inertia.js v2             |
| Build    | Vite                      |
| Styling  | TailwindCSS 3 + shadcn/ui |
| Database | MySQL 8                   |
| Charts   | Recharts                  |
| Auth     | Laravel Breeze            |

## Prerequisites

- **XAMPP** (includes PHP 8.2+, MySQL 8, Apache, phpMyAdmin) — [download](https://www.apachefriends.org)
- **Composer 2.x** — [download](https://getcomposer.org)
- **Node.js 20 LTS** — [download](https://nodejs.org)
- **pnpm 10.x** — [download](https://pnpm.io/installation) (`npm install -g pnpm`)

## Quick Start

### 1. Start XAMPP

Open the **XAMPP Control Panel** and start both:

- **Apache**
- **MySQL**

> phpMyAdmin will be available at **http://localhost/phpmyadmin** once both services are running.

### 2. Clone the repository

```bash
git clone <repository-url> Internet-CN-Web-DoAn
cd Internet-CN-Web-DoAn
```

### 3. Install dependencies

```bash
composer install
pnpm install
```

### 4. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

The default `.env` values already match XAMPP's MySQL defaults (root user, no password). Edit only if your setup differs:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_website
DB_USERNAME=root
DB_PASSWORD=
```

### 5. Create the database and seed data

```bash
php artisan db:create
php artisan migrate:fresh --seed
```

`db:create` reads `DB_DATABASE` from `.env` and creates the database automatically — no need to open phpMyAdmin manually. `migrate:fresh --seed` then creates all tables and populates them with demo data: 6 user accounts, 20 Vietnamese stocks, and 30 days of price history per stock.

### 6. Start the development servers

Open two terminals:

**Terminal 1** (Laravel backend):

```bash
php artisan serve
```

**Terminal 2** (Vite dev server with hot reload):

```bash
pnpm run dev
```

### 7. Open the application

Visit **http://localhost:8000**

## Demo Accounts

After running `php artisan migrate:fresh --seed`, the following accounts are ready to use. All passwords are `password`.

| Role          | Email            | Balance       | Redirects to | Notes                                                                  |
| ------------- | ---------------- | ------------- | ------------ | ---------------------------------------------------------------------- |
| Administrator | admin@uit.edu.vn | —             | `/admin`     | Full access to admin panel. Cannot trade (no balance).                 |
| User          | user1@uit.edu.vn | 100,000,000 ₫ | `/dashboard` | Standard account with moderate balance. Good for general testing.      |
| User          | user2@uit.edu.vn | 50,000,000 ₫  | `/dashboard` | Lower balance — useful for testing insufficient-funds edge cases.      |
| User          | user3@uit.edu.vn | 200,000,000 ₫ | `/dashboard` | High balance — useful for placing large orders without balance errors. |
| User          | user4@uit.edu.vn | 0 ₫           | `/dashboard` | Zero balance — every buy order should be rejected.                     |
| User (locked) | user5@uit.edu.vn | 75,000,000 ₫  | ✗ blocked    | Login returns _"Tài khoản đã bị khóa"_. Cannot access the app.         |

### Login behavior

- **Admin** accounts land on `/admin` (admin dashboard). Accessing any `/` user route still works but is not the primary flow.
- **User** accounts land on `/dashboard`. Manually navigating to `/admin` returns HTTP 403.
- **Locked** accounts are rejected at the login step — the session is never created.

> If the table above shows stale data (e.g., a balance was changed during testing), run `php artisan migrate:fresh --seed` to reset all demo data.

## Project Structure

```
stock-website/
├── app/                      # PHP application code (Models, Controllers, Middleware)
├── database/
│   ├── migrations/           # Schema definitions
│   └── seeders/              # Demo data
├── docs/                     # Architecture and design documentation
├── public/                   # Web server document root
├── resources/
│   ├── css/                  # Tailwind imports
│   ├── js/
│   │   ├── Pages/            # Inertia React pages
│   │   ├── components/       # Reusable React components
│   │   ├── layouts/          # Page layouts
│   │   ├── lib/              # Utility functions
│   │   └── types/            # TypeScript definitions
│   └── views/                # Blade root template
└── routes/                   # Route definitions
```

See `docs/05-folder-structure.md` for the complete layout.

## Available Commands

### Development

```bash
php artisan serve           # Start Laravel backend
pnpm run dev                # Start Vite dev server
```

### Database

```bash
php artisan db:create                 # Create the database (first-time setup)
php artisan migrate                   # Run pending migrations
php artisan migrate:fresh             # Drop all tables and re-migrate
php artisan migrate:fresh --seed      # Drop, migrate, and seed
php artisan db:seed                   # Run seeders only
php artisan migrate:rollback          # Roll back the last migration batch
```

### Code Quality

```bash
# TypeScript / React
pnpm run lint               # Lint TypeScript/React
pnpm run lint:fix           # Lint and auto-fix
pnpm run format             # Format with Prettier
pnpm run type-check         # TypeScript type checking

# PHP
composer lint               # Check PHP code style (Pint dry-run)
composer format             # Auto-fix PHP code style (Pint)
```

### Build

```bash
pnpm run build              # Production asset build
```

## Documentation

| Document                                                         | Description                            |
| ---------------------------------------------------------------- | -------------------------------------- |
| [docs/01-project-overview.md](docs/01-project-overview.md)       | Project goals, scope, and stakeholders |
| [docs/02-tech-stack.md](docs/02-tech-stack.md)                   | Technology choices and rationale       |
| [docs/03-architecture.md](docs/03-architecture.md)               | System architecture and request flow   |
| [docs/04-database-design.md](docs/04-database-design.md)         | Database schema and ERD                |
| [docs/05-folder-structure.md](docs/05-folder-structure.md)       | Codebase organization                  |
| [docs/06-coding-standards.md](docs/06-coding-standards.md)       | Style guides and conventions           |
| [docs/07-security-guidelines.md](docs/07-security-guidelines.md) | Security policies and practices        |
| [docs/08-phase1-tasks.md](docs/08-phase1-tasks.md)               | Phase 1 task breakdown                 |

## Viewing the Database

Open **http://localhost/phpmyadmin** (requires XAMPP MySQL to be running). Select the `stock_website` database from the left sidebar to browse tables and run queries.

## Database Export

To export the database as SQL for academic submission:

1. Open **http://localhost/phpmyadmin**
2. Select the `stock_website` database from the left sidebar
3. Click the **Export** tab
4. Choose format **SQL**, method **Quick**
5. Click **Go** to download `stock_website.sql`

## Troubleshooting

### Migration fails with "database does not exist"

Run `php artisan db:create` first (requires XAMPP MySQL to be running), then retry the migration.

### Cannot connect to MySQL / SQLSTATE errors

1. Open XAMPP Control Panel and verify **MySQL** shows a green "Running" status
2. Confirm `.env` has `DB_HOST=127.0.0.1`, `DB_USERNAME=root`, `DB_PASSWORD=` (empty)
3. XAMPP MySQL default port is `3306` — ensure nothing else occupies it

### phpMyAdmin not opening

Make sure **Apache** is also started in XAMPP (phpMyAdmin is served by Apache, not MySQL). Then visit http://localhost/phpmyadmin.

### Vite dev server doesn't connect

Ensure both `php artisan serve` and `pnpm run dev` are running. Vite's hot reload requires the dev server on port 5173.

### "Class not found" errors

Run `composer dump-autoload` to regenerate the autoloader.

### Permissions errors on `storage/` or `bootstrap/cache/`

```bash
chmod -R 775 storage bootstrap/cache
```

### Database is empty after migration

Run with the seed flag: `php artisan migrate:fresh --seed`

## License

Educational project. Not for commercial use.
