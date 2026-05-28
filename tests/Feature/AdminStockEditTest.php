<?php

namespace Tests\Feature;

use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminStockEditTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_edit_stock_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->get("/admin/stocks/{$stock->id}/edit");

        $response->assertOk();
    }

    public function test_admin_can_update_stock_with_valid_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData([
            'symbol' => 'FPT',
            'company_name' => 'FPT Corporation',
        ]));

        $response = $this
            ->actingAs($admin)
            ->put("/admin/stocks/{$stock->id}", $this->validUpdateData([
                'company_name' => 'FPT Digital Corporation',
                'sector' => 'Tài chính',
                'exchange' => 'HNX',
                'current_price' => '125000.50',
                'previous_close' => '120000',
                'description' => 'Cập nhật thông tin doanh nghiệp.',
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/stocks')
            ->assertSessionHas('success', 'Đã cập nhật mã CK FPT');

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            'symbol' => 'FPT',
            'company_name' => 'FPT Digital Corporation',
            'sector' => 'Tài chính',
            'exchange' => 'HNX',
            'current_price' => '125000.50',
            'previous_close' => '120000.00',
            'description' => 'Cập nhật thông tin doanh nghiệp.',
        ]);
    }

    public function test_symbol_cannot_be_changed_when_updating_stock(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->from("/admin/stocks/{$stock->id}/edit")
            ->put("/admin/stocks/{$stock->id}", $this->validUpdateData([
                'symbol' => 'ABC',
                'company_name' => 'Tampered Company',
            ]));

        $response
            ->assertSessionHasErrors('symbol')
            ->assertRedirect("/admin/stocks/{$stock->id}/edit");

        $this->assertDatabaseHas('stocks', [
            'id' => $stock->id,
            'symbol' => 'FPT',
            'company_name' => 'FPT Corporation',
        ]);
    }

    public function test_exchange_must_be_valid_when_updating_stock(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->from("/admin/stocks/{$stock->id}/edit")
            ->put("/admin/stocks/{$stock->id}", $this->validUpdateData([
                'exchange' => 'NYSE',
            ]));

        $response
            ->assertSessionHasErrors('exchange')
            ->assertRedirect("/admin/stocks/{$stock->id}/edit");
    }

    public function test_prices_cannot_be_negative_when_updating_stock(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->from("/admin/stocks/{$stock->id}/edit")
            ->put("/admin/stocks/{$stock->id}", $this->validUpdateData([
                'current_price' => '-1',
            ]));

        $response
            ->assertSessionHasErrors('current_price')
            ->assertRedirect("/admin/stocks/{$stock->id}/edit");
    }

    public function test_admin_can_replace_logo_when_updating_stock(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('stocks/logos/old-logo.png', 'old logo');

        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData([
            'symbol' => 'FPT',
            'logo_url' => '/storage/stocks/logos/old-logo.png',
        ]));

        $response = $this
            ->actingAs($admin)
            ->post("/admin/stocks/{$stock->id}", [
                ...$this->validUpdateData(),
                '_method' => 'put',
                'logo' => UploadedFile::fake()->image('new-logo.png'),
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/stocks');

        $stock->refresh();

        $this->assertNotNull($stock->logo_url);
        $this->assertStringStartsWith('/storage/stocks/logos/', $stock->logo_url);
        $this->assertNotSame('/storage/stocks/logos/old-logo.png', $stock->logo_url);
        Storage::disk('public')->assertMissing('stocks/logos/old-logo.png');
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $stock->logo_url));
    }

    public function test_logo_must_be_valid_image_type_when_updating_stock(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->from("/admin/stocks/{$stock->id}/edit")
            ->post("/admin/stocks/{$stock->id}", [
                ...$this->validUpdateData(),
                '_method' => 'put',
                'logo' => UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf'),
            ]);

        $response
            ->assertSessionHasErrors('logo')
            ->assertRedirect("/admin/stocks/{$stock->id}/edit");
    }

    public function test_logo_must_not_exceed_two_megabytes_when_updating_stock(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $stock = Stock::create($this->validStockData(['symbol' => 'FPT']));

        $response = $this
            ->actingAs($admin)
            ->from("/admin/stocks/{$stock->id}/edit")
            ->post("/admin/stocks/{$stock->id}", [
                ...$this->validUpdateData(),
                '_method' => 'put',
                'logo' => UploadedFile::fake()->image('large.png')->size(2049),
            ]);

        $response
            ->assertSessionHasErrors('logo')
            ->assertRedirect("/admin/stocks/{$stock->id}/edit");
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validStockData(array $overrides = []): array
    {
        return array_merge([
            'symbol' => 'FPT',
            'company_name' => 'FPT Corporation',
            'sector' => 'Công nghệ',
            'exchange' => 'HOSE',
            'current_price' => '100000',
            'previous_close' => '99000',
            'description' => 'Công ty công nghệ hàng đầu Việt Nam.',
        ], $overrides);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function validUpdateData(array $overrides = []): array
    {
        return array_merge([
            'company_name' => 'FPT Corporation',
            'sector' => 'Công nghệ',
            'exchange' => 'HOSE',
            'current_price' => '100000',
            'previous_close' => '99000',
            'description' => 'Công ty công nghệ hàng đầu Việt Nam.',
        ], $overrides);
    }
}
