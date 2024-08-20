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
        Schema::create('report_submissions', function (Blueprint $table) {
            $table->id('report_submission_id');
            $table->foreignId('report_submission_template_id')->constrained('report_submission_templates', 'report_submission_template_id');
            $table->foreignId('barangay_id')->constrained('barangays', 'barangay_id');
            $table->enum('status', ['pending', 'submitted', 'submitted late'])->default('pending');
            $table->date('due_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_submissions');
    }
};
