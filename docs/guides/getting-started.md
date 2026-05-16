# Getting Started

Hướng dẫn setup môi trường từ 0 đến chạy được local trong khoảng 30 phút.

## Bước 1: Yêu cầu hệ thống

```bash
php --version       # 8.2+
composer --version  # 2.x
node --version      # 20.x LTS
mysql --version     # 8.x
```

Trên macOS dùng Homebrew, Windows dùng **Laragon** (recommended — gộp PHP, MySQL, Apache), Linux dùng package manager.

Ngoài ra cần **pnpm** (thay thế cho npm):

```bash
npm install -g pnpm
pnpm --version  # 10.x
```

## Bước 2: Clone & Install

```bash
git clone <repository-url> stock-website
cd stock-website
composer install
pnpm install
```

## Bước 3: Cấu hình

```bash
cp .env.example .env
php artisan key:generate
```

Sửa `.env` theo môi trường local của bạn:

```env
DB_DATABASE=stock_website
DB_USERNAME=root
DB_PASSWORD=
```

Với XAMPP, các giá trị mặc định trên là đúng — không cần sửa.

## Bước 4: Tạo database

Chạy lệnh sau để tạo database tự động (đọc tên từ `.env`):

```bash
php artisan db:create
```

Hoặc tạo thủ công qua phpMyAdmin (`http://localhost/phpmyadmin`):

- Click "New"
- Database name: `stock_website`
- Collation: `utf8mb4_unicode_ci`
- Click Create

## Bước 5: Migrate & Seed

```bash
php artisan migrate:fresh --seed
```

Lệnh này drop toàn bộ bảng, tạo lại từ đầu và seed demo data: 1 admin + 5 users, 20 mã CK Việt Nam, và 30 ngày lịch sử giá cho mỗi mã.

## Bước 6: Chạy dev servers

Mở **2 terminals riêng biệt**.

**Terminal 1** (Laravel backend):

```bash
php artisan serve
```

**Terminal 2** (Vite frontend với hot reload):

```bash
pnpm run dev
```

## Bước 7: Test thử

Mở http://localhost:8000

Đăng nhập thử:

- Admin: `admin@uit.edu.vn` / `password` → redirect về `/admin`
- User thường: `user1@uit.edu.vn` / `password` → redirect về `/dashboard`

## Bước 8: Tìm task của bạn

Mở `docs/tasks/README.md`, xác định module được assign, rồi đọc kỹ file task tương ứng (M1–M4).

---

## Demo Accounts

Sau khi `migrate:fresh --seed`, các tài khoản sau sẵn sàng. Mật khẩu đều là `password`.

| Email            | Role  | Balance       | Ghi chú                                       |
| ---------------- | ----- | ------------- | --------------------------------------------- |
| admin@uit.edu.vn | Admin | —             | Toàn quyền admin panel, không trading         |
| user1@uit.edu.vn | User  | 100,000,000 ₫ | Tài khoản standard, dùng để test chung        |
| user2@uit.edu.vn | User  | 50,000,000 ₫  | Balance thấp — test insufficient funds        |
| user3@uit.edu.vn | User  | 200,000,000 ₫ | Balance cao — test large orders               |
| user4@uit.edu.vn | User  | 0 ₫           | Zero balance — mọi lệnh mua phải reject       |
| user5@uit.edu.vn | User  | 75,000,000 ₫  | Bị khóa — login trả về "Tài khoản đã bị khóa" |

---

## Lỗi thường gặp

### `php artisan migrate` báo "database not exist"

→ Chưa tạo database. Chạy `php artisan db:create` trước (cần MySQL đang chạy).

### `pnpm run dev` báo "port 5173 already in use"

→ Process khác đang dùng port. Kill process hoặc đổi port trong `vite.config.ts`.

### "419 Page Expired"

→ CSRF token hết hạn. Refresh trang và thử lại.

### "Class not found" sau khi thêm file mới

→ Chạy `composer dump-autoload` để regenerate autoloader.

### Permissions error trên `storage/` hoặc `bootstrap/cache/`

```bash
chmod -R 775 storage bootstrap/cache
```

### MySQL không kết nối được

→ Đảm bảo MySQL đang chạy (XAMPP Control Panel). Kiểm tra `.env` có `DB_HOST=127.0.0.1`, `DB_USERNAME=root`, `DB_PASSWORD=` (để trống).

---

## Bước tiếp theo

1. Đọc `docs/guides/contributing.md` — Git workflow và commit conventions
2. Đọc `docs/guides/component-library.md` — UI components và utilities có sẵn
3. Đọc file task module của bạn trong `docs/tasks/`
4. Bắt đầu code!
