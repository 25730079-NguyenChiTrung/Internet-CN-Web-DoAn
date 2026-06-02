<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        $portfolios = Auth::user()->portfolios()->with('stock')->get();

        $holdings = $portfolios->map(function ($p) {
            $qty = (string) $p->quantity;
            $avg = (string) $p->avg_price;
            $cur = (string) $p->stock->current_price;

            $currentValue = bcmul($qty, $cur, 2);
            $costBasis = bcmul($qty, $avg, 2);
            $unrealizedPnl = bcsub($currentValue, $costBasis, 2);
            $pnlPct = $costBasis !== '0.00'
                ? bcmul(bcdiv(bcsub($currentValue, $costBasis, 4), $costBasis, 4), '100', 4)
                : '0.0000';

            return array_merge($p->toArray(), [
                'current_value' => $currentValue,
                'cost_basis' => $costBasis,
                'unrealized_pnl' => $unrealizedPnl,
                'pnl_percent' => $pnlPct,
            ]);
        });

        $holdingsArray = $holdings->all();
        $totalValue = array_reduce($holdingsArray, fn ($c, $h) => bcadd($c, $h['current_value'], 2), '0.00');
        $totalCost = array_reduce($holdingsArray, fn ($c, $h) => bcadd($c, $h['cost_basis'], 2), '0.00');
        $totalPnl = bcsub($totalValue, $totalCost, 2);

        $balance     = (string) Auth::user()->balance;
        $totalAssets = bcadd($totalValue, $balance, 2);

        $summary = [
            'total_value'  => $totalValue,
            'total_cost'   => $totalCost,
            'total_pnl'    => $totalPnl,
            'balance'      => $balance,
            'total_assets' => $totalAssets,
        ];

        return Inertia::render('Portfolio', compact('holdings', 'summary'));
    }
}
