<?php

namespace Database\Factories;

use App\Models\Stock;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    public function definition(): array
    {
        $price = fake()->randomFloat(2, 10000, 500000);
        $quantity = fake()->numberBetween(10, 500);

        return [
            'user_id' => User::factory(),
            'stock_id' => Stock::factory(),
            'type' => fake()->randomElement(['buy', 'sell']),
            'quantity' => $quantity,
            'price' => $price,
            'total' => round($price * $quantity, 2),
            'fee' => 0,
            'status' => fake()->randomElement(['pending', 'completed', 'cancelled']),
            'executed_at' => now(),
        ];
    }
}
