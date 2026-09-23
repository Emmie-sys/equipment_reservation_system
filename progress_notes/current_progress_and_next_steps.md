# Equipment Reservation System — Progress and Roadmap

**Date & Time**: September 23, 2026 (Updated)
**System Architecture**: Single REST Backend (PHP / PostgreSQL) serving React Web Client and React Native Mobile Client.

---

## 1. Where We Have Reached So Far

### Database Foundation (PostgreSQL 16)
- **Schema**: Completely mapped and documented across all 57 relational tables in `database/schema.sql`.
- **Seed Data**: Executed comprehensive seed script `database/seed_data.sql` with real institutional data:
  - System roles (`ADMIN`, `STAFF`, `STUDENT`, `TECHNICIAN`).
  - Core campus models, categories, equipment units with asset tags (`EQ-PROJ-001`, `EQ-CAM-001`, `EQ-LAP-001`), building locations, and room depots.
  - Reservation statuses (`pending`, `approved`, `active`, `completed`, `cancelled`, `rejected`).
  - Active test users with hashed credentials (`admin@institution.edu`, `student@institution.edu`, `staff@institution.edu` / password: `emmie`).

### Backend REST API (PHP Standalone)
- **Entry Point**: `backend/public/index.php` — zero-dependency front-controller.
- **Database Connection**: Configured for PostgreSQL with password `emmie` via environment variables.
- **Authentication**:
  - `POST /api/v1/auth/login` — email/password login, returns Base64 Bearer token.
  - `POST /api/v1/auth/logout` — stateless logout.
  - `GET /api/v1/auth/me` — current user profile with roles.
- **Dashboard**:
  - `GET /api/v1/dashboard/stats` — aggregate metrics (total equipment, available, pending, active reservations, today's bookings, in-maintenance count, recent bookings, popular equipment by booking count).
- **Equipment**:
  - `GET /api/v1/equipment` — filterable catalog (search, status).
  - `GET /api/v1/equipment/{id}` — single equipment unit detail.
  - `GET /api/v1/equipment/{id}/availability?start_time=&end_time=` — conflict detection using half-open interval.
- **Reservations**:
  - `GET /api/v1/reservations` — filterable list (status, user_id).
  - `POST /api/v1/reservations` — create reservation with atomic transaction.
  - `PATCH /api/v1/reservations/{id}/approve` — approve with comments.
  - `PATCH /api/v1/reservations/{id}/reject` — reject with reason.
  - `PATCH /api/v1/reservations/{id}/cancel` — cancel by owner or admin.
  - `PATCH /api/v1/reservations/{id}/checkin` — hand equipment to requester, sets status to `active`, marks equipment `in_use`.
  - `PATCH /api/v1/reservations/{id}/checkout` — process return, sets status to `completed`, returns equipment to `available`, optionally records condition notes.
- **Audit Logging**: All state transitions written to `audit_logs` table.
- **Conflict Prevention**: Half-open interval formula `(start < q_end) AND (end > q_start)` prevents double-bookings.

### Web Frontend (React + Vite)
- **Design System**: Dark-mode glassmorphism styling with HSL/indigo palette.
- **Dashboard (`DashboardView.jsx`)**:
  - Pulls live stats from `/api/v1/dashboard/stats`.
  - Displays 6 KPI cards: Total Equipment, Available Units, Pending Approval, Active/Scheduled, In Maintenance, Reservations Today.
  - Recent bookings table and popular equipment list from real data.
  - Admin quick-action buttons.
- **Equipment Catalog (`EquipmentCatalogPage.jsx`)**:
  - Filterable hardware catalog with real-time conflict checker.
  - Modal reservation form.
- **Reservations (`ReservationsPage.jsx`)**:
  - Role-gated action buttons: Approve, Reject, Check-In, Return, Cancel.
  - Check-In modal confirms handover and moves reservation to Active.
  - Return modal captures condition notes and return notes, marks Completed.
  - Filter tabs: All, Pending, Approved, Active, Completed, Cancelled.
- **Authentication**: `LoginPage.jsx` with demo credential buttons.

### Mobile Client (React Native + Expo)
- **API Client**: `mobile/src/api/client.ts` — BASE_URL set to machine LAN IP `192.168.31.225:8000`.
- **Reservation API**: `mobileReservationApi` with `checkin` and `checkout` methods (parity with web).
- **Screens**:
  - `LoginScreen.tsx`, `EquipmentCatalogScreen.tsx`, `NewReservationScreen.tsx`, `MyReservationsScreen.tsx`.
  - `AppNavigator.tsx`: Bottom tab navigation.

### Operations & Infrastructure
- `run_backend.ps1` — launches PHP dev server on port 8000 from the project root.
- `run_mobile.ps1` — launches Expo bundler for the mobile app.
- Web: `cd web && npm run dev` (Vite on port 5173).

---

## 2. Where to Pick Up From (Next Steps)

### Priority 1 — Web Frontend Enhancements
- Equipment Management CRUD view for Technicians/Admins (create new asset, update condition, decommission/archive).
- User management screen (list users, change roles, activate/deactivate accounts).
- Interactive timeline or calendar view showing equipment availability slots.
- Export reports (CSV/PDF) of reservation logs and audit trails.

### Priority 2 — Mobile Enhancements
- Barcode / QR scanner using `expo-camera` or `expo-barcode-scanner` for instant equipment check-in and return.
- Push notifications for booking approvals and return reminders via Expo Notifications.
- Offline-first caching of equipment catalog using AsyncStorage or MMKV.

### Priority 3 — Backend Enhancements
- Email notifications (PHP mail / SMTP) when a booking is approved, rejected, or approaching return deadline.
- Incident / Damage Reporting endpoint: if equipment is returned damaged, attach condition incident to a new `equipment_incidents` record.
- Pagination for equipment and reservations list endpoints (add `?page=&per_page=` support).
- Full-text search improvements using PostgreSQL `tsvector`.

### Priority 4 — QA & Testing
- PHPUnit tests for `AvailabilityService` conflict scenarios.
- Cypress or Playwright end-to-end tests for the web workflows (login, book, approve, check-in, return).
- Load testing of the PHP built-in server (consider moving to Apache/Nginx + PHP-FPM for production).

---

## 3. Account Credentials for Testing

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| System Administrator | `admin@institution.edu` | `emmie` | Full approval rights, equipment catalog management, audit logs, check-in/return |
| Staff Member | `staff@institution.edu` | `emmie` | Request equipment, review department bookings, approve/check-in/return |
| Student | `student@institution.edu` | `emmie` | Browse catalog, check availability, request bookings, cancel own bookings |

---

## 4. Configuration Notes

| Setting | Value |
| :--- | :--- |
| Database Host | `127.0.0.1:5432` |
| Database Name | `equipment_reservation_system` |
| Database Password | `emmie` |
| Backend Port | `8000` |
| Web Dev Port | `5173` |
| Mobile LAN IP | `192.168.31.225` (update if network changes) |
| PHP Executable | `C:\xampp\php\php.exe` |
