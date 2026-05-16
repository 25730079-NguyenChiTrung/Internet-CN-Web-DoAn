<?php

namespace Database\Seeders;

use App\Models\Stock;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = User::where('email', 'user1@uit.edu.vn')->first();
        $user2 = User::where('email', 'user2@uit.edu.vn')->first();
        $user3 = User::where('email', 'user3@uit.edu.vn')->first();

        if (! $user1 || ! $user2 || ! $user3) {
            return;
        }

        $now = Carbon::now();

        $records = [
            // user1: mua VNM 2 lần (portfolio avg = 85,000)
            [
                'user' => $user1, 'symbol' => 'VNM', 'type' => 'buy',
                'quantity' => 200, 'price' => '84000.00',
                'created_at' => $now->copy()->subDays(20),
            ],
            [
                'user' => $user1, 'symbol' => 'VNM', 'type' => 'buy',
                'quantity' => 100, 'price' => '87000.00',
                'created_at' => $now->copy()->subDays(10),
            ],
            // user1: mua FPT
            [
                'user' => $user1, 'symbol' => 'FPT', 'type' => 'buy',
                'quantity' => 200, 'price' => '120000.00',
                'created_at' => $now->copy()->subDays(15),
            ],

            // user2: mua rồi bán ACB (không còn portfolio)
            [
                'user' => $user2, 'symbol' => 'ACB', 'type' => 'buy',
                'quantity' => 200, 'price' => '22000.00',
                'created_at' => $now->copy()->subDays(25),
            ],
            [
                'user' => $user2, 'symbol' => 'ACB', 'type' => 'sell',
                'quantity' => 200, 'price' => '24000.00',
                'created_at' => $now->copy()->subDays(5),
            ],

            // user3: mua HPG và VCB
            [
                'user' => $user3, 'symbol' => 'HPG', 'type' => 'buy',
                'quantity' => 500, 'price' => '25000.00',
                'created_at' => $now->copy()->subDays(30),
            ],
            [
                'user' => $user3, 'symbol' => 'VCB', 'type' => 'buy',
                'quantity' => 100, 'price' => '88000.00',
                'created_at' => $now->copy()->subDays(12),
            ],
        ];

        foreach ($records as $record) {
            $stock = Stock::where('symbol', $record['symbol'])->first();

            if (! $stock) {
                continue;
            }

            $total = bcmul((string) $record['price'], (string) $record['quantity'], 2);
            $fee   = bcmul($total, '0.0015', 2);

            Transaction::create([
                'user_id'     => $record['user']->id,
                'stock_id'    => $stock->id,
                'type'        => $record['type'],
                'quantity'    => $record['quantity'],
                'price'       => $record['price'],
                'total'       => $total,
                'fee'         => $fee,
                'status'      => 'completed',
                'executed_at' => $record['created_at'],
                'created_at'  => $record['created_at'],
                'updated_at'  => $record['created_at'],
            ]);
        }
    }
}
