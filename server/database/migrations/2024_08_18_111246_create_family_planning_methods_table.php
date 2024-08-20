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
        Schema::create('family_planning_methods', function (Blueprint $table) {
            $table->id('method_id');
            $table->string('method_name');
            $table->foreignId('parent_method_id')->nullable()->constrained('family_planning_methods', 'method_id')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('family_planning_methods');
    }
};
