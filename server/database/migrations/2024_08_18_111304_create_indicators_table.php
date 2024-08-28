<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('indicators', function (Blueprint $table) {
            $table->id('indicator_id');
            $table->string('indicator_name');
            $table->foreignId('parent_indicator_id')->nullable()->constrained('indicators', 'indicator_id')->onDelete('set null');
            $table->foreignId('service_id')->constrained('services', 'service_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('indicators');
    }
};
