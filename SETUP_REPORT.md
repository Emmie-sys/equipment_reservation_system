# Equipment Reservation System — Setup & Environment Report

**Prepared**: September 23, 2026
**Purpose**: This document is a record of the working environment, the tools installed, and the core system files that were created to make the Equipment Reservation System operational. It is intended as a reference for any developer picking up this project.

---

## Part 1: Working Environment

### Machine & OS

| Property | Value |
| :--- | :--- |
| Operating System | Windows (PowerShell environment) |
| Shell | PowerShell 5.1 |
| Project Root | `H:\equipment_reservation_system` |

---

### Installed Software Stack

#### 1. PHP 8.2 (via XAMPP)

- **Installation Path**: `C:\xampp\php\php.exe`
- **Version**: PHP 8.2.12
- **Purpose**: Runs the backend REST API using PHP's built-in development server.
- **Key Extensions Required** (must be enabled in `C:\xampp\php\php.ini`):
  - `extension=pdo_pgsql` — PDO driver for PostgreSQL
  - `extension=pgsql` — native PostgreSQL driver
- **How to confirm**:
  ```powershell
  C:\xampp\php\php.exe -m | findstr pgsql
  ```
  Expected output: `pdo_pgsql` and `pgsql` listed.

#### 2. PostgreSQL 18

- **Installation Path**: `C:\Program Files\PostgreSQL\18\bin\`
- **psql client**: `C:\Program Files\PostgreSQL\18\bin\psql.exe`
- **Server Port**: `5432` (default)
- **Superuser**: `postgres`
- **Database Password**: `emmie`
- **Database Name**: `equipment_reservation_system`
- **Schema**: 57 relational tables covering users, roles, equipment, reservations, audit logs, rooms, buildings, and supporting lookup tables.

#### 3. Node.js & npm

- **Purpose**: Required to run the React/Vite web frontend and the React Native/Expo mobile application.
- **npm** is used for all package management (`npm install`, `npm run dev`).

#### 4. Expo CLI

- **Installation**: Installed locally inside `mobile/node_modules/.bin/expo`.
- **Version**: 0.18.31 (npx expo)
- **Purpose**: Starts the Metro bundler for the React Native app, which is loaded on a physical device using the Expo Go app.

---

## Part 2: Project Folder Structure

```
H:\equipment_reservation_system\
│
├── backend\                    # PHP REST API (standalone, no framework)
│   └── public\
│       └── index.php           # MAIN API FILE — all routes and business logic
│
├── web\                        # React + Vite web frontend
│   ├── src\
│   │   ├── api\                # API client modules (client.js, auth.js, equipment.js, reservations.js, dashboard.js)
│   │   ├── context\            # AuthContext.jsx — global auth state
│   │   ├── features\           # Page-level components (dashboard, equipment, reservations, auth)
│   │   └── index.css           # Global design system (dark glassmorphism)
│   └── .env                    # VITE_API_BASE_URL configuration
│
├── mobile\                     # React Native + Expo mobile app
│   └── src\
│       ├── api\                # client.ts, equipment.ts, reservations.ts
│       ├── screens\            # LoginScreen, Catalog, NewReservation, MyReservations
│       └── navigation\         # AppNavigator.tsx (bottom tabs + stack)
│
├── database\
│   ├── schema.sql              # Full 57-table schema definition
│   └── seed_data.sql           # Seed data for roles, equipment, test users
│
├── docs\                       # Project documentation
│   ├── RUNNING_INSTRUCTIONS.md
│   └── api-spec.md
│
├── progress_notes\
│   └── current_progress_and_next_steps.md
│
├── run_backend.ps1             # PowerShell script to start PHP API server
└── run_mobile.ps1              # PowerShell script to start Expo bundler
```

---

## Part 3: Core System Files

### 3.1 Database Connection

**File**: `backend\public\index.php` (lines 19–42)

The backend connects to PostgreSQL using PHP's PDO extension. Connection parameters are read from environment variables with hardcoded fallbacks for development:

```php
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
        PDO::ATTR_ERRMODE    => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]
);
```

If the connection fails, the API immediately returns HTTP 500 with a JSON error — it does not silently fail.

**Prerequisite**: `pdo_pgsql` must be enabled in `php.ini`.

---

### 3.2 API Front Controller

**File**: `backend\public\index.php`

This is the single entry point for all API requests. It is a zero-dependency PHP file that acts as a router, controller, and service layer in one. Its structure is:

| Section | Line Range | Purpose |
| :--- | :--- | :--- |
| CORS Headers | 7–16 | Allows cross-origin requests from the web and mobile clients |
| Database Connection | 18–42 | Establishes the PDO PostgreSQL connection |
| Request Helpers | 44–95 | `sendResponse()` helper and `getAuthenticatedUser()` for token validation |
| Health Check | 99–108 | `GET /api/v1/health` — confirms server and DB are alive |
| Dashboard Stats | 110–188 | `GET /api/v1/dashboard/stats` — aggregate KPI metrics |
| Auth Routes | ~190–270 | Login, logout, me |
| Equipment Routes | ~272–440 | List, single GET, availability check |
| Reservation Routes | ~442–610 | List, create, approve, reject, cancel |
| Check-in / Check-out | ~612–730 | Custody transfer workflow |
| 404 Fallback | last line | Catches unmatched routes |

---

### 3.3 Authentication System

**File**: `backend\public\index.php` — `POST /api/v1/auth/login`

Authentication flow:

1. Client sends `{ email, password }` as JSON.
2. Server looks up the user by lowercase email in the `users` table.
3. Checks `account_status = 'active'` (the actual column — not a boolean `is_active`).
4. Verifies the password using `password_verify()` against the bcrypt hash stored in `password_hash`.
5. On success: fetches user roles from `user_roles` JOIN `roles`, and returns a Base64-encoded Bearer token in the format `base64(user_id:email)`.

Token validation (for protected routes) is handled by `getAuthenticatedUser($pdo)` which decodes the token and re-fetches the user from the DB on every request.

---

### 3.4 Web API Client

**File**: `web\src\api\client.js`

All HTTP calls from the web frontend go through this single client function. It automatically:
- Reads the Bearer token from `localStorage`.
- Attaches the `Authorization: Bearer <token>` header.
- Intercepts `401` responses and clears the stored token (auto-logout).
- Throws a descriptive error if the response is not `ok`.

The base URL is configured via `web\.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

---

### 3.5 Mobile API Client

**File**: `mobile\src\api\client.ts`

Mirrors the web client but uses `AsyncStorage` (via `mobile\src\utils\storage.ts`) instead of `localStorage`. The base URL is set to the machine's LAN IP so a physical device running Expo Go can reach the backend over Wi-Fi:

```typescript
// Update this if your network changes (run: ipconfig | findstr IPv4)
const BASE_URL = 'http://192.168.31.225:8000/api/v1';
```

---

### 3.6 Runner Scripts

#### `run_backend.ps1` (project root)

```powershell
.\run_backend.ps1
```

Resolves the PHP executable (checks PATH first, then XAMPP), then starts the PHP built-in development server:

```
php -S 0.0.0.0:8000 -t H:\equipment_reservation_system\backend\public
```

- Server binds to `0.0.0.0:8000` so both `localhost` (web browser) and the LAN IP (mobile device) can connect.

#### `run_mobile.ps1` (project root)

```powershell
.\run_mobile.ps1
```

Navigates to the `mobile\` directory and starts the Expo Metro bundler. The Expo Go app on your device scans the QR code displayed in the terminal.

---

## Part 4: Confirmed Test Credentials

These are the actual credentials verified against the live PostgreSQL database:

| Role | Email | Password |
| :--- | :--- | :--- |
| Administrator | `admin@school.edu` | `emmie` |
| Staff Member | `s.jenkins@school.edu` | `emmie` |
| Technician | `r.miller@school.edu` | `emmie` |
| Student | `alex.rivera@student.school.edu` | `emmie` |

All passwords were reset to `emmie` (bcrypt-hashed) during the initial setup session on September 23, 2026.

---

## Part 5: Known Issues Encountered & Resolved

### Issue 1 — PHP Extensions Not Enabled
- **Symptom**: `PDO driver pgsql not found` on server start.
- **Resolution**: Manually uncommented `extension=pdo_pgsql` and `extension=pgsql` in `C:\xampp\php\php.ini`.

### Issue 2 — Wrong Column Name `is_active`
- **Symptom**: `SQLSTATE[42703]: Undefined column: is_active` on every login attempt.
- **Root Cause**: The `users` table uses `account_status VARCHAR` (with value `'active'`) instead of a boolean `is_active` column. The API was written against an assumed schema.
- **Resolution**: Updated all SQL queries in `index.php` to select `account_status` and check `account_status = 'active'`.

### Issue 3 — Wrong Demo Email Domain
- **Symptom**: Login failed with `admin@institution.edu` even after Issue 2 was fixed.
- **Root Cause**: Seed data used `@school.edu` domain, not `@institution.edu`.
- **Resolution**: Updated all hardcoded demo emails in `LoginPage.jsx` (web) and `LoginScreen.tsx` (mobile) to the real `@school.edu` addresses.

### Issue 4 — Password Hash Mismatch
- **Symptom**: `password_verify()` returned false for all attempted passwords.
- **Root Cause**: The seed data used an unknown password hash.
- **Resolution**: Reset all 4 test user passwords directly in PostgreSQL to a fresh bcrypt hash of `"emmie"`.

---

## Part 6: How to Start the System

Open three separate terminal windows:

**Terminal 1 — Backend API**
```powershell
cd H:\equipment_reservation_system
.\run_backend.ps1
# Confirm: "PHP Development Server started" and no fatal errors appear
# Test: visit http://localhost:8000/api/v1/health in browser
```

**Terminal 2 — Web Frontend**
```powershell
cd H:\equipment_reservation_system\web
npm run dev
# Open: http://localhost:5173
# Login with: admin@school.edu / emmie
```

**Terminal 3 — Mobile App**
```powershell
cd H:\equipment_reservation_system
.\run_mobile.ps1
# Scan QR code with Expo Go on your device
# Ensure device is on same Wi-Fi network as this machine
```
