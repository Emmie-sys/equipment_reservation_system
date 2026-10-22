<?php
/**
 * Institutional Equipment Reservation System — API Front Controller
 * Zero-dependency standalone REST dispatcher connecting to PostgreSQL
 */

// ─── 1. CORS & Preflight ───────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ─── 2. Database Connection ───────────────────────────────────────────────────
$dbHost = getenv('DB_HOST') ?: '127.0.0.1';
$dbPort = getenv('DB_PORT') ?: '5432';
$dbName = getenv('DB_DATABASE') ?: 'equipment_reservation_system';
$dbUser = getenv('DB_USERNAME') ?: 'postgres';
$dbPass = getenv('DB_PASSWORD') ?: 'emmie';

try {
    $pdo = new PDO(
        "pgsql:host={$dbHost};port={$dbPort};dbname={$dbName}",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $e->getMessage(),
    ]);
    exit;
}

// ─── 3. Modular University SSO & Directory Service ────────────────────────────
require_once __DIR__ . '/../app/Services/UniversitySsoService.php';
use App\Services\UniversitySsoService;
$ssoService = new UniversitySsoService($pdo);

// ─── 4. Request Helpers ────────────────────────────────────────────────────────
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true) ?? [];

// Helper to send JSON responses
function sendResponse(int $statusCode, bool $success, string $message, $data = null, $meta = null, $errors = null) {
    http_response_code($statusCode);
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) $response['data'] = $data;
    if ($meta !== null) $response['meta'] = $meta;
    if ($errors !== null) $response['errors'] = $errors;
    echo json_encode($response);
    exit;
}

// Helper to extract Bearer token & verify user
function getAuthenticatedUser($pdo) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        // Token is formatted as b64(user_id:email)
        $decoded = base64_decode($token, true);
        if ($decoded && str_contains($decoded, ':')) {
            [$userId, $email] = explode(':', $decoded, 2);
            $stmt = $pdo->prepare("SELECT user_id, email, first_name, last_name, student_number, account_status FROM users WHERE user_id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            if ($user && $user['account_status'] === 'active') {
                // Fetch user roles
                $roleStmt = $pdo->prepare("
                    SELECT r.role_name 
                    FROM roles r 
                    JOIN user_roles ur ON r.role_id = ur.role_id 
                    WHERE ur.user_id = ?
                ");
                $roleStmt->execute([$user['user_id']]);
                $user['roles'] = $roleStmt->fetchAll(PDO::FETCH_COLUMN) ?: ['STUDENT'];
                return $user;
            }
        }
    }
    // Fallback default admin user for development if no token provided
    $stmt = $pdo->query("SELECT user_id, email, first_name, last_name, student_number, account_status FROM users WHERE email = 'admin@gu.ac.ug' OR email = 'admin@school.edu' LIMIT 1");
    $user = $stmt->fetch();
    if ($user) {
        $user['roles'] = ['ADMIN'];
        return $user;
    }
    return null;
}

// ─── 4. Router Dispatch ────────────────────────────────────────────────────────

// Health Check
if ($requestUri === '/' || $requestUri === '/api/v1/health') {
    sendResponse(200, true, 'Equipment Reservation API is online and operational.', [
        'service' => 'Institutional Equipment Reservation System',
        'version' => '1.0.0',
        'database' => 'PostgreSQL 16',
        'status' => 'healthy',
        'timestamp' => date('c'),
    ]);
}

// ── Dashboard Stats ───────────────────────────────────────────────────────────
if ($requestUri === '/api/v1/dashboard/stats' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    $actorRoles = $actor ? array_map('strtoupper', $actor['roles'] ?? []) : ['STUDENT'];
    $isPrivileged = in_array('ADMIN', $actorRoles) || in_array('ATTENDANT', $actorRoles) || in_array('TECHNICIAN', $actorRoles);
    $stats = [];

    // Count of equipment ready for booking (unbooked and active)
    $availableFleetQuery = "
        SELECT COUNT(*) FROM equipment e
        JOIN equipment_status_types est ON e.status_id = est.status_id
        WHERE est.status_name = 'available' AND e.is_bookable = TRUE
          AND e.equipment_id NOT IN (
              SELECT DISTINCT ri.equipment_id FROM reservation_items ri
              JOIN reservations res ON ri.reservation_id = res.reservation_id
              JOIN reservation_status_types rst ON res.status_id = rst.status_id
              WHERE ri.equipment_id IS NOT NULL AND rst.status_name IN ('pending', 'approved', 'active')
                AND res.requested_end_datetime >= NOW()
          )
    ";
    $stats['available_equipment'] = (int)$pdo->query($availableFleetQuery)->fetchColumn();

    if (!$isPrivileged && $actor) {
        // ── STUDENT & LECTURER: Isolated Personal Overview ──────────────────────
        $userId = (int)$actor['user_id'];
        $stats['is_personal_overview'] = true;
        $stats['user_id'] = $userId;
        $stats['user_name'] = trim(($actor['first_name'] ?? '') . ' ' . ($actor['last_name'] ?? ''));
        $stats['student_number'] = $actor['student_number'] ?? null;

        $myTotal = $pdo->prepare("SELECT COUNT(*) FROM reservations WHERE requested_by_user_id = ?");
        $myTotal->execute([$userId]);
        $stats['total_reservations'] = (int)$myTotal->fetchColumn();
        $stats['my_total_reservations'] = $stats['total_reservations'];

        $myActive = $pdo->prepare("
            SELECT COUNT(*) FROM reservations r
            JOIN reservation_status_types rst ON r.status_id = rst.status_id
            WHERE r.requested_by_user_id = ? AND rst.status_name IN ('approved', 'active')
        ");
        $myActive->execute([$userId]);
        $stats['active_reservations'] = (int)$myActive->fetchColumn();
        $stats['my_active_reservations'] = $stats['active_reservations'];

        $myPending = $pdo->prepare("
            SELECT COUNT(*) FROM reservations r
            JOIN reservation_status_types rst ON r.status_id = rst.status_id
            WHERE r.requested_by_user_id = ? AND rst.status_name = 'pending'
        ");
        $myPending->execute([$userId]);
        $stats['pending_reservations'] = (int)$myPending->fetchColumn();
        $stats['my_pending_reservations'] = $stats['pending_reservations'];

        $myCompleted = $pdo->prepare("
            SELECT COUNT(*) FROM reservations r
            JOIN reservation_status_types rst ON r.status_id = rst.status_id
            WHERE r.requested_by_user_id = ? AND rst.status_name = 'completed'
        ");
        $myCompleted->execute([$userId]);
        $stats['completed_reservations'] = (int)$myCompleted->fetchColumn();

        $myRecentStmt = $pdo->prepare("
            SELECT r.reservation_id, r.submitted_at, r.requested_start_datetime, r.requested_end_datetime,
                   rst.status_name, u.first_name, u.last_name,
                   e.asset_tag, em.model_name
            FROM reservations r
            LEFT JOIN reservation_status_types rst ON r.status_id = rst.status_id
            LEFT JOIN users u ON r.requested_by_user_id = u.user_id
            LEFT JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN equipment e ON ri.equipment_id = e.equipment_id
            LEFT JOIN equipment_models em ON e.model_id = em.model_id
            WHERE r.requested_by_user_id = ?
            ORDER BY r.reservation_id DESC
            LIMIT 5
        ");
        $myRecentStmt->execute([$userId]);
        $stats['recent_bookings'] = $myRecentStmt->fetchAll();

        $popularStmt = $pdo->query("
            SELECT em.model_name, em.manufacturer, COUNT(ri.reservation_id) AS reservation_count,
                   e.asset_tag
            FROM reservation_items ri
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN equipment_models em ON e.model_id = em.model_id
            GROUP BY em.model_name, em.manufacturer, e.asset_tag
            ORDER BY reservation_count DESC
            LIMIT 5
        ");
        $stats['popular_equipment'] = $popularStmt->fetchAll();

    } else {
        // ── ATTENDANT & ADMIN: Operational & Institutional Overview ─────────────
        $stats['is_personal_overview'] = false;
        $stats['total_equipment'] = (int)$pdo->query("SELECT COUNT(*) FROM equipment")->fetchColumn();

        $stats['pending_reservations'] = (int)$pdo->query("
            SELECT COUNT(*) FROM reservations r
            JOIN reservation_status_types rst ON r.status_id = rst.status_id
            WHERE rst.status_name = 'pending'
        ")->fetchColumn();

        $stats['active_reservations'] = (int)$pdo->query("
            SELECT COUNT(*) FROM reservations r
            JOIN reservation_status_types rst ON r.status_id = rst.status_id
            WHERE rst.status_name IN ('approved', 'active')
        ")->fetchColumn();

        $stats['reservations_today'] = (int)$pdo->query("
            SELECT COUNT(*) FROM reservations
            WHERE DATE(submitted_at) = CURRENT_DATE
        ")->fetchColumn();

        $stats['in_maintenance'] = (int)$pdo->query("
            SELECT COUNT(*) FROM equipment e
            JOIN equipment_status_types est ON e.status_id = est.status_id
            WHERE est.status_name = 'maintenance'
        ")->fetchColumn();

        $stats['faulty_equipment'] = (int)$pdo->query("
            SELECT COUNT(*) FROM equipment e
            JOIN equipment_status_types est ON e.status_id = est.status_id
            WHERE est.status_name IN ('maintenance', 'faulty', 'retired', 'damaged') OR e.is_bookable = FALSE
        ")->fetchColumn();

        $stats['total_users'] = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();

        $recentStmt = $pdo->query("
            SELECT r.reservation_id, r.submitted_at, r.requested_start_datetime, r.requested_end_datetime,
                   rst.status_name, u.first_name, u.last_name,
                   e.asset_tag, em.model_name
            FROM reservations r
            LEFT JOIN reservation_status_types rst ON r.status_id = rst.status_id
            LEFT JOIN users u ON r.requested_by_user_id = u.user_id
            LEFT JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
            LEFT JOIN equipment e ON ri.equipment_id = e.equipment_id
            LEFT JOIN equipment_models em ON e.model_id = em.model_id
            ORDER BY r.reservation_id DESC
            LIMIT 5
        ");
        $stats['recent_bookings'] = $recentStmt->fetchAll();

        $popularStmt = $pdo->query("
            SELECT em.model_name, em.manufacturer, COUNT(ri.reservation_id) AS reservation_count,
                   e.asset_tag
            FROM reservation_items ri
            JOIN equipment e ON ri.equipment_id = e.equipment_id
            JOIN equipment_models em ON e.model_id = em.model_id
            GROUP BY em.model_name, em.manufacturer, e.asset_tag
            ORDER BY reservation_count DESC
            LIMIT 5
        ");
        $stats['popular_equipment'] = $popularStmt->fetchAll();
    }

    sendResponse(200, true, 'Dashboard statistics retrieved.', $stats);
}

// ── Auth Routes (Modular University SSO Integration) ─────────────────────────
if (($requestUri === '/api/v1/auth/login' || $requestUri === '/api/v1/auth/sso-login') && $method === 'POST') {
    $identifier = trim($body['email'] ?? $body['student_number'] ?? $body['identifier'] ?? '');
    $password = $body['password'] ?? '';

    if (empty($identifier) || empty($password)) {
        sendResponse(422, false, 'Institutional email or student number and password are required.');
    }

    try {
        $authenticatedUser = $ssoService->authenticate($identifier, $password);
    } catch (Exception $e) {
        sendResponse(403, false, $e->getMessage());
    }

    if (!$authenticatedUser) {
        sendResponse(401, false, 'Invalid institutional credentials or password.');
    }

    $token = base64_encode("{$authenticatedUser['user_id']}:{$authenticatedUser['email']}");

    // Log audit
    $auditStmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'USER_LOGIN', 'User', ?, NOW())");
    $auditStmt->execute([$authenticatedUser['user_id'], $authenticatedUser['user_id']]);

    sendResponse(200, true, 'Login successful.', [
        'token' => $token,
        'token_type' => 'Bearer',
        'user' => [
            'user_id' => $authenticatedUser['user_id'],
            'email' => $authenticatedUser['email'],
            'first_name' => $authenticatedUser['first_name'],
            'last_name' => $authenticatedUser['last_name'],
            'middle_name' => $authenticatedUser['middle_name'] ?? null,
            'student_number' => $authenticatedUser['student_number'] ?? null,
            'roles' => $authenticatedUser['roles'],
            'is_sso_verified' => true,
        ],
    ]);
}

if ($requestUri === '/api/v1/auth/logout' && $method === 'POST') {
    sendResponse(200, true, 'Logged out successfully.');
}

if ($requestUri === '/api/v1/auth/me' && $method === 'GET') {
    $user = getAuthenticatedUser($pdo);
    if (!$user) sendResponse(401, false, 'Unauthenticated session.');
    sendResponse(200, true, 'User profile retrieved.', [
        'user_id' => $user['user_id'],
        'email' => $user['email'],
        'first_name' => $user['first_name'],
        'last_name' => $user['last_name'],
        'student_number' => $user['student_number'] ?? null,
        'display_name' => trim("{$user['first_name']} {$user['last_name']}"),
        'roles' => $user['roles'],
    ]);
}

// ── Student Directory & Provisioning Routes (Modular SSO Directory) ──────────
if ($requestUri === '/api/v1/students' && $method === 'GET') {
    $students = $ssoService->getStudents(['search' => $_GET['search'] ?? '']);
    sendResponse(200, true, 'University students directory retrieved.', $students, [
        'total' => count($students),
    ]);
}

if ($requestUri === '/api/v1/students' && $method === 'POST') {
    $user = getAuthenticatedUser($pdo);
    $allowed = !empty(array_intersect($user['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) {
        sendResponse(403, false, 'Access denied. Only Administrators and Equipment Attendants can provision students.');
    }

    try {
        $provisioned = $ssoService->provisionStudent($body, (int)$user['user_id']);
        sendResponse(201, true, 'Student successfully provisioned into the university directory.', $provisioned);
    } catch (Exception $e) {
        sendResponse(422, false, $e->getMessage());
    }
}

if (preg_match('#^/api/v1/students/([^/]+)$#', $requestUri, $matches) && $method === 'GET') {
    $stdNum = urldecode($matches[1]);
    $student = $ssoService->getStudentByNumber($stdNum);
    if (!$student) {
        sendResponse(404, false, "Student '{$stdNum}' not found in the university directory.");
    }

    // Include recent reservations
    $resStmt = $pdo->prepare("
        SELECT r.reservation_id, r.submitted_at, r.requested_start_datetime, r.requested_end_datetime,
               rst.status_name, em.model_name, e.asset_tag
        FROM reservations r
        JOIN reservation_status_types rst ON r.status_id = rst.status_id
        LEFT JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
        LEFT JOIN equipment e ON ri.equipment_id = e.equipment_id
        LEFT JOIN equipment_models em ON e.model_id = em.model_id
        WHERE r.requested_by_user_id = ?
        ORDER BY r.reservation_id DESC
        LIMIT 5
    ");
    $resStmt->execute([$student['user_id']]);
    $student['recent_reservations'] = $resStmt->fetchAll();

    sendResponse(200, true, 'Student record retrieved.', $student);
}

// ── Equipment Routes ──────────────────────────────────────────────────────────
if ($requestUri === '/api/v1/equipment' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    $actorRoles = $actor ? array_map('strtoupper', $actor['roles'] ?? []) : ['STUDENT'];
    $isPrivileged = in_array('ADMIN', $actorRoles) || in_array('ATTENDANT', $actorRoles) || in_array('TECHNICIAN', $actorRoles);

    $search = $_GET['search'] ?? '';
    $status = $_GET['status'] ?? '';
    // If exclude_booked param is explicitly supplied, respect it; otherwise default: non-privileged users exclude booked
    $excludeBooked = isset($_GET['exclude_booked'])
        ? filter_var($_GET['exclude_booked'], FILTER_VALIDATE_BOOLEAN)
        : (!$isPrivileged);

    $sql = "
        SELECT 
            e.equipment_id,
            e.model_id,
            e.asset_tag,
            e.serial_number,
            e.status_id,
            e.current_room_id,
            e.purchase_date,
            e.condition_notes,
            e.is_bookable,
            est.status_name,
            em.model_name,
            em.manufacturer,
            em.model_number,
            ec.category_name,
            r.room_code,
            b.building_name
        FROM equipment e
        LEFT JOIN equipment_status_types est ON e.status_id = est.status_id
        LEFT JOIN equipment_models em ON e.model_id = em.model_id
        LEFT JOIN equipment_categories ec ON em.category_id = ec.category_id
        LEFT JOIN rooms r ON e.current_room_id = r.room_id
        LEFT JOIN buildings b ON r.building_id = b.building_id
        WHERE 1=1
    ";
    $params = [];

    if ($excludeBooked) {
        // Students and Lecturers: Exclude equipment already booked or unavailable
        $sql .= " AND e.is_bookable = TRUE AND est.status_name = 'available' AND e.equipment_id NOT IN (
            SELECT DISTINCT ri.equipment_id FROM reservation_items ri
            JOIN reservations res ON ri.reservation_id = res.reservation_id
            JOIN reservation_status_types rst ON res.status_id = rst.status_id
            WHERE ri.equipment_id IS NOT NULL AND rst.status_name IN ('pending', 'approved', 'active')
              AND res.requested_end_datetime >= NOW()
        )";
    } elseif (!empty($status)) {
        // Privileged staff can filter by status or view all
        $sql .= " AND est.status_name = ?";
        $params[] = $status;
    }

    if (!empty($search)) {
        $sql .= " AND (e.asset_tag ILIKE ? OR em.model_name ILIKE ? OR em.manufacturer ILIKE ?)";
        $wildcard = "%{$search}%";
        $params[] = $wildcard;
        $params[] = $wildcard;
        $params[] = $wildcard;
    }
    $sql .= " ORDER BY e.equipment_id ASC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $raw = $stmt->fetchAll();

    $equipmentList = array_map(function($row) {
        return [
            'equipment_id' => (int)$row['equipment_id'],
            'model_id' => (int)$row['model_id'],
            'asset_tag' => $row['asset_tag'],
            'serial_number' => $row['serial_number'],
            'condition_notes' => $row['condition_notes'],
            'is_bookable' => (bool)$row['is_bookable'],
            'status' => [
                'status_id' => (int)$row['status_id'],
                'status_name' => $row['status_name'] ?? 'available',
            ],
            'model' => [
                'model_name' => $row['model_name'] ?? 'General Unit',
                'manufacturer' => $row['manufacturer'] ?? 'Department Equipment',
                'category' => [
                    'category_name' => $row['category_name'] ?? 'Hardware',
                ],
            ],
            'room' => $row['room_code'] ? [
                'room_code' => $row['room_code'],
                'building' => [
                    'building_name' => $row['building_name'] ?? 'Main Campus Depot',
                ],
            ] : null,
        ];
    }, $raw);

    sendResponse(200, true, 'Equipment catalog retrieved successfully.', $equipmentList, [
        'total_records' => count($equipmentList),
    ]);
}

// Equipment Availability Check
if (preg_match('#^/api/v1/equipment/(\d+)/availability$#', $requestUri, $matches) && $method === 'GET') {
    $equipmentId = (int)$matches[1];
    $startTime = $_GET['start_time'] ?? '';
    $endTime = $_GET['end_time'] ?? '';

    if (empty($startTime) || empty($endTime)) {
        sendResponse(422, false, 'start_time and end_time query parameters are required.');
    }

    $conflictStmt = $pdo->prepare("
        SELECT r.reservation_id, r.requested_start_datetime, r.requested_end_datetime, rst.status_name
        FROM reservation_items ri
        JOIN reservations r ON ri.reservation_id = r.reservation_id
        JOIN reservation_status_types rst ON r.status_id = rst.status_id
        WHERE ri.equipment_id = ?
          AND rst.status_name IN ('pending', 'approved', 'active')
          AND r.requested_start_datetime < ?
          AND r.requested_end_datetime > ?
        LIMIT 1
    ");
    $conflictStmt->execute([$equipmentId, $endTime, $startTime]);
    $conflict = $conflictStmt->fetch();

    sendResponse(200, true, 'Availability checked.', [
        'equipment_id' => $equipmentId,
        'is_available' => empty($conflict),
        'conflict' => $conflict ?: null,
    ]);
}

// Single Equipment GET
if (preg_match('#^/api/v1/equipment/(\d+)$#', $requestUri, $matches) && $method === 'GET') {
    $equipmentId = (int)$matches[1];

    $stmt = $pdo->prepare("
        SELECT
            e.equipment_id, e.model_id, e.asset_tag, e.serial_number,
            e.status_id, e.current_room_id, e.purchase_date, e.condition_notes,
            e.is_bookable,
            est.status_name,
            em.model_name, em.manufacturer, em.model_number, em.description,
            ec.category_name,
            r.room_code, r.room_name,
            b.building_name
        FROM equipment e
        LEFT JOIN equipment_status_types est ON e.status_id = est.status_id
        LEFT JOIN equipment_models em ON e.model_id = em.model_id
        LEFT JOIN equipment_categories ec ON em.category_id = ec.category_id
        LEFT JOIN rooms r ON e.current_room_id = r.room_id
        LEFT JOIN buildings b ON r.building_id = b.building_id
        WHERE e.equipment_id = ?
    ");
    $stmt->execute([$equipmentId]);
    $row = $stmt->fetch();

    if (!$row) {
        sendResponse(404, false, "Equipment unit #{$equipmentId} not found.");
    }

    sendResponse(200, true, 'Equipment unit retrieved.', [
        'equipment_id'   => (int)$row['equipment_id'],
        'model_id'       => (int)$row['model_id'],
        'asset_tag'      => $row['asset_tag'],
        'serial_number'  => $row['serial_number'],
        'condition_notes'=> $row['condition_notes'],
        'is_bookable'    => (bool)$row['is_bookable'],
        'purchase_date'  => $row['purchase_date'],
        'status' => [
            'status_id'   => (int)$row['status_id'],
            'status_name' => $row['status_name'] ?? 'available',
        ],
        'model' => [
            'model_name'   => $row['model_name'] ?? 'General Unit',
            'manufacturer' => $row['manufacturer'] ?? 'Unknown',
            'model_number' => $row['model_number'],
            'description'  => $row['description'],
            'category' => [
                'category_name' => $row['category_name'] ?? 'Hardware',
            ],
        ],
        'room' => $row['room_code'] ? [
            'room_code'  => $row['room_code'],
            'room_name'  => $row['room_name'],
            'building' => [
                'building_name' => $row['building_name'] ?? 'Main Campus',
            ],
        ] : null,
    ]);
}

// ── Reservation Routes ────────────────────────────────────────────────────────
if ($requestUri === '/api/v1/reservations' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    $actorRoles = $actor ? array_map('strtoupper', $actor['roles'] ?? []) : ['STUDENT'];
    $isPrivileged = in_array('ADMIN', $actorRoles) || in_array('ATTENDANT', $actorRoles) || in_array('TECHNICIAN', $actorRoles);

    $status = $_GET['status'] ?? '';
    $userId = $_GET['user_id'] ?? '';

    $sql = "
        SELECT 
            r.reservation_id,
            r.requested_by_user_id,
            r.status_id,
            r.purpose_details,
            r.submitted_at,
            r.requested_start_datetime,
            r.requested_end_datetime,
            rst.status_name,
            u.first_name,
            u.last_name,
            u.email,
            ri.equipment_id,
            e.asset_tag,
            em.model_name
        FROM reservations r
        LEFT JOIN reservation_status_types rst ON r.status_id = rst.status_id
        LEFT JOIN users u ON r.requested_by_user_id = u.user_id
        LEFT JOIN reservation_items ri ON r.reservation_id = ri.reservation_id
        LEFT JOIN equipment e ON ri.equipment_id = e.equipment_id
        LEFT JOIN equipment_models em ON e.model_id = em.model_id
        WHERE 1=1
    ";
    $params = [];

    // Students and Lecturers strictly view only their own reservations
    if (!$isPrivileged && $actor) {
        $sql .= " AND r.requested_by_user_id = ?";
        $params[] = (int)$actor['user_id'];
    } elseif (!empty($userId) && is_numeric($userId)) {
        $sql .= " AND r.requested_by_user_id = ?";
        $params[] = (int)$userId;
    }

    if (!empty($status)) {
        $sql .= " AND rst.status_name = ?";
        $params[] = $status;
    }
    $sql .= " ORDER BY r.reservation_id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $raw = $stmt->fetchAll();

    $reservations = array_map(function($row) {
        return [
            'reservation_id' => (int)$row['reservation_id'],
            'requested_by_user_id' => (int)$row['requested_by_user_id'],
            'purpose_details' => $row['purpose_details'],
            'submitted_at' => $row['submitted_at'],
            'requested_start_datetime' => $row['requested_start_datetime'],
            'requested_end_datetime' => $row['requested_end_datetime'],
            'status' => [
                'status_id' => (int)$row['status_id'],
                'status_name' => $row['status_name'] ?? 'pending',
            ],
            'requester' => [
                'first_name' => $row['first_name'] ?? 'Campus',
                'last_name' => $row['last_name'] ?? 'User',
                'email' => $row['email'] ?? '',
            ],
            'items' => [
                [
                    'equipment' => [
                        'equipment_id' => (int)$row['equipment_id'],
                        'asset_tag' => $row['asset_tag'] ?? 'Unassigned',
                        'model' => [
                            'model_name' => $row['model_name'] ?? 'Equipment Asset',
                        ],
                    ],
                ]
            ],
        ];
    }, $raw);

    sendResponse(200, true, 'Reservations retrieved successfully.', $reservations, [
        'total_records' => count($reservations),
    ]);
}

if ($requestUri === '/api/v1/reservations' && $method === 'POST') {
    $equipmentId = (int)($body['equipment_id'] ?? 0);
    $startTime = $body['start_time'] ?? '';
    $endTime = $body['end_time'] ?? '';
    $purposeDetails = $body['purpose_details'] ?? '';
    $purposeTypeId = (int)($body['purpose_type_id'] ?? 1);

    if ($equipmentId <= 0 || empty($startTime) || empty($endTime)) {
        sendResponse(422, false, 'Equipment ID, start time, and end time are required.');
    }

    if (strtotime($endTime) <= strtotime($startTime)) {
        sendResponse(422, false, 'End time must be strictly after the start time.');
    }

    // Availability Conflict Check
    $conflictStmt = $pdo->prepare("
        SELECT r.reservation_id, r.requested_start_datetime, r.requested_end_datetime
        FROM reservation_items ri
        JOIN reservations r ON ri.reservation_id = r.reservation_id
        JOIN reservation_status_types rst ON r.status_id = rst.status_id
        WHERE ri.equipment_id = ?
          AND rst.status_name IN ('pending', 'approved', 'active')
          AND r.requested_start_datetime < ?
          AND r.requested_end_datetime > ?
        LIMIT 1
    ");
    $conflictStmt->execute([$equipmentId, $endTime, $startTime]);
    $conflict = $conflictStmt->fetch();

    if ($conflict) {
        sendResponse(409, false, 'Equipment is already reserved during the requested period.', null, null, [
            'conflict' => $conflict,
        ]);
    }

    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;

    // Resolve 'pending' status ID
    $statusStmt = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'pending' LIMIT 1");
    $pendingStatusId = $statusStmt->fetchColumn() ?: 1;

    // Begin Transaction
    $pdo->beginTransaction();
    try {
        $insertRes = $pdo->prepare("
            INSERT INTO reservations (requested_by_user_id, purpose_type_id, purpose_details, status_id, requested_start_datetime, requested_end_datetime, submitted_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW())
            RETURNING reservation_id
        ");
        $insertRes->execute([$userId, $purposeTypeId, $purposeDetails, $pendingStatusId, $startTime, $endTime]);
        $reservationId = $insertRes->fetchColumn();

        // Line item
        $modelId = $pdo->query("SELECT model_id FROM equipment WHERE equipment_id = {$equipmentId} LIMIT 1")->fetchColumn() ?: 1;
        $insertItem = $pdo->prepare("
            INSERT INTO reservation_items (reservation_id, model_id, equipment_id, quantity_requested, line_status)
            VALUES (?, ?, ?, 1, 'pending')
        ");
        $insertItem->execute([$reservationId, $modelId, $equipmentId]);

        // Status history
        $insertHistory = $pdo->prepare("
            INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at)
            VALUES (?, ?, ?, 'Reservation submitted.', NOW())
        ");
        $insertHistory->execute([$reservationId, $pendingStatusId, $userId]);

        // Audit log
        $insertAudit = $pdo->prepare("
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at)
            VALUES (?, 'RESERVATION_CREATED', 'Reservation', ?, NOW())
        ");
        $insertAudit->execute([$userId, $reservationId]);

        $pdo->commit();

        sendResponse(201, true, 'Reservation submitted successfully and is pending approval.', [
            'reservation_id' => (int)$reservationId,
            'status' => 'pending',
            'requested_start_datetime' => $startTime,
            'requested_end_datetime' => $endTime,
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Failed to save reservation: ' . $e->getMessage());
    }
}

// Approve Reservation
if (preg_match('#^/api/v1/reservations/(\d+)/approve$#', $requestUri, $matches) && $method === 'PATCH') {
    $resId = (int)$matches[1];
    $comments = $body['comments'] ?? 'Approved by administrator.';
    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;

    $approvedStatusId = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'approved' LIMIT 1")->fetchColumn() ?: 2;

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare("UPDATE reservations SET status_id = ? WHERE reservation_id = ?");
        $update->execute([$approvedStatusId, $resId]);

        $history = $pdo->prepare("INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at) VALUES (?, ?, ?, ?, NOW())");
        $history->execute([$resId, $approvedStatusId, $userId, $comments]);

        $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'RESERVATION_APPROVED', 'Reservation', ?, NOW())");
        $audit->execute([$userId, $resId]);

        $pdo->commit();
        sendResponse(200, true, 'Reservation approved successfully.');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Failed to approve: ' . $e->getMessage());
    }
}

// Reject Reservation
if (preg_match('#^/api/v1/reservations/(\d+)/reject$#', $requestUri, $matches) && $method === 'PATCH') {
    $resId = (int)$matches[1];
    $reason = $body['reason'] ?? 'Rejected by administrator.';
    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;

    $rejectedStatusId = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'rejected' LIMIT 1")->fetchColumn() ?: 5;

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare("UPDATE reservations SET status_id = ? WHERE reservation_id = ?");
        $update->execute([$rejectedStatusId, $resId]);

        $history = $pdo->prepare("INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at) VALUES (?, ?, ?, ?, NOW())");
        $history->execute([$resId, $rejectedStatusId, $userId, $reason]);

        $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'RESERVATION_REJECTED', 'Reservation', ?, NOW())");
        $audit->execute([$userId, $resId]);

        $pdo->commit();
        sendResponse(200, true, 'Reservation rejected.');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Failed to reject: ' . $e->getMessage());
    }
}

// Cancel Reservation
if (preg_match('#^/api/v1/reservations/(\d+)/cancel$#', $requestUri, $matches) && $method === 'PATCH') {
    $resId = (int)$matches[1];
    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;

    $cancelledStatusId = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'cancelled' LIMIT 1")->fetchColumn() ?: 6;

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare("UPDATE reservations SET status_id = ? WHERE reservation_id = ?");
        $update->execute([$cancelledStatusId, $resId]);

        $history = $pdo->prepare("INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at) VALUES (?, ?, ?, 'Cancelled by user.', NOW())");
        $history->execute([$resId, $cancelledStatusId, $userId]);

        $audit = $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'RESERVATION_CANCELLED', 'Reservation', ?, NOW())");
        $audit->execute([$userId, $resId]);

        $pdo->commit();
        sendResponse(200, true, 'Reservation cancelled successfully.');
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Failed to cancel: ' . $e->getMessage());
    }
}

// ── Check-in / Check-out Routes ───────────────────────────────────────────────

// Check-in: Mark equipment as physically handed over to the requester
if (preg_match('#^/api/v1/reservations/(\d+)/checkin$#', $requestUri, $matches) && $method === 'PATCH') {
    $resId = (int)$matches[1];
    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;
    $notes = $body['notes'] ?? 'Equipment checked out to requester.';

    // Verify reservation exists and is in 'approved' state
    $stmt = $pdo->prepare("
        SELECT r.reservation_id, r.requested_by_user_id, rst.status_name
        FROM reservations r
        JOIN reservation_status_types rst ON r.status_id = rst.status_id
        WHERE r.reservation_id = ?
    ");
    $stmt->execute([$resId]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        sendResponse(404, false, "Reservation #{$resId} not found.");
    }
    if (!in_array($reservation['status_name'], ['approved', 'pending'])) {
        sendResponse(409, false, "Reservation #{$resId} cannot be checked in. Current status: {$reservation['status_name']}.");
    }

    // Resolve 'active' status ID
    $activeStatusId = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'active' LIMIT 1")->fetchColumn();
    if (!$activeStatusId) {
        sendResponse(500, false, "System configuration error: 'active' status not found.");
    }

    $pdo->beginTransaction();
    try {
        // Update reservation to active
        $pdo->prepare("UPDATE reservations SET status_id = ? WHERE reservation_id = ?")
            ->execute([$activeStatusId, $resId]);

        // Record status history
        $pdo->prepare("
            INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at)
            VALUES (?, ?, ?, ?, NOW())
        ")->execute([$resId, $activeStatusId, $userId, $notes]);

        // Update equipment items to 'in_use'
        $inUseStatusId = $pdo->query("SELECT status_id FROM equipment_status_types WHERE status_name = 'in_use' OR status_name = 'reserved' LIMIT 1")->fetchColumn();
        if ($inUseStatusId) {
            $itemsStmt = $pdo->prepare("SELECT equipment_id FROM reservation_items WHERE reservation_id = ?");
            $itemsStmt->execute([$resId]);
            $items = $itemsStmt->fetchAll(PDO::FETCH_COLUMN);
            foreach ($items as $eqId) {
                $pdo->prepare("UPDATE equipment SET status_id = ? WHERE equipment_id = ?")
                    ->execute([$inUseStatusId, $eqId]);
            }
        }

        // Update reservation_items line_status
        $pdo->prepare("UPDATE reservation_items SET line_status = 'checked_out' WHERE reservation_id = ?")
            ->execute([$resId]);

        // Audit log
        $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'EQUIPMENT_CHECKED_IN', 'Reservation', ?, NOW())")
            ->execute([$userId, $resId]);

        $pdo->commit();
        sendResponse(200, true, 'Equipment checked in successfully. Reservation is now active.', [
            'reservation_id' => $resId,
            'status' => 'active',
            'checked_in_by' => $userId,
            'checked_in_at' => date('c'),
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Check-in failed: ' . $e->getMessage());
    }
}

// Check-out: Mark equipment as returned by the requester
if (preg_match('#^/api/v1/reservations/(\d+)/checkout$#', $requestUri, $matches) && $method === 'PATCH') {
    $resId = (int)$matches[1];
    $user = getAuthenticatedUser($pdo);
    $userId = $user ? $user['user_id'] : 1;
    $conditionNotes = $body['condition_notes'] ?? '';
    $returnNotes = $body['notes'] ?? 'Equipment returned by requester.';

    // Verify reservation is 'active'
    $stmt = $pdo->prepare("
        SELECT r.reservation_id, rst.status_name
        FROM reservations r
        JOIN reservation_status_types rst ON r.status_id = rst.status_id
        WHERE r.reservation_id = ?
    ");
    $stmt->execute([$resId]);
    $reservation = $stmt->fetch();

    if (!$reservation) {
        sendResponse(404, false, "Reservation #{$resId} not found.");
    }
    if ($reservation['status_name'] !== 'active') {
        sendResponse(409, false, "Reservation #{$resId} cannot be checked out. Current status: {$reservation['status_name']}.");
    }

    // Resolve 'completed' status ID
    $completedStatusId = $pdo->query("SELECT status_id FROM reservation_status_types WHERE status_name = 'completed' LIMIT 1")->fetchColumn();
    if (!$completedStatusId) {
        sendResponse(500, false, "System configuration error: 'completed' status not found.");
    }

    // Resolve 'available' equipment status
    $availableEqStatusId = $pdo->query("SELECT status_id FROM equipment_status_types WHERE status_name = 'available' LIMIT 1")->fetchColumn();

    $pdo->beginTransaction();
    try {
        // Update reservation to completed
        $pdo->prepare("UPDATE reservations SET status_id = ? WHERE reservation_id = ?")
            ->execute([$completedStatusId, $resId]);

        // Record status history
        $pdo->prepare("
            INSERT INTO reservation_status_history (reservation_id, new_status_id, changed_by_user_id, notes, changed_at)
            VALUES (?, ?, ?, ?, NOW())
        ")->execute([$resId, $completedStatusId, $userId, $returnNotes]);

        // Return equipment to available
        $itemsStmt = $pdo->prepare("SELECT equipment_id FROM reservation_items WHERE reservation_id = ?");
        $itemsStmt->execute([$resId]);
        $items = $itemsStmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($items as $eqId) {
            $updateEq = $pdo->prepare("UPDATE equipment SET status_id = ?, condition_notes = COALESCE(NULLIF(?, ''), condition_notes) WHERE equipment_id = ?");
            $updateEq->execute([$availableEqStatusId, $conditionNotes, $eqId]);
        }

        // Update reservation_items line_status
        $pdo->prepare("UPDATE reservation_items SET line_status = 'returned' WHERE reservation_id = ?")
            ->execute([$resId]);

        // Audit log
        $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'EQUIPMENT_CHECKED_OUT', 'Reservation', ?, NOW())")
            ->execute([$userId, $resId]);

        $pdo->commit();
        sendResponse(200, true, 'Equipment returned successfully. Reservation is now complete.', [
            'reservation_id' => $resId,
            'status' => 'completed',
            'returned_by' => $userId,
            'returned_at' => date('c'),
        ]);
    } catch (Exception $e) {
        $pdo->rollBack();
        sendResponse(500, false, 'Check-out failed: ' . $e->getMessage());
    }
}

// ── Messages / Notifications Compose Routes ───────────────────────────────────
if ($requestUri === '/api/v1/messages' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $scope = $_GET['scope'] ?? 'received'; // 'received' | 'sent' | 'all'
    $userId = $actor['user_id'];
    $isPrivileged = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT']));

    if ($isPrivileged && $scope === 'all') {
        $stmt = $pdo->query("
            SELECT m.message_id, m.subject, m.body, m.message_type, m.sent_at, m.is_read,
                   s.first_name AS sender_first, s.last_name AS sender_last, s.email AS sender_email,
                   r.first_name AS recipient_first, r.last_name AS recipient_last, r.email AS recipient_email,
                   m.recipient_user_id, m.sender_user_id
            FROM messages m
            LEFT JOIN users s ON m.sender_user_id = s.user_id
            LEFT JOIN users r ON m.recipient_user_id = r.user_id
            ORDER BY m.sent_at DESC LIMIT 100
        ");
    } elseif ($scope === 'sent') {
        $stmt = $pdo->prepare("
            SELECT m.message_id, m.subject, m.body, m.message_type, m.sent_at, m.is_read,
                   r.first_name AS recipient_first, r.last_name AS recipient_last, r.email AS recipient_email,
                   m.recipient_user_id, m.sender_user_id
            FROM messages m
            LEFT JOIN users r ON m.recipient_user_id = r.user_id
            WHERE m.sender_user_id = ?
            ORDER BY m.sent_at DESC LIMIT 100
        ");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->prepare("
            SELECT m.message_id, m.subject, m.body, m.message_type, m.sent_at, m.is_read,
                   s.first_name AS sender_first, s.last_name AS sender_last, s.email AS sender_email,
                   m.recipient_user_id, m.sender_user_id
            FROM messages m
            LEFT JOIN users s ON m.sender_user_id = s.user_id
            WHERE m.recipient_user_id = ? OR m.recipient_user_id IS NULL
            ORDER BY m.sent_at DESC LIMIT 100
        ");
        $stmt->execute([$userId]);
    }
    $messages = $stmt->fetchAll();
    sendResponse(200, true, 'Messages retrieved.', $messages, ['total' => count($messages)]);
}

if ($requestUri === '/api/v1/messages' && $method === 'POST') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT']));
    if (!$allowed) sendResponse(403, false, 'Only Administrators and Attendants can compose messages.');

    $subject = trim($body['subject'] ?? '');
    $msgBody = trim($body['body'] ?? '');
    $recipientUserId = !empty($body['recipient_user_id']) ? (int)$body['recipient_user_id'] : null;
    $messageType = $body['message_type'] ?? 'general'; // general | reminder | alert | broadcast

    if (empty($subject) || empty($msgBody)) {
        sendResponse(422, false, 'Subject and message body are required.');
    }

    // Ensure messages table exists
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS messages (
            message_id SERIAL PRIMARY KEY,
            sender_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
            recipient_user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
            subject VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            message_type VARCHAR(50) DEFAULT 'general',
            is_read BOOLEAN DEFAULT FALSE,
            sent_at TIMESTAMP DEFAULT NOW()
        )
    ");

    $stmt = $pdo->prepare("
        INSERT INTO messages (sender_user_id, recipient_user_id, subject, body, message_type, sent_at)
        VALUES (?, ?, ?, ?, ?, NOW())
        RETURNING message_id
    ");
    $stmt->execute([$actor['user_id'], $recipientUserId, $subject, $msgBody, $messageType]);
    $msgId = (int)$stmt->fetchColumn();

    // Audit
    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'MESSAGE_SENT', 'Message', ?, NOW())")
        ->execute([$actor['user_id'], $msgId]);

    sendResponse(201, true, 'Message sent successfully.', [
        'message_id' => $msgId,
        'subject' => $subject,
        'message_type' => $messageType,
        'recipient_user_id' => $recipientUserId,
        'sent_at' => date('c'),
    ]);
}

if (preg_match('#^/api/v1/messages/(\d+)/read$#', $requestUri, $matches) && $method === 'PATCH') {
    $msgId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $pdo->prepare("UPDATE messages SET is_read = TRUE WHERE message_id = ?")->execute([$msgId]);
    sendResponse(200, true, 'Message marked as read.');
}

// ── Faulty / Unavailable Equipment Route ──────────────────────────────────────
if ($requestUri === '/api/v1/equipment/faulty' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');

    $stmt = $pdo->query("
        SELECT
            e.equipment_id, e.asset_tag, e.serial_number, e.condition_notes,
            e.purchase_date, e.is_bookable,
            est.status_name AS status,
            em.model_name, em.manufacturer,
            ec.category_name,
            r.room_code, b.building_name
        FROM equipment e
        JOIN equipment_status_types est ON e.status_id = est.status_id
        LEFT JOIN equipment_models em ON e.model_id = em.model_id
        LEFT JOIN equipment_categories ec ON em.category_id = ec.category_id
        LEFT JOIN rooms r ON e.current_room_id = r.room_id
        LEFT JOIN buildings b ON r.building_id = b.building_id
        WHERE est.status_name IN ('maintenance', 'faulty', 'retired', 'damaged', 'decommissioned')
           OR e.is_bookable = FALSE
        ORDER BY est.status_name, e.asset_tag
    ");
    $faulty = $stmt->fetchAll();
    sendResponse(200, true, 'Faulty and unavailable equipment retrieved.', $faulty, ['total' => count($faulty)]);
}

if (preg_match('#^/api/v1/equipment/(\d+)/status$#', $requestUri, $matches) && $method === 'PATCH') {
    $eqId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');

    $newStatus = trim($body['status'] ?? '');
    $conditionNotes = trim($body['condition_notes'] ?? '');
    $isBookable = isset($body['is_bookable']) ? (bool)$body['is_bookable'] : null;

    if (empty($newStatus)) sendResponse(422, false, 'Status is required.');

    $statusId = $pdo->prepare("SELECT status_id FROM equipment_status_types WHERE LOWER(status_name) = LOWER(?) LIMIT 1");
    $statusId->execute([$newStatus]);
    $statusRow = $statusId->fetch();
    if (!$statusRow) sendResponse(404, false, "Unknown equipment status: '{$newStatus}'.");

    $fields = "status_id = ?";
    $params = [$statusRow['status_id']];
    if (!empty($conditionNotes)) { $fields .= ", condition_notes = ?"; $params[] = $conditionNotes; }
    if ($isBookable !== null) { $fields .= ", is_bookable = ?"; $params[] = $isBookable ? 'TRUE' : 'FALSE'; }
    $params[] = $eqId;

    $pdo->prepare("UPDATE equipment SET {$fields} WHERE equipment_id = ?")->execute($params);
    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'EQUIPMENT_STATUS_CHANGED', 'Equipment', ?, NOW())")
        ->execute([$actor['user_id'], $eqId]);

    sendResponse(200, true, "Equipment status updated to '{$newStatus}'.", ['equipment_id' => $eqId, 'status' => $newStatus]);
}

// ── User Management Routes (Admin + Attendant) ────────────────────────────────
if ($requestUri === '/api/v1/users' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');

    $search = trim($_GET['search'] ?? '');
    $roleFilter = trim($_GET['role'] ?? '');

    $sql = "
        SELECT u.user_id, u.first_name, u.last_name, u.middle_name, u.email, u.phone_number,
               u.student_number, u.account_status, u.created_at,
               COALESCE(array_agg(r.role_name) FILTER (WHERE r.role_name IS NOT NULL), ARRAY[]::text[]) AS roles
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        WHERE 1=1
    ";
    $params = [];
    if (!empty($search)) {
        $sql .= " AND (u.first_name ILIKE ? OR u.last_name ILIKE ? OR u.email ILIKE ? OR u.student_number ILIKE ?)";
        $wc = "%{$search}%";
        $params = [$wc, $wc, $wc, $wc];
    }
    if (!empty($roleFilter)) {
        $sql .= " AND r.role_name = ?";
        $params[] = strtoupper($roleFilter);
    }
    $sql .= " GROUP BY u.user_id ORDER BY u.user_id DESC LIMIT 200";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll();
    // Decode pg array format for roles
    foreach ($users as &$u) {
        $raw = $u['roles'];
        if (is_string($raw)) {
            $raw = trim($raw, '{}');
            $u['roles'] = $raw ? explode(',', $raw) : [];
        }
    }
    sendResponse(200, true, 'Users retrieved.', $users, ['total' => count($users)]);
}

if ($requestUri === '/api/v1/users' && $method === 'POST') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');
    // Delegate to SSO provisioning service
    try {
        $provisioned = $ssoService->provisionStudent($body, (int)$actor['user_id']);
        // Override role if specified
        if (!empty($body['role'])) {
            $roleRow = $pdo->prepare("SELECT role_id FROM roles WHERE role_name = ? LIMIT 1");
            $roleRow->execute([strtoupper($body['role'])]);
            $newRoleId = $roleRow->fetchColumn();
            if ($newRoleId) {
                $pdo->prepare("DELETE FROM user_roles WHERE user_id = ?")->execute([$provisioned['user_id']]);
                $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$provisioned['user_id'], $newRoleId]);
            }
        }
        sendResponse(201, true, 'User added to institutional directory.', $provisioned);
    } catch (Exception $e) {
        sendResponse(422, false, $e->getMessage());
    }
}

if (preg_match('#^/api/v1/users/(\d+)$#', $requestUri, $matches) && $method === 'PATCH') {
    $targetUserId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Only Admins can edit users.');

    $fields = []; $params = [];
    if (isset($body['first_name'])) { $fields[] = "first_name = ?"; $params[] = $body['first_name']; }
    if (isset($body['last_name']))  { $fields[] = "last_name = ?";  $params[] = $body['last_name']; }
    if (isset($body['phone_number'])) { $fields[] = "phone_number = ?"; $params[] = $body['phone_number']; }
    if (isset($body['account_status'])) { $fields[] = "account_status = ?"; $params[] = $body['account_status']; }
    if (empty($fields)) sendResponse(422, false, 'No updatable fields provided.');
    $params[] = $targetUserId;
    $pdo->prepare("UPDATE users SET " . implode(', ', $fields) . " WHERE user_id = ?")->execute($params);

    // Update role if provided
    if (!empty($body['role'])) {
        $roleRow = $pdo->prepare("SELECT role_id FROM roles WHERE role_name = ? LIMIT 1");
        $roleRow->execute([strtoupper($body['role'])]);
        $roleId = $roleRow->fetchColumn();
        if ($roleId) {
            $pdo->prepare("DELETE FROM user_roles WHERE user_id = ?")->execute([$targetUserId]);
            $pdo->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)")->execute([$targetUserId, $roleId]);
        }
    }
    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'USER_UPDATED', 'User', ?, NOW())")
        ->execute([$actor['user_id'], $targetUserId]);
    sendResponse(200, true, 'User updated successfully.', ['user_id' => $targetUserId]);
}

if (preg_match('#^/api/v1/users/(\d+)$#', $requestUri, $matches) && $method === 'DELETE') {
    $targetUserId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Only Admins can delete users.');
    if ($targetUserId === (int)$actor['user_id']) sendResponse(409, false, 'Cannot delete your own account.');
    // Soft-delete: deactivate
    $pdo->prepare("UPDATE users SET account_status = 'inactive' WHERE user_id = ?")->execute([$targetUserId]);
    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'USER_DEACTIVATED', 'User', ?, NOW())")
        ->execute([$actor['user_id'], $targetUserId]);
    sendResponse(200, true, 'User deactivated successfully.', ['user_id' => $targetUserId]);
}

// ── Roles Management (Admin Only) ─────────────────────────────────────────────
if ($requestUri === '/api/v1/roles' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');
    $roles = $pdo->query("SELECT role_id, role_name, description, created_at FROM roles ORDER BY role_id")->fetchAll();
    sendResponse(200, true, 'Roles retrieved.', $roles);
}

if ($requestUri === '/api/v1/roles' && $method === 'POST') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');
    $roleName = strtoupper(trim($body['role_name'] ?? ''));
    $desc = trim($body['description'] ?? '');
    if (empty($roleName)) sendResponse(422, false, 'Role name is required.');
    $stmt = $pdo->prepare("INSERT INTO roles (role_name, description) VALUES (?, ?) ON CONFLICT (role_name) DO NOTHING RETURNING role_id");
    $stmt->execute([$roleName, $desc]);
    $roleId = $stmt->fetchColumn();
    if (!$roleId) sendResponse(409, false, "Role '{$roleName}' already exists.");
    sendResponse(201, true, "Role '{$roleName}' created.", ['role_id' => $roleId, 'role_name' => $roleName]);
}

if (preg_match('#^/api/v1/roles/(\d+)$#', $requestUri, $matches) && $method === 'PATCH') {
    $roleId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');
    $desc = $body['description'] ?? null;
    if ($desc !== null) $pdo->prepare("UPDATE roles SET description = ? WHERE role_id = ?")->execute([$desc, $roleId]);
    sendResponse(200, true, 'Role updated.', ['role_id' => $roleId]);
}

if (preg_match('#^/api/v1/roles/(\d+)$#', $requestUri, $matches) && $method === 'DELETE') {
    $roleId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');
    $pdo->prepare("DELETE FROM user_roles WHERE role_id = ?")->execute([$roleId]);
    $pdo->prepare("DELETE FROM roles WHERE role_id = ?")->execute([$roleId]);
    sendResponse(200, true, 'Role deleted.', ['role_id' => $roleId]);
}

// ── System Settings (Admin Only) ──────────────────────────────────────────────
if ($requestUri === '/api/v1/settings' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');

    // Ensure system_settings table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS system_settings (
            key VARCHAR(128) PRIMARY KEY,
            value TEXT,
            description TEXT,
            updated_at TIMESTAMP DEFAULT NOW(),
            updated_by INT REFERENCES users(user_id) ON DELETE SET NULL
        )
    ");
    // Seed defaults if empty
    $count = (int)$pdo->query("SELECT COUNT(*) FROM system_settings")->fetchColumn();
    if ($count === 0) {
        $defaults = [
            ['max_reservation_days', '14', 'Maximum loan period in days'],
            ['require_approval', 'true', 'Whether all reservations require admin approval'],
            ['auto_reminder_hours', '24', 'Hours before due date to send auto-reminder'],
            ['institution_name', 'Gulu University', 'Institution display name'],
            ['dispatch_location', 'STC-101, Science Complex', 'Primary equipment dispatch location'],
            ['academic_year', '2026/2027', 'Current academic year'],
            ['max_items_per_reservation', '5', 'Maximum equipment items per single reservation'],
        ];
        $ins = $pdo->prepare("INSERT INTO system_settings (key, value, description) VALUES (?, ?, ?) ON CONFLICT DO NOTHING");
        foreach ($defaults as [$k, $v, $d]) $ins->execute([$k, $v, $d]);
    }

    $settings = $pdo->query("SELECT key, value, description, updated_at FROM system_settings ORDER BY key")->fetchAll();
    sendResponse(200, true, 'System settings retrieved.', $settings);
}

if ($requestUri === '/api/v1/settings' && $method === 'PATCH') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    if (!in_array('ADMIN', $actor['roles'] ?? [])) sendResponse(403, false, 'Admins only.');
    if (empty($body) || !is_array($body)) sendResponse(422, false, 'No settings provided.');

    $pdo->exec("CREATE TABLE IF NOT EXISTS system_settings (key VARCHAR(128) PRIMARY KEY, value TEXT, description TEXT, updated_at TIMESTAMP DEFAULT NOW(), updated_by INT)");
    $upd = $pdo->prepare("INSERT INTO system_settings (key, value, updated_at, updated_by) VALUES (?, ?, NOW(), ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW(), updated_by = EXCLUDED.updated_by");
    foreach ($body as $key => $val) {
        $upd->execute([strtolower(trim($key)), (string)$val, $actor['user_id']]);
    }
    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'SETTINGS_UPDATED', 'System', 0, NOW())")
        ->execute([$actor['user_id']]);
    sendResponse(200, true, 'System settings updated successfully.');
}

// ── Equipment CRUD (Add / Create) — Admin & Attendant ─────────────────────────
if ($requestUri === '/api/v1/equipment/models' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $models = $pdo->query("SELECT m.model_id, m.model_name, m.manufacturer, m.model_number, c.category_name FROM equipment_models m LEFT JOIN equipment_categories c ON m.category_id = c.category_id ORDER BY m.model_name")->fetchAll();
    sendResponse(200, true, 'Equipment models retrieved.', $models);
}

if ($requestUri === '/api/v1/equipment/categories' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $cats = $pdo->query("SELECT category_id, category_name, description FROM equipment_categories ORDER BY category_name")->fetchAll();
    sendResponse(200, true, 'Categories retrieved.', $cats);
}

if ($requestUri === '/api/v1/equipment/statuses' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $statuses = $pdo->query("SELECT status_id, status_name FROM equipment_status_types ORDER BY status_name")->fetchAll();
    sendResponse(200, true, 'Equipment statuses retrieved.', $statuses);
}

if ($requestUri === '/api/v1/equipment/rooms' && $method === 'GET') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $rooms = $pdo->query("
        SELECT r.room_id, r.room_code, r.room_name, b.building_name
        FROM rooms r
        LEFT JOIN buildings b ON r.building_id = b.building_id
        ORDER BY b.building_name, r.room_code
    ")->fetchAll();
    sendResponse(200, true, 'Rooms retrieved.', $rooms);
}

// Create new Equipment Unit (Admin & Attendant)
if ($requestUri === '/api/v1/equipment' && $method === 'POST') {
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) sendResponse(403, false, 'Access denied. Privileged attendants/admins only.');

    $modelId = (int)($body['model_id'] ?? 0);
    $assetTag = trim($body['asset_tag'] ?? '');
    $serialNumber = trim($body['serial_number'] ?? '');
    $statusId = (int)($body['status_id'] ?? 1);
    $roomId = !empty($body['current_room_id']) ? (int)$body['current_room_id'] : null;
    $conditionNotes = trim($body['condition_notes'] ?? 'Brand new / operational hardware unit.');
    $isBookable = isset($body['is_bookable']) ? (bool)$body['is_bookable'] : true;
    $purchaseDate = !empty($body['purchase_date']) ? $body['purchase_date'] : date('Y-m-d');

    if (empty($assetTag)) {
        sendResponse(422, false, 'Asset Tag is required and must be unique.');
    }
    if ($modelId <= 0) {
        sendResponse(422, false, 'Valid Equipment Model is required.');
    }

    // Check duplicate asset tag
    $chk = $pdo->prepare("SELECT equipment_id FROM equipment WHERE LOWER(asset_tag) = LOWER(?)");
    $chk->execute([$assetTag]);
    if ($chk->fetch()) {
        sendResponse(409, false, "Asset tag '{$assetTag}' already exists in inventory.");
    }

    $stmt = $pdo->prepare("
        INSERT INTO equipment (
            model_id, asset_tag, serial_number, status_id,
            current_room_id, condition_notes, is_bookable, purchase_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        RETURNING equipment_id
    ");
    $stmt->execute([
        $modelId,
        $assetTag,
        $serialNumber ?: null,
        $statusId,
        $roomId,
        $conditionNotes,
        $isBookable ? 'TRUE' : 'FALSE',
        $purchaseDate
    ]);
    $newId = (int)$stmt->fetchColumn();

    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'EQUIPMENT_CREATED', 'Equipment', ?, NOW())")
        ->execute([$actor['user_id'], $newId]);

    sendResponse(201, true, "Equipment unit '{$assetTag}' registered successfully.", [
        'equipment_id' => $newId,
        'asset_tag' => $assetTag,
        'model_id' => $modelId,
    ]);
}

// Update Equipment Unit (Admin & Attendant)
if (preg_match('#^/api/v1/equipment/(\d+)$#', $requestUri, $matches) && $method === 'PATCH') {
    $eqId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');

    $chk = $pdo->prepare("SELECT equipment_id FROM equipment WHERE equipment_id = ?");
    $chk->execute([$eqId]);
    if (!$chk->fetch()) {
        sendResponse(404, false, "Equipment unit #{$eqId} not found.");
    }

    $fields = [];
    $params = [];

    if (isset($body['asset_tag'])) {
        $fields[] = "asset_tag = ?";
        $params[] = trim($body['asset_tag']);
    }
    if (isset($body['serial_number'])) {
        $fields[] = "serial_number = ?";
        $params[] = trim($body['serial_number']);
    }
    if (isset($body['model_id'])) {
        $fields[] = "model_id = ?";
        $params[] = (int)$body['model_id'];
    }
    if (isset($body['status_id'])) {
        $fields[] = "status_id = ?";
        $params[] = (int)$body['status_id'];
    }
    if (isset($body['current_room_id'])) {
        $fields[] = "current_room_id = ?";
        $params[] = !empty($body['current_room_id']) ? (int)$body['current_room_id'] : null;
    }
    if (isset($body['condition_notes'])) {
        $fields[] = "condition_notes = ?";
        $params[] = trim($body['condition_notes']);
    }
    if (isset($body['is_bookable'])) {
        $fields[] = "is_bookable = ?";
        $params[] = (bool)$body['is_bookable'] ? 'TRUE' : 'FALSE';
    }

    if (empty($fields)) {
        sendResponse(422, false, 'No fields provided for update.');
    }

    $params[] = $eqId;
    $sql = "UPDATE equipment SET " . implode(', ', $fields) . " WHERE equipment_id = ?";
    $pdo->prepare($sql)->execute($params);

    $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity_type, entity_id, performed_at) VALUES (?, 'EQUIPMENT_UPDATED', 'Equipment', ?, NOW())")
        ->execute([$actor['user_id'], $eqId]);

    sendResponse(200, true, "Equipment unit #{$eqId} updated successfully.");
}

// Delete Equipment Unit (Admin & Attendant)
if (preg_match('#^/api/v1/equipment/(\d+)$#', $requestUri, $matches) && $method === 'DELETE') {
    $eqId = (int)$matches[1];
    $actor = getAuthenticatedUser($pdo);
    if (!$actor) sendResponse(401, false, 'Unauthenticated.');
    $allowed = !empty(array_intersect($actor['roles'] ?? [], ['ADMIN', 'ATTENDANT', 'TECHNICIAN']));
    if (!$allowed) sendResponse(403, false, 'Access denied.');

    // Check if equipment is tied to existing reservations
    $resCount = $pdo->prepare("SELECT COUNT(*) FROM reservation_items WHERE equipment_id = ?");
    $resCount->execute([$eqId]);
    $count = (int)$resCount->fetchColumn();

    if ($count > 0) {
        // Soft delete / decommission so reservation history is preserved
        $pdo->prepare("
            UPDATE equipment
            SET is_bookable = FALSE,
                status_id = (SELECT status_id FROM equipment_status_types WHERE status_name = 'decommissioned' LIMIT 1),
                condition_notes = 'Decommissioned / archived by operator.'
            WHERE equipment_id = ?
        ")->execute([$eqId]);
        sendResponse(200, true, "Equipment unit #{$eqId} has reservation history and was marked as Decommissioned (archived).");
    } else {
        $pdo->prepare("DELETE FROM equipment WHERE equipment_id = ?")->execute([$eqId]);
        sendResponse(200, true, "Equipment unit #{$eqId} permanently removed from inventory.");
    }
}

// 404 Fallback
sendResponse(404, false, "Endpoint not found: {$method} {$requestUri}");
