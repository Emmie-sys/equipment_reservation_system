-- =============================================================================
-- PostgreSQL Seed Data: Institutional Equipment Reservation System
-- Matches the active 57-table schema in equipment_reservation_system
-- =============================================================================

-- 1. Standard Roles
INSERT INTO roles (role_name, description) VALUES
('ADMIN', 'Institutional System Administrator with full operational control'),
('STAFF', 'Academic faculty and administrative staff members'),
('STUDENT', 'Enrolled undergraduate and graduate students'),
('TECHNICIAN', 'Equipment lab technicians and maintenance personnel')
ON CONFLICT (role_name) DO NOTHING;

-- 2. Equipment Status Types
INSERT INTO equipment_status_types (status_name) VALUES
('available'),
('reserved'),
('checked_out'),
('maintenance'),
('retired')
ON CONFLICT (status_name) DO NOTHING;

-- 3. Reservation Status Types
INSERT INTO reservation_status_types (status_name) VALUES
('pending'),
('approved'),
('rejected'),
('active'),
('completed'),
('cancelled')
ON CONFLICT (status_name) DO NOTHING;

-- 4. Reservation Purpose Types
INSERT INTO reservation_purpose_types (purpose_name) VALUES
('Academic Coursework / Class Project'),
('Faculty Research & Field Study'),
('Institutional Event / PA Setup'),
('Student Organization / Extracurricular')
ON CONFLICT (purpose_name) DO NOTHING;

-- 5. Campuses, Buildings & Rooms
INSERT INTO campuses (campus_name, campus_code, address_line, city, country, is_active) VALUES
('Main Academic Campus', 'MAIN-CAMPUS', 'Plot 10 University Avenue', 'Kampala', 'Uganda', true)
ON CONFLICT (campus_code) DO NOTHING;

INSERT INTO buildings (campus_id, building_name, building_code, number_of_floors)
SELECT c.campus_id, 'Science & Technology Complex', 'STC', 4
FROM campuses c WHERE c.campus_code = 'MAIN-CAMPUS'
ON CONFLICT (building_code) DO NOTHING;

INSERT INTO buildings (campus_id, building_name, building_code, number_of_floors)
SELECT c.campus_id, 'Media & Performing Arts Center', 'MPAC', 3
FROM campuses c WHERE c.campus_code = 'MAIN-CAMPUS'
ON CONFLICT (building_code) DO NOTHING;

INSERT INTO rooms (building_id, room_code, room_name, room_type, floor_number, capacity, is_bookable_space)
SELECT b.building_id, 'STC-101', 'Central Equipment Dispatch Desk', 'dispatch', 1, 10, false
FROM buildings b WHERE b.building_code = 'STC'
ON CONFLICT (building_id, room_code) DO NOTHING;

INSERT INTO rooms (building_id, room_code, room_name, room_type, floor_number, capacity, is_bookable_space)
SELECT b.building_id, 'MPAC-204', 'Media Production Equipment Room', 'storage', 2, 8, false
FROM buildings b WHERE b.building_code = 'MPAC'
ON CONFLICT (building_id, room_code) DO NOTHING;

-- 6. Equipment Categories
INSERT INTO equipment_categories (category_name, category_code, description, requires_certification) VALUES
('Audio-Visual & Presentation', 'CAT-AV', 'High-lumen projectors, motorized projection screens, PA amplifiers', false),
('Photography & Video Production', 'CAT-MEDIA', 'DSLR & cinema cameras, prime lenses, heavy-duty tripods, gimbal stabilizers', false),
('Computing & Digital Media', 'CAT-IT', 'Mobile workstation laptops, tablets, portable VR headsets', false),
('Laboratory & Engineering Electronics', 'CAT-ENG', 'Digital oscilloscopes, bench multimeters, signal generators, sensor kits', true),
('Event Audio & PA Systems', 'CAT-AUDIO', 'Wireless handheld microphones, mixer consoles, portable stage monitors', false)
ON CONFLICT (category_code) DO NOTHING;

-- 7. Equipment Models
INSERT INTO equipment_models (
    category_id, model_name, manufacturer, model_number, specifications, standard_usage_instructions, unit_of_measure, replacement_cost, requires_certification, is_active
)
SELECT 
    c.category_id,
    'Epson PowerLite L530U Laser Projector',
    'Epson',
    'V11HA27020',
    '5200 Lumens, WUXGA (1920x1200), Laser Light Engine, Dual HDMI, VGA, HDBaseT',
    'Allow fans to cool down before unplugging. Do not block air intake vents.',
    'unit',
    1850.00,
    false,
    true
FROM equipment_categories c WHERE c.category_code = 'CAT-AV'
ON CONFLICT DO NOTHING;

INSERT INTO equipment_models (
    category_id, model_name, manufacturer, model_number, specifications, standard_usage_instructions, unit_of_measure, replacement_cost, requires_certification, is_active
)
SELECT 
    c.category_id,
    'Canon EOS R6 Mark II Mirrorless Camera',
    'Canon',
    'EOS-R6M2-BODY',
    '24.2 MP Full-Frame CMOS Sensor, 4K 60p 10-Bit Internal, Dual Pixel AF II',
    'Keep lens cap attached when not filming. Clean only with optical blower.',
    'unit',
    2499.00,
    false,
    true
FROM equipment_categories c WHERE c.category_code = 'CAT-MEDIA'
ON CONFLICT DO NOTHING;

INSERT INTO equipment_models (
    category_id, model_name, manufacturer, model_number, specifications, standard_usage_instructions, unit_of_measure, replacement_cost, requires_certification, is_active
)
SELECT 
    c.category_id,
    'Apple MacBook Pro 16" M3 Max',
    'Apple',
    'MUW63LL/A',
    'Apple M3 Max 16-Core CPU, 40-Core GPU, 36GB Unified Memory, 1TB SSD',
    'Return with standard 140W MagSafe charger and protective travel sleeve.',
    'unit',
    3499.00,
    false,
    true
FROM equipment_categories c WHERE c.category_code = 'CAT-IT'
ON CONFLICT DO NOTHING;

INSERT INTO equipment_models (
    category_id, model_name, manufacturer, model_number, specifications, standard_usage_instructions, unit_of_measure, replacement_cost, requires_certification, is_active
)
SELECT 
    c.category_id,
    'Shure BLX288/SM58 Dual Wireless Vocal System',
    'Shure',
    'BLX288-SM58',
    'Dual channel analog receiver with two SM58 handheld microphone transmitters',
    'Ensure AA batteries are removed before long-term storage.',
    'set',
    649.00,
    false,
    true
FROM equipment_categories c WHERE c.category_code = 'CAT-AUDIO'
ON CONFLICT DO NOTHING;

INSERT INTO equipment_models (
    category_id, model_name, manufacturer, model_number, specifications, standard_usage_instructions, unit_of_measure, replacement_cost, requires_certification, is_active
)
SELECT 
    c.category_id,
    'Rigol DS1054Z 50MHz Digital Oscilloscope',
    'Rigol',
    'DS1054Z',
    '4 Channels, 50MHz Bandwidth, 1GSa/s Real-time sample rate, 24Mpts Memory',
    'Ground leads must be connected to earth ground only. Do not exceed max input voltage.',
    'unit',
    399.00,
    true,
    true
FROM equipment_categories c WHERE c.category_code = 'CAT-ENG'
ON CONFLICT DO NOTHING;

-- 8. Equipment Inventory Units
INSERT INTO equipment (
    model_id, asset_tag, serial_number, status_id, current_room_id, purchase_date, purchase_cost, barcode_value, is_bookable, condition_notes
)
SELECT 
    m.model_id,
    'AST-PRJ-001',
    'EPS-PL-882194',
    s.status_id,
    r.room_id,
    '2025-08-15',
    1850.00,
    'BC-AST-PRJ-001',
    true,
    'Excellent operational condition, lamp hours at 120h'
FROM equipment_models m
CROSS JOIN equipment_status_types s
CROSS JOIN rooms r
WHERE m.model_name LIKE 'Epson PowerLite%' 
  AND s.status_name = 'available' 
  AND r.room_code = 'STC-101'
ON CONFLICT (asset_tag) DO NOTHING;

INSERT INTO equipment (
    model_id, asset_tag, serial_number, status_id, current_room_id, purchase_date, purchase_cost, barcode_value, is_bookable, condition_notes
)
SELECT 
    m.model_id,
    'AST-PRJ-002',
    'EPS-PL-882195',
    s.status_id,
    r.room_id,
    '2025-08-15',
    1850.00,
    'BC-AST-PRJ-002',
    true,
    'Minor cosmetic scratch on exterior casing, optics clean'
FROM equipment_models m
CROSS JOIN equipment_status_types s
CROSS JOIN rooms r
WHERE m.model_name LIKE 'Epson PowerLite%' 
  AND s.status_name = 'available' 
  AND r.room_code = 'STC-101'
ON CONFLICT (asset_tag) DO NOTHING;

INSERT INTO equipment (
    model_id, asset_tag, serial_number, status_id, current_room_id, purchase_date, purchase_cost, barcode_value, is_bookable, condition_notes
)
SELECT 
    m.model_id,
    'AST-CAM-001',
    'CAN-R6-491028',
    s.status_id,
    r.room_id,
    '2025-09-01',
    2499.00,
    'BC-AST-CAM-001',
    true,
    'Pristine condition, includes 2 LP-E6NH batteries and 128GB V90 SD card'
FROM equipment_models m
CROSS JOIN equipment_status_types s
CROSS JOIN rooms r
WHERE m.model_name LIKE 'Canon EOS R6%' 
  AND s.status_name = 'available' 
  AND r.room_code = 'MPAC-204'
ON CONFLICT (asset_tag) DO NOTHING;

INSERT INTO equipment (
    model_id, asset_tag, serial_number, status_id, current_room_id, purchase_date, purchase_cost, barcode_value, is_bookable, condition_notes
)
SELECT 
    m.model_id,
    'AST-LAP-001',
    'APL-MBP-992104',
    s.status_id,
    r.room_id,
    '2025-10-10',
    3499.00,
    'BC-AST-LAP-001',
    true,
    'Configured with Adobe Creative Cloud and Final Cut Pro suite'
FROM equipment_models m
CROSS JOIN equipment_status_types s
CROSS JOIN rooms r
WHERE m.model_name LIKE 'Apple MacBook Pro%' 
  AND s.status_name = 'available' 
  AND r.room_code = 'STC-101'
ON CONFLICT (asset_tag) DO NOTHING;

INSERT INTO equipment (
    model_id, asset_tag, serial_number, status_id, current_room_id, purchase_date, purchase_cost, barcode_value, is_bookable, condition_notes
)
SELECT 
    m.model_id,
    'AST-MIC-001',
    'SHU-SM58-10294',
    s.status_id,
    r.room_id,
    '2025-11-05',
    649.00,
    'BC-AST-MIC-001',
    true,
    'Includes rack mount receiver kit and 2 microphone stands'
FROM equipment_models m
CROSS JOIN equipment_status_types s
CROSS JOIN rooms r
WHERE m.model_name LIKE 'Shure BLX288%' 
  AND s.status_name = 'available' 
  AND r.room_code = 'MPAC-204'
ON CONFLICT (asset_tag) DO NOTHING;

-- 9. Seed Users (Bcrypt hash: 'Password123!')
-- $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
INSERT INTO users (first_name, last_name, email, phone_number, password_hash, account_status) VALUES
('Marcus', 'Vance', 'admin@school.edu', '+256-700-112233', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
('Sarah', 'Jenkins', 's.jenkins@school.edu', '+256-700-223344', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
('Robert', 'Miller', 'r.miller@school.edu', '+256-700-334455', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active'),
('Alex', 'Rivera', 'alex.rivera@student.school.edu', '+256-700-445566', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'active')
ON CONFLICT (email) DO NOTHING;

-- 10. Assign Roles to Users
INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'admin@school.edu' AND r.role_name = 'ADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 's.jenkins@school.edu' AND r.role_name = 'STAFF'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'r.miller@school.edu' AND r.role_name = 'TECHNICIAN'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.user_id, r.role_id
FROM users u, roles r
WHERE u.email = 'alex.rivera@student.school.edu' AND r.role_name = 'STUDENT'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 11. Sample Reservations
INSERT INTO reservations (
    requested_by_user_id, purpose_type_id, purpose_details, status_id, requested_start_datetime, requested_end_datetime, pickup_room_id
)
SELECT 
    u.user_id,
    p.purpose_type_id,
    'Presentation for CSC 310 Senior Capstone project demonstration',
    s.status_id,
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day 3 hours',
    r.room_id
FROM users u
CROSS JOIN reservation_purpose_types p
CROSS JOIN reservation_status_types s
CROSS JOIN rooms r
WHERE u.email = 'alex.rivera@student.school.edu'
  AND p.purpose_name LIKE 'Academic Coursework%'
  AND s.status_name = 'approved'
  AND r.room_code = 'STC-101'
LIMIT 1;

-- 12. Attach Reservation Item
INSERT INTO reservation_items (
    reservation_id, model_id, equipment_id, quantity_requested, line_status
)
SELECT 
    res.reservation_id,
    eq.model_id,
    eq.equipment_id,
    1,
    'allocated'
FROM reservations res
CROSS JOIN equipment eq
WHERE eq.asset_tag = 'AST-PRJ-001'
ORDER BY res.reservation_id DESC
LIMIT 1;

-- 13. Sample Approval
INSERT INTO approvals (
    reservation_id, approver_user_id, decision, decision_reason, decided_at
)
SELECT 
    res.reservation_id,
    admin.user_id,
    'approved',
    'Equipment reservation approved for capstone demo in STC-101.',
    NOW()
FROM reservations res
CROSS JOIN users admin
WHERE admin.email = 'admin@school.edu'
ORDER BY res.reservation_id DESC
LIMIT 1;
