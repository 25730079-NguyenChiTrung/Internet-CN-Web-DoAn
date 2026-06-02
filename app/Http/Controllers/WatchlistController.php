<?php

namespace App\Http\Controllers;

use App\Http\Requests\WatchlistRequest;
use App\Models\Stock;
use App\Models\Watchlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WatchlistController extends Controller
{
    public function index(): Response
    {
        $watchlists = Auth::user()->watchlists()->with('stock')->get();
        $stocks = Stock::active()->orderBy('symbol')->get();

        return Inertia::render('Watchlist', compact('watchlists', 'stocks'));
    }

    public function store(WatchlistRequest $request): RedirectResponse
    {
        Watchlist::firstOrCreate([
            'user_id' => Auth::id(),
            'stock_id' => $request->stock_id,
        ]);

        return back()->with('success', 'Đã thêm vào danh sách theo dõi.');
    }

    public function destroy(Watchlist $watchlist): RedirectResponse
    {
        if ($watchlist->user_id !== Auth::id()) {
            abort(403);
        }

        $watchlist->delete();

        return back()->with('success', 'Đã xóa khỏi danh sách theo dõi.');
    }
}
