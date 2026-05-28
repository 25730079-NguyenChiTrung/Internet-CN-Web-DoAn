<?php

namespace Tests\Feature;

use App\Models\Stock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminStockCreateTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_create_stock_page(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->get('/admin/stocks/create');

        $response->assertOk();
    }

    public function test_admin_can_create_stock_with_valid_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->post('/admin/stocks', $this->validStockData([
                'symbol' => 'ABC',
                'company_name' => 'ABC Corporation',
                'current_price' => '125000.50',
                'previous_close' => '120000',
            ]));

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/admin/stocks')
            ->assertSessionHas('success', 'Đã thêm mã CK ABC');

        $this->assertDatabaseHas('stocks', [
            'symbol' => 'ABC',
            'company_name' => 'ABC Corporation',
            'sector' => 'Công nghệ',
            'exchange' => 'HOSE',
            'current_price' => '125000.50',
            'previous_close' => '120000.00',
            'is_active' => true,
        ]);
    }

    public function test_symbol_must_be_unique(): void
    {
        Stock::create($this->validStockData(['symbol' => 'FPT']));
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData(['symbol' => 'FPT']));

        $response
            ->assertSessionHasErrors('symbol')
            ->assertRedirect('/admin/stocks/create');
    }

    public function test_symbol_must_use_uppercase_letters_only(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData(['symbol' => 'fpt1']));

        $response
            ->assertSessionHasErrors('symbol')
            ->assertRedirect('/admin/stocks/create');
    }

    public function test_exchange_must_be_valid(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData(['exchange' => 'NYSE']));

        $response
            ->assertSessionHasErrors('exchange')
            ->assertRedirect('/admin/stocks/create');
    }

    public function test_prices_cannot_be_negative(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData(['current_price' => '-1']));

        $response
            ->assertSessionHasErrors('current_price')
            ->assertRedirect('/admin/stocks/create');
    }

    public function test_admin_can_upload_logo_when_creating_stock(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);
        $logo = UploadedFile::fake()->image('logo.png');

        $response = $this
            ->actingAs($admin)
            ->post('/admin/stocks', $this->validStockData([
                'symbol' => 'LOGO',
                'logo' => $logo,
            ]));

        $response->assertSessionHasNoErrors();

        $stock = Stock::where('symbol', 'LOGO')->firstOrFail();

        $this->assertNotNull($stock->logo_url);
        $this->assertStringStartsWith('/storage/stocks/logos/', $stock->logo_url);
        Storage::disk('public')->assertExists(str_replace('/storage/', '', $stock->logo_url));
    }

    public function test_logo_must_be_valid_image_type(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData([
                'logo' => UploadedFile::fake()->create('logo.pdf', 100, 'application/pdf'),
            ]));

        $response
            ->assertSessionHasErrors('logo')
            ->assertRedirect('/admin/stocks/create');
    }

    public function test_logo_must_not_exceed_two_megabytes(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($admin)
            ->from('/admin/stocks/create')
            ->post('/admin/stocks', $this->validStockData([
                'logo' => UploadedFile::fake()->image('large.png')->size(2049),
            ]));

        $response
            ->assertSessionHasErrors('logo')
            ->assertRedirect('/admin/stocks/create');
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
}
