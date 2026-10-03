# RESERViT — Phase 1 Progress Report
## Full-Stack Foundation: Database, Backend API & Web Frontend

**Period**: September 23–28, 2026
**Prepared**: September 30, 2026
**System Name**: RESERViT (Equipment Reservation System)
**Project Root**: `H:\equipment_reservation_system`

---

## Executive Summary

Phase 1 delivered the complete working foundation of the RESERViT system. All three core layers — **database**, **backend REST API**, and **web frontend** — were built, debugged, and confirmed operational on a local development environment. By the end of Phase 1, every role (Admin, Staff, Technician, Student) could authenticate, browse the equipment catalog, submit reservations, and progress them through the full lifecycle: _pending → approved → active → completed_.

---

## 1. Environment & Infrastructure

### Development Stack Confirmed

| Component | Technology | Version / Detail |
| :--- | :--- | :--- |
| Operating System | Windows (PowerShell) | PowerShell 5.1 |
| Database | PostgreSQL | 18, port 5432 |
| Backend Runtime | PHP | 8.2.12 via XAMPP |
| Web Framework | React + Vite | Node.js / npm |
| Mobile Framework | React Native + Expo | SDK 51 (initial) |
| Project Root | — | `H:\equipment_reservation_system` |

### PHP Configuration Fixes

Two PHP extensions were required and were **not enabled by default** — manually activated in `C:\xampp\php\php.ini`:

- `extension=pdo_pgsql` — PDO driver for PostgreSQL
- `extension=pgsql` — native PostgreSQL driver

### Runner Scripts Created

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `run_backend.ps1` | `.\run_backend.ps1` | Launches PHP dev server on `0.0.0.0:8000` |
| `run_mobile.ps1` | `.\run_mobile.ps1` | Starts Expo Metro bundler with auto LAN IP detection |

---

## 2. Database Layer (PostgreSQL)

### Schema — 57 Relational Tables

| Entity Group | Key Tables | Purpose |
| :--- | :--- | :--- |
| Identity & Access | `users`, `roles`, `user_roles` | Authentication, RBAC |
| Equipment | `equipment`, `equipment_models`, `equipment_categories`, `equipment_status_types` | Physical inventory |
| Reservations | `reservations`, `reservation_items`, `reservation_status_types`, `approvals` | Booking lifecycle |
| Locations | `campuses`, `buildings`, `rooms` | Custody & dispatch tracking |
| Audit | `audit_logs`, `checkout_records`, `return_records` | Full action trail |
| Lookups | `purpose_types`, `condition_types`, and 40+ supporting tables | Reference data |

### Seed Data Loaded

- **4 system roles**: `ADMIN`, `STAFF`, `STUDENT`, `TECHNICIAN`
- **Equipment models**: Projectors, DSLR cameras, laptops, oscilloscopes, PA systems, VR headsets
- **Individual units**: Asset-tagged inventory (e.g. `EQ-PROJ-001`, `EQ-CAM-001`, `EQ-LAP-001`)
- **Reservation statuses**: `pending`, `approved`, `rejected`, `active`, `completed`, `cancelled`
- **Test users** (all password: `emmie`):

| Role | Email |
| :--- | :--- |
| Administrator | `admin@school.edu` |
| Staff Member | `s.jenkins@school.edu` |
| Technician | `r.miller@school.edu` |
| Student | `alex.rivera@student.school.edu` |

### Issues Encountered & Resolved

| # | Issue | Root Cause | Fix |
| :--- | :--- | :--- | :--- |
| 1 | `PDO driver not found` on server start | `pdo_pgsql` extension disabled in `php.ini` | Manually uncommented in `php.ini` |
| 2 | `Undefined column: is_active` on every login | Schema uses `account_status VARCHAR`, not a boolean | Updated all SQL to use `account_status = 'active'` |
| 3 | Login failed with `@institution.edu` emails | Seed data uses `@school.edu` domain | Updated all hardcoded demo emails in web and mobile |
| 4 | `password_verify()` returned false for all users | Seed data contained an unknown hash | Reset all 4 test passwords to a fresh bcrypt hash of `emmie` |

---

## 3. Backend REST API (PHP Standalone)

### Architecture

- **Entry Point**: `backend/public/index.php` — a single zero-dependency PHP file (router + controller + service layer)
- **No framework** — pure PDO + PHP OOP
- **Authentication**: Base64-encoded Bearer tokens (`base64(user_id:email)`) validated per-request via `getAuthenticatedUser()`
- **CORS**: Configured to allow requests from web (`localhost:5173`) and mobile (any LAN origin)

### Implemented Endpoints

| Group | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| Auth | POST | `/api/v1/auth/login` | Email/password login — returns token + user |
| Auth | POST | `/api/v1/auth/logout` | Stateless token clear |
| Auth | GET | `/api/v1/auth/me` | Current user profile with roles |
| Dashboard | GET | `/api/v1/dashboard/stats` | KPI aggregates — total, available, pending, active, in-maintenance, today |
| Equipment | GET | `/api/v1/equipment` | Filterable catalog (search, status, category) |
| Equipment | GET | `/api/v1/equipment/{id}` | Single unit detail with model, room, status |
| Equipment | GET | `/api/v1/equipment/{id}/availability` | Conflict check (half-open interval) |
| Reservations | GET | `/api/v1/reservations` | Role-gated filterable list |
| Reservations | POST | `/api/v1/reservations` | Create booking (atomic transaction) |
| Reservations | PATCH | `/api/v1/reservations/{id}/approve` | Admin/Staff approval with comments |
| Reservations | PATCH | `/api/v1/reservations/{id}/reject` | Admin/Staff rejection with reason |
| Reservations | PATCH | `/api/v1/reservations/{id}/cancel` | Cancel by owner or admin |
| Reservations | PATCH | `/api/v1/reservations/{id}/checkin` | Dispatch equipment — status becomes `active` |
| Reservations | PATCH | `/api/v1/reservations/{id}/checkout` | Process return with condition notes — status becomes `completed` |

### Conflict Prevention Logic

```sql
WHERE r.requested_start_datetime < :requested_end
  AND r.requested_end_datetime   > :requested_start
  AND rst.status_name IN ('pending', 'approved', 'active')
```

Half-open interval formula prevents double-bookings and handles shared boundary timestamps correctly.

---

## 4. Web Frontend (React + Vite)

### RESERViT Design System

| Token | Value |
| :--- | :--- |
| Forest Pine | `#09381F` |
| Botanical Emerald | `#1B6A41` |
| Royal Deep Plum | `#5A2D5C` |
| Muted Lilac Mist | `#E6D4E6` |
| Philosophy | Apple simplicity + functional glassmorphism — zero gradients |
| Typography | Plus Jakarta Sans (Headlines), Inter (Body) |

### Pages & Dashboards

| Page | File | Description |
| :--- | :--- | :--- |
| Login | `LoginPage.jsx` | Branded glass form with demo credential buttons |
| Admin Dashboard | `AdminDashboard.jsx` | 6 KPI cards, recent bookings, popular equipment, approval queue |
| Staff Dashboard | `StaffDashboard.jsx` | Active loans, pending approvals, team equipment view |
| Student Dashboard | `StudentDashboard.jsx` | My reservations, catalog shortcut, active loans |
| Technician Dashboard | `TechnicianDashboard.jsx` | Check-in/out queue, maintenance tracker |
| Role Router | `DashboardView.jsx` | Renders correct dashboard per role |
| Equipment Catalog | `EquipmentCatalogPage.jsx` | Searchable catalog, availability check, modal reservation form |
| Reservations | `ReservationsPage.jsx` | Status filter tabs, approve/reject/check-in/return |
| Profile | `ProfilePage.jsx` | User info, role badge, account details |
| Style Guide | `StyleGuidePage.jsx` | Interactive component showcase |

---

## 5. Phase 1 Delivered Checklist

| Deliverable | Status |
| :--- | :--- |
| PostgreSQL schema (57 tables) | ✅ Complete |
| Seed data (roles, equipment, test users) | ✅ Complete |
| PHP REST API — all CRUD endpoints | ✅ Complete |
| Authentication (login / logout / me) | ✅ Complete |
| Booking lifecycle (submit → approve → active → complete) | ✅ Complete |
| Conflict prevention engine | ✅ Complete |
| Audit logging | ✅ Complete |
| React web frontend — all 4 role dashboards | ✅ Complete |
| Equipment catalog with real-time availability check | ✅ Complete |
| Reservations page with approval / check-in / return | ✅ Complete |
| RESERViT brand system (colors, typography, glassmorphism) | ✅ Complete |
| Runner scripts | ✅ Complete |
| Working test credentials for all 4 roles | ✅ Complete |

---

## 6. How to Start the System

```powershell
# Terminal 1 — Backend API
cd H:\equipment_reservation_system
.\run_backend.ps1
# Verify at: http://localhost:8000/api/v1/health

# Terminal 2 — Web Frontend
cd H:\equipment_reservation_system\web
npm run dev
# Open: http://localhost:5173  |  Login: admin@school.edu / emmie

# Terminal 3 — Mobile App
cd H:\equipment_reservation_system\mobile
.\run_mobile.ps1 -Clear
# Scan QR code with Expo Go on your device
```

---

*This report covers Phase 1: September 23–28, 2026.*
*See PROGRESS_REPORT_PHASE_2.md for the UI redesign, mobile frontend build, and SDK upgrade work.*
