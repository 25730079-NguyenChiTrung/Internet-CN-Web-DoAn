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
        $date_from = $request->query('date_from');
        $date_to   = $request->query('date_to');

        $type = in_array($type, ['buy', 'sell']) ? $type : null;
        $status = in_array($status, ['pending', 'completed', 'cancelled']) ? $status : null;

        $query = Auth::user()
            ->transactions()
            ->with('stock')
            ->latest('created_at');

        if ($type) {
            $query->where('type', $type);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($date_from) {
            $query->whereDate('created_at', '>=', $date_from);
        }

        if ($date_to) {
            $query->whereDate('created_at', '<=', $date_to);
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

        $filters = compact('type', 'status', 'date_from', 'date_to');

        return Inertia::render('Transactions', compact('transactions', 'filters'));
    }
}
