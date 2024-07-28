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
        Schema::create('appointments', function (Blueprint $table) {
            $table->id('apptId');
            $table->unsignedBigInteger('patientId');
            $table->date('apptDate');
            $table->unsignedBigInteger('apptCategoryId');
            $table->string('patientNote');
            $table->timestamps();

            $table->foreign('patientId')->references('patientId')->on('patients');
            $table->foreign('apptCategoryId')->references('apptCategoryId')->on('appointment_categories');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
