# Phase 1 — Project Foundation Tasks

## Overview

Phase 1 establishes the project foundation: a runnable Laravel + Inertia + React application with authentication, role-based authorization, database schema, seed data, shared layouts, and reusable components. After Phase 1, feature development can proceed in parallel without infrastructure blockers.

## Objectives

1. Initialize a clean codebase with the agreed tech stack
2. Implement database schema (migrations + models)
3. Seed realistic demo data
4. Configure authentication with role-based redirects
5. Create middleware for admin gating
6. Build reusable layouts and shared UI components
7. Document setup and conventions

## Out of Scope

Phase 1 does **not** include:

- Feature controllers (stock CRUD, trading logic, etc.)
- Feature pages (browse stocks, place orders, etc.)
- Production deployment
- Performance optimization beyond baseline

## Deliverables

| # | Deliverable | Location |
|---|-------------|----------|
| 1 | Initialized Laravel project | Project root |
| 2 | 5 migration files | `database/migrations/` |
| 3 | 5 Eloquent models | `app/Models/` |
| 4 | 3 seeders | `database/seeders/` |
| 5 | Admin middleware | `app/Http/Middleware/EnsureUserIsAdmin.php` |
| 6 | Route definitions with middleware groups | `routes/web.php` |
| 7 | 3 layouts (guest, app, admin) | `resources/js/layouts/` |
| 8 | ~10 shared React components | `resources/js/components/shared/` |
| 9 | TypeScript types | `resources/js/types/` |
| 10 | Format utilities | `resources/js/lib/format.ts` |
| 11 | Placeholder pages | `resources/js/Pages/` |
| 12 | ESLint, Prettier, Husky configuration | Project root |
| 13 | Documentation | `docs/`, `README.md` |
| 14 | Completion report | `PHASE_1_COMPLETION_REPORT.md` |

## Task Breakdown

### Part A: Backend Foundation

#### A1. Initialize Laravel Project

```bash
composer create-project laravel/laravel stock-website
cd stock-website
```

Verify:

- PHP version: `php --version` (must be 8.2+)
- Laravel version: `php artisan --version` (must be 11.x)

#### A2. Install Laravel Breeze with Inertia React

```bash
composer require laravel/breeze --dev
php artisan breeze:install react --typescript
npm install
```

Important: Do **not** select SSR option (adds complexity not needed).

Verify scaffolding created:

- `resources/js/Pages/Auth/Login.tsx`
- `resources/js/Pages/Auth/Register.tsx`
- `resources/js/Pages/Welcome.tsx`
- `routes/auth.php`

#### A3. Configure Environment

Edit `.env`:

```env
APP_NAME="Stock Trading"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=stock_website
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
SESSION_LIFETIME=120
```

Update `.env.example` to mirror structure (without sensitive values).

#### A4. Create MySQL Database

```sql
CREATE DATABASE stock_website
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Or via phpMyAdmin: New → name: `stock_website`, collation: `utf8mb4_unicode_ci`.

#### A5. Customize Users Migration

Modify the default `0001_01_01_000000_create_users_table.php`:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('email')->unique();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password');
        $table->enum('role', ['user', 'admin'])->default('user');
        $table->decimal('balance', 15, 2)->default(0);
        $table->boolean('is_active')->default(true);
        $table->rememberToken();
        $table->timestamps();
    });

    // ... rest (password_reset_tokens, sessions)
}
```

#### A6. Create Stocks Migration

```bash
php artisan make:migration create_stocks_table
```

```php
public function up(): void
{
    Schema::create('stocks', function (Blueprint $table) {
        $table->id();
        $table->string('symbol', 10)->unique()->index();
        $table->string('company_name');
        $table->string('sector', 100)->nullable();
        $table->enum('exchange', ['HOSE', 'HNX', 'UPCOM'])->default('HOSE');
        $table->decimal('current_price', 15, 2)->default(0);
        $table->decimal('previous_close', 15, 2)->default(0);
        $table->text('description')->nullable();
        $table->string('logo_url')->nullable();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();

        $table->index('is_active');
    });
}
```

#### A7. Create Transactions Migration

```php
public function up(): void
{
    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('stock_id')->constrained()->restrictOnDelete();
        $table->enum('type', ['buy', 'sell']);
        $table->integer('quantity');
        $table->decimal('price', 15, 2);
        $table->decimal('total', 15, 2);
        $table->decimal('fee', 15, 2)->default(0);
        $table->enum('status', ['pending', 'completed', 'cancelled'])->default('pending');
        $table->timestamp('executed_at')->nullable();
        $table->timestamps();

        $table->index(['user_id', 'created_at']);
        $table->index(['stock_id', 'status']);
    });
}
```

#### A8. Create Portfolios Migration

```php
public function up(): void
{
    Schema::create('portfolios', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->cascadeOnDelete();
        $table->foreignId('stock_id')->constrained()->restrictOnDelete();
        $table->integer('quantity');
        $table->decimal('avg_price', 15, 2);
        $table->timestamps();

        $table->unique(['user_id', 'stock_id']);
    });
}
```

#### A9. Create Price Histories Migration

```php
public function up(): void
{
    Schema::create('price_histories', function (Blueprint $table) {
        $table->id();
        $table->foreignId('stock_id')->constrained()->cascadeOnDelete();
        $table->decimal('price', 15, 2);
        $table->date('date');
        $table->timestamps();

        $table->unique(['stock_id', 'date']);
    });
}
```

#### A10. Create User Model

`app/Models/User.php`:

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'balance',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }
}
```

#### A11. Create Stock Model

`app/Models/Stock.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'symbol',
        'company_name',
        'sector',
        'exchange',
        'current_price',
        'previous_close',
        'description',
        'logo_url',
        'is_active',
    ];

    protected $appends = ['change_percent', 'trend'];

    protected function casts(): array
    {
        return [
            'current_price' => 'decimal:2',
            'previous_close' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function getChangePercentAttribute(): float
    {
        if ($this->previous_close == 0) {
            return 0;
        }
        return round((($this->current_price - $this->previous_close) / $this->previous_close) * 100, 2);
    }

    public function getTrendAttribute(): string
    {
        if ($this->current_price > $this->previous_close) return 'up';
        if ($this->current_price < $this->previous_close) return 'down';
        return 'flat';
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function priceHistories(): HasMany
    {
        return $this->hasMany(PriceHistory::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (!$keyword) return $query;
        return $query->where(function ($q) use ($keyword) {
            $q->where('symbol', 'like', "%{$keyword}%")
              ->orWhere('company_name', 'like', "%{$keyword}%");
        });
    }
}
```

#### A12. Create Transaction, Portfolio, PriceHistory Models

Follow the same pattern as Stock. Include:

- `$fillable`
- `$casts` (decimals to `decimal:2`)
- Relationships (`belongsTo` for FK relationships)

#### A13. Create User Seeder

`database/seeders/UserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@uit.edu.vn',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'balance' => 0,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $users = [
            ['name' => 'Nguyễn Văn A', 'email' => 'user1@uit.edu.vn', 'balance' => 100_000_000],
            ['name' => 'Trần Thị B', 'email' => 'user2@uit.edu.vn', 'balance' => 50_000_000],
            ['name' => 'Lê Văn C', 'email' => 'user3@uit.edu.vn', 'balance' => 200_000_000],
            ['name' => 'Phạm Thị D', 'email' => 'user4@uit.edu.vn', 'balance' => 0],  // Edge case
            ['name' => 'Hoàng Văn E', 'email' => 'user5@uit.edu.vn', 'balance' => 75_000_000, 'is_active' => false],  // Locked
        ];

        foreach ($users as $userData) {
            User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => Hash::make('password'),
                'role' => 'user',
                'balance' => $userData['balance'],
                'is_active' => $userData['is_active'] ?? true,
                'email_verified_at' => now(),
            ]);
        }
    }
}
```

#### A14. Create Stock Seeder

`database/seeders/StockSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Stock;
use Illuminate\Database\Seeder;

class StockSeeder extends Seeder
{
    public function run(): void
    {
        $stocks = [
            ['symbol' => 'VNM', 'company_name' => 'Công ty Cổ phần Sữa Việt Nam', 'sector' => 'Thực phẩm & Đồ uống', 'exchange' => 'HOSE', 'current_price' => 71_500, 'previous_close' => 70_800],
            ['symbol' => 'FPT', 'company_name' => 'Công ty Cổ phần FPT', 'sector' => 'Công nghệ thông tin', 'exchange' => 'HOSE', 'current_price' => 121_500, 'previous_close' => 119_800],
            ['symbol' => 'HPG', 'company_name' => 'Công ty Cổ phần Tập đoàn Hòa Phát', 'sector' => 'Vật liệu cơ bản', 'exchange' => 'HOSE', 'current_price' => 25_650, 'previous_close' => 26_100],
            ['symbol' => 'VCB', 'company_name' => 'Ngân hàng TMCP Ngoại thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 91_200, 'previous_close' => 90_500],
            ['symbol' => 'ACB', 'company_name' => 'Ngân hàng TMCP Á Châu', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 24_500, 'previous_close' => 24_700],
            ['symbol' => 'BID', 'company_name' => 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 48_200, 'previous_close' => 47_900],
            ['symbol' => 'CTG', 'company_name' => 'Ngân hàng TMCP Công thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 36_800, 'previous_close' => 36_500],
            ['symbol' => 'GAS', 'company_name' => 'Tổng Công ty Khí Việt Nam', 'sector' => 'Dầu khí', 'exchange' => 'HOSE', 'current_price' => 78_500, 'previous_close' => 79_200],
            ['symbol' => 'HDB', 'company_name' => 'Ngân hàng TMCP Phát triển TP.HCM', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 26_400, 'previous_close' => 26_200],
            ['symbol' => 'MBB', 'company_name' => 'Ngân hàng TMCP Quân đội', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 22_800, 'previous_close' => 22_500],
            ['symbol' => 'MWG', 'company_name' => 'Công ty CP Đầu tư Thế giới Di động', 'sector' => 'Bán lẻ', 'exchange' => 'HOSE', 'current_price' => 64_200, 'previous_close' => 63_500],
            ['symbol' => 'NVL', 'company_name' => 'Công ty CP Tập đoàn Đầu tư Địa ốc Nova', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 18_300, 'previous_close' => 18_900],
            ['symbol' => 'PLX', 'company_name' => 'Tập đoàn Xăng dầu Việt Nam', 'sector' => 'Dầu khí', 'exchange' => 'HOSE', 'current_price' => 44_500, 'previous_close' => 44_100],
            ['symbol' => 'POW', 'company_name' => 'Tổng Công ty Điện lực Dầu khí Việt Nam', 'sector' => 'Tiện ích', 'exchange' => 'HOSE', 'current_price' => 12_650, 'previous_close' => 12_500],
            ['symbol' => 'REE', 'company_name' => 'Công ty CP Cơ Điện Lạnh', 'sector' => 'Công nghiệp', 'exchange' => 'HOSE', 'current_price' => 68_500, 'previous_close' => 67_800],
            ['symbol' => 'SAB', 'company_name' => 'Tổng Công ty CP Bia - Rượu - Nước giải khát Sài Gòn', 'sector' => 'Thực phẩm & Đồ uống', 'exchange' => 'HOSE', 'current_price' => 56_300, 'previous_close' => 56_700],
            ['symbol' => 'SSI', 'company_name' => 'Công ty CP Chứng khoán SSI', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 31_200, 'previous_close' => 30_900],
            ['symbol' => 'TCB', 'company_name' => 'Ngân hàng TMCP Kỹ thương Việt Nam', 'sector' => 'Tài chính', 'exchange' => 'HOSE', 'current_price' => 25_700, 'previous_close' => 25_400],
            ['symbol' => 'VHM', 'company_name' => 'Công ty CP Vinhomes', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 42_300, 'previous_close' => 41_800],
            ['symbol' => 'VIC', 'company_name' => 'Tập đoàn Vingroup', 'sector' => 'Bất động sản', 'exchange' => 'HOSE', 'current_price' => 41_500, 'previous_close' => 41_900],
        ];

        foreach ($stocks as $stock) {
            Stock::create([
                ...$stock,
                'description' => 'Công ty niêm yết trên sàn HOSE.',
                'is_active' => true,
            ]);
        }
    }
}
```

#### A15. Create Price History Seeder

`database/seeders/PriceHistorySeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\PriceHistory;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class PriceHistorySeeder extends Seeder
{
    public function run(): void
    {
        $stocks = Stock::all();

        foreach ($stocks as $stock) {
            $price = (float) $stock->current_price;

            // Generate 30 days of historical prices ending at current_price
            $prices = [];
            for ($i = 30; $i >= 1; $i--) {
                // Random walk: ±3% per day
                $changePercent = (mt_rand(-300, 300) / 10000);
                $price = $price * (1 + $changePercent);
                $prices[] = [
                    'date' => now()->subDays($i)->toDateString(),
                    'price' => round($price, 2),
                ];
            }

            foreach ($prices as $entry) {
                PriceHistory::create([
                    'stock_id' => $stock->id,
                    'price' => $entry['price'],
                    'date' => $entry['date'],
                ]);
            }
        }
    }
}
```

#### A16. Update DatabaseSeeder

```php
public function run(): void
{
    $this->call([
        UserSeeder::class,
        StockSeeder::class,
        PriceHistorySeeder::class,
    ]);
}
```

#### A17. Run Migrations and Seeders

```bash
php artisan migrate:fresh --seed
```

Expected output:

```
INFO  Dropping all tables ........................ DONE
INFO  Preparing database ........................ DONE
INFO  Running migrations.
  0001_01_01_000000_create_users_table .......... 25ms DONE
  0001_01_01_000001_create_cache_table .......... 15ms DONE
  0001_01_01_000002_create_jobs_table ........... 18ms DONE
  2025_xx_xx_create_stocks_table ................ 14ms DONE
  2025_xx_xx_create_transactions_table .......... 22ms DONE
  2025_xx_xx_create_portfolios_table ............ 16ms DONE
  2025_xx_xx_create_price_histories_table ....... 14ms DONE

INFO  Seeding database.
  Database\Seeders\UserSeeder ................... DONE
  Database\Seeders\StockSeeder .................. DONE
  Database\Seeders\PriceHistorySeeder ........... DONE
```

Verify in phpMyAdmin: 6 users, 20 stocks, 600 price_histories.

#### A18. Create Admin Middleware

```bash
php artisan make:middleware EnsureUserIsAdmin
```

`app/Http/Middleware/EnsureUserIsAdmin.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return redirect()->route('login');
        }

        if ($request->user()->role !== 'admin') {
            abort(403, 'Bạn không có quyền truy cập trang này');
        }

        return $next($request);
    }
}
```

#### A19. Register Middleware Alias

In `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
    ]);
})
```

#### A20. Customize Login to Check is_active

In `app/Http/Requests/Auth/LoginRequest.php`, modify `authenticate()`:

```php
public function authenticate(): void
{
    $this->ensureIsNotRateLimited();

    if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
        RateLimiter::hit($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.failed'),
        ]);
    }

    // Check if user is active
    if (! Auth::user()->is_active) {
        Auth::logout();
        $this->session()->invalidate();

        throw ValidationException::withMessages([
            'email' => 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        ]);
    }

    RateLimiter::clear($this->throttleKey());
}
```

#### A21. Configure Role-Based Login Redirect

In `app/Http/Controllers/Auth/AuthenticatedSessionController.php`, override `store()`:

```php
public function store(LoginRequest $request): RedirectResponse
{
    $request->authenticate();
    $request->session()->regenerate();

    $user = $request->user();

    return redirect()->intended(
        $user->is_admin ? route('admin.dashboard') : route('dashboard')
    );
}
```

#### A22. Define Routes

Replace `routes/web.php`:

```php
<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/stocks', [StockController::class, 'index'])->name('stocks.index');
Route::get('/stocks/{stock:symbol}', [StockController::class, 'show'])->name('stocks.show');

// Authenticated user routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/portfolio', [PortfolioController::class, 'index'])->name('portfolio.index');
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');
});

require __DIR__.'/auth.php';
```

#### A23. Create Placeholder Controllers

For each placeholder, create a controller that renders an empty Inertia page. This allows routes to work even before members implement features.

Example `app/Http/Controllers/HomeController.php`:

```php
public function index()
{
    return Inertia::render('Welcome');
}
```

Same pattern for `DashboardController`, `StockController`, `PortfolioController`, `TransactionController`, `Admin\DashboardController`.

### Part B: Frontend Foundation

#### B1. Configure Vite

Verify `vite.config.ts` exists with React + TypeScript support (Breeze sets this up).

#### B2. Configure TailwindCSS

`tailwind.config.js`:

```js
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                'price-up': 'hsl(var(--price-up))',
                'price-down': 'hsl(var(--price-down))',
                'price-flat': 'hsl(var(--price-flat))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [forms],
};
```

#### B3. Configure CSS Variables

`resources/css/app.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;

    --price-up: 142 71% 45%;
    --price-down: 0 84% 60%;
    --price-flat: 215 20% 65%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

#### B4. Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Answer prompts:

- TypeScript: yes
- Style: Default
- Base color: Slate
- CSS variables: yes
- React Server Components: no
- `components.json` location: root
- Components alias: `@/components`
- Utils alias: `@/lib/utils`

#### B5. Install shadcn/ui Components

```bash
npx shadcn@latest add button input label dialog dropdown-menu \
  table card select badge avatar separator tabs form \
  toast alert sheet skeleton command popover
```

#### B6. Install Additional Dependencies

```bash
npm install lucide-react react-hot-toast date-fns recharts
npm install -D prettier prettier-plugin-tailwindcss
```

#### B7. Configure TypeScript Strict Mode

`tsconfig.json`:

```json
{
    "compilerOptions": {
        "target": "ES2020",
        "lib": ["DOM", "DOM.Iterable", "ES2020"],
        "module": "ESNext",
        "moduleResolution": "Bundler",
        "jsx": "react-jsx",
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "noFallthroughCasesInSwitch": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "allowImportingTsExtensions": false,
        "paths": {
            "@/*": ["./resources/js/*"]
        }
    },
    "include": [
        "resources/js/**/*",
        "vite.config.ts"
    ]
}
```

#### B8. Create TypeScript Types

`resources/js/types/models.ts`:

```typescript
export type UserRole = 'user' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: UserRole;
  balance: number;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export type Exchange = 'HOSE' | 'HNX' | 'UPCOM';

export interface Stock {
  id: number;
  symbol: string;
  company_name: string;
  sector: string | null;
  exchange: Exchange;
  current_price: number;
  previous_close: number;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  change_percent: number;
  trend: 'up' | 'down' | 'flat';
  created_at: string;
  updated_at: string;
}

export type TransactionType = 'buy' | 'sell';
export type TransactionStatus = 'pending' | 'completed' | 'cancelled';

export interface Transaction {
  id: number;
  user_id: number;
  stock_id: number;
  type: TransactionType;
  quantity: number;
  price: number;
  total: number;
  fee: number;
  status: TransactionStatus;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  stock?: Stock;
}

export interface Portfolio {
  id: number;
  user_id: number;
  stock_id: number;
  quantity: number;
  avg_price: number;
  created_at: string;
  updated_at: string;
  stock?: Stock;
}

export interface PriceHistory {
  id: number;
  stock_id: number;
  price: number;
  date: string;
  created_at: string;
  updated_at: string;
}
```

`resources/js/types/inertia.ts`:

```typescript
import type { User } from './models';

export interface PageProps {
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
    [key: string]: unknown;
  };
}

export type InertiaPageProps<T = Record<string, unknown>> = T & PageProps;
```

#### B9. Create Format Utilities

`resources/js/lib/format.ts`:

```typescript
/**
 * Format a number as Vietnamese Dong currency.
 */
export function formatCurrency(amount: number | string): string {
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(value)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a percentage value with sign.
 */
export function formatPercent(value: number | string, decimals = 2): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0%';
  const sign = num > 0 ? '+' : '';
  return `${sign}${num.toFixed(decimals)}%`;
}

/**
 * Format a number with thousand separators.
 */
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Format a date string to DD/MM/YYYY.
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Format a date string to DD/MM/YYYY HH:mm.
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}
```

#### B10. Create Layouts

`resources/js/layouts/guest-layout.tsx`: Simple centered layout for login/register pages.

`resources/js/layouts/app-layout.tsx`: User-facing layout with top navbar, footer, and toast container.

`resources/js/layouts/admin-layout.tsx`: Admin layout with sidebar (Dashboard, Stocks, Users) and top bar.

Detailed implementation deferred to actual coding (Claude Code will generate).

#### B11. Create Shared Components

Create files in `resources/js/components/shared/`:

- `page-header.tsx`: Title + breadcrumb + actions slot
- `data-table.tsx`: Generic table with sort/filter
- `empty-state.tsx`: Icon + message + optional action
- `confirm-dialog.tsx`: Confirmation modal
- `stock-card.tsx`: Stock display card
- `stock-chart.tsx`: Recharts line chart wrapper
- `price-change.tsx`: Colored % display
- `loading-spinner.tsx`
- `error-boundary.tsx`

#### B12. Create Placeholder Pages

Each placeholder page renders the appropriate layout with a `<PageHeader>` and `<EmptyState>` indicating "Coming soon". This unblocks routes and lets navigation work end-to-end.

### Part C: Tooling & Configuration

#### C1. ESLint Configuration

`eslint.config.js`:

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
);
```

#### C2. Prettier Configuration

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### C3. EditorConfig

`.editorconfig`:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_size = 4
indent_style = space
insert_final_newline = true
trim_trailing_whitespace = true

[*.{ts,tsx,js,jsx,css,json,md,yml,yaml}]
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

#### C4. Husky + lint-staged

```bash
npm install -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:

```bash
npx lint-staged
```

`package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

#### C5. NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint resources/js --ext .ts,.tsx",
    "lint:fix": "eslint resources/js --ext .ts,.tsx --fix",
    "format": "prettier --write 'resources/js/**/*.{ts,tsx,css}'",
    "type-check": "tsc --noEmit"
  }
}
```

#### C6. .gitignore

Verify `.gitignore` excludes:

```
/node_modules
/public/build
/public/hot
/public/storage
/storage/*.key
/vendor
.env
.env.backup
.env.production
.phpactor.json
.phpunit.result.cache
Homestead.json
Homestead.yaml
auth.json
npm-debug.log
yarn-error.log
/.fleet
/.idea
/.vscode
.DS_Store
```

#### C7. README.md

Create comprehensive README with:

- Project description
- Tech stack
- Prerequisites
- Setup instructions
- Development workflow
- Useful commands
- Demo accounts

(Detailed template in next section)

### Part D: Verification

#### D1. Run Final Verification

```bash
# Drop and recreate database
php artisan migrate:fresh --seed

# Build assets
npm run build

# Start dev servers (in separate terminals)
php artisan serve
npm run dev
```

#### D2. Manual Smoke Test

1. Open <http://localhost:8000> → Welcome page displays
2. Click Register → form works
3. Login with `admin@uit.edu.vn` / `password` → redirected to `/admin`
4. Logout → redirected to `/`
5. Login with `user1@uit.edu.vn` / `password` → redirected to `/dashboard`
6. Manually navigate to `/admin` → receive 403
7. Logout, try login with `user5@uit.edu.vn` / `password` → error: "Tài khoản đã bị khóa"

#### D3. Linting

```bash
npm run lint        # Should pass with 0 errors
npm run type-check  # Should pass with 0 errors
```

#### D4. Security Audit

```bash
composer audit     # Should show 0 critical/high
npm audit          # Should show 0 critical/high
```

#### D5. Completion Report

Create `PHASE_1_COMPLETION_REPORT.md` with:

- Summary of work completed
- Tech stack versions actually installed
- Files created
- Issues encountered and resolved
- Items deferred to Phase 2
- Next steps

## Acceptance Criteria

Phase 1 is complete when:

- [ ] `php artisan migrate:fresh --seed` runs without errors
- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `composer audit` shows no high/critical vulnerabilities
- [ ] `npm audit` shows no high/critical vulnerabilities
- [ ] Admin user can log in and reach `/admin`
- [ ] Regular user can log in and reach `/dashboard`
- [ ] Regular user receives 403 when accessing `/admin`
- [ ] Inactive user receives appropriate error on login attempt
- [ ] All 5 migrations exist and run cleanly
- [ ] All 5 models defined with relationships
- [ ] All 3 seeders populate expected data (6 users, 20 stocks, 600 price histories)
- [ ] Admin middleware registered and enforced
- [ ] All required documentation files exist in `docs/`
- [ ] `README.md` provides complete setup instructions
- [ ] All commits follow naming convention
- [ ] No `.env`, `vendor/`, `node_modules/`, `public/build/` in git history
