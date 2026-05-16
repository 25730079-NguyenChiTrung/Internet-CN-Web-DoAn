# Security Guidelines

## Security Posture

This application implements defense-in-depth across multiple layers. Security is treated as a baseline requirement, not an optional feature.

## Threat Model

### Primary Threats

| Threat                            | Likelihood | Impact   | Mitigation Layer                                  |
| --------------------------------- | ---------- | -------- | ------------------------------------------------- |
| SQL Injection                     | Medium     | High     | ORM (Eloquent), Form Requests                     |
| Cross-Site Scripting (XSS)        | Medium     | High     | React auto-escaping, no `dangerouslySetInnerHTML` |
| Cross-Site Request Forgery (CSRF) | Low        | High     | Laravel CSRF middleware                           |
| Broken Access Control             | High       | High     | Middleware + Form Request authorize()             |
| Mass Assignment                   | Medium     | Medium   | `$fillable` on all Models                         |
| Session Hijacking                 | Low        | High     | Secure cookies, HTTPS in production               |
| Brute Force Login                 | High       | Medium   | Rate limiting                                     |
| Insecure Dependencies             | Medium     | Variable | `composer audit`, `pnpm audit`                    |
| Information Disclosure            | Medium     | Low      | Generic error messages, no debug in prod          |

### Assets to Protect

- User credentials (passwords, tokens)
- User balance and transaction data
- Session identifiers
- Stock pricing data integrity
- Administrative access

## Authentication Security

### Password Storage

- Algorithm: **bcrypt** (Laravel default)
- Cost factor: **12** rounds
- Never logged, never returned in API responses
- Hidden via Model `$hidden` array

```php
class User extends Authenticatable
{
    protected $hidden = [
        'password',
        'remember_token',
    ];
}
```

### Password Requirements

```php
use Illuminate\Validation\Rules\Password;

'password' => [
    'required',
    'confirmed',
    Password::min(8)
        ->letters()
        ->mixedCase()
        ->numbers()
        ->uncompromised(), // Checks haveibeenpwned database
],
```

### Login Flow

1. User submits email + password
2. Throttle middleware checks rate limit (max 6 attempts per minute per IP)
3. Application looks up user by email
4. Bcrypt verifies password (constant-time comparison)
5. Check `is_active` flag (reject if false)
6. Create session, regenerate session ID
7. Redirect based on role

### Session Configuration

```php
// config/session.php
return [
    'driver' => env('SESSION_DRIVER', 'database'),  // database for production
    'lifetime' => 120,                              // 2 hours
    'expire_on_close' => false,
    'encrypt' => true,
    'http_only' => true,                            // Not accessible to JavaScript
    'same_site' => 'lax',                           // CSRF protection
    'secure' => env('SESSION_SECURE_COOKIE', false),// HTTPS only in production
];
```

Production `.env`:

```env
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database
```

### Rate Limiting

Applied to authentication endpoints via Laravel throttle middleware:

```php
// routes/auth.php
Route::middleware(['throttle:6,1'])->group(function () {
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware(['throttle:3,1'])->group(function () {
    Route::post('forgot-password', [PasswordResetLinkController::class, 'store']);
});
```

Throttle format: `throttle:{max_attempts},{decay_minutes}`.

## Authorization Security

### Role-Based Access

Two roles: `user` and `admin`. Enforced at multiple layers.

**Route Layer** (middleware):

```php
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // All routes here require admin role
});
```

**Form Request Layer** (defense in depth):

```php
public function authorize(): bool
{
    return $this->user()?->role === 'admin';
}
```

### Resource Ownership

For user-owned resources (own portfolio, own transactions), verify ownership:

```php
public function show(Transaction $transaction)
{
    if ($transaction->user_id !== auth()->id()) {
        abort(403);
    }
    return Inertia::render('Transactions/Show', compact('transaction'));
}
```

### Self-Protection

Admin users cannot:

- Delete or deactivate themselves
- Demote themselves from admin role

```php
// In Admin\UserController
public function update(UpdateUserRequest $request, User $user)
{
    if ($user->id === $request->user()->id) {
        return back()->with('error', 'Không thể chỉnh sửa tài khoản của chính mình');
    }
    // ...
}
```

## Input Validation

### Defense Layer: Form Requests

Every endpoint accepting user input uses a Form Request:

```php
class StoreStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'symbol' => [
                'required',
                'string',
                'max:10',
                'regex:/^[A-Z]+$/',
                'unique:stocks,symbol',
            ],
            'company_name' => ['required', 'string', 'max:255'],
            'current_price' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'exchange' => ['required', 'in:HOSE,HNX,UPCOM'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ];
    }
}
```

### Validation Rules Reference

| Rule                           | Purpose                             |
| ------------------------------ | ----------------------------------- |
| `required`                     | Field must be present and non-empty |
| `string`, `integer`, `numeric` | Type check                          |
| `min:N`, `max:N`               | Length or range                     |
| `email`                        | Email format                        |
| `unique:table,column`          | Database uniqueness                 |
| `exists:table,column`          | Database existence                  |
| `in:val1,val2`                 | Enum-like values                    |
| `regex:/pattern/`              | Pattern match                       |
| `confirmed`                    | Matches `field_confirmation`        |
| `mimes:type1,type2`            | File MIME types                     |

### Never Trust Client Data

```php
// ❌ BAD: Trusting client-provided value
public function deposit(Request $request) {
    $newBalance = $request->input('new_balance');  // User can fake this!
    $user->balance = $newBalance;
    $user->save();
}

// ✅ GOOD: Compute server-side from validated input
public function deposit(DepositRequest $request, User $user) {
    $user->increment('balance', $request->validated('amount'));
}
```

## SQL Injection Prevention

### Use Eloquent or Query Builder

Both use parameterized queries automatically.

```php
// ✅ SAFE
User::where('email', $email)->first();
DB::table('users')->where('email', $email)->first();
DB::select('SELECT * FROM users WHERE email = ?', [$email]);

// ❌ DANGEROUS
DB::select("SELECT * FROM users WHERE email = '{$email}'");
DB::statement("UPDATE users SET role = 'admin' WHERE id = {$id}");
```

### Whitelist Columns for orderBy

Dynamic sorting based on user input is a common injection point:

```php
// ❌ DANGEROUS
$users = User::orderBy($request->input('sort'))->get();
// User can pass: "id; DROP TABLE users;"

// ✅ SAFE
$allowedSorts = ['name', 'email', 'created_at'];
$sort = in_array($request->sort, $allowedSorts) ? $request->sort : 'created_at';
$users = User::orderBy($sort)->get();
```

## XSS Prevention

### React Auto-Escaping

React escapes all rendered content by default:

```tsx
// SAFE: React escapes < > & " ' /
<div>{userInput}</div>
```

### dangerouslySetInnerHTML

Only use with sanitized content:

```tsx
import DOMPurify from 'dompurify';

// If you MUST render HTML
<div
    dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(richTextContent),
    }}
/>;
```

We do not render user HTML anywhere in the application.

### Inertia Page Props

Server-rendered data is automatically JSON-encoded by Inertia. No special handling needed.

## CSRF Protection

### Enabled by Default

Laravel includes CSRF middleware globally. Forms must include the CSRF token:

```php
// Inertia automatically handles this via Axios interceptors
// No manual token handling needed
```

### Exceptions

Only exclude routes from CSRF if absolutely necessary (e.g., webhooks):

```php
// In bootstrap/app.php
$middleware->validateCsrfTokens(except: [
    'webhooks/*',  // External services can't have CSRF tokens
]);
```

## Mass Assignment Protection

Always define `$fillable` on Models. Never use `$guarded = []`.

```php
// ✅ GOOD
class Stock extends Model
{
    protected $fillable = [
        'symbol',
        'company_name',
        'current_price',
        // ... explicit list
    ];
}

// ❌ DANGEROUS
class Stock extends Model
{
    protected $guarded = [];  // Anyone can set any field, including role!
}
```

Use `validated()` instead of `all()`:

```php
// ✅ GOOD
User::create($request->validated());

// ❌ DANGEROUS
User::create($request->all());  // Includes unvalidated fields
```

## File Upload Security

### Validation

```php
'logo' => [
    'nullable',
    'image',
    'mimes:jpeg,png,webp',  // Whitelist
    'max:2048',              // 2MB
    'dimensions:max_width=2000,max_height=2000',
],
```

### Storage

Store uploaded files outside the public web root, serve via controller:

```php
// Store
$path = $request->file('logo')->store('logos', 'public');

// Access via storage symlink
asset('storage/' . $path);
```

Run `php artisan storage:link` to create the symlink.

### File Name Sanitization

Laravel's `store()` method auto-generates random file names. Don't use user-provided names:

```php
// ❌ DANGEROUS: User-provided filename
$file->move(storage_path('uploads'), $file->getClientOriginalName());

// ✅ SAFE: Laravel-generated name
$path = $file->store('uploads');
```

## Money Calculations

### Decimal Type Required

```php
// Migration
$table->decimal('balance', 15, 2);

// Model cast
protected $casts = [
    'balance' => 'decimal:2',
];
```

### Avoid Float Arithmetic

For precise calculations, use `bcmath` or convert to cents:

```php
// ❌ INACCURATE
$total = $price * $quantity;  // Float math has rounding errors

// ✅ ACCURATE (string-based)
$total = bcmul($price, (string) $quantity, 2);

// ✅ ACCURATE (integer cents)
$priceCents = (int) round($price * 100);
$totalCents = $priceCents * $quantity;
$total = $totalCents / 100;
```

## Atomic Operations

Use database transactions for any operation that modifies multiple rows:

```php
public function buy(User $user, Stock $stock, int $quantity): Transaction
{
    return DB::transaction(function () use ($user, $stock, $quantity) {
        // 1. Lock user row for update
        $user = User::lockForUpdate()->find($user->id);

        // 2. Verify balance
        $total = $stock->current_price * $quantity;
        if ($user->balance < $total) {
            throw new InsufficientBalanceException();
        }

        // 3. Deduct balance
        $user->decrement('balance', $total);

        // 4. Create transaction
        $transaction = Transaction::create([...]);

        // 5. Update portfolio
        // ...

        return $transaction;
    });
}
```

Without transactions, partial failures can leave data inconsistent (e.g., balance deducted but no transaction record).

## Logging Security Events

Use separate log channel for security events:

```php
// config/logging.php
'channels' => [
    'security' => [
        'driver' => 'daily',
        'path' => storage_path('logs/security.log'),
        'level' => 'info',
        'days' => 90,
    ],
],
```

### Events to Log

```php
// Failed login
Log::channel('security')->warning('Failed login attempt', [
    'email' => $request->input('email'),
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
]);

// Successful admin login
Log::channel('security')->info('Admin logged in', [
    'user_id' => $user->id,
    'ip' => $request->ip(),
]);

// Role escalation attempt (should never happen)
Log::channel('security')->critical('Unauthorized admin access', [
    'user_id' => auth()->id(),
    'route' => $request->path(),
    'ip' => $request->ip(),
]);

// Bulk operations
Log::channel('security')->info('Admin updated user balance', [
    'admin_id' => auth()->id(),
    'target_user_id' => $user->id,
    'amount' => $amount,
]);
```

### Never Log

```php
// ❌ NEVER
Log::info('User logged in', ['password' => $request->password]);
Log::info('User data', ['credit_card' => $cc]);
Log::info('Token issued', ['token' => $jwt]);
```

## Dependency Security

### Regular Audits

```bash
# Backend
composer audit

# Frontend
pnpm audit

# Fix automatically if safe
pnpm audit --fix
```

### Version Pinning

Lock files are committed to repository:

- `composer.lock`
- `pnpm-lock.yaml`

This ensures reproducible builds and prevents supply chain attacks via dependency drift.

### Dependency Selection Criteria

Before adding a new dependency:

- [ ] Active maintenance (commits within last 6 months)
- [ ] Reasonable popularity (avoid trivial packages with < 1000 downloads/week)
- [ ] Compatible license (MIT, Apache 2.0, BSD)
- [ ] Documentation quality
- [ ] No known critical vulnerabilities

## Production Hardening

### Environment Variables

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

# Session
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database
SESSION_LIFETIME=120

# Database
DB_CONNECTION=mysql
# Use strong password, dedicated user, restricted permissions

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=warning
```

### HTTPS Enforcement

```php
// In AppServiceProvider
public function boot(): void
{
    if (config('app.env') === 'production') {
        URL::forceScheme('https');
    }
}
```

### HTTP Security Headers

Add via middleware or web server:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### Hide Framework Fingerprint

```php
// Remove or change Server header
// In Nginx
server_tokens off;

// Remove X-Powered-By in PHP
expose_php = Off
```

### Disable Debug Routes

Remove or restrict access to:

- `/_ignition/` (Whoops error page) — disabled when `APP_DEBUG=false`
- `/telescope` — auth-gated to admin only
- `/horizon` — auth-gated to admin only

## Pre-Deploy Checklist

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] Strong `APP_KEY` generated and set
- [ ] Database credentials use dedicated user with minimum privileges
- [ ] HTTPS enforced (with valid certificate)
- [ ] `composer audit` shows no high/critical issues
- [ ] `pnpm audit` shows no high/critical issues
- [ ] Rate limiting enabled on auth endpoints
- [ ] CSRF protection enabled (default, do not disable)
- [ ] Security headers configured
- [ ] Error logging enabled, but errors not displayed to end users
- [ ] Backup strategy in place
- [ ] `.env` file permissions: 600 (owner read/write only)

## Incident Response

If a security issue is discovered:

1. **Triage**: Assess severity and exposure
2. **Contain**: Disable affected feature/account if needed
3. **Investigate**: Review logs to understand scope
4. **Remediate**: Apply fix
5. **Communicate**: Notify affected users if data exposed
6. **Document**: Post-mortem in `docs/incidents/`
7. **Improve**: Update security guidelines, add automated checks

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Laravel Security Documentation](https://laravel.com/docs/security)
- [PHP Security Best Practices](https://www.php.net/manual/en/security.php)
- [React Security](https://react.dev/learn/security)
