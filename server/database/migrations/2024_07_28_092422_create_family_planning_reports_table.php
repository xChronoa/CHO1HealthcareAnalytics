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
        Schema::create('family_planning_reports', function (Blueprint $table) {
            $table->id('fpId');
            $table->unsignedBigInteger('userId');
            $table->unsignedBigInteger('ageId');
            $table->unsignedBigInteger('fpMethodId');
            $table->unsignedBigInteger('fpCategoryId');
            $table->integer('totalMale');
            $table->integer('totalFemale');
            $table->integer('month');
            $table->year('year');
            $table->timestamps();

            $table->foreign('userId')->references('userId')->on('users');
            $table->foreign('ageId')->references('ageId')->on('age_categories');
            $table->foreign('fpMethodId')->references('fpMethodId')->on('family_planning_methods');
            $table->foreign('fpCategoryId')->references('fpCategoryId')->on('family_planning_categories');
            $table->check('month between 1 and 12');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_planning_reports');
    }
};
