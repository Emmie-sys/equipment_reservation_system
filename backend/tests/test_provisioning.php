<?php
// Test Provisioning a new student as Admin
$loginCh = curl_init('http://127.0.0.1:8000/api/v1/auth/login');
curl_setopt($loginCh, CURLOPT_RETURNTRANSFER, true);
curl_setopt($loginCh, CURLOPT_POST, true);
curl_setopt($loginCh, CURLOPT_POSTFIELDS, json_encode(['email' => 'admin@gu.ac.ug', 'password' => 'emmie']));
curl_setopt($loginCh, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$adminRes = json_decode(curl_exec($loginCh), true);
curl_close($loginCh);

$adminToken = $adminRes['data']['token'] ?? '';
echo "[ADMIN TOKEN] " . ($adminToken ? "Obtained" : "Failed") . "\n";

// Provision Student
$provCh = curl_init('http://127.0.0.1:8000/api/v1/students');
curl_setopt($provCh, CURLOPT_RETURNTRANSFER, true);
curl_setopt($provCh, CURLOPT_POST, true);
curl_setopt($provCh, CURLOPT_POSTFIELDS, json_encode([
    'first_name' => 'Brenda',
    'other_name' => 'Atim',
    'last_name' => 'Atim',
    'student_number' => 'GU/2026/CS/108',
    'email' => 'brenda.atim@gu.ac.ug',
    'password' => 'emmie',
    'phone_number' => '+256-782-998877',
    'year_of_study' => 2,
]));
curl_setopt($provCh, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $adminToken,
]);
$provRes = json_decode(curl_exec($provCh), true);
curl_close($provCh);

echo "[PROVISION RESULT] " . ($provRes['success'] ? "SUCCESS: ID #{$provRes['data']['student_id']}, No: {$provRes['data']['student_number']}" : "FAILED: " . ($provRes['message'] ?? '')) . "\n";

// Test logging in as the newly provisioned student
$stdLogin = curl_init('http://127.0.0.1:8000/api/v1/auth/login');
curl_setopt($stdLogin, CURLOPT_RETURNTRANSFER, true);
curl_setopt($stdLogin, CURLOPT_POST, true);
curl_setopt($stdLogin, CURLOPT_POSTFIELDS, json_encode(['email' => 'GU/2026/CS/108', 'password' => 'emmie']));
curl_setopt($stdLogin, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
$newStdRes = json_decode(curl_exec($stdLogin), true);
curl_close($stdLogin);

echo "[NEW STUDENT LOGIN BY STUDENT_NUMBER] " . ($newStdRes['success'] ? "SUCCESS: Name={$newStdRes['data']['user']['first_name']}, Roles=" . implode(',', $newStdRes['data']['user']['roles']) : "FAILED") . "\n";
