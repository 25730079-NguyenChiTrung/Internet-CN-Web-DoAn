# Contributing Guide

## Git Workflow

### Branches

- `main` — Production branch. Chỉ nhận merge từ `develop`. Không branch trực tiếp từ đây.
- `develop` — Integration branch. Tất cả feature branches đều branch từ đây và merge về đây.
- `feat/<module-name>` — Feature branches cho từng module.

### Workflow

1. Pull `develop` mới nhất:

    ```bash
    git checkout develop
    git pull origin develop
    ```

2. Tạo feature branch từ `develop`:

    ```bash
    git checkout -b feat/your-module-name
    ```

3. Commit thường xuyên với message rõ ràng

4. Push và mở Pull Request vào `develop`

5. Address review feedback

6. Merge sau khi được approve

> **Lưu ý**: `main` là production branch — chỉ merge PR từ `develop` vào `main` khi codebase đã ổn định và sẵn sàng demo.

## Commit Messages

Format: `type: short description`

Types:

- `feat` — Tính năng mới
- `fix` — Sửa bug
- `docs` — Chỉ sửa docs
- `style` — Format, missing semicolons (không đổi logic)
- `refactor` — Refactor không đổi behavior
- `chore` — Tools, deps, config

Examples:

```
feat: add stock create form with validation
fix: handle empty portfolio state on sell
refactor: extract pagination logic to hook
docs: add jsdoc to TradingService
chore: add Prettier config for Tailwind class sorting
```

KHÔNG làm:

```
update
fix stuff
WIP
asdf
ok done
```

## Pull Request

1. Self-review diff trước khi mở PR
2. PR nhỏ (< 500 dòng nếu được) — dễ review hơn
3. Một concern per PR
4. Chạy lint và type-check local trước khi push:
    ```bash
    pnpm run lint
    pnpm run type-check
    ```
5. Đợi ít nhất 1 approve trước khi merge
6. Dùng "Squash and Merge" để giữ history clean

## Code Style

Chi tiết đầy đủ: `docs/06-coding-standards.md`

Quick rules:

- **PHP**: PSR-12, type hints bắt buộc, return types bắt buộc
- **TypeScript**: strict mode ON, không dùng `any`
- **CSS**: Tailwind utility-first, không inline styles
- **Files**:
    - React components: `kebab-case.tsx`
    - React pages (Inertia): `PascalCase.tsx`
    - PHP classes: `PascalCase.php`

## KHÔNG được làm

- ❌ Push trực tiếp lên `main`
- ❌ Sửa files của module khác mà không thống nhất trước
- ❌ Thêm dependencies mới mà không thông báo
- ❌ Skip code review
- ❌ Commit `.env`, `vendor/`, `node_modules/`, `storage/logs/`, `public/build/`
- ❌ Disable ESLint/TypeScript errors thay vì fix
- ❌ Dùng `any` type trong TypeScript
- ❌ Dùng raw SQL queries (dùng Eloquent)
- ❌ Dùng `*`, `+`, `-`, `/` cho money (dùng BCMath)
- ❌ Skip Form Request validation
- ❌ Logic phức tạp trong Controller (delegate sang Service)

## Khi stuck

1. Đọc lại docs trong `docs/`
2. Check `docs/guides/component-library.md` để xem có component/utility dùng lại được
3. Hỏi team
4. Mở GitHub issue nếu phát hiện bug trong shared code — không tự fix code của người khác

## Code Review Etiquette

Khi review code người khác:

- Lịch sự, cụ thể, gợi ý thay thế thay vì chỉ nói "sai"
- Approve khi đủ tốt (không cần hoàn hảo)
- Dùng "Suggest changes" trên GitHub cho fix nhỏ

Khi nhận review:

- Đừng take personally — review là về code, không phải về người
- Hỏi nếu comment không rõ
- Tranh luận tôn trọng nếu disagree, nhưng lắng nghe ý kiến

## Shared Files — Ai được sửa gì?

Xem `docs/05-folder-structure.md` phần "File Ownership Map" để biết file nào thuộc module nào.

Với **shared files** (types, shared components, routes), khi cần sửa:

1. Thông báo với team trước
2. Chỉ thêm, không rename hoặc xóa field/export cũ
3. Mở issue/discussion nếu cần thay đổi lớn
