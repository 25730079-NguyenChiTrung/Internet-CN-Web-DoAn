<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepositRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->toString();
        $role = $request->string('role')->toString();
        $status = $request->string('status')->toString();
        $sort = $request->string('sort')->toString();
        $direction = $request->string('direction')->toString() === 'asc' ? 'asc' : 'desc';

        $query = User::query()
            ->when($search !== '', fn ($q) => $q->where(function ($inner) use ($search) {
                $inner->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            }))
            ->when(in_array($role, ['admin', 'user'], true), fn ($q) => $q->where('role', $role))
            ->when($status === 'active', fn ($q) => $q->where('is_active', true))
            ->when($status === 'locked', fn ($q) => $q->where('is_active', false));

        match ($sort) {
            'balance' => $query->orderBy('balance', $direction),
            default => $query->orderBy('created_at', $direction),
        };

        $users = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => [
                'data' => $users->getCollection()->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'balance' => (float) $user->balance,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                ])->values(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'from' => $users->firstItem(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'to' => $users->lastItem(),
                    'total' => $users->total(),
                ],
                'links' => [
                    'first' => $users->url(1),
                    'last' => $users->url($users->lastPage()),
                    'prev' => $users->previousPageUrl(),
                    'next' => $users->nextPageUrl(),
                ],
            ],
            'filters' => [
                'search' => $search,
                'role' => in_array($role, ['admin', 'user'], true) ? $role : '',
                'status' => in_array($status, ['active', 'locked'], true) ? $status : '',
                'sort' => $sort === 'balance' ? 'balance' : 'created_at',
                'direction' => $direction,
            ],
        ]);
    }

    public function show(User $user): Response
    {
        $user->load([
            'portfolios.stock',
            'transactions' => fn ($q) => $q->with('stock')->latest()->limit(10),
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'balance' => (float) $user->balance,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at,
                'is_self' => $user->id === Auth::id(),
            ],
            'portfolios' => $user->portfolios->map(fn ($portfolio) => [
                'id' => $portfolio->id,
                'symbol' => $portfolio->stock?->symbol,
                'company_name' => $portfolio->stock?->company_name,
                'quantity' => $portfolio->quantity,
                'avg_price' => (float) $portfolio->avg_price,
                'current_price' => (float) ($portfolio->stock?->current_price ?? 0),
                // Giá trị thị trường hiện tại = số lượng * giá hiện tại
                'market_value' => (float) bcmul(
                    (string) $portfolio->quantity,
                    (string) ($portfolio->stock?->current_price ?? 0),
                    2
                ),
            ])->values(),
            'transactions' => $user->transactions->map(fn ($transaction) => [
                'id' => $transaction->id,
                'symbol' => $transaction->stock?->symbol,
                'type' => $transaction->type,
                'quantity' => $transaction->quantity,
                'price' => (float) $transaction->price,
                'total' => (float) $transaction->total,
                'fee' => (float) $transaction->fee,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at,
            ])->values(),
        ]);
    }

    public function toggleActive(User $user): RedirectResponse
    {
        // Admin không được tự khóa tài khoản của chính mình.
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Không thể thay đổi trạng thái tài khoản của chính mình.');
        }

        $user->update(['is_active' => ! $user->is_active]);
        $action = $user->is_active ? 'kích hoạt' : 'khóa';

        return back()->with('success', "Đã {$action} tài khoản {$user->email}.");
    }

    public function deposit(DepositRequest $request, User $user): RedirectResponse
    {
        // Admin không được tự nạp tiền cho chính mình.
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Không thể nạp tiền cho chính mình.');
        }

        $amount = (string) $request->validated()['amount'];

        // Cộng tiền bằng BCMath để tránh sai số dấu phẩy động.
        $user->balance = bcadd((string) $user->balance, $amount, 2);
        $user->save();

        Log::channel('security')->info('Admin deposited virtual funds', [
            'admin_id' => Auth::id(),
            'target_user_id' => $user->id,
            'amount' => $amount,
        ]);

        return back()->with('success', 'Đã nạp '.number_format((int) $amount).' ₫ cho '.$user->email.'.');
    }
}
