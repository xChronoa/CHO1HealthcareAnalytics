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
            $table->id('serviceDataId');
            $table->unsignedBigInteger('serviceId');
            $table->unsignedBigInteger('indicatorId');
            $table->unsignedBigInteger('userId');
            $table->unsignedBigInteger('ageId');
            $table->integer('totalMale');
            $table->integer('totalFemale');
            $table->string('remarks');
            $table->integer('month');
            $table->year('year');
            $table->timestamps();

            $table->foreign('serviceId')->references('serviceId')->on('services');
            $table->foreign('indicatorId')->references('indicatorId')->on('indicators');
            $table->foreign('userId')->references('userId')->on('users');
            $table->foreign('ageId')->references('ageId')->on('age_categories');
            $table->check('month between 1 and 12');
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
