<?php

namespace Database\Seeders;

use App\Models\PriceHistory;
use App\Models\Stock;
use Illuminate\Database\Seeder;

class PriceHistorySeeder extends Seeder
{
    public function run(): void
    {
        $stocks = Stock::all();

        foreach ($stocks as $stock) {
            $currentPrice = (float) $stock->current_price;

            // Work backwards: generate starting price 30 days ago
            // then walk forward to current price
            $startPrice = $currentPrice;
            $prices = [];

            // Generate 30 days going backwards, then reverse
            for ($i = 30; $i >= 1; $i--) {
                // Random walk: ±3% per day
                $changePercent = (mt_rand(-300, 300) / 10000);
                $startPrice = $startPrice / (1 + $changePercent);
                $prices[] = [
                    'date' => now()->subDays($i)->toDateString(),
                    'price' => round(max($startPrice, 1000), 2),
                ];
            }

            foreach ($prices as $entry) {
                PriceHistory::create([
                    'stock_id' => $stock->id,
                    'price' => $entry['price'],
                    'date' => $entry['date'],
                ]);
            }
        }
    }
}
