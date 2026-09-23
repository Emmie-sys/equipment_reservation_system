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

## Default Institutional Demo Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin / Technician** | `admin@institution.edu` | `emmie` | Approve/Reject bookings, inventory management, audit trail |
| **Faculty / Staff** | `staff@institution.edu` | `emmie` | Request equipment, review department bookings |
| **Student** | `student@institution.edu` | `emmie` | Browse equipment catalog, submit bookings, cancel own bookings |

---

## Business Rules & Conflict Engine

- **Strict Interval Overlap Check**: Reservations check the interval formula:
  $$\text{Overlap} \iff (\text{Reservation.Start} < \text{Requested.End}) \land (\text{Reservation.End} > \text{Requested.Start})$$
  Double-bookings return HTTP 409 Conflict with the exact conflicting slot.
- **Audit Trails**: All status updates (pending -> approved -> active -> completed/cancelled) are recorded in both `reservation_status_history` and `audit_logs`.
- **Role Isolation**: Non-administrators can only query and manage their own reservations.
