<?php

namespace Database\Factories;

use App\Models\Stock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Stock>
 */
class StockFactory extends Factory
{
    public function definition(): array
    {
        $currentPrice = fake()->randomFloat(2, 10000, 500000);

        return [
            'symbol' => strtoupper(fake()->unique()->lexify('???')),
            'company_name' => fake()->company(),
            'sector' => fake()->randomElement(['Tài chính', 'Công nghệ', 'Bất động sản', 'Y tế']),
            'exchange' => fake()->randomElement(['HOSE', 'HNX', 'UPCOM']),
            'current_price' => $currentPrice,
            'previous_close' => $currentPrice * fake()->randomFloat(2, 0.9, 1.1),
            'description' => null,
            'logo_url' => null,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(['is_active' => false]);
    }
}
