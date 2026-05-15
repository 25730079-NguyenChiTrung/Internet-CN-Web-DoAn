<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Stocks/Index');
    }

    public function show(string $symbol): Response
    {
        return Inertia::render('Stocks/Show', ['symbol' => $symbol]);
    }
}
