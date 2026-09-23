<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offence_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code', 30)->unique();
            $table->string('name', 150);
            $table->enum('severity', ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'])->default('MINOR');
            $table->integer('default_demerit_points')->default(5);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('incident_number', 50)->unique();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('reporter_id')->constrained('users')->restrictOnDelete();
            $table->foreignUuid('category_id')->constrained('offence_categories')->restrictOnDelete();
            $table->uuid('term_id')->nullable();
            $table->string('title', 200);
            $table->text('description');
            $table->string('location', 150);
            $table->timestampTz('occurred_at');
            $table->enum('severity', ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']);
            $table->integer('demerit_points_awarded')->default(0);
            $table->enum('status', ['DRAFT', 'PENDING_REVIEW', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED', 'ESCALATED'])->default('PENDING_REVIEW');
            $table->text('investigation_notes')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestampTz('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
        Schema::dropIfExists('offence_categories');
    }
};
