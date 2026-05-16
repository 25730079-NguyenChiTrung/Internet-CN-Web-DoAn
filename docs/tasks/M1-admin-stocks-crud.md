# Module M1: Admin Stocks CRUD

## Overview

Module quản lý cổ phiếu cho admin. Cho phép admin thêm/xem/sửa/xóa mã cổ phiếu trên hệ thống. Đây là source of truth cho danh sách CK mà user có thể giao dịch — các module M3 và M4 đều đọc dữ liệu từ bảng `stocks` mà module này quản lý.

## How This Module Fits with Others

Project có 4 modules phát triển song song:

| Module                         | Focus                                  |
| ------------------------------ | -------------------------------------- |
| M1: Admin Stocks CRUD          | Quản lý mã CK (admin)                  |
| M2: Admin Users Management     | Quản lý người dùng (admin)             |
| M3: User Stocks Browser        | Xem CK + chart (user)                  |
| M4: User Portfolio & Watchlist | Portfolio + lịch sử + watchlist (user) |

**Module này** tương tác với module khác như sau:

- M3 và M4 đọc data từ bảng `stocks` mà bạn quản lý.
- Bạn KHÔNG sửa data của họ, họ KHÔNG sửa schema của bạn.
- Khi bạn set `is_active = false` cho một mã CK, M3 vẫn hiển thị nhưng M4 sẽ từ chối giao dịch.

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
git checkout -b feat/admin-stocks-crud
```

Branch của module này: `feat/admin-stocks-crud`

Mở Pull Request vào **`develop`** (không phải `main`).

Commit format: `type: description` (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`)

## Features

### Feature 1: List Stocks

**Route**:

```
GET /admin/stocks
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/Admin/StockController.php` (method `index`)
- Frontend: `resources/js/Pages/Admin/Stocks/Index.tsx`

**Mô tả nghiệp vụ**:
Admin truy cập trang để xem toàn bộ danh sách mã CK. Mỗi dòng hiển thị: symbol, tên công ty, sàn (HOSE/HNX/UPCOM), giá hiện tại, % thay đổi (xanh nếu tăng/đỏ nếu giảm), trạng thái (active/inactive badge), và các action buttons (xem, sửa, xóa, toggle active).

Hỗ trợ tìm kiếm theo symbol hoặc tên công ty (realtime qua URL params), lọc theo trạng thái (active/inactive), sắp xếp theo giá hoặc % thay đổi. Kết quả phân trang 20 mục mỗi trang.

**Acceptance Criteria**:

- [ ] Hiển thị đầy đủ các cột: symbol, company_name, exchange, current_price, % change, is_active, actions
- [ ] Tìm kiếm theo symbol/name, kết quả update theo URL params
- [ ] Filter theo trạng thái active/inactive
- [ ] Pagination 20/trang
- [ ] Responsive trên mobile

**Gợi ý implementation**:

```php
public function index(Request $request): Response
{
    $stocks = Stock::withTrashed()
        ->when($request->search, fn ($q, $s) => $q->where('symbol', 'like', "%{$s}%")
            ->orWhere('company_name', 'like', "%{$s}%"))
        ->when($request->status === 'active', fn ($q) => $q->where('is_active', true))
        ->when($request->status === 'inactive', fn ($q) => $q->where('is_active', false))
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Admin/Stocks/Index', [
        'stocks' => $stocks,
        'filters' => $request->only('search', 'status'),
    ]);
}
```

---

### Feature 2: Create Stock

**Route**:

```
GET  /admin/stocks/create
POST /admin/stocks
```

**Files cần tạo**:

- Backend: `app/Http/Requests/StoreStockRequest.php`, method `store` trong `StockController.php`
- Frontend: `resources/js/Pages/Admin/Stocks/Create.tsx`

**Mô tả nghiệp vụ**:
Admin tạo mã CK mới khi có công ty niêm yết mới trên hệ thống. Form bao gồm các trường:

- **Symbol**: chữ in hoa, unique, tối đa 10 ký tự, chỉ chứa chữ cái (regex `/^[A-Z]+$/`). Ví dụ: VNM, FPT, HPG.
- **Tên công ty**: bắt buộc, tối đa 255 ký tự.
- **Sector**: dropdown, các giá trị như: Tài chính, Bất động sản, Công nghệ, Năng lượng, Tiêu dùng, Công nghiệp, Y tế, Tiện ích.
- **Sàn giao dịch**: HOSE / HNX / UPCOM (dropdown).
- **Giá hiện tại** (`current_price`): số thập phân ≥ 0.
- **Giá đóng phiên trước** (`previous_close`): số thập phân ≥ 0.
- **Mô tả**: textarea, optional.
- **Logo**: optional, upload file ảnh (jpeg/png/webp, tối đa 2MB).

Sau khi tạo thành công, redirect về trang list với flash message "Đã thêm mã CK [SYMBOL]".

**Acceptance Criteria**:

- [ ] Tất cả validation rules hoạt động, error messages hiển thị bằng tiếng Việt
- [ ] Symbol unique trong database
- [ ] Logo upload validate đúng định dạng và kích thước
- [ ] Redirect về list sau khi tạo thành công với toast notification

**Gợi ý implementation**:

```php
// StoreStockRequest.php
public function rules(): array
{
    return [
        'symbol'         => ['required', 'string', 'max:10', 'regex:/^[A-Z]+$/', 'unique:stocks,symbol'],
        'company_name'   => ['required', 'string', 'max:255'],
        'sector'         => ['nullable', 'string', 'max:100'],
        'exchange'       => ['required', 'in:HOSE,HNX,UPCOM'],
        'current_price'  => ['required', 'numeric', 'min:0'],
        'previous_close' => ['required', 'numeric', 'min:0'],
        'description'    => ['nullable', 'string'],
        'logo'           => ['nullable', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
    ];
}
```

---

### Feature 3: Edit Stock

**Route**:

```
GET /admin/stocks/{id}/edit
PUT /admin/stocks/{id}
```

**Files cần tạo**:

- Backend: `app/Http/Requests/UpdateStockRequest.php`, method `edit` và `update` trong `StockController.php`
- Frontend: `resources/js/Pages/Admin/Stocks/Edit.tsx`

**Mô tả nghiệp vụ**:
Admin sửa thông tin mã CK. Đặc biệt quan trọng là cập nhật giá (`current_price`, `previous_close`) — đây là cách admin "tạo giá" trên hệ thống vì project không kết nối sàn thật.

**Symbol không cho phép sửa** vì đã có giao dịch lịch sử liên kết (field hiển thị nhưng ở trạng thái disabled/readonly). Các trường còn lại tương tự Create form, với data được pre-fill từ record hiện tại.

**Acceptance Criteria**:

- [ ] Form pre-fill đầy đủ data hiện tại
- [ ] Symbol field disabled, không thể thay đổi
- [ ] Validation tương tự Create (ngoại trừ unique constraint cho symbol)
- [ ] Redirect về list sau khi save với toast notification

---

### Feature 4: Delete Stock

**Route**:

```
DELETE /admin/stocks/{id}
```

**Files cần tạo**:

- Backend: method `destroy` trong `StockController.php`

**Mô tả nghiệp vụ**:
Admin xóa mã CK khỏi hệ thống. Vì bảng `transactions` có foreign key với `ON DELETE RESTRICT`, không thể xóa mã CK đã có giao dịch lịch sử.

- Nếu đã có giao dịch → hiển thị error rõ ràng: "Không thể xóa mã CK đã có giao dịch. Hãy chuyển sang trạng thái Inactive thay thế."
- Nếu chưa có giao dịch → soft delete (set `deleted_at`).

Luôn hiển thị confirm dialog trước khi xóa để tránh xóa nhầm.

**Acceptance Criteria**:

- [ ] ConfirmDialog hiển thị trước khi xóa
- [ ] Handle FK constraint error gracefully với error message tiếng Việt
- [ ] Soft delete thành công nếu không có giao dịch
- [ ] Toast notification sau khi xóa

**Gợi ý implementation**:

```php
public function destroy(Stock $stock): RedirectResponse
{
    try {
        $stock->delete(); // soft delete
        return redirect()->route('admin.stocks.index')
            ->with('success', "Đã xóa mã CK {$stock->symbol}");
    } catch (\Illuminate\Database\QueryException $e) {
        if (str_contains($e->getMessage(), '1451')) { // FK constraint
            return back()->with('error', 'Không thể xóa mã CK đã có giao dịch. Hãy chuyển sang trạng thái Inactive thay thế.');
        }
        throw $e;
    }
}
```

---

### Feature 5: Toggle Active Status

**Route**:

```
PATCH /admin/stocks/{id}/toggle-active
```

**Files cần tạo**:

- Backend: method `toggleActive` trong `StockController.php`

**Mô tả nghiệp vụ**:
Admin tạm ngưng hoặc bật lại mã CK mà không cần xóa. Khi `is_active = false`:

- Mã CK hiển thị badge "Tạm ngưng" trên trang danh sách và chi tiết.
- Mã vẫn hiển thị trong danh sách với badge "Tạm ngưng".
- Lịch sử giao dịch cũ vẫn còn nguyên.

Tính năng này là giải pháp thay thế cho xóa khi CK đã có giao dịch lịch sử.

**Acceptance Criteria**:

- [ ] Confirm dialog trước khi toggle
- [ ] Badge trạng thái cập nhật ngay sau khi toggle
- [ ] Toast notification với nội dung rõ ràng ("Đã kích hoạt / Đã tạm ngưng mã CK [SYMBOL]")

---

## Files You Own

```
app/Http/Controllers/Admin/StockController.php
app/Http/Requests/StoreStockRequest.php
app/Http/Requests/UpdateStockRequest.php
resources/js/Pages/Admin/Stocks/Index.tsx
resources/js/Pages/Admin/Stocks/Create.tsx
resources/js/Pages/Admin/Stocks/Edit.tsx
```

## Shared Resources

Có thể dùng:

- Backend: Model `Stock` (đã có sẵn với relationships, scopes, casts)
- Frontend: Layouts (`AdminLayout`), shared components (`DataTable`, `PageHeader`, `ConfirmDialog`, `EmptyState`)
- Utilities: `formatCurrency`, `formatPercent` từ `@/lib/format`
- Chi tiết: `docs/guides/component-library.md`

## Lưu ý

- ⚠️ Symbol phải uppercase và unique. Dùng regex `/^[A-Z]+$/` trong validation.
- ⚠️ Mọi cột money (`current_price`, `previous_close`) dùng `DECIMAL`, không `float`. Model đã có cast `'current_price' => 'decimal:2'`.
- ⚠️ Stock đã có transactions không xóa được (FK RESTRICT). Handle error này gracefully thay vì để lỗi 500.
- ⚠️ Logo upload: validate `image|mimes:jpeg,png,webp|max:2048`. Dùng `$request->file('logo')->store('logos', 'public')` để lưu, không dùng filename gốc từ user.
- ⚠️ Dùng `withTrashed()` nếu muốn hiển thị cả soft-deleted records trong admin list.

## Getting Help

- Stuck? Check `docs/guides/contributing.md`
- Bug trong shared code? Mở GitHub issue, không tự fix
