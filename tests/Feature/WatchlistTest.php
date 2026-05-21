<?php

namespace Tests\Feature;

use App\Models\Stock;
use App\Models\User;
use App\Models\Watchlist;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WatchlistTest extends TestCase
{
    use RefreshDatabase;

    // ── Authentication ────────────────────────────────────────────

    public function test_unauthenticated_user_is_redirected_from_index(): void
    {
        $this->get('/watchlist')->assertRedirect('/login');
    }

    public function test_unauthenticated_user_cannot_store(): void
    {
        $stock = Stock::factory()->create();
        $this->post('/watchlist', ['stock_id' => $stock->id])->assertRedirect('/login');
    }

    public function test_unauthenticated_user_cannot_destroy(): void
    {
        $watchlist = Watchlist::factory()->create();
        $this->delete("/watchlist/{$watchlist->id}")->assertRedirect('/login');
    }

    // ── Index ─────────────────────────────────────────────────────

    public function test_index_returns_inertia_page_with_watchlists_and_stocks(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create();
        Watchlist::factory()->create(['user_id' => $user->id, 'stock_id' => $stock->id]);
        Stock::factory()->create(); // extra active stock

        $this->actingAs($user)
            ->get('/watchlist')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Watchlist')
                ->has('watchlists', 1)
                ->has('stocks')
            );
    }

    public function test_index_only_returns_authenticated_users_watchlists(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        Watchlist::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->get('/watchlist')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('watchlists', 0)
            );
    }

    // ── Store ─────────────────────────────────────────────────────

    public function test_store_creates_watchlist_entry(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create();

        $this->actingAs($user)
            ->post('/watchlist', ['stock_id' => $stock->id])
            ->assertRedirect();

        $this->assertDatabaseHas('watchlists', [
            'user_id' => $user->id,
            'stock_id' => $stock->id,
        ]);
    }

    public function test_store_is_idempotent(): void
    {
        $user = User::factory()->create();
        $stock = Stock::factory()->create();
        Watchlist::factory()->create(['user_id' => $user->id, 'stock_id' => $stock->id]);

        $this->actingAs($user)
            ->post('/watchlist', ['stock_id' => $stock->id])
            ->assertRedirect();

        $this->assertDatabaseCount('watchlists', 1);
    }

    public function test_store_validates_stock_id_required(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/watchlist', [])
            ->assertSessionHasErrors('stock_id');
    }

    public function test_store_validates_stock_id_exists(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/watchlist', ['stock_id' => 99999])
            ->assertSessionHasErrors('stock_id');
    }

    // ── Destroy ───────────────────────────────────────────────────

    public function test_destroy_deletes_own_watchlist_entry(): void
    {
        $user = User::factory()->create();
        $watchlist = Watchlist::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)
            ->delete("/watchlist/{$watchlist->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('watchlists', ['id' => $watchlist->id]);
    }

    public function test_destroy_returns_403_for_other_users_entry(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $watchlist = Watchlist::factory()->create(['user_id' => $other->id]);

        $this->actingAs($user)
            ->delete("/watchlist/{$watchlist->id}")
            ->assertForbidden();
    }

    public function test_destroy_returns_404_for_non_existent_entry(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->delete('/watchlist/99999')
            ->assertNotFound();
    }
}
