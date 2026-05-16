# Module M2: Admin Users Management

## Overview

Module quản lý người dùng cho admin. Admin xem danh sách tất cả user, xem chi tiết từng tài khoản (bao gồm portfolio và lịch sử giao dịch), khóa/mở tài khoản, và nạp tiền ảo cho user để phục vụ mục đích demo.

## How This Module Fits with Others

Project có 4 modules phát triển song song:

| Module                       | Focus                       |
| ---------------------------- | --------------------------- |
| M1: Admin Stocks CRUD        | Quản lý mã CK (admin)       |
| M2: Admin Users Management   | Quản lý người dùng (admin)  |
| M3: User Stocks Browser      | Xem CK + chart (user)       |
| M4: User Trading & Portfolio | Đặt lệnh + portfolio (user) |

**Module này** tương tác với module khác như sau:

- Đọc data từ bảng `users`, tham chiếu `transactions` và `portfolios` để hiển thị thông tin chi tiết user.
- Không modify schema của bảng nào — chỉ đọc và cập nhật `users.balance` và `users.is_active`.
- Khi bạn khóa user (`is_active = false`), M4 sẽ từ chối mọi giao dịch của user đó.

## Prerequisites — Đọc trước khi bắt đầu

1. `docs/01-project-overview.md`
2. `docs/03-architecture.md`
3. `docs/04-database-design.md`
4. `docs/06-coding-standards.md`
5. `docs/07-security-guidelines.md`
6. `docs/guides/getting-started.md`
7. `docs/guides/component-library.md`
8. `.claude/skills/money-decimal-handling.md` — cần thiết cho tính năng deposit

## Git Workflow

```bash
git checkout develop
git pull origin develop
git checkout -b feat/admin-users-management
```

Branch của module này: `feat/admin-users-management`

Mở Pull Request vào **`develop`** (không phải `main`).

Commit format: `type: description` (`feat`, `fix`, `docs`, `style`, `refactor`, `chore`)

## Features

### Feature 1: List Users

**Route**:

```
GET /admin/users
```

**Files cần tạo**:

- Backend: `app/Http/Controllers/Admin/UserController.php` (method `index`)
- Frontend: `resources/js/Pages/Admin/Users/Index.tsx`

**Mô tả nghiệp vụ**:
Admin xem toàn bộ danh sách user trên hệ thống. Mỗi dòng hiển thị: avatar (initials nếu không có ảnh), name, email, role (badge Admin/User), balance (formatted VND), trạng thái (Active/Locked badge), ngày tạo tài khoản, và nút "Xem chi tiết".

Hỗ trợ tìm kiếm theo email hoặc name, filter theo role (`admin`/`user`) và trạng thái (`active`/`locked`), sort theo `created_at` hoặc `balance`. Phân trang 20 mục mỗi trang.

**Acceptance Criteria**:

- [ ] Hiển thị đầy đủ các cột: avatar, name, email, role, balance, is_active, created_at, actions
- [ ] Search theo email/name
- [ ] Filter theo role và is_active
- [ ] Pagination 20/trang
- [ ] Responsive

**Gợi ý implementation**:

```php
public function index(Request $request): Response
{
    $users = User::when($request->search, fn ($q, $s) =>
            $q->where('name', 'like', "%{$s}%")
              ->orWhere('email', 'like', "%{$s}%"))
        ->when($request->role, fn ($q, $r) => $q->where('role', $r))
        ->when($request->status === 'active', fn ($q) => $q->where('is_active', true))
        ->when($request->status === 'locked', fn ($q) => $q->where('is_active', false))
        ->paginate(20)
        ->withQueryString();

    return Inertia::render('Admin/Users/Index', [
        'users'   => $users,
        'filters' => $request->only('search', 'role', 'status'),
    ]);
}
```

---

### Feature 2: Show User Detail

**Route**:

```
GET /admin/users/{id}
```

**Files cần tạo**:

- Backend: method `show` trong `UserController.php`
- Frontend: `resources/js/Pages/Admin/Users/Show.tsx`

**Mô tả nghiệp vụ**:
Admin xem toàn bộ thông tin của 1 user. Trang bố cục 2 phần:

**Phần trên — Thông tin tài khoản**:

- Avatar, name, email, role, balance (nổi bật), trạng thái, ngày tạo tài khoản
- Nút hành động: "Khóa/Mở tài khoản", "Nạp tiền"

**Phần dưới — Dữ liệu giao dịch**:

- **Portfolio hiện tại**: bảng liệt kê các mã CK đang nắm giữ — symbol, tên công ty, quantity, avg_price, market_value (tính theo current_price)
- **10 giao dịch gần nhất**: loại (BUY/SELL badge), symbol, quantity, price, total, fee, thời gian

Nếu user chưa có portfolio hoặc giao dịch, hiển thị empty state phù hợp.

**Acceptance Criteria**:

- [ ] Eager load tránh N+1 (`with(['portfolios.stock', 'transactions.stock'])`)
- [ ] Portfolio empty state rõ ràng
- [ ] Giao dịch sort theo `created_at DESC`, giới hạn 10 bản ghi
- [ ] Responsive layout

**Gợi ý implementation**:

```php
public function show(User $user): Response
{
    $user->load([
        'portfolios.stock',
        'transactions' => fn ($q) => $q->with('stock')->latest()->limit(10),
    ]);

    return Inertia::render('Admin/Users/Show', ['user' => $user]);
}
```

---

### Feature 3: Lock / Unlock User

**Route**:

```
PATCH /admin/users/{id}/toggle-active
```

**Files cần tạo**:

- Backend: method `toggleActive` trong `UserController.php`

**Mô tả nghiệp vụ**:
Admin khóa tài khoản user vi phạm bằng cách set `is_active = false`. User bị khóa sẽ không thể đăng nhập — hệ thống trả về thông báo "Tài khoản đã bị khóa" tại bước login. Admin cũng có thể mở khóa tài khoản (set `is_active = true`).

**Bảo vệ quan trọng**: Admin không được tự khóa tài khoản của chính mình (check `$user->id !== auth()->id()`).

Luôn hiển thị confirm dialog trước khi thực hiện.

**Acceptance Criteria**:

- [ ] Confirm dialog trước khi lock/unlock
- [ ] Error nếu admin tự khóa chính mình
- [ ] Toast notification với nội dung rõ ràng
- [ ] Badge trạng thái cập nhật sau khi toggle

**Gợi ý implementation**:

```php
public function toggleActive(User $user): RedirectResponse
{
    if ($user->id === auth()->id()) {
        return back()->with('error', 'Không thể thay đổi trạng thái tài khoản của chính mình');
    }

    $user->update(['is_active' => !$user->is_active]);
    $action = $user->is_active ? 'kích hoạt' : 'khóa';

    return back()->with('success', "Đã {$action} tài khoản {$user->email}");
}
```

---

### Feature 4: Deposit Virtual Funds

**Route**:

```
POST /admin/users/{id}/deposit
```

**Files cần tạo**:

- Backend: `app/Http/Requests/DepositRequest.php`, method `deposit` trong `UserController.php`

**Mô tả nghiệp vụ**:
Admin nạp tiền ảo cho user để họ có thể thực hiện giao dịch demo. Tính năng này chỉ dành cho mục đích test và demo, không phản ánh giao dịch tài chính thật.

Form input: số tiền cần nạp (VND). Validation: phải là số nguyên, tối thiểu 1, tối đa 10,000,000,000. Sau khi submit, cộng thêm vào `users.balance`. Log audit vào security log để theo dõi.

**Bảo vệ**: Admin không được nạp tiền cho chính mình.

**Acceptance Criteria**:

- [ ] Validation: integer, min 1, max 10,000,000,000
- [ ] Error nếu admin nạp cho chính mình
- [ ] Balance update chính xác
- [ ] Toast "Đã nạp [amount] cho [email]"
- [ ] Log audit (Log::info vào channel 'security')

**Gợi ý implementation**:

```php
public function deposit(DepositRequest $request, User $user): RedirectResponse
{
    if ($user->id === auth()->id()) {
        return back()->with('error', 'Không thể nạp tiền cho chính mình');
    }

    $amount = $request->validated('amount');
    $user->balance = bcadd((string) $user->balance, (string) $amount, 2);
    $user->save();

    Log::channel('security')->info('Admin deposited virtual funds', [
        'admin_id'       => auth()->id(),
        'target_user_id' => $user->id,
        'amount'         => $amount,
    ]);

    return back()->with('success', "Đã nạp " . number_format($amount) . " ₫ cho {$user->email}");
}
```

---

## Files You Own

```
app/Http/Controllers/Admin/UserController.php
app/Http/Requests/DepositRequest.php
resources/js/Pages/Admin/Users/Index.tsx
resources/js/Pages/Admin/Users/Show.tsx
```

## Shared Resources

Có thể dùng:

- Backend: Models `User`, `Portfolio`, `Transaction`, `Stock`
- Frontend: Layouts (`AdminLayout`), shared components (`DataTable`, `PageHeader`, `ConfirmDialog`, `EmptyState`)
- Utilities: `formatCurrency`, `formatDate`, `formatDateTime` từ `@/lib/format`
- Chi tiết: `docs/guides/component-library.md`

## Lưu ý

- ⚠️ Admin không tự khóa chính mình. Check `$user->id !== auth()->id()` trước khi toggle.
- ⚠️ Admin không tự nạp tiền cho chính mình. Cùng check như trên.
- ⚠️ Số tiền nạp validate: integer, min 1, max 10,000,000,000. Dùng `bcadd` để cộng balance (xem `.claude/skills/money-decimal-handling.md`).
- ⚠️ Eager load khi hiển thị user detail để tránh N+1: `with(['portfolios.stock', 'transactions.stock'])`.
- ⚠️ Giới hạn transactions hiển thị trong show page (10 gần nhất), không load toàn bộ.

## Getting Help

- Stuck? Check `docs/guides/contributing.md`
- Bug trong shared code? Mở GitHub issue, không tự fix
