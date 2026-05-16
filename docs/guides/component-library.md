# Component Library Reference

Catalog shared components và utilities có sẵn để tái sử dụng. Đọc file này trước khi tạo component mới — có thể thứ bạn cần đã có.

## shadcn/ui Base Components

Tất cả ở `resources/js/components/ui/`. Import trực tiếp:

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableCell,
    TableHead,
} from '@/components/ui/table';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
```

### Button

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`

Sizes: `default`, `sm`, `lg`, `icon`

```tsx
<Button variant="default">Lưu</Button>
<Button variant="destructive" size="sm">Xóa</Button>
<Button variant="outline">Hủy</Button>
<Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
```

### Input + Label

```tsx
<div className="space-y-2">
    <Label htmlFor="symbol">Symbol</Label>
    <Input id="symbol" type="text" placeholder="VNM" />
    {errors.symbol && <p className="text-sm text-red-500">{errors.symbol}</p>}
</div>
```

### Dialog (modal)

```tsx
<Dialog>
    <DialogTrigger asChild>
        <Button>Mở dialog</Button>
    </DialogTrigger>
    <DialogContent>
        <h2 className="text-lg font-semibold">Tiêu đề</h2>
        <p>Nội dung dialog</p>
    </DialogContent>
</Dialog>
```

### Badge

```tsx
<Badge variant="default">Active</Badge>
<Badge variant="destructive">Locked</Badge>
<Badge variant="outline">HOSE</Badge>
<Badge variant="secondary">Admin</Badge>
```

---

## Project Shared Components

Tất cả ở `resources/js/components/shared/`.

### `<DataTable />`

Dùng cho bảng có search, sort, pagination.

```tsx
<DataTable data={stocks.data} columns={columns} searchable pagination={stocks.meta} />
```

### `<PageHeader />`

Header tiêu chuẩn cho các trang admin/user.

```tsx
<PageHeader
    title="Quản lý cổ phiếu"
    description="Thêm, sửa, xóa mã CK trên hệ thống"
    actions={
        <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm mới
        </Button>
    }
/>
```

### `<EmptyState />`

Hiển thị khi danh sách rỗng.

```tsx
<EmptyState
    icon={<Inbox className="h-10 w-10" />}
    title="Chưa có cổ phiếu"
    description="Thêm mã CK đầu tiên để bắt đầu"
    action={<Button>Thêm mới</Button>}
/>
```

### `<ConfirmDialog />`

Confirm dialog trước khi thực hiện hành động nguy hiểm.

```tsx
<ConfirmDialog
    trigger={<Button variant="destructive">Xóa</Button>}
    title="Xác nhận xóa"
    description="Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa mã CK này?"
    onConfirm={() => router.delete(route('admin.stocks.destroy', stock.id))}
/>
```

### `<StockCard />`

Hiển thị 1 mã CK dạng card (dùng trong M3 — trang danh sách public).

```tsx
<StockCard stock={stock} onClick={(s) => router.visit(`/stocks/${s.symbol}`)} />
```

### `<StockChart />`

Biểu đồ giá CK 30 ngày dùng Recharts (dùng trong M3 — trang chi tiết).

```tsx
<StockChart data={stock.price_histories} />
```

### `<PriceChange />`

Hiển thị % thay đổi giá với màu xanh/đỏ tự động.

```tsx
<PriceChange value={2.5} />    // "+2.50%" màu xanh, mũi tên lên
<PriceChange value={-1.3} />   // "-1.30%" màu đỏ, mũi tên xuống
<PriceChange value={0} />      // "0.00%" màu xám
```

---

## Layouts

### `<AppLayout />`

Dùng cho tất cả trang của user đã đăng nhập (Dashboard, Portfolio, Transactions, Stocks/Show).

```tsx
import AppLayout from '@/layouts/app-layout';

export default function Portfolio({ portfolios }: Props) {
    return (
        <AppLayout>
            <Head title="Danh mục đầu tư" />
            {/* nội dung trang */}
        </AppLayout>
    );
}
```

### `<AdminLayout />`

Dùng cho tất cả trang admin (sidebar + top bar).

```tsx
import AdminLayout from '@/layouts/admin-layout';

export default function Index({ stocks }: Props) {
    return (
        <AdminLayout>
            <Head title="Quản lý cổ phiếu" />
            {/* nội dung trang */}
        </AdminLayout>
    );
}
```

### `<GuestLayout />`

Dùng cho trang public, login, register.

---

## Utility Functions

```tsx
import {
    formatCurrency,
    formatPercent,
    formatDate,
    formatDateTime,
    formatNumber,
} from '@/lib/format';

formatCurrency(71500); // "71.500 ₫"
formatCurrency('71500.00'); // "71.500 ₫"
formatPercent(2.5); // "+2.50%"
formatPercent(-1.3); // "-1.30%"
formatDate('2025-05-15'); // "15/05/2025"
formatDateTime('2025-05-15 14:30:00'); // "15/05/2025 14:30"
formatNumber(1234567); // "1,234,567"
```

### `cn()` helper

Kết hợp Tailwind classes có điều kiện.

```tsx
import { cn } from '@/lib/utils';

<div
    className={cn(
        'rounded border px-4 py-2',
        isActive && 'border-blue-500 bg-blue-500 text-white',
        isDisabled && 'cursor-not-allowed opacity-50',
    )}
/>;
```

---

## TypeScript Types

```tsx
import type { User, Stock, Transaction, Portfolio, PriceHistory } from '@/types/models';
import type { PageProps } from '@/types/inertia';

interface Props extends PageProps {
    stocks: Stock[];
    filters: { search?: string };
}

export default function Index({ stocks, filters, auth }: Props) {
    // auth.user là user đang đăng nhập (null nếu guest)
}
```

Available types: `User`, `Stock`, `Transaction`, `Portfolio`, `PriceHistory`, `PageProps`.

---

## Recharts (dùng cho M3 — biểu đồ giá)

```tsx
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from 'recharts';

<ResponsiveContainer width="100%" height={300}>
    <LineChart data={priceHistory}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => formatCurrency(value as number)} />
        <Line type="monotone" dataKey="price" stroke="#3b82f6" dot={false} />
    </LineChart>
</ResponsiveContainer>;
```

---

## Lucide Icons

```tsx
import { Plus, Edit, Trash2, Eye, ArrowUp, ArrowDown, Search, Filter, X, Inbox } from 'lucide-react';

// Icon trong button
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Thêm mới
</Button>

// Icon-only button
<Button variant="ghost" size="icon" aria-label="Xóa">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## react-hot-toast

```tsx
import { toast } from 'react-hot-toast';

toast.success('Đã lưu thành công');
toast.error('Có lỗi xảy ra. Vui lòng thử lại');
toast('Đang xử lý...');
```

Hoặc dùng flash messages từ backend (layout tự hiển thị toast):

```php
// PHP — trong Controller
return back()->with('success', 'Đã lưu thành công');
return back()->with('error', 'Có lỗi xảy ra');
```

---

## Inertia Form Hook

Dùng `useForm` cho tất cả forms — không dùng `fetch` hay `axios` trực tiếp.

```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors, reset } = useForm({
    symbol: '',
    quantity: 100,
});

const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post(route('admin.stocks.store'), {
        onSuccess: () => {
            toast.success('Đã tạo thành công');
            reset();
        },
        onError: () => toast.error('Vui lòng kiểm tra lại form'),
    });
};

// Hiển thị validation error
{
    errors.symbol && <p className="text-sm text-red-500">{errors.symbol}</p>;
}
```
