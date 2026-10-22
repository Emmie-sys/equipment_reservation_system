<?php
$testUsers = [
    ['admin@gu.ac.ug', 'emmie'],
    ['attendant@gu.ac.ug', 'emmie'],
    ['lecturer@gu.ac.ug', 'emmie'],
    ['student@gmail.com', 'emmie'],
    ['GU/2026/BIT/042', 'emmie'], // student_number test
];

foreach ($testUsers as [$id, $pwd]) {
    $ch = curl_init('http://127.0.0.1:8000/api/v1/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['email' => $id, 'password' => $pwd]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $raw = curl_exec($ch);
    $res = json_decode($raw, true);
    curl_close($ch);
    echo "[LOGIN] {$id} => " . ($res['success'] ? "SUCCESS: Roles=" . implode(',', $res['data']['user']['roles']) . ", Name=" . $res['data']['user']['first_name'] : "FAILED: " . ($res['message'] ?? $raw)) . "\n";
}

// Test Student Directory GET
$ch = curl_init('http://127.0.0.1:8000/api/v1/students');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
echo "[STUDENTS DIRECTORY] Count = " . count($res['data'] ?? []) . "\n";

// Test Student Lookup by student_number
$ch = curl_init('http://127.0.0.1:8000/api/v1/students/GU%2F2026%2FBIT%2F042');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = json_decode(curl_exec($ch), true);
curl_close($ch);
echo "[STUDENT LOOKUP] Found: " . ($res['data']['first_name'] ?? 'None') . " " . ($res['data']['last_name'] ?? '') . "\n";
