<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin & Disciplinary Officer Users
        $adminId = (string) Str::uuid();
        $deanId = (string) Str::uuid();
        $teacherId = (string) Str::uuid();

        DB::table('users')->insert([
            [
                'id' => $adminId,
                'name' => 'System Administrator',
                'email' => 'admin@school.edu',
                'password_hash' => Hash::make('Password123!'),
                'role' => 'ADMIN',
                'phone' => '+1-555-0100',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $deanId,
                'name' => 'Dr. Marcus Vance (Dean)',
                'email' => 'dean.vance@school.edu',
                'password_hash' => Hash::make('Password123!'),
                'role' => 'DISCIPLINARY_OFFICER',
                'phone' => '+1-555-0101',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $teacherId,
                'name' => 'Sarah Jenkins',
                'email' => 's.jenkins@school.edu',
                'password_hash' => Hash::make('Password123!'),
                'role' => 'TEACHER',
                'phone' => '+1-555-0102',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // 2. Class & Students
        $classId = (string) Str::uuid();
        DB::table('classes')->insert([
            'id' => $classId,
            'name' => 'Grade 10-Beta',
            'grade_level' => 10,
            'room_number' => 'Room 204',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $studentId = (string) Str::uuid();
        DB::table('students')->insert([
            'id' => $studentId,
            'admission_number' => 'STU-2026-001',
            'class_id' => $classId,
            'first_name' => 'Alex',
            'last_name' => 'Rivera',
            'date_of_birth' => '2010-04-12',
            'guardian_name' => 'Carlos Rivera',
            'guardian_phone' => '+1-555-0191',
            'guardian_email' => 'carlos.rivera@example.com',
            'cumulative_demerits' => 20,
            'status' => 'ON_PROBATION',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Offence Categories
        $offenceCategories = [
            ['code' => 'UNIFORM_VIOLATION', 'name' => 'Dress Code Violation', 'severity' => 'MINOR', 'default_demerit_points' => 5],
            ['code' => 'TARDINESS_UNEXCUSED', 'name' => 'Chronic Tardiness', 'severity' => 'MINOR', 'default_demerit_points' => 5],
            ['code' => 'CLASSROOM_DISRUPTION', 'name' => 'Disruptive Behavior', 'severity' => 'MODERATE', 'default_demerit_points' => 15],
            ['code' => 'ACADEMIC_DISHONESTY', 'name' => 'Cheating / Plagiarism', 'severity' => 'MAJOR', 'default_demerit_points' => 30],
            ['code' => 'PHYSICAL_ALTERCATION', 'name' => 'Fighting / Assault', 'severity' => 'CRITICAL', 'default_demerit_points' => 50],
        ];

        foreach ($offenceCategories as $cat) {
            DB::table('offence_categories')->insert([
                'id' => (string) Str::uuid(),
                'code' => $cat['code'],
                'name' => $cat['name'],
                'severity' => $cat['severity'],
                'default_demerit_points' => $cat['default_demerit_points'],
                'description' => "Standard policy for {$cat['name']}",
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
