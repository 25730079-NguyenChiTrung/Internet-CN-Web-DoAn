<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Watchlist>
 */
class WatchlistFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stock_id' => Stock::factory(),
        ];
    }
}
