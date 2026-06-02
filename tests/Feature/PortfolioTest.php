<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected(): void
    {
        $this->get('/portfolio')->assertRedirect('/login');
    }

    public function test_portfolio_renders_empty_state_when_no_holdings(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/portfolio')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Portfolio')
                ->has('holdings', 0)
                ->where('summary.total_value', '0.00')
                ->where('summary.total_cost', '0.00')
                ->where('summary.total_pnl', '0.00')
            );
    }

    public function test_portfolio_computes_bcmath_pnl_correctly(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create([
            'current_price' => '55.00',
        ]);
        Portfolio::factory()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'quantity' => 100,
            'avg_price' => '50.00',
        ]);

        $this->actingAs($user)
            ->get('/portfolio')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Portfolio')
                ->has('holdings', 1)
                ->where('holdings.0.current_value', '5500.00')
                ->where('holdings.0.unrealized_pnl', '500.00')
                ->where('holdings.0.pnl_percent', '10.0000')
                ->where('summary.total_value', '5500.00')
                ->where('summary.total_cost', '5000.00')
                ->where('summary.total_pnl', '500.00')
            );
    }

    public function test_portfolio_only_returns_authenticated_users_holdings(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Portfolio::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->get('/portfolio')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('holdings', 0));
    }

    public function test_portfolio_handles_zero_avg_price(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create(['current_price' => '100.00']);
        Portfolio::factory()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'quantity' => 10,
            'avg_price' => '0.00',
        ]);

        $this->actingAs($user)
            ->get('/portfolio')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('holdings.0.pnl_percent', '0.0000')
            );
    }
}
