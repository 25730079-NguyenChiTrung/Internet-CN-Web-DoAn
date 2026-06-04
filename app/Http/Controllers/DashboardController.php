<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $portfolios = $user->portfolios()->with('stock')->get();

        // Tổng hợp giá trị thị trường và giá vốn bằng BCMath để tránh sai số số thực.
        $totalValue = '0.00';
        $totalCost = '0.00';
        foreach ($portfolios as $p) {
            $qty = (string) $p->quantity;
            $totalValue = bcadd($totalValue, bcmul($qty, (string) $p->stock->current_price, 2), 2);
            $totalCost = bcadd($totalCost, bcmul($qty, (string) $p->avg_price, 2), 2);
        }

        $stats = [
            'balance' => (string) $user->balance,
            'portfolio_value' => $totalValue,
            'unrealized_pnl' => bcsub($totalValue, $totalCost, 2),
            'month_transactions' => Transaction::where('user_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
        ];

        return Inertia::render('Dashboard', compact('stats'));
    }
}
