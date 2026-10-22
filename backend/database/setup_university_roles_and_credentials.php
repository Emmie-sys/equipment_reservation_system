<?php
/**
 * Setup University Roles, Testing Credentials, and Realistic Data
 * Equipment Reservation System
 */

$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '5432';
$dbName = getenv('DB_DATABASE') ?: 'equipment_reservation_system';
$dbUser = getenv('DB_USERNAME') ?: 'postgres';
$dbPass = getenv('DB_PASSWORD') ?: 'emmie';

$pdo = new PDO(
    "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName}",
    $dbUser,
    $dbPass,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);

echo "[1/5] Ensuring Database Columns & Roles...\n";

// Ensure student_number exists and relax constraints for direct provisioning
$pdo->exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS student_number VARCHAR(64) UNIQUE");
$pdo->exec("ALTER TABLE students ADD COLUMN IF NOT EXISTS student_number VARCHAR(64) UNIQUE");
$pdo->exec("ALTER TABLE students ALTER COLUMN program_id DROP NOT NULL");

// Upsert Roles: ADMIN, ATTENDANT, LECTURER, STUDENT
$roles = [
    ['ADMIN', 'Institutional System Administrator with full operational governance'],
    ['ATTENDANT', 'Equipment Lab Attendant managing physical dispatch, check-in, checkout, and returns'],
    ['LECTURER', 'Academic Faculty & Course Lecturer conducting lectures, lab practicals, and research'],
    ['STUDENT', 'Enrolled Student & Class Representative reserving equipment for cohort coursework'],
    ['STAFF', 'Legacy Faculty Alias'],
    ['TECHNICIAN', 'Legacy Lab Attendant Alias'],
];

foreach ($roles as [$name, $desc]) {
    $stmt = $pdo->prepare("
        INSERT INTO roles (role_name, description)
        VALUES (?, ?)
        ON CONFLICT (role_name) DO UPDATE SET description = EXCLUDED.description
    ");
    $stmt->execute([$name, $desc]);
}

echo "[2/5] Seeding Exact Testing Users (Password: emmie)...\n";

$passwordHash = password_hash('emmie', PASSWORD_BCRYPT);

$users = [
    [
        'email' => 'admin@gu.ac.ug',
        'first_name' => 'Institutional',
        'last_name' => 'Admin',
        'middle_name' => 'Gulu',
        'phone_number' => '+256-772-001001',
        'role' => 'ADMIN',
        'student_number' => null,
    ],
    [
        'email' => 'attendant@gu.ac.ug',
        'first_name' => 'Equipment',
        'last_name' => 'Attendant',
        'middle_name' => 'Lab',
        'phone_number' => '+256-772-002002',
        'role' => 'ATTENDANT',
        'student_number' => null,
    ],
    [
        'email' => 'lecturer@gu.ac.ug',
        'first_name' => 'Dr. Sarah',
        'last_name' => 'Okello',
        'middle_name' => 'Akello',
        'phone_number' => '+256-772-003003',
        'role' => 'LECTURER',
        'student_number' => null,
    ],
    [
        'email' => 'student@gmail.com',
        'first_name' => 'Emmanuel',
        'last_name' => 'Mugisha',
        'middle_name' => 'ClassRep',
        'phone_number' => '+256-772-004004',
        'role' => 'STUDENT',
        'student_number' => 'GU/2026/BIT/042',
    ],
];

foreach ($users as $u) {
    // Check if user exists by email
    $chk = $pdo->prepare("SELECT user_id FROM users WHERE LOWER(email) = LOWER(?)");
    $chk->execute([$u['email']]);
    $existing = $chk->fetch();

    if ($existing) {
        $userId = $existing['user_id'];
        $upd = $pdo->prepare("
            UPDATE users SET
                first_name = ?,
                last_name = ?,
                middle_name = ?,
                phone_number = ?,
                password_hash = ?,
                student_number = ?,
                account_status = 'active',
                updated_at = NOW()
            WHERE user_id = ?
        ");
        $upd->execute([
            $u['first_name'],
            $u['last_name'],
            $u['middle_name'],
            $u['phone_number'],
            $passwordHash,
            $u['student_number'],
            $userId,
        ]);
    } else {
        $ins = $pdo->prepare("
            INSERT INTO users (
                first_name, last_name, middle_name, email, phone_number,
                password_hash, student_number, account_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
            RETURNING user_id
        ");
        $ins->execute([
            $u['first_name'],
            $u['last_name'],
            $u['middle_name'],
            $u['email'],
            $u['phone_number'],
            $passwordHash,
            $u['student_number'],
        ]);
        $userId = $ins->fetchColumn();
    }

    // Role mapping
    $roleId = $pdo->query("SELECT role_id FROM roles WHERE role_name = '{$u['role']}' LIMIT 1")->fetchColumn();
    if ($roleId) {
        // Clear previous roles
        $pdo->prepare("DELETE FROM user_roles WHERE user_id = ?")->execute([$userId]);
        // Insert new role
        $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$userId, $roleId]);
    }

    // If student, link to students table
    if ($u['role'] === 'STUDENT') {
        $stdChk = $pdo->prepare("SELECT student_id FROM students WHERE user_id = ?");
        $stdChk->execute([$userId]);
        $existingStd = $stdChk->fetch();

        if ($existingStd) {
            $pdo->prepare("
                UPDATE students SET
                    registration_number = ?,
                    student_number = ?,
                    enrollment_status = 'active',
                    year_of_study = 3,
                    updated_at = NOW()
                WHERE user_id = ?
            ")->execute([$u['student_number'], $u['student_number'], $userId]);
        } else {
            $pdo->prepare("
                INSERT INTO students (
                    user_id, registration_number, student_number,
                    year_of_study, enrollment_status, admission_date, created_at, updated_at
                ) VALUES (?, ?, ?, 3, 'active', '2023-09-01', NOW(), NOW())
            ")->execute([$userId, $u['student_number'], $u['student_number']]);
        }
    }

    echo "  -> Seeded User: {$u['email']} [Role: {$u['role']}] ID #{$userId}\n";
}

echo "[3/5] Seeding Realistic University Reservations for Testing...\n";

// Get user IDs
$studentId = $pdo->query("SELECT user_id FROM users WHERE email = 'student@gmail.com'")->fetchColumn();
$lecturerId = $pdo->query("SELECT user_id FROM users WHERE email = 'lecturer@gu.ac.ug'")->fetchColumn();
$attendantId = $pdo->query("SELECT user_id FROM users WHERE email = 'attendant@gu.ac.ug'")->fetchColumn();

// Purpose Type ID
$purposeTypeId = $pdo->query("SELECT purpose_type_id FROM reservation_purpose_types LIMIT 1")->fetchColumn() ?: 6;

// Status IDs
$pendingStatus = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'pending'")->fetchColumn() ?: 1;
$approvedStatus = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'approved'")->fetchColumn() ?: 2;
$activeStatus = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'active'")->fetchColumn() ?: 4;
$completedStatus = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'completed'")->fetchColumn() ?: 5;

// Equipment units with model_id
$equipments = $pdo->query("SELECT equipment_id, model_id FROM equipment LIMIT 6")->fetchAll();

if (!empty($equipments)) {
    // 1. Lecturer Course Reservation (Approved, ready for pickup by attendant)
    $lecturerRes = $pdo->prepare("
        INSERT INTO reservations (
            requested_by_user_id, purpose_type_id, purpose_details, status_id,
            requested_start_datetime, requested_end_datetime, submitted_at
        ) VALUES (?, ?, 'CSC 312 Database Systems Practical Lab - Projector & Signal Kits', ?, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', NOW())
        RETURNING reservation_id
    ");
    $lecturerRes->execute([$lecturerId, $purposeTypeId, $approvedStatus]);
    $lResId = $lecturerRes->fetchColumn();

    $pdo->prepare("INSERT INTO reservation_items (reservation_id, model_id, equipment_id, quantity_requested, line_status) VALUES (?, ?, ?, 1, 'allocated')")
        ->execute([$lResId, $equipments[0]['model_id'], $equipments[0]['equipment_id']]);

    // 2. Student / Class Rep Reservation (Active loan - currently in use with countdown)
    $studentRes = $pdo->prepare("
        INSERT INTO reservations (
            requested_by_user_id, purpose_type_id, purpose_details, status_id,
            requested_start_datetime, requested_end_datetime, submitted_at
        ) VALUES (?, ?, 'BIT Year 3 Class Seminar Presentation - Audio Kit & Laser Projector', ?, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 hours', NOW() - INTERVAL '2 hours')
        RETURNING reservation_id
    ");
    $studentRes->execute([$studentId, $purposeTypeId, $activeStatus]);
    $sResId = $studentRes->fetchColumn();

    if (isset($equipments[1])) {
        $pdo->prepare("INSERT INTO reservation_items (reservation_id, model_id, equipment_id, quantity_requested, line_status) VALUES (?, ?, ?, 1, 'checked_out')")
            ->execute([$sResId, $equipments[1]['model_id'], $equipments[1]['equipment_id']]);
    }

    // 3. Pending reservation awaiting approval/dispatch
    $pendingRes = $pdo->prepare("
        INSERT INTO reservations (
            requested_by_user_id, purpose_type_id, purpose_details, status_id,
            requested_start_datetime, requested_end_datetime, submitted_at
        ) VALUES (?, ?, 'Faculty of Science & Computing Robotics Fieldwork Sensors', ?, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 4 hours', NOW())
        RETURNING reservation_id
    ");
    $pendingRes->execute([$lecturerId, $purposeTypeId, $pendingStatus]);
    $pResId = $pendingRes->fetchColumn();

    if (isset($equipments[2])) {
        $pdo->prepare("INSERT INTO reservation_items (reservation_id, model_id, equipment_id, quantity_requested, line_status) VALUES (?, ?, ?, 1, 'pending')")
            ->execute([$pResId, $equipments[2]['model_id'], $equipments[2]['equipment_id']]);
    }
}

echo "[4/5] Verification of All Testing Accounts...\n";

$verify = $pdo->query("
    SELECT u.user_id, u.email, u.first_name, u.last_name, u.student_number, r.role_name
    FROM users u
    JOIN user_roles ur ON u.user_id = ur.user_id
    JOIN roles r ON ur.role_id = r.role_id
    WHERE u.email IN ('admin@gu.ac.ug', 'attendant@gu.ac.ug', 'lecturer@gu.ac.ug', 'student@gmail.com')
    ORDER BY u.user_id ASC
")->fetchAll();

foreach ($verify as $row) {
    echo "  [OK] {$row['email']} -> Role: {$row['role_name']}, Name: {$row['first_name']} {$row['last_name']}" . 
         ($row['student_number'] ? " (Student No: {$row['student_number']})" : "") . "\n";
}

echo "[5/5] University Setup Completed Successfully!\n";
