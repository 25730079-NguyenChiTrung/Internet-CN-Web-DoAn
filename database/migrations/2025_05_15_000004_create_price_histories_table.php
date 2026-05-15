<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('price_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained()->cascadeOnDelete();
            $table->decimal('price', 15, 2);
            $table->date('date');
            $table->timestamps();

            $table->unique(['stock_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('price_histories');
    }
};
