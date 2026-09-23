<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name', 50);
            $table->integer('grade_level');
            $table->string('room_number', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('admission_number', 50)->unique();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->date('date_of_birth');
            $table->string('guardian_name', 150)->nullable();
            $table->string('guardian_phone', 50)->nullable();
            $table->string('guardian_email', 255)->nullable();
            $table->integer('cumulative_demerits')->default(0);
            $table->enum('status', ['ACTIVE', 'ON_PROBATION', 'SUSPENDED', 'EXPELLED', 'GRADUATED'])->default('ACTIVE');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
        Schema::dropIfExists('classes');
    }
};
