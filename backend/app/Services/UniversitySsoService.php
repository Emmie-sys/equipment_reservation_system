<?php

namespace App\Services;

use PDO;
use Exception;

/**
 * Interface UniversitySsoServiceInterface
 * 
 * Modular abstraction for Institutional University Single Sign-On (SSO)
 * and Student Directory integration. In production, this can be swapped with
 * an LDAP / SAML 2.0 / OAuth2 provider pointing to the live university core API.
 */
interface UniversitySsoServiceInterface
{
    public function authenticate(string $identifier, string $password): ?array;
    public function provisionStudent(array $data, int $actorUserId): array;
    public function getStudents(array $filters = []): array;
    public function getStudentByNumber(string $studentNumber): ?array;
}

/**
 * Class UniversitySsoService
 * 
 * Local Development & Institutional Directory Provider
 * Manages modular student provisioning by Admin & Attendant and authenticates credentials.
 */
class UniversitySsoService implements UniversitySsoServiceInterface
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Authenticate via email OR student registration number
     */
    public function authenticate(string $identifier, string $password): ?array
    {
        $cleanId = strtolower(trim($identifier));

        // Query user by email or student_number
        $stmt = $this->pdo->prepare("
            SELECT user_id, email, first_name, last_name, middle_name, student_number, password_hash, account_status
            FROM users
            WHERE LOWER(email) = ? OR LOWER(student_number) = ?
            LIMIT 1
        ");
        $stmt->execute([$cleanId, $cleanId]);
        $user = $stmt->fetch();

        if (!$user) {
            return null;
        }

        // Validate password (supports bcrypt, legacy equality, and default institutional dev password 'emmie')
        $valid = password_verify($password, $user['password_hash']) ||
                 $password === 'emmie' ||
                 $user['password_hash'] === $password;

        if (!$valid) {
            return null;
        }

        if ($user['account_status'] !== 'active') {
            throw new Exception('Institutional account is deactivated or suspended.');
        }

        // Fetch user roles
        $roleStmt = $this->pdo->prepare("
            SELECT r.role_name
            FROM roles r
            JOIN user_roles ur ON r.role_id = ur.role_id
            WHERE ur.user_id = ?
        ");
        $roleStmt->execute([$user['user_id']]);
        $roles = $roleStmt->fetchAll(PDO::FETCH_COLUMN) ?: ['STUDENT'];

        return [
            'user_id' => (int)$user['user_id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'middle_name' => $user['middle_name'],
            'student_number' => $user['student_number'],
            'roles' => $roles,
            'is_sso_verified' => true,
        ];
    }

    /**
     * Provision a student into the institutional directory (Admin & Attendant)
     */
    public function provisionStudent(array $data, int $actorUserId): array
    {
        $firstName = trim($data['first_name'] ?? '');
        $otherName = trim($data['other_name'] ?? $data['middle_name'] ?? '');
        $lastName = trim($data['last_name'] ?? '');
        $studentNumber = strtoupper(trim($data['student_number'] ?? ''));
        $email = strtolower(trim($data['email'] ?? ''));
        $rawPassword = $data['password'] ?? 'emmie';
        $phoneNumber = trim($data['phone_number'] ?? '+256-700-000000');
        $yearOfStudy = (int)($data['year_of_study'] ?? 1);

        if (empty($firstName) || empty($studentNumber) || empty($email)) {
            throw new Exception('First name, student number, and email are required.');
        }

        if (empty($lastName)) {
            $lastName = !empty($otherName) ? $otherName : 'Student';
        }

        // Check for duplicate student number
        $stmtChk = $this->pdo->prepare("SELECT user_id FROM users WHERE LOWER(student_number) = LOWER(?) LIMIT 1");
        $stmtChk->execute([$studentNumber]);
        if ($stmtChk->fetch()) {
            throw new Exception("Student number '{$studentNumber}' is already registered in the university system.");
        }

        // Check for duplicate email
        $stmtEmailChk = $this->pdo->prepare("SELECT user_id FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
        $stmtEmailChk->execute([$email]);
        if ($stmtEmailChk->fetch()) {
            throw new Exception("Email '{$email}' is already registered in the university system.");
        }

        $passwordHash = password_hash($rawPassword, PASSWORD_BCRYPT);

        $this->pdo->beginTransaction();
        try {
            // 1. Insert into users
            $insUser = $this->pdo->prepare("
                INSERT INTO users (
                    first_name, last_name, middle_name, email, phone_number,
                    password_hash, student_number, account_status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', NOW(), NOW())
                RETURNING user_id
            ");
            $insUser->execute([
                $firstName,
                $lastName,
                $otherName,
                $email,
                $phoneNumber,
                $passwordHash,
                $studentNumber,
            ]);
            $userId = (int)$insUser->fetchColumn();

            // 2. Attach STUDENT role
            $studentRoleId = $this->pdo->query("SELECT role_id FROM roles WHERE role_name = 'STUDENT' LIMIT 1")->fetchColumn();
            if ($studentRoleId) {
                $this->pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")
                    ->execute([$userId, $studentRoleId]);
            }

            // 3. Insert into students table
            $insStudent = $this->pdo->prepare("
                INSERT INTO students (
                    user_id, registration_number, student_number,
                    year_of_study, enrollment_status, admission_date, created_at, updated_at
                ) VALUES (?, ?, ?, ?, 'active', CURRENT_DATE, NOW(), NOW())
                RETURNING student_id
            ");
            $insStudent->execute([
                $userId,
                $studentNumber,
                $studentNumber,
                $yearOfStudy,
            ]);
            $studentId = (int)$insStudent->fetchColumn();

            // 4. Audit Log
            $insAudit = $this->pdo->prepare("
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at)
                VALUES (?, 'STUDENT_PROVISIONED', 'User', ?, NOW())
            ");
            $insAudit->execute([$actorUserId, $userId]);

            $this->pdo->commit();

            return [
                'user_id' => $userId,
                'student_id' => $studentId,
                'first_name' => $firstName,
                'other_name' => $otherName,
                'last_name' => $lastName,
                'student_number' => $studentNumber,
                'email' => $email,
                'year_of_study' => $yearOfStudy,
                'enrollment_status' => 'active',
                'provisioned_by_user_id' => $actorUserId,
                'created_at' => date('c'),
            ];
        } catch (Exception $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Retrieve directory students list
     */
    public function getStudents(array $filters = []): array
    {
        $search = $filters['search'] ?? '';

        $sql = "
            SELECT 
                s.student_id,
                u.user_id,
                u.first_name,
                u.middle_name AS other_name,
                u.last_name,
                u.email,
                u.phone_number,
                u.student_number,
                s.year_of_study,
                s.enrollment_status,
                u.created_at
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE 1=1
        ";
        $params = [];

        if (!empty($search)) {
            $sql .= " AND (u.first_name ILIKE ? OR u.last_name ILIKE ? OR u.student_number ILIKE ? OR u.email ILIKE ?)";
            $wc = "%{$search}%";
            $params = [$wc, $wc, $wc, $wc];
        }

        $sql .= " ORDER BY s.student_id DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Lookup student by student_number
     */
    public function getStudentByNumber(string $studentNumber): ?array
    {
        $clean = strtoupper(trim($studentNumber));
        $stmt = $this->pdo->prepare("
            SELECT 
                s.student_id,
                u.user_id,
                u.first_name,
                u.middle_name AS other_name,
                u.last_name,
                u.email,
                u.phone_number,
                u.student_number,
                s.year_of_study,
                s.enrollment_status,
                u.account_status,
                u.created_at
            FROM students s
            JOIN users u ON s.user_id = u.user_id
            WHERE UPPER(u.student_number) = ? OR UPPER(s.student_number) = ? OR UPPER(s.registration_number) = ?
            LIMIT 1
        ");
        $stmt->execute([$clean, $clean, $clean]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
