<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sector' => ['nullable', 'string', 'max:100'],
            'exchange' => ['nullable', 'in:HOSE,HNX,UPCOM'],
            'sort' => ['nullable', 'in:symbol_asc,name_asc,name_desc,change_desc,change_asc,price_desc,price_asc'],
        ]);

        $sort = $filters['sort'] ?? 'symbol_asc';

        $query = Stock::query()
            ->active()
            ->search($filters['search'] ?? null)
            ->when(! empty($filters['sector']), fn ($q) => $q->where('sector', $filters['sector']))
            ->when(! empty($filters['exchange']), fn ($q) => $q->where('exchange', $filters['exchange']));

        match ($sort) {
            'change_desc' => $query->orderByRaw('CASE WHEN previous_close = 0 THEN 0 ELSE ((current_price - previous_close) / previous_close) END DESC'),
            'change_asc' => $query->orderByRaw('CASE WHEN previous_close = 0 THEN 0 ELSE ((current_price - previous_close) / previous_close) END ASC'),
            'price_desc' => $query->orderByDesc('current_price'),
            'price_asc' => $query->orderBy('current_price'),
            'name_asc' => $query->orderBy('company_name'),
            'name_desc' => $query->orderByDesc('company_name'),
            default => $query->orderBy('symbol'),
        };

        $stocks = $query->paginate(20)->withQueryString();

        return Inertia::render('Stocks/Index', [
            'stocks' => [
                'data' => $stocks->items(),
                'meta' => [
                    'current_page' => $stocks->currentPage(),
                    'from' => $stocks->firstItem(),
                    'last_page' => $stocks->lastPage(),
                    'per_page' => $stocks->perPage(),
                    'to' => $stocks->lastItem(),
                    'total' => $stocks->total(),
                ],
                'links' => [
                    'prev' => $stocks->previousPageUrl(),
                    'next' => $stocks->nextPageUrl(),
                    'pages' => collect($stocks->getUrlRange(1, $stocks->lastPage()))
                        ->map(fn ($url, $page) => [
                            'page' => $page,
                            'url' => $url,
                            'active' => $page === $stocks->currentPage(),
                        ])
                        ->values(),
                ],
            ],
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sector' => $filters['sector'] ?? '',
                'exchange' => $filters['exchange'] ?? '',
                'sort' => $filters['sort'] ?? 'symbol_asc',
            ],
            'sectorOptions' => Stock::active()
                ->whereNotNull('sector')
                ->where('sector', '!=', '')
                ->distinct()
                ->orderBy('sector')
                ->pluck('sector')
                ->values(),
            'exchangeOptions' => Stock::active()
                ->distinct()
                ->orderBy('exchange')
                ->pluck('exchange')
                ->values(),
        ]);
    }

    public function show(string $symbol): Response
    {
        $stock = Stock::where('symbol', strtoupper($symbol))
            ->with(['priceHistories' => fn ($q) => $q->orderByDesc('date')->limit(30)])
            ->firstOrFail();

        $stock->setRelation(
            'priceHistories',
            $stock->priceHistories->sortBy('date')->values(),
        );

        $watchlistId = null;
        if (Auth::check()) {
            $watchlistId = Auth::user()
                ->watchlists()
                ->where('stock_id', $stock->id)
                ->value('id');
        }

        return Inertia::render('Stocks/Show', [
            'stock' => $stock,
            'watchlist_id' => $watchlistId,
        ]);
    }
}
