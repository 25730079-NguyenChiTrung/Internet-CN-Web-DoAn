<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $type = $request->query('type');
        $status = $request->query('status');
        $search = $request->query('search');

        $type = in_array($type, ['buy', 'sell']) ? $type : null;
        $status = in_array($status, ['pending', 'completed', 'cancelled']) ? $status : null;

        $query = Auth::user()
            ->transactions()
            ->with('stock')
            ->latest('executed_at');

        if ($type) {
            $query->where('type', $type);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($search) {
            $query->whereHas('stock', function ($q) use ($search) {
                $q->where('symbol', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%");
            });
        }

        $paginator = $query->paginate(20)->withQueryString();

        $transactions = [
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'from' => $paginator->firstItem(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ];

        $filters = compact('type', 'status', 'search');

        return Inertia::render('Transactions', compact('transactions', 'filters'));
    }
}
