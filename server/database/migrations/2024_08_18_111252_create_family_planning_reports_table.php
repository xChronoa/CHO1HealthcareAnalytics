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
            $table->id('report_id');
            $table->foreignId('age_category_id')->constrained('age_categories', 'age_category_id');
            $table->foreignId('fp_method_id')->constrained('family_planning_methods', 'method_id');
            $table->integer('current_users_beginning_month');
            $table->integer('new_acceptors_prev_month');
            $table->integer('other_acceptors_present_month');
            $table->integer('drop_outs_present_month');
            $table->integer('current_users_end_month');
            $table->integer('new_acceptors_present_month');
            $table->foreignId('report_status_id')->constrained('report_statuses', 'report_status_id');
            $table->timestamps();
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
