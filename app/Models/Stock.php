<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Stock extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'symbol',
        'company_name',
        'sector',
        'exchange',
        'current_price',
        'previous_close',
        'description',
        'logo_url',
        'is_active',
    ];

    protected $appends = ['change_percent', 'trend'];

    protected function casts(): array
    {
        return [
            'current_price' => 'decimal:2',
            'previous_close' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function getChangePercentAttribute(): float
    {
        if ((float) $this->previous_close === 0.0) {
            return 0.0;
        }

        return round((((float) $this->current_price - (float) $this->previous_close) / (float) $this->previous_close) * 100, 2);
    }

    public function getTrendAttribute(): string
    {
        if ((float) $this->current_price > (float) $this->previous_close) {
            return 'up';
        }
        if ((float) $this->current_price < (float) $this->previous_close) {
            return 'down';
        }

        return 'flat';
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class);
    }

    public function priceHistories(): HasMany
    {
        return $this->hasMany(PriceHistory::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, ?string $keyword)
    {
        if (! $keyword) {
            return $query;
        }

        return $query->where(function ($q) use ($keyword) {
            $q->where('symbol', 'like', "%{$keyword}%")
                ->orWhere('company_name', 'like', "%{$keyword}%");
        });
    }
}
