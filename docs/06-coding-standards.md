# Coding Standards

## General Principles

1. **Clarity over cleverness** — Optimize for the next developer reading the code
2. **Consistency over preference** — Follow project conventions even if you prefer alternatives
3. **Explicit over implicit** — Type hints, return types, no magic
4. **Composition over inheritance** — Prefer small, focused units
5. **Manual verification** — Verify critical paths and edge cases through hands-on testing

## PHP / Laravel Standards

### Style Guide

Follow PSR-12 with Laravel-specific overrides as enforced by `php-cs-fixer.dist.php`.

### Type Declarations

Always use type hints for parameters, return types, and properties:

```php
// GOOD
public function buy(User $user, Stock $stock, int $quantity): Transaction
{
    // ...
}

// BAD
public function buy($user, $stock, $quantity)
{
    // ...
}
```

### Property Promotion

Use constructor property promotion (PHP 8.0+):

```php
// GOOD
class TradingService
{
    public function __construct(
        private readonly WalletService $walletService,
        private readonly LoggerInterface $logger,
    ) {}
}

// BAD
class TradingService
{
    private WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
}
```

### Readonly Properties

Mark properties as `readonly` when they shouldn't change after construction:

```php
public function __construct(
    private readonly TradingService $tradingService,
) {}
```

### Named Arguments

Use named arguments for clarity in calls with multiple parameters of similar types:

```php
// GOOD
$service->buy(user: $user, stock: $stock, quantity: 100);

// BAD (positional, less readable)
$service->buy($user, $stock, 100);
```

### Models

```php
class Stock extends Model
{
    use HasFactory, SoftDeletes;

    // 1. Constants (if any)
    public const EXCHANGES = ['HOSE', 'HNX', 'UPCOM'];

    // 2. Fillable
    protected $fillable = [
        'symbol',
        'company_name',
        // ...
    ];

    // 3. Hidden (if any)
    protected $hidden = [];

    // 4. Casts
    protected $casts = [
        'current_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // 5. Relationships
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // 6. Accessors
    public function getChangePercentAttribute(): float
    {
        // ...
    }

    // 7. Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // 8. Other methods
}
```

### Controllers

Keep controllers thin. Delegate to services for business logic.

```php
class TradingController extends Controller
{
    public function __construct(
        private readonly TradingService $tradingService,
    ) {}

    public function buy(PlaceOrderRequest $request, Stock $stock): RedirectResponse
    {
        try {
            $this->tradingService->buy(
                user: $request->user(),
                stock: $stock,
                quantity: $request->validated('quantity'),
            );

            return back()->with('success', 'Đặt lệnh thành công');
        } catch (InvalidArgumentException $e) {
            return back()->with('error', $e->getMessage())->withInput();
        }
    }
}
```

### Form Requests

Every endpoint that receives input has a Form Request:

```php
class PlaceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->is_active;
    }

    public function rules(): array
    {
        return [
            'quantity' => ['required', 'integer', 'min:100', 'multiple_of:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Vui lòng nhập số lượng',
            'quantity.integer' => 'Số lượng phải là số nguyên',
            'quantity.min' => 'Số lượng tối thiểu là 100',
            'quantity.multiple_of' => 'Số lượng phải là bội số của 100',
        ];
    }
}
```

### Database Transactions

Wrap multi-step operations in transactions:

```php
return DB::transaction(function () use ($user, $stock, $quantity) {
    // Step 1
    $this->walletService->debit($user, $total);

    // Step 2
    $transaction = Transaction::create([...]);

    // Step 3
    $this->updatePortfolio($user, $stock, $quantity);

    return $transaction;
});
```

### Exceptions

Throw specific exceptions, not generic ones:

```php
// GOOD
throw new InsufficientBalanceException('Số dư không đủ');

// ACCEPTABLE
throw new InvalidArgumentException('Số dư không đủ');

// BAD (too generic)
throw new Exception('Error');
```

### Comments

Comment WHY, not WHAT:

```php
// BAD: redundant
// Increment quantity
$quantity++;

// GOOD: explains reasoning
// Vietnamese market requires lot size of 100; round up to next multiple
$quantity = ceil($requestedQuantity / 100) * 100;
```

Use Vietnamese for business logic explanations:

```php
// Tính giá trung bình theo công thức Weighted Average Cost
// avg_new = (avg_old * qty_old + price * qty_new) / (qty_old + qty_new)
$newAvgPrice = ...;
```

Use English for technical/structural notes:

```php
// Eager load to prevent N+1
$stocks = Stock::with('priceHistories')->get();
```

### Avoid

```php
// ❌ Facade for simple queries when injection works
$user = Auth::user();

// ✅ Use request
$user = $request->user();

// ❌ Helper functions when method exists
$total = collect($items)->sum('price');

// ✅ When using Eloquent
$total = $items->sum('price');

// ❌ Type juggling
if ($value == "1") { ... }

// ✅ Strict comparison
if ($value === '1') { ... }

// ❌ Mass assignment without $fillable
$user = User::create($request->all());

// ✅ Use validated data
$user = User::create($request->validated());
```

## TypeScript / React Standards

### TypeScript Configuration

```json
{
    "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "noUnusedLocals": true,
        "noUnusedParameters": true,
        "esModuleInterop": true
    }
}
```

### Type Definitions

Define types for all data structures:

```typescript
// types/models.ts
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin';
    balance: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Stock {
    id: number;
    symbol: string;
    company_name: string;
    sector: string | null;
    exchange: 'HOSE' | 'HNX' | 'UPCOM';
    current_price: number;
    previous_close: number;
    description: string | null;
    is_active: boolean;
    change_percent: number; // Computed (accessor on backend)
    created_at: string;
    updated_at: string;
}
```

### Component Props

```typescript
interface StockCardProps {
    stock: Stock;
    onClick?: (stock: Stock) => void;
    className?: string;
}

export function StockCard({ stock, onClick, className }: StockCardProps) {
    // ...
}
```

### No `any`

```typescript
// ❌ BAD
function process(data: any) { ... }

// ✅ GOOD
function process(data: ApiResponse) { ... }

// ✅ ACCEPTABLE (when truly unknown)
function process(data: unknown) {
  if (isApiResponse(data)) { /* type narrowed */ }
}
```

### Type Guards

```typescript
function isUser(value: unknown): value is User {
    return typeof value === 'object' && value !== null && 'id' in value && 'email' in value;
}
```

### Functional Components

Prefer arrow function components for consistency:

```tsx
// GOOD
export default function StockCard({ stock }: Props) {
    return <div>{stock.symbol}</div>;
}

// Or with const
const StockCard = ({ stock }: Props) => {
    return <div>{stock.symbol}</div>;
};
```

### Hooks

Custom hooks must start with `use`:

```typescript
// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
```

### State Management

Order of preference:

1. **Server state** (Inertia props)
2. **Form state** (`useForm` from Inertia)
3. **Local state** (`useState`)
4. **Derived state** (`useMemo`)

Do not introduce global state management (Redux, Zustand) unless absolutely necessary.

### Avoid

```tsx
// ❌ Inline styles
<div style={{ padding: '10px' }} />

// ✅ Tailwind
<div className="p-2.5" />

// ❌ Direct DOM manipulation
useEffect(() => {
  document.getElementById('input')?.focus();
});

// ✅ Refs
const inputRef = useRef<HTMLInputElement>(null);
useEffect(() => { inputRef.current?.focus(); });

// ❌ Indexing as key
{items.map((item, i) => <div key={i}>{item.name}</div>)}

// ✅ Stable identifier
{items.map(item => <div key={item.id}>{item.name}</div>)}

// ❌ Multiple state for related values
const [first, setFirst] = useState('');
const [last, setLast] = useState('');

// ✅ Single state object (or useForm)
const [name, setName] = useState({ first: '', last: '' });

// ❌ Updating state directly
state.items.push(newItem);
setState(state);

// ✅ Immutable update
setState({ ...state, items: [...state.items, newItem] });
```

## CSS / Tailwind Standards

### Class Ordering

Use Prettier with `prettier-plugin-tailwindcss` to sort classes automatically. Recommended order:

1. Layout (flex, grid, block)
2. Sizing (w-, h-, min-, max-)
3. Spacing (m-, p-)
4. Typography (text-, font-)
5. Colors (bg-, text-color-)
6. Borders (border-, rounded-)
7. Effects (shadow-, opacity-)
8. Transitions (transition-, duration-)
9. Modifiers (hover:, focus:, md:, lg:)

Example:

```tsx
<div className="flex w-full p-4 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-md hover:bg-gray-50 md:p-6">
```

### Use `cn()` for Conditional Classes

```tsx
import { cn } from '@/lib/utils';

<button
    className={cn(
        'rounded px-4 py-2',
        isActive && 'bg-blue-500 text-white',
        isDisabled && 'cursor-not-allowed opacity-50',
    )}
/>;
```

### Mobile-First Design

Start with mobile styles, add modifiers for larger screens:

```tsx
// GOOD: mobile first
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// BAD: desktop first
<div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
```

## Git Standards

### Commit Messages

Format: `type: short description`

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`

```bash
# GOOD
git commit -m "feat: add Stock model with relationships"
git commit -m "fix: handle null balance in user accessor"
git commit -m "docs: add database design documentation"

# BAD
git commit -m "update"
git commit -m "fix stuff"
git commit -m "WIP"
```

### Branch Names

Format: `type/short-description-kebab-case`

```bash
feat/admin-stocks-crud
fix/login-redirect-bug
docs/update-readme
chore/upgrade-laravel-11
```

### PR Description Template

```markdown
## What

Brief description of changes

## Why

Reason for the changes

## How

Approach taken

## Verification

How to verify manually

## Screenshots (if UI)

[attach]

## Checklist

- [ ] Linter passes
- [ ] Manual verification done
- [ ] Documentation updated (if needed)
```

## Documentation Standards

### Code Documentation

Use docblocks for public APIs of classes and complex functions:

```php
/**
 * Process a buy order for the user.
 *
 * Atomically:
 * 1. Debits user's balance
 * 2. Creates transaction record
 * 3. Updates portfolio with new weighted average price
 *
 * @throws InvalidArgumentException If quantity invalid or insufficient balance
 */
public function buy(User $user, Stock $stock, int $quantity): Transaction
{
    // ...
}
```

### Markdown Documentation

- Use `#` for top-level headings
- Use code fences with language hints
- Include diagrams (ASCII or Mermaid) for complex flows
- Keep paragraphs short
- Use tables for structured data

## Performance Standards

### Backend

- Avoid N+1 queries (use `with()`)
- Paginate large result sets
- Index foreign keys and commonly filtered columns
- Use database transactions for atomicity, not for performance

### Frontend

- Lazy-load route components (Inertia handles this with code splitting)
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to optimized children with `useCallback`
- Use `useDeferredValue` for non-urgent updates
- Profile before optimizing

## Accessibility Standards

- Semantic HTML (`<button>`, not `<div onClick>`)
- `alt` attributes on images
- `aria-label` on icon-only buttons
- Keyboard navigation works for all interactive elements
- Focus indicators visible
- Color contrast meets WCAG AA
- Form labels associated with inputs (`htmlFor`)

## Error Messages

User-facing error messages:

- In Vietnamese
- Specific and actionable
- Don't reveal technical details

```php
// GOOD (user-friendly)
'Số dư không đủ để thực hiện giao dịch'

// BAD (technical leak)
'SQLSTATE[23000]: Integrity constraint violation: ...'
```

Internal error messages (logs, exceptions):

- In English
- Include context (user_id, stock_id, etc.)
- Detailed enough to debug
