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
        Schema::create('report_statuses', function (Blueprint $table) {
            $table->id('report_status_id');
            $table->foreignId('report_submission_id')->constrained('report_submissions', 'report_submission_id');
            $table->foreignId('user_id')->constrained('users', 'user_id');
            $table->enum('status', ['pending', 'overdue', 'for verification', 'approved', 'rejected']);
            $table->timestamp('submitted_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_statuses');
    }
};
