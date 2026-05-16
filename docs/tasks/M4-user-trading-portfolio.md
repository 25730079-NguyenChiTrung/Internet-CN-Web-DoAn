# Module M4: User Trading & Portfolio

## Overview

Core trading module — phần phức tạp nhất của project. Xử lý đặt lệnh mua/bán cổ phiếu với atomic database transactions, quản lý portfolio của user với tính toán P&L (Profit & Loss), và hiển thị lịch sử toàn bộ giao dịch.

## How This Module Fits with Others

Project có 4 modules phát triển song song:

| Module                       | Focus                       |
| ---------------------------- | --------------------------- |
| M1: Admin Stocks CRUD        | Quản lý mã CK (admin)       |
| M2: Admin Users Management   | Quản lý người dùng (admin)  |
| M3: User Stocks Browser      | Xem CK + chart (user)       |
| M4: User Trading & Portfolio | Đặt lệnh + portfolio (user) |

**Module này** tương tác với module khác như sau:

- Cung cấp endpoints `/trading/buy` và `/trading/sell` cho order form của M3.
- Đọc data từ tất cả bảng: `users`, `stocks`, `transactions`, `portfolios`.
- **Coordinate với M3 owner** về tên fields trong form và submission flow trước khi code.

## Prerequisites — Đọc trước khi bắt đầu

1. `docs/01-project-overview.md`
2. `docs/03-architecture.md`
3. `docs/04-database-design.md`
4. `docs/06-coding-standards.md`
5. `docs/07-security-guidelines.md`
6. `docs/guides/getting-started.md`
7. `docs/guides/component-library.md`
8. **`.claude/skills/money-decimal-handling.md` — BẮT BUỘC ĐỌC TRƯỚC KHI VIẾT BẤT KỲ DÒNG CODE NÀO XỬ LÝ TIỀN**

## Git Workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feat/user-trading-portfolio
```

Branch của module này: `feat/user-trading-portfolio`

Mở Pull Request vào **`develop`** (không phải `main`).

Commit format: `type: description` (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`)

## Features

### Feature 1: Buy Order

**Route**:

```
POST /trading/buy
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/TradingController.php` (method `buy`)
- Backend: `app/Http/Requests/PlaceOrderRequest.php`
- Backend: `app/Services/TradingService.php` (chứa business logic)

**Mô tả nghiệp vụ**:
Khi user submit form mua từ trang stock detail (M3), server thực hiện theo thứ tự:

1. **Validate input**: `stock_id` tồn tại và active, `quantity` là integer ≥ 100 và là bội số 100, user đang active.
2. **Lấy giá**: đọc `stocks.current_price` tại thời điểm submit (không tin giá từ client).
3. **Tính toán** (dùng BCMath, không dùng float arithmetic):
    - `total = bcmul(price, quantity, 2)`
    - `fee = bcmul(total, '0.0015', 2)`
    - `grand_total = bcadd(total, fee, 2)`
4. **Kiểm tra balance**: `bccomp($user->balance, $grand_total, 2) >= 0`. Nếu không đủ → trả về error "Số dư không đủ để thực hiện giao dịch".
5. **Atomic DB transaction** (wrap toàn bộ trong `DB::transaction()`):
    - Lock user row: `User::lockForUpdate()->find($user->id)` — chống race condition khi nhiều tab submit đồng thời.
    - Trừ balance: `$user->balance = bcsub($user->balance, $grand_total, 2)` rồi save.
    - Tạo `Transaction` record: `type=buy`, `status=completed`, `executed_at=now()`.
    - Upsert `Portfolio`:
        - Chưa có → tạo mới với `avg_price = current_price`, `quantity = buy_quantity`.
        - Đã có → tính weighted average price (xem công thức bên dưới), cộng quantity.
6. Redirect về `/portfolio` với flash success "Đặt lệnh mua thành công".

**Acceptance Criteria**:

- [ ] Validation đầy đủ (stock tồn tại, active, quantity bội số 100)
- [ ] Tính toán tiền chính xác bằng BCMath
- [ ] Check balance trước khi trừ
- [ ] Toàn bộ DB operations trong `DB::transaction()`
- [ ] Lock user row với `lockForUpdate()`
- [ ] Portfolio upsert với weighted avg price
- [ ] Redirect về `/portfolio` sau khi thành công

---

### Feature 2: Sell Order

**Route**:

```
POST /trading/sell
```

**Files cần tạo**:

- Backend: method `sell` trong `TradingController.php`

**Mô tả nghiệp vụ**:
Khi user submit form bán:

1. **Validate input**: tương tự buy — `stock_id`, `quantity` bội số 100, stock active, user active.
2. **Kiểm tra portfolio**: user phải có đủ số lượng cổ phiếu cần bán. Nếu không → error "Bạn không sở hữu đủ cổ phiếu để thực hiện lệnh bán".
3. **Tính toán** (BCMath):
    - `total = bcmul(price, quantity, 2)`
    - `fee = bcmul(total, '0.0015', 2)`
    - `net_proceeds = bcsub(total, fee, 2)`
4. **Atomic DB transaction**:
    - Tạo `Transaction` record: `type=sell`, `status=completed`.
    - Update `Portfolio`: giảm quantity. Nếu `quantity = 0` sau khi bán → **DELETE row** (không để lại row với quantity = 0).
    - Cộng balance: `$user->balance = bcadd($user->balance, $net_proceeds, 2)` rồi save.
5. Redirect về `/portfolio` với flash success.

**Acceptance Criteria**:

- [ ] Check portfolio đủ số lượng trước khi bán
- [ ] Toàn bộ DB operations trong `DB::transaction()`
- [ ] Portfolio row bị DELETE khi quantity = 0
- [ ] Balance cộng đúng sau khi trừ fee
- [ ] Redirect về `/portfolio` sau khi thành công

---

### Feature 3: Portfolio Page

**Route**:

```
GET /portfolio
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/PortfolioController.php` (method `index`)
- Frontend: `resources/js/Pages/Portfolio.tsx`

**Mô tả nghiệp vụ**:
Trang hiển thị danh mục đầu tư của user (require auth).

**Summary cards** (hàng trên cùng):

- **Tổng tài sản**: cash + tổng market value của tất cả holdings
- **Cash khả dụng**: `user.balance`
- **Tổng vốn đầu tư**: tổng `avg_price × quantity` của tất cả holdings
- **P&L tổng**: market value - cost basis, hiển thị cả số tiền lẫn % (màu xanh/đỏ)

**Bảng holdings**: mỗi dòng là 1 mã CK đang nắm:

- Symbol, tên công ty
- Quantity (số cổ phiếu)
- Avg Price (giá vốn trung bình)
- Current Price (giá hiện tại, lấy từ `stocks.current_price`)
- Market Value = `current_price × quantity`
- P&L Amount = `market_value - (avg_price × quantity)`
- P&L % = `(pnl_amount / cost_basis) × 100`
- Nút "Bán" → link đến `/stocks/{symbol}` (order form ở trang đó)

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

---

### Feature 4: Transaction History

**Route**:

```
GET /transactions
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/TransactionController.php` (method `index`)
- Frontend: `resources/js/Pages/Transactions.tsx`

**Mô tả nghiệp vụ**:
Trang liệt kê toàn bộ lịch sử giao dịch của user (require auth), sort theo `created_at DESC`.

Mỗi dòng hiển thị: ngày + giờ, loại (badge xanh "MUA" / đỏ "BÁN"), symbol, tên công ty, số lượng, giá/cổ phiếu, tổng giá trị, phí giao dịch, trạng thái.

Filters (URL-driven, có thể bookmark):

- Loại giao dịch: All / Mua / Bán
- Khoảng thời gian: từ ngày / đến ngày

Phân trang 20 mục mỗi trang.

**Acceptance Criteria**:

- [ ] Filters hoạt động qua URL params (bookmarkable)
- [ ] Sort theo `created_at DESC`
- [ ] Pagination 20/trang
- [ ] Responsive

---

## Files You Own

```
app/Http/Controllers/TradingController.php
app/Http/Controllers/PortfolioController.php
app/Http/Controllers/TransactionController.php
app/Http/Requests/PlaceOrderRequest.php
app/Services/TradingService.php
resources/js/Pages/Portfolio.tsx
resources/js/Pages/Transactions.tsx
resources/js/components/user/order-form.tsx
```

## Shared Resources

Có thể dùng:

- Backend: Models `User`, `Stock`, `Transaction`, `Portfolio`
- Frontend: Layouts (`AppLayout`), shared components (`DataTable`, `EmptyState`, `PriceChange`)
- Utilities: `formatCurrency`, `formatPercent`, `formatDate`, `formatDateTime` từ `@/lib/format`
- Chi tiết: `docs/guides/component-library.md`

## Lưu ý CỰC KỲ QUAN TRỌNG

- 🚨 **TUYỆT ĐỐI KHÔNG dùng `*`, `/`, `+`, `-` cho money**. Phải dùng `bcmul`, `bcdiv`, `bcadd`, `bcsub`.
- 🚨 **TUYỆT ĐỐI KHÔNG dùng `>`, `<`, `>=` để so sánh money**. Phải dùng `bccomp($a, $b, 2)`.
- 🚨 Mọi operation modify nhiều rows phải wrap trong `DB::transaction()`.
- 🚨 Lock user row với `lockForUpdate()` trong buy để tránh race condition.
- 🚨 Khi sell hết cổ phiếu (quantity = 0), DELETE row portfolio — không để lại row với quantity = 0.
- ⚠️ Fee rate: hard-code constant `TRANSACTION_FEE_RATE = '0.0015'` (string, không phải float!).
- ⚠️ Hiển thị confirm dialog trước khi user submit order (ở frontend).
- ⚠️ Giá thực hiện lấy từ `stocks.current_price` tại thời điểm submit, KHÔNG tin giá gửi từ client.

## Weighted Average Price Formula

Khi user mua thêm cổ phiếu của mã đã có trong portfolio:

```
new_avg = (old_avg × old_qty + buy_price × buy_qty) / (old_qty + buy_qty)
```

PHP implementation (dùng BCMath):

```php
$oldCost    = bcmul((string) $portfolio->avg_price, (string) $portfolio->quantity, 2);
$newCost    = bcmul((string) $buyPrice, (string) $buyQuantity, 2);
$totalCost  = bcadd($oldCost, $newCost, 2);
$totalQty   = $portfolio->quantity + $buyQuantity;
$newAvgPrice = bcdiv($totalCost, (string) $totalQty, 2);
```

## P&L Calculation (Portfolio Page)

```php
// Cho từng holding
$marketValue = bcmul((string) $stock->current_price, (string) $portfolio->quantity, 2);
$costBasis   = bcmul((string) $portfolio->avg_price, (string) $portfolio->quantity, 2);
$pnlAmount   = bcsub($marketValue, $costBasis, 2);
$pnlPercent  = bcmul(bcdiv($pnlAmount, $costBasis, 6), '100', 2);
```

## Getting Help

- Stuck? Check `docs/guides/contributing.md`
- Bug trong shared code? Mở GitHub issue, không tự fix
