# Feature Tasks

Mỗi module thuộc về 1 thành viên, chịu trách nhiệm cả backend và frontend.

## Module Assignments

| Module                                                         | Description                 | Complexity |
| -------------------------------------------------------------- | --------------------------- | ---------- |
| [M1: Admin Stocks CRUD](./M1-admin-stocks-crud.md)             | Quản lý mã CK (admin)       | ⭐⭐⭐     |
| [M2: Admin Users Management](./M2-admin-users-management.md)   | Quản lý người dùng (admin)  | ⭐⭐       |
| [M3: User Stocks Browser](./M3-user-stocks-browser.md)         | Xem CK + chart (user)       | ⭐⭐⭐     |
| [M4: User Trading & Portfolio](./M4-user-trading-portfolio.md) | Đặt lệnh + portfolio (user) | ⭐⭐⭐⭐   |

## Module Dependencies

- **M4 phụ thuộc M3**: M4 cần order form UI từ stock detail page của M3. M3 expose placeholder form trước, M4 wire up backend logic.
- Các module khác phát triển song song.

## Shared Files Coordination

| Shared File                    | Used By | Strategy                              |
| ------------------------------ | ------- | ------------------------------------- |
| `resources/js/types/models.ts` | All     | Chỉ thêm field, không rename field cũ |
| `routes/web.php`               | All     | Mỗi module thêm route group riêng     |
| `database/migrations/*`        | All     | Read-only, không sửa                  |
| `components/shared/*`          | All     | Không sửa nếu không có agreement      |
