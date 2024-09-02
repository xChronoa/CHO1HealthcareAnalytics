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
        Schema::create('service_data', function (Blueprint $table) {
            $table->id('service_data_id');
            $table->foreignId('service_id')->constrained('services', 'service_id');
            $table->foreignId('indicator_id')->constrained('indicators', 'indicator_id')->nullable();
            $table->foreignId('age_category_id')->constrained('age_categories', 'age_category_id')->nullable();
            $table->enum('value_type', ['male', 'female', 'total'])->nullable();
            $table->float('value');
            $table->text('remarks')->nullable();
            $table->foreignId('report_status_id')->constrained('report_statuses', 'report_status_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_data');
    }
};
