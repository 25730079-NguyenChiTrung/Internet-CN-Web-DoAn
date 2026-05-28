<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->string('status')->toString();
        $sort = $request->string('sort')->toString();
        $direction = $request->string('direction')->toString() === 'desc' ? 'desc' : 'asc';

        $query = Stock::query()
            ->search($request->string('search')->toString())
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'inactive', fn ($query) => $query->where('is_active', false));

        match ($sort) {
            'price' => $query->orderBy('current_price', $direction),
            'change' => $query->orderByRaw(
                "CASE WHEN previous_close = 0 THEN 0 ELSE ((current_price - previous_close) / previous_close) * 100 END {$direction}"
            ),
            default => $query->orderBy('symbol'),
        };

        $stocks = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Stocks/Index', [
            'stocks' => [
                'data' => $stocks->getCollection()->map(fn (Stock $stock) => [
                    'id' => $stock->id,
                    'symbol' => $stock->symbol,
                    'company_name' => $stock->company_name,
                    'sector' => $stock->sector,
                    'exchange' => $stock->exchange,
                    'current_price' => (float) $stock->current_price,
                    'previous_close' => (float) $stock->previous_close,
                    'description' => $stock->description,
                    'logo_url' => $stock->logo_url,
                    'is_active' => $stock->is_active,
                    'change_percent' => $stock->change_percent,
                    'trend' => $stock->trend,
                    'deleted_at' => $stock->deleted_at,
                    'created_at' => $stock->created_at,
                    'updated_at' => $stock->updated_at,
                ])->values(),
                'meta' => [
                    'current_page' => $stocks->currentPage(),
                    'from' => $stocks->firstItem(),
                    'last_page' => $stocks->lastPage(),
                    'per_page' => $stocks->perPage(),
                    'to' => $stocks->lastItem(),
                    'total' => $stocks->total(),
                ],
                'links' => [
                    'first' => $stocks->url(1),
                    'last' => $stocks->url($stocks->lastPage()),
                    'prev' => $stocks->previousPageUrl(),
                    'next' => $stocks->nextPageUrl(),
                ],
            ],
            'filters' => [
                'search' => $request->string('search')->toString(),
                'status' => in_array($status, ['active', 'inactive'], true) ? $status : '',
                'sort' => in_array($sort, ['price', 'change'], true) ? $sort : '',
                'direction' => $direction,
            ],
        ]);
    }
}
