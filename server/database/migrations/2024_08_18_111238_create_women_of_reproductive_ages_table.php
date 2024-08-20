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
        Schema::create('women_of_reproductive_ages', function (Blueprint $table) {
            $table->id('wra_id');
            $table->foreignId('age_category_id')->constrained('age_categories', 'age_category_id');
            $table->integer('unmet_need_modern_fp');
            $table->foreignId('report_status_id')->constrained('report_statuses', 'report_status_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('women_of_reproductive_ages');
    }
};
