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
        Schema::create('morbidity_reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->foreignId('disease_id')->constrained('diseases', 'disease_id');
            $table->foreignId('age_category_id')->constrained('age_categories', 'age_category_id');
            $table->integer('male');
            $table->integer('female');
            $table->foreignId('report_status_id')->constrained('report_statuses', 'report_status_id');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('morbidity_reports');
    }
};
