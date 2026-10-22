# Institutional Equipment Reservation and Tracking System

A full-stack enterprise institutional equipment reservation and asset tracking system. A single PostgreSQL-backed PHP REST API powers two dedicated client applications: a modern React Web Portal and a React Native Mobile App (ready for Expo Go).

---

## System Architecture

```text
                 ┌──────────────────────────────────────────────┐
                 │       PostgreSQL 16 Relational Database      │
                 │     57 Tables (port 5432, password: emmie)   │
                 └──────────────────────▲───────────────────────┘
                                        │
                         SQL (PDO / Eloquent Models)
                                        │
                 ┌──────────────────────┴───────────────────────┐
                 │       PHP / Laravel REST API (v1)            │
                 │   JWT Auth, Availability Engine, Audit Logs  │
                 │              (Port 8000)                     │
                 └──────────────▲────────────────▲──────────────┘
                                │                │
                      JSON / HTTPS             JSON / HTTPS
                                │                │
        ┌───────────────────────┴──────┐  ┌──────┴────────────────────────┐
        │       React Web Portal       │  │   React Native Mobile App     │
        │   Vite + Glassmorphism UI    │  │       (Expo Go Mobile)        │
        │         (Port 5173)          │  │     (Android / iOS Phones)    │
        └──────────────────────────────┘  └───────────────────────────────┘
```

---

## Repository Structure

```text
.
├── run_backend.ps1     # PowerShell script to start PHP backend API
├── run_mobile.ps1      # PowerShell script to start Expo mobile development server
├── backend/            # PHP / Laravel REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # AuthController, EquipmentController, ReservationController
│   │   │   └── Requests/        # StoreReservationRequest (server validation)
│   │   ├── Models/              # Equipment, Reservation, User, Role, Room, Approval, etc.
│   │   ├── Services/            # AvailabilityService (conflict engine), ReservationService, AuditService
│   │   ├── Policies/            # ReservationPolicy, EquipmentPolicy
│   │   └── Exceptions/          # EquipmentConflictException (HTTP 409)
│   ├── config/                  # database.php (PostgreSQL connection)
│   ├── routes/
│   │   └── api.php              # Full v1 REST routes (/auth, /equipment, /reservations)
│   └── tests/Unit/              # AvailabilityServiceTest.php (interval math tests)
│
├── web/                # React Web Portal (Vite + Tailwind/CSS Variables)
│   ├── src/
│   │   ├── api/                 # client.js, auth.js, equipment.js, reservations.js
│   │   ├── context/             # AuthContext.jsx (session token, user role)
│   │   ├── features/
│   │   │   ├── auth/            # LoginPage.jsx (one-click demo logins)
│   │   │   ├── dashboard/       # DashboardView.jsx (KPI metrics, recent bookings)
│   │   │   ├── equipment/       # EquipmentCatalogPage.jsx (search, availability check, modal booking)
│   │   │   └── reservations/    # ReservationsPage.jsx (review, approve, reject, cancel)
│   │   ├── routes/              # AppRoutes.jsx, ProtectedRoute.jsx
│   │   ├── index.css            # Dark glassmorphism design system
│   │   └── App.jsx              # Sidebar layout, topbar, user profile badge
│   └── package.json
│
├── mobile/             # React Native Mobile App (Expo Go ready)
│   ├── src/
│   │   ├── api/                 # mobileApiClient, equipment.ts, reservations.ts
│   │   ├── context/             # AuthContext.tsx
│   │   ├── navigation/          # AppNavigator.tsx (bottom tabs + stack)
│   │   └── screens/
│   │       ├── LoginScreen.tsx          # Mobile authentication
│   │       ├── EquipmentCatalogScreen.tsx # Searchable inventory
│   │       ├── NewReservationScreen.tsx # Time slot picker & conflict check
│   │       └── MyReservationsScreen.tsx # Student/Faculty personal bookings
│   ├── app.json         # Expo configuration
│   └── package.json
│
├── shared/             # Domain constants & validation logic shared across Web & Mobile
│   ├── constants.js     # Status types, purpose types, error codes
│   └── validation.js    # Time range and input validation
│
├── database/           # PostgreSQL DDL & Test Data
│   ├── schema.sql       # Complete 57-table PostgreSQL schema
│   └── seed_data.sql    # System roles, categories, test equipment, rooms, users
│
├── docs/               # Technical documentation
│   ├── RUNNING_INSTRUCTIONS.md # Step-by-step launch guide for Backend, Web & Mobile
│   ├── PROJECT_CONTEXT.md      # Domain architecture and data flows
│   └── api-spec.md             # REST API endpoint specifications
│
├── progress_notes/     # Development milestone tracking
│   └── current_progress_and_next_steps.md # Detailed progress & roadmap
│
├── .gitignore
└── README.md
```

---

## Quick Start Instructions

Detailed, step-by-step instructions are available in [docs/RUNNING_INSTRUCTIONS.md](file:///H:/equipment_reservation_system/docs/RUNNING_INSTRUCTIONS.md).

### 1. Backend REST API
Run the backend starter script:
```powershell
.\run_backend.ps1
```
Or execute manually:
```powershell
cd H:\equipment_reservation_system\backend
& C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public
```

### 2. React Web Portal
```powershell
cd H:\equipment_reservation_system\web
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. React Native Mobile App (with Expo Go)
1. Verify `BASE_URL` in `mobile/src/api/client.ts` points to your machine's Wi-Fi IP (e.g. `http://192.168.x.x:8000/api/v1`).
2. Run the mobile starter script:
```powershell
.\run_mobile.ps1
```
Or execute manually:
```powershell
cd H:\equipment_reservation_system\mobile
npx expo start
```
3. Open Expo Go on your device, scan the QR code, and test immediately.

---

## Institutional Testing Credentials

> **Note:** These credentials are for development and testing only. In production the system integrates with the university's SSO provider (SAML 2.0 / LDAP). Credentials must **not** be displayed or hardcoded on any authentication page.

| Role | Email | Password | Dashboard & Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gu.ac.ug` | `emmie` | Full system governance, depot fleet management with CRUD, student & staff SSO provisioning, user role management (full CRUD), system configuration settings, broadcast messaging, approve/reject all reservations, audit logs |
| **Attendant** | `attendant@gu.ac.ug` | `emmie` | Dispatch operations desk, depot fleet management with CRUD, physical handover (check-in loan) & return inspection (check-out), faulty fleet resolution board, provision students for SSO, custom messaging & reminders |
| **Lecturer** | `lecturer@gu.ac.ug` | `emmie` | Academic course practicals desk, personal bookings overview only, unbooked equipment catalog reservation, delegation to class reps, messaging inbox |
| **Student (Class Rep)** | `student@gmail.com` | `emmie` | Class representative portal, personal loan countdown and overview only, unbooked equipment catalog reservation, view active loans, cancel pending bookings, messaging inbox |

### Role-Based Access Control (RBAC) Architecture

#### 1. Web Portal (`web/`)
- **[AppShell.jsx](file:///h:/equipment_reservation_system/web/src/components/layout/AppShell.jsx)**: 4 independent navigation schemes tailored specifically for `STUDENT`, `LECTURER`, `ATTENDANT`, and `ADMIN`.
- **[AppRoutes.jsx](file:///h:/equipment_reservation_system/web/src/routes/AppRoutes.jsx)**: Route guards (`RoleRoute`) protecting privileged paths:
  - `/equipment/faulty` — Admin & Attendant only
  - `/users` — Admin & Attendant only
  - `/roles` — Admin only
  - `/settings` — Admin only
- **[EquipmentCatalogPage.jsx](file:///h:/equipment_reservation_system/web/src/features/equipment/EquipmentCatalogPage.jsx)**: Automatically filters out booked units for Students & Lecturers; reveals full fleet and Add/Edit/Delete actions for Attendants & Admins.
- **[ReservationsPage.jsx](file:///h:/equipment_reservation_system/web/src/features/reservations/ReservationsPage.jsx)**: Displays "My Reservations" for non-staff (strictly personal), and "Depot Reservations Management" for staff with approval/handover/checkin actions.
- **[FaultyEquipmentPage.jsx](file:///h:/equipment_reservation_system/web/src/features/equipment/FaultyEquipmentPage.jsx)**: Dedicated resolution board for equipment in maintenance, faulty, or decommissioned states.
- **[UserManagementPage.jsx](file:///h:/equipment_reservation_system/web/src/features/users/UserManagementPage.jsx)**: University user directory with SSO student provisioning and admin status governance.
- **[MessagesPage.jsx](file:///h:/equipment_reservation_system/web/src/features/messages/MessagesPage.jsx)**: Tabbed inbox, sent items, and compose modal with broadcast options.
- **[RolesManagementPage.jsx](file:///h:/equipment_reservation_system/web/src/features/admin/RolesManagementPage.jsx)**: Role permissions and descriptions CRUD.
- **[SystemSettingsPage.jsx](file:///h:/equipment_reservation_system/web/src/features/admin/SystemSettingsPage.jsx)**: Operational parameters (max loan duration, academic year, auto-approvals, maintenance mode).

#### 2. Mobile App (`mobile/`)
- **[AppNavigator.tsx](file:///h:/equipment_reservation_system/mobile/src/navigation/AppNavigator.tsx)**: Dynamically renders bottom tabs based on the authenticated user's role:
  - **Student / Lecturer**: Overview, Catalog (unbooked only), My Loans, Messages, Account
  - **Attendant**: Dispatch Desk, Fleet (all units), Bookings Queue, Faulty Gear, Add User (SSO), Account
  - **Admin**: Governance, Fleet, Bookings Queue, Faulty Fleet, User Governance, Account
- **[HomeScreen.tsx](file:///h:/equipment_reservation_system/mobile/src/screens/HomeScreen.tsx)**: Role-specialized dashboard view with Apple HIG spring animations and metrics.
- **[EquipmentCatalogScreen.tsx](file:///h:/equipment_reservation_system/mobile/src/screens/EquipmentCatalogScreen.tsx)**: Automatic unbooked filtering for student accounts.
- **[FaultyEquipmentScreen.tsx](file:///h:/equipment_reservation_system/mobile/src/screens/FaultyEquipmentScreen.tsx)**: Mobile repair and servicing resolution board.
- **[UserManagementScreen.tsx](file:///h:/equipment_reservation_system/mobile/src/screens/UserManagementScreen.tsx)**: Mobile SSO user and student provisioning.
- **[MyReservationsScreen.tsx](file:///h:/equipment_reservation_system/mobile/src/screens/MyReservationsScreen.tsx)**: Interactive mobile dispatch queue with 1-tap Approve, Reject, Handover, and Return actions.

---

## Business Rules & Conflict Engine

- **Strict Interval Overlap Check**: Reservations check the interval formula:
  $$\text{Overlap} \iff (\text{Reservation.Start} < \text{Requested.End}) \land (\text{Reservation.End} > \text{Requested.Start})$$
  Double-bookings return HTTP 409 Conflict with the exact conflicting slot.
- **Audit Trails**: All status updates (pending -> approved -> active -> completed/cancelled) are recorded in both `reservation_status_history` and `audit_logs`.
- **Role Isolation**: Non-administrators (Students, Lecturers) are strictly restricted at both backend REST API and frontend levels to their own personal reservations.

