# Module M4: User Portfolio & Watchlist

## Overview

Module quản lý danh mục đầu tư và watchlist của user. Hiển thị portfolio hiện tại với tính toán P&L, lịch sử toàn bộ giao dịch với bộ lọc, và cho phép user theo dõi các mã CK quan tâm thông qua watchlist cá nhân.

## How This Module Fits with Others

Project có 4 modules phát triển song song:

| Module                         | Focus                                  |
| ------------------------------ | -------------------------------------- |
| M1: Admin Stocks CRUD          | Quản lý mã CK (admin)                  |
| M2: Admin Users Management     | Quản lý người dùng (admin)             |
| M3: User Stocks Browser        | Xem CK + chart (user)                  |
| M4: User Portfolio & Watchlist | Portfolio + lịch sử + watchlist (user) |

**Module này** tương tác với module khác như sau:

- Cung cấp endpoints `POST /watchlist` và `DELETE /watchlist/{id}` cho nút "Theo dõi" trên trang Stock Detail của M3.
- Đọc data từ bảng: `users`, `stocks`, `transactions`, `portfolios`, `watchlists`.
- **Coordinate với M3 owner** về prop `watchlist_id` trả về từ backend và luồng submit nút Theo dõi / Bỏ theo dõi.

## Prerequisites — Đọc trước khi bắt đầu

1. `docs/01-project-overview.md`
2. `docs/03-architecture.md`
3. `docs/04-database-design.md`
4. `docs/06-coding-standards.md`
5. `docs/07-security-guidelines.md`
6. `docs/guides/getting-started.md`
7. `docs/guides/component-library.md`

## Git Workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feat/user-portfolio-watchlist
```

Branch của module này: `feat/user-portfolio-watchlist`

Mở Pull Request vào **`develop`** (không phải `main`).

Commit format: `type: description` (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`)

## Features

### Feature 1: Portfolio Page

**Route**:

```
GET /portfolio
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/PortfolioController.php` (method `index`)
- Frontend: `resources/js/Pages/Portfolio.tsx`

**Mô tả nghiệp vụ**:
Trang hiển thị danh mục đầu tư của user (require auth). Data được seed sẵn để demo.

**Summary cards** (hàng trên cùng):

- **Tổng tài sản**: cash + tổng market value của tất cả holdings
- **Cash khả dụng**: `user.balance`
- **Tổng vốn đầu tư**: tổng `avg_price × quantity` của tất cả holdings
- **P&L tổng**: market value - cost basis, hiển thị cả số tiền lẫn % (màu xanh/đỏ)

**Bảng holdings** — mỗi dòng là 1 mã CK đang nắm:

- Symbol, tên công ty
- Quantity (số cổ phiếu)
- Avg Price (giá vốn trung bình)
- Current Price (giá hiện tại, từ `stocks.current_price`)
- Market Value = `current_price × quantity`
- P&L Amount = `market_value − (avg_price × quantity)`
- P&L % = `(pnl_amount / cost_basis) × 100`
- Nút "Xem chi tiết" → link đến `/stocks/{symbol}`

**Empty state**: nếu chưa có holdings, hiển thị "Bạn chưa sở hữu cổ phiếu nào. Khám phá thị trường →" với link đến `/stocks`.

**Acceptance Criteria**:

- [ ] Tính P&L chính xác cho từng holding và tổng
- [ ] Eager load `portfolios.stock` để tránh N+1
- [ ] Empty state hiển thị khi không có holdings
- [ ] Số tiền format đúng VND
- [ ] Responsive

**Gợi ý implementation**:

```php
public function index(): Response
{
    $portfolios = auth()->user()
        ->portfolios()
        ->with('stock')
        ->get();

    return Inertia::render('Portfolio', [
        'portfolios' => $portfolios,
        'balance'    => auth()->user()->balance,
    ]);
}
```

**P&L Calculation** — dùng BCMath để chính xác:

```php
// Cho từng holding
$marketValue = bcmul((string) $stock->current_price, (string) $portfolio->quantity, 2);
$costBasis   = bcmul((string) $portfolio->avg_price, (string) $portfolio->quantity, 2);
$pnlAmount   = bcsub($marketValue, $costBasis, 2);
$pnlPercent  = bcmul(bcdiv($pnlAmount, $costBasis, 6), '100', 2);
```

---

### Feature 2: Transaction History

**Route**:

```
GET /transactions
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/TransactionController.php` (method `index`)
- Frontend: `resources/js/Pages/Transactions.tsx`

**Mô tả nghiệp vụ**:
Trang liệt kê toàn bộ lịch sử giao dịch của user (require auth), sort theo `created_at DESC`. Data được seed sẵn để demo.

Mỗi dòng hiển thị: ngày + giờ, loại (badge xanh "MUA" / đỏ "BÁN"), symbol, tên công ty, số lượng, giá/cổ phiếu, tổng giá trị, phí giao dịch, trạng thái.

Filters (URL-driven, có thể bookmark):

- Loại giao dịch: All / Mua / Bán
- Khoảng thời gian: từ ngày / đến ngày

Phân trang 20 mục mỗi trang.

**Acceptance Criteria**:

- [ ] Filters hoạt động qua URL params (bookmarkable)
- [ ] Sort theo `created_at DESC`
- [ ] Pagination 20/trang
- [ ] Eager load `transactions.stock` để tránh N+1
- [ ] Responsive

---

### Feature 3: Watchlist

**Routes**:

```
GET    /watchlist              # Xem danh sách theo dõi
POST   /watchlist              # Thêm mã vào watchlist
DELETE /watchlist/{watchlist}  # Xóa mã khỏi watchlist
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/WatchlistController.php` (methods: `index`, `store`, `destroy`)
- Backend: `app/Http/Requests/WatchlistRequest.php`
- Backend: migration `create_watchlists_table` (xem bên dưới)
- Frontend: `resources/js/Pages/Watchlist.tsx`

**Mô tả nghiệp vụ**:
User đăng nhập có thể theo dõi các mã CK quan tâm mà không cần mua. Nút "Theo dõi" / "Đang theo dõi" hiển thị trên trang Stock Detail (M3 render UI, M4 xử lý logic).

**Trang Watchlist** (`GET /watchlist`):

- Danh sách dạng bảng: symbol, tên công ty, exchange badge, giá hiện tại, % thay đổi, thời gian thêm vào
- Nút "Bỏ theo dõi" (DELETE) — hiển thị confirm dialog trước khi xóa
- Nút "Xem chi tiết" → link đến `/stocks/{symbol}`
- Empty state: "Bạn chưa theo dõi mã CK nào. Khám phá thị trường →" với link đến `/stocks`

**Thêm vào watchlist** (`POST /watchlist`):

- Body: `{ stock_id: number }`
- Validate: `stock_id` tồn tại trong bảng `stocks`
- Logic: dùng `firstOrCreate` — nếu đã theo dõi rồi thì không báo lỗi (idempotent)
- Response: redirect back với flash success

**Xóa khỏi watchlist** (`DELETE /watchlist/{watchlist}`):

- Route Model Binding trên `Watchlist` model
- Authorize: verify `$watchlist->user_id === auth()->id()` — trả về 403 nếu không phải owner
- Redirect về trang watchlist với flash success

**Migration — bảng `watchlists`**:

```php
Schema::create('watchlists', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('stock_id')->constrained()->cascadeOnDelete();
    $table->timestamps();

    $table->unique(['user_id', 'stock_id']);
});
```

**Gợi ý implementation**:

```php
// WatchlistController

public function index(): Response
{
    $watchlists = auth()->user()
        ->watchlists()
        ->with('stock')
        ->latest()
        ->get();

    return Inertia::render('Watchlist', ['watchlists' => $watchlists]);
}

public function store(WatchlistRequest $request): RedirectResponse
{
    auth()->user()->watchlists()->firstOrCreate([
        'stock_id' => $request->validated('stock_id'),
    ]);

    return back()->with('success', 'Đã thêm vào danh sách theo dõi');
}

public function destroy(Watchlist $watchlist): RedirectResponse
{
    if ($watchlist->user_id !== auth()->id()) {
        abort(403);
    }

    $watchlist->delete();

    return redirect()->route('watchlist.index')
        ->with('success', 'Đã xóa khỏi danh sách theo dõi');
}
```

**Coordinate với M3**:

Backend cần trả về `watchlist_id: number | null` (không phải boolean) để M3 có thể gọi DELETE đúng URL:

```php
// Trong StockController@show (M3 owner thêm dòng này)
$watchlistId = auth()->check()
    ? auth()->user()->watchlists()->where('stock_id', $stock->id)->value('id')
    : null;

return Inertia::render('Stocks/Show', [
    'stock'        => $stock,
    'watchlist_id' => $watchlistId,   // null = chưa theo dõi
]);
```

**Acceptance Criteria**:

- [ ] Trang `/watchlist` hiển thị danh sách với eager load `.stock`, có empty state
- [ ] POST `/watchlist` thêm mã — idempotent, không lỗi nếu đã có
- [ ] DELETE `/watchlist/{id}` verify ownership (403 nếu không phải owner)
- [ ] Require auth trên tất cả 3 routes
- [ ] Responsive

---

## Files You Own

```
app/Http/Controllers/PortfolioController.php
app/Http/Controllers/TransactionController.php
app/Http/Controllers/WatchlistController.php
app/Http/Requests/WatchlistRequest.php
database/migrations/2025_xx_xx_create_watchlists_table.php
resources/js/Pages/Portfolio.tsx
resources/js/Pages/Transactions.tsx
resources/js/Pages/Watchlist.tsx
```

## Shared Resources

Có thể dùng:

- Backend: Models `User`, `Stock`, `Transaction`, `Portfolio`; cần tạo thêm Model `Watchlist`
- Frontend: Layouts (`AppLayout`), shared components (`DataTable`, `EmptyState`, `PriceChange`, `ConfirmDialog`)
- Utilities: `formatCurrency`, `formatPercent`, `formatDate`, `formatDateTime` từ `@/lib/format`
- Chi tiết: `docs/guides/component-library.md`

## Lưu ý

- ⚠️ Dùng BCMath cho tính toán P&L hiển thị trên Portfolio page — không dùng float arithmetic.
- ⚠️ Eager load để tránh N+1: `portfolios()->with('stock')`, `watchlists()->with('stock')`, `transactions()->with('stock')`.
- ⚠️ Watchlist `store` phải idempotent — dùng `firstOrCreate` thay vì `create`.
- ⚠️ Watchlist `destroy` phải verify ownership trước khi xóa.
- ⚠️ **Coordinate với M3 owner** về prop `watchlist_id` và luồng submit nút Theo dõi / Bỏ theo dõi.

## Getting Help

- Stuck? Check `docs/guides/contributing.md`
- Bug trong shared code? Mở GitHub issue, không tự fix
