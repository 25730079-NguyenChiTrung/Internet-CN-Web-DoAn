<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use App\Models\Watchlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class WatchlistController extends Controller
{
    public function index(Request $request): Response
    {
        $watchlists = $request->user()
            ->watchlists()
            ->with('stock')
            ->latest()
            ->get();

        return Inertia::render('Watchlist', [
            'watchlists' => $watchlists,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stock_id' => ['required', 'integer', 'exists:stocks,id'],
        ]);

        $stock = Stock::query()
            ->whereKey($validated['stock_id'])
            ->active()
            ->firstOrFail();

        $request->user()->watchlists()->firstOrCreate([
            'stock_id' => $stock->id,
        ]);

        return Redirect::back()->with('success', 'Đã thêm mã cổ phiếu vào watchlist.');
    }

    public function destroy(Request $request, Watchlist $watchlist): RedirectResponse
    {
        abort_unless($watchlist->user_id === $request->user()->id, 403);

        $watchlist->delete();

        return Redirect::back()->with('success', 'Đã xoá mã cổ phiếu khỏi watchlist.');
    }
}
