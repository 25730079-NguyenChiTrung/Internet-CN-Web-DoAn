<?php

namespace Tests\Feature;

use App\Models\Stock;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_redirected(): void
    {
        $this->get('/transactions')->assertRedirect('/login');
    }

    public function test_index_renders_paginated_transactions(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(5)->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Transactions')
                ->has('transactions.data', 5)
                ->has('filters')
            );
    }

    public function test_index_only_returns_authenticated_users_transactions(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Transaction::factory()->count(3)->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 0)
            );
    }

    public function test_filter_by_type_buy(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'type' => 'buy']);
        Transaction::factory()->count(2)->create(['user_id' => $user->id, 'type' => 'sell']);

        $this->actingAs($user)
            ->get('/transactions?type=buy')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 3)
                ->where('filters.type', 'buy')
            );
    }

    public function test_filter_by_type_sell(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(2)->create(['user_id' => $user->id, 'type' => 'buy']);
        Transaction::factory()->count(4)->create(['user_id' => $user->id, 'type' => 'sell']);

        $this->actingAs($user)
            ->get('/transactions?type=sell')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 4)
            );
    }

    public function test_filter_by_status_completed(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id, 'status' => 'completed']);
        Transaction::factory()->count(2)->create(['user_id' => $user->id, 'status' => 'pending']);

        $this->actingAs($user)
            ->get('/transactions?status=completed')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 3)
                ->where('filters.status', 'completed')
            );
    }

    public function test_invalid_filter_value_is_ignored(): void
    {
        $user = User::factory()->create();
        Transaction::factory()->count(3)->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->get('/transactions?type=invalid_value')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 3)
                ->where('filters.type', null)
            );
    }

    public function test_filter_by_search_matches_stock_symbol(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create(['symbol' => 'VNM']);
        Transaction::factory()->create(['user_id' => $user->id, 'stock_id' => $stock->id]);
        Transaction::factory()->create(['user_id' => $user->id]); // other stock

        $this->actingAs($user)
            ->get('/transactions?search=VNM')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 1)
            );
    }

    public function test_combined_filters_applied(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create(['symbol' => 'VIC']);
        Transaction::factory()->create([
            'user_id' => $user->id,
            'stock_id' => $stock->id,
            'type' => 'sell',
            'status' => 'completed',
        ]);
        // noise
        Transaction::factory()->create(['user_id' => $user->id, 'type' => 'buy', 'status' => 'completed']);
        Transaction::factory()->create(['user_id' => $user->id, 'stock_id' => $stock->id, 'type' => 'sell', 'status' => 'pending']);

        $this->actingAs($user)
            ->get('/transactions?type=sell&status=completed&search=VIC')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.data', 1)
            );
    }

    public function test_filters_are_returned_in_props(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/transactions?type=buy&status=pending&search=VNM')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.type', 'buy')
                ->where('filters.status', 'pending')
                ->where('filters.search', 'VNM')
            );
    }

    public function test_paginated_response_has_meta_and_links(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/transactions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('transactions.meta')
                ->has('transactions.links')
            );
    }
}
