<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Stock;
use App\Models\Transaction;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Các chỉ số tổng quan toàn hệ thống dành cho quản trị viên.
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'total_stocks' => Stock::count(),
            'today_transactions' => Transaction::whereDate('created_at', today())->count(),
            'total_volume' => (int) Transaction::sum('quantity'),
        ];

        return Inertia::render('Admin/Dashboard', compact('stats'));
    }
}
