<?php

namespace Database\Factories;

use App\Models\Portfolio;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Portfolio>
 */
class PortfolioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'stock_id' => Stock::factory(),
            'quantity' => fake()->numberBetween(10, 1000),
            'avg_price' => fake()->randomFloat(2, 10000, 200000),
        ];
    }
}
