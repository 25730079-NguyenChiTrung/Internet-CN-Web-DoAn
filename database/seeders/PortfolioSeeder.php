<?php

namespace Database\Seeders;

use App\Models\Portfolio;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Database\Seeder;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = User::where('email', 'user1@uit.edu.vn')->first();
        $user3 = User::where('email', 'user3@uit.edu.vn')->first();

        if (! $user1 || ! $user3) {
            return;
        }

        $holdings = [
            // user1: nắm giữ 2 mã
            ['user' => $user1, 'symbol' => 'VNM', 'quantity' => 300, 'avg_price' => '85000.00'],
            ['user' => $user1, 'symbol' => 'FPT', 'quantity' => 200, 'avg_price' => '120000.00'],

            // user3: nắm giữ 2 mã (balance cao)
            ['user' => $user3, 'symbol' => 'HPG', 'quantity' => 500, 'avg_price' => '25000.00'],
            ['user' => $user3, 'symbol' => 'VCB', 'quantity' => 100, 'avg_price' => '88000.00'],
        ];

        foreach ($holdings as $holding) {
            $stock = Stock::where('symbol', $holding['symbol'])->first();

            if (! $stock) {
                continue;
            }

            Portfolio::firstOrCreate(
                ['user_id' => $holding['user']->id, 'stock_id' => $stock->id],
                ['quantity' => $holding['quantity'], 'avg_price' => $holding['avg_price']],
            );
        }
    }
}
