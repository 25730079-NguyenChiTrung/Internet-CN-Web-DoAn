# Module M3: User Stocks Browser

## Overview

Module xem cổ phiếu — public lẫn authenticated. Cho phép mọi người (kể cả chưa đăng nhập) browse danh sách mã CK dạng card, và user đã đăng nhập xem chi tiết từng mã với biểu đồ giá 30 ngày và nút theo dõi watchlist. Module này là "cửa ngõ" để user khám phá thị trường.

## How This Module Fits with Others

Project có 4 modules phát triển song song:

| Module                         | Focus                                  |
| ------------------------------ | -------------------------------------- |
| M1: Admin Stocks CRUD          | Quản lý mã CK (admin)                  |
| M2: Admin Users Management     | Quản lý người dùng (admin)             |
| M3: User Stocks Browser        | Xem CK + chart (user)                  |
| M4: User Portfolio & Watchlist | Portfolio + lịch sử + watchlist (user) |

**Module này** tương tác với module khác như sau:

- Đọc data từ bảng `stocks` (M1 quản lý) và `price_histories` để hiển thị chart.
- **Cột phải của stock detail** hiển thị nút "Theo dõi / Bỏ theo dõi" — M3 render UI, M4 xử lý logic watchlist.
- Coordinate với M4 owner về prop `watchlist_id` (number | null) và submission URL (`POST /watchlist`, `DELETE /watchlist/{id}`).

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
git checkout -b feat/user-stocks-browser
```

Branch của module này: `feat/user-stocks-browser`

Mở Pull Request vào **`develop`** (không phải `main`).

Commit format: `type: description` (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`)

## Features

### Feature 1: Public Stocks List

**Route**:

```
GET /stocks
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/StockController.php` (public, không cần auth middleware) method `index`
- Frontend: `resources/js/Pages/Stocks/Index.tsx`

**Mô tả nghiệp vụ**:
Trang public cho mọi người (kể cả chưa đăng nhập) xem danh sách các mã CK đang hoạt động. Khác với trang admin (dùng bảng), trang này hiển thị dạng **grid card** — trực quan và phù hợp với người dùng phổ thông.

Mỗi card hiển thị: symbol (font lớn, đậm), tên công ty (nhỏ hơn, màu nhạt), sàn giao dịch (badge nhỏ), giá hiện tại (formatted), % thay đổi so với hôm qua (màu xanh nếu tăng với mũi tên lên, đỏ nếu giảm với mũi tên xuống). Bấm vào card → navigate đến trang chi tiết `/stocks/{symbol}`.

Hỗ trợ tìm kiếm theo symbol/name (URL param), filter theo sector và exchange, sort theo % thay đổi (top gainers/losers), giá, alphabet. Kết quả paginate 20/trang.

Chỉ hiển thị stocks có `is_active = true`.

**Acceptance Criteria**:

- [ ] Grid responsive: 1 cột (mobile) → 2 cột (tablet) → 3-4 cột (desktop)
- [ ] Mỗi card có symbol, company_name, exchange badge, current_price, % change (màu xanh/đỏ)
- [ ] Search theo symbol/name
- [ ] Filter theo sector, exchange
- [ ] Sort theo % change, price, name
- [ ] Chỉ hiển thị active stocks
- [ ] Click card navigate đến `/stocks/{symbol}`

**Gợi ý implementation**:

```php
public function index(Request $request): Response
{
    $stocks = Stock::active()
        ->when($request->search, fn ($q, $s) =>
            $q->where('symbol', 'like', "%{$s}%")
              ->orWhere('company_name', 'like', "%{$s}%"))
        ->when($request->sector, fn ($q, $s) => $q->where('sector', $s))
        ->when($request->exchange, fn ($q, $e) => $q->where('exchange', $e))
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Stocks/Index', [
        'stocks'  => $stocks,
        'filters' => $request->only('search', 'sector', 'exchange', 'sort'),
    ]);
}
```

---

### Feature 2: Stock Detail

**Route**:

```
GET /stocks/{symbol}
```

**Files cần tạo**:

- Backend: method `show` trong `StockController.php`
- Frontend: `resources/js/Pages/Stocks/Show.tsx`
- Component: `resources/js/components/shared/stock-chart.tsx` (kiểm tra đã có chưa trước khi tạo mới)

**Mô tả nghiệp vụ**:
Trang chi tiết một mã CK. Layout 2 cột trên desktop, 1 cột trên mobile.

**Cột trái (thông tin & biểu đồ)**:

- Header: logo (nếu có), symbol (font rất lớn), tên công ty, badges (sector, exchange)
- Giá hiện tại (rất lớn, nổi bật) + % thay đổi (màu xanh/đỏ)
- **Biểu đồ giá 30 ngày** (Recharts `LineChart`): trục X là ngày, trục Y là giá, có tooltip khi hover, đường màu xanh smooth. Data từ `price_histories` sort theo `date ASC`.
- Tabs: "Mô tả công ty" / "Thống kê cơ bản"

**Cột phải (watchlist panel)**:

- Nếu user **chưa đăng nhập**: CTA "Đăng nhập để theo dõi mã này" kèm link đến `/login`
- Nếu user **đã đăng nhập**:
    - Nút toggle: nếu `watchlist_id === null` → hiển thị "Theo dõi" (POST `/watchlist`); nếu có giá trị → hiển thị "Đang theo dõi" (DELETE `/watchlist/{watchlist_id}`)
    - Có thể hiển thị thêm thông tin tóm tắt: giá hiện tại, % thay đổi, market cap (nếu có)
- Nếu stock **inactive**: hiển thị badge "Tạm ngưng" bên cạnh tên

**Acceptance Criteria**:

- [ ] Chart load đúng data 30 ngày, có tooltip
- [ ] Mobile responsive (1 cột)
- [ ] Guest thấy CTA đăng nhập thay vì nút Theo dõi
- [ ] Nút Theo dõi toggle đúng theo trạng thái `watchlist_id`
- [ ] Inactive stock hiển thị thông báo phù hợp

**Gợi ý implementation**:

```php
public function show(string $symbol): Response
{
    $stock = Stock::where('symbol', $symbol)
        ->with(['priceHistories' => fn ($q) => $q->orderBy('date')->limit(30)])
        ->firstOrFail();

    $watchlistId = null;
    if (auth()->check()) {
        $watchlistId = auth()->user()->watchlists()
            ->where('stock_id', $stock->id)
            ->value('id');
    }

    return Inertia::render('Stocks/Show', [
        'stock'        => $stock,
        'watchlist_id' => $watchlistId,  // null = chưa theo dõi
    ]);
}
```

---

## Files You Own

```
app/Http/Controllers/StockController.php   (public-facing, không phải Admin/)
resources/js/Pages/Stocks/Index.tsx
resources/js/Pages/Stocks/Show.tsx
resources/js/components/user/stock-filter.tsx   (nếu cần tách component filter)
```

## Shared Resources

Có thể dùng:

- Backend: Model `Stock` (scope `active()`), Model `Portfolio`
- Frontend: Layouts (`AppLayout`, `GuestLayout`), shared components (`StockCard`, `StockChart`, `PriceChange`, `EmptyState`)
- Recharts: `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`
- Utilities: `formatCurrency`, `formatPercent`, `formatDate` từ `@/lib/format`
- Chi tiết: `docs/guides/component-library.md`

## Lưu ý

- ⚠️ Trang `/stocks` là **PUBLIC** — không require auth middleware. Nhưng nút Theo dõi chỉ hiển thị khi user đã đăng nhập.
- ⚠️ Data chart từ `price_histories` của 30 ngày gần nhất, sort theo `date ASC`.
- ⚠️ **Coordinate với M4 owner** về prop `watchlist_id` (number | null) và submission URL (`POST /watchlist`, `DELETE /watchlist/{id}`). Thống nhất trước khi implement.
- ⚠️ Tránh N+1: luôn dùng `with('priceHistories')` khi load stock detail.
- ⚠️ Dùng `Stock::active()` scope để lọc chỉ hiển thị mã đang hoạt động trong danh sách.

## Getting Help

- Stuck? Check `docs/guides/contributing.md`
- Bug trong shared code? Mở GitHub issue, không tự fix
