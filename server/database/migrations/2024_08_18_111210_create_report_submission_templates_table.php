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
        Schema::create('report_submission_templates', function (Blueprint $table) {
            $table->id('report_submission_template_id');
            $table->foreignId('admin_id')->constrained('users', 'user_id');
            $table->enum('report_type', ['m1', 'm2']);
            $table->tinyInteger('report_month')->check('report_month BETWEEN 1 AND 12');
            $table->year('report_year');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_submission_templates');
    }
};
