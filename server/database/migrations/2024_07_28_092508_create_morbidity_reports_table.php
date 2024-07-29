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
            $table->id('morbidityReportId');
            $table->unsignedBigInteger('userId');
            $table->unsignedBigInteger('diseaseId');
            $table->unsignedBigInteger('ageId');
            $table->integer('totalMale');
            $table->integer('totalFemale');
            $table->integer('month');
            $table->year('year');
            $table->timestamps();

            $table->foreign('userId')->references('userId')->on('users');
            $table->foreign('diseaseId')->references('diseaseId')->on('diseases');
            $table->foreign('ageId')->references('ageId')->on('age_categories');
            $table->check('month between 1 and 12');
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
