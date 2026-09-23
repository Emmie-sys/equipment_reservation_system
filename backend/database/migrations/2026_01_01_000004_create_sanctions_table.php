<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sanctions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('incident_id')->constrained('incidents')->cascadeOnDelete();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('assigned_by')->constrained('users')->restrictOnDelete();
            $table->enum('sanction_type', [
                'VERBAL_WARNING',
                'WRITTEN_REPRIMAND',
                'AFTER_SCHOOL_DETENTION',
                'COMMUNITY_SERVICE',
                'PARENTAL_CONFERENCE',
                'IN_SCHOOL_SUSPENSION',
                'OUT_OF_SCHOOL_SUSPENSION',
                'EXPULSION_RECOMMENDATION',
            ]);
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['PROPOSED', 'ACTIVE', 'COMPLETED', 'APPEALED', 'OVERTURNED', 'CANCELLED'])->default('ACTIVE');
            $table->text('completion_notes')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('demerit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignUuid('incident_id')->nullable()->constrained('incidents')->nullOnDelete();
            $table->integer('points_delta');
            $table->integer('running_balance');
            $table->text('reason');
            $table->foreignUuid('authorized_by')->constrained('users')->restrictOnDelete();
            $table->timestampTz('created_at')->useCurrent();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 100);
            $table->uuid('entity_id');
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('demerit_logs');
        Schema::dropIfExists('sanctions');
    }
};
