<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->string('symbol', 10)->unique();
            $table->string('company_name');
            $table->string('sector', 100)->nullable();
            $table->enum('exchange', ['HOSE', 'HNX', 'UPCOM'])->default('HOSE');
            $table->decimal('current_price', 15, 2)->default(0);
            $table->decimal('previous_close', 15, 2)->default(0);
            $table->text('description')->nullable();
            $table->string('logo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index('symbol');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
