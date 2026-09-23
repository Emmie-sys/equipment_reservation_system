# Student Incident, Sanction & Disciplinary Management System

A multi-platform enterprise system for reporting student incidents, tracking demerit points, managing sanctions, and auditing disciplinary workflows.

---

## 📁 Repository Structure

```text
.
├── backend/            # PHP API (Laravel)
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/ # REST controllers (IncidentController, SanctionController...)
│   │   │   ├── Middleware/      # Role and JWT authentication checks
│   │   │   └── Requests/        # Form validation requests
│   │   ├── Models/              # Eloquent models (Student, Incident, Sanction, User)
│   │   ├── Services/            # Core business rules (DemeritService, AuditService)
│   │   └── Policies/            # Role-based authorization policies
│   ├── database/
│   │   ├── migrations/          # Schema migrations in dependency order
│   │   ├── seeders/             # Initial terms, classes, users, rules
│   │   └── factories/           # Model factories
│   ├── routes/
│   │   └── api.php              # REST API endpoints
│   ├── tests/                   # Unit & feature tests for business logic
│   ├── .env.example
│   └── composer.json
│
├── web/                # React Web Application (Vite / React 18+)
│   ├── src/
│   │   ├── api/                 # Resource API wrappers (incidents, sanctions, etc.)
│   │   ├── components/common/   # Reusable UI (Buttons, Tables, Modals)
│   │   ├── features/            # Feature modules (incidents, sanctions, students, dashboard)
│   │   ├── context/             # AuthContext (user, role, token)
│   │   ├── hooks/               # useAuth, useFetch, etc.
│   │   ├── routes/              # App routing & role-based route guards
│   │   └── utils/               # Formatting and helper utilities
│   ├── .env.example
│   └── package.json
│
├── mobile/             # React Native Mobile App
│   ├── src/
│   │   ├── api/                 # Mobile API client sharing schema with web
│   │   ├── components/          # Native components
│   │   ├── screens/             # LoginScreen, ReportIncidentScreen, MyIncidentsScreen
│   │   ├── navigation/          # React Navigation stacks & tabs
│   │   └── context/             # AuthContext & state providers
│   ├── android/
│   ├── ios/
│   └── package.json
│
├── shared/             # Framework-agnostic JS logic shared across Web & Mobile
│   ├── constants.js             # Offence severities, roles, status enums
│   └── validation.js            # Universal validation rules
│
├── database/           # Standalone DB artifacts
│   ├── schema.sql               # Full PostgreSQL DDL
│   ├── seed_data.sql            # Initial test and baseline data
│   └── erd.png                  # Entity-relationship diagram
│
├── docs/               # Architecture and documentation
│   ├── PROJECT_CONTEXT.md       # Full architectural context and business rules
│   ├── api-spec.md              # REST API specification
│   └── screenshots/             # UI screenshots and flow captures
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **PHP 8.2+** with `pdo_pgsql`, `mbstring`, `openssl`, and `bcmath` extensions
- **Composer** (v2+)
- **Node.js** (v18+ or v20+) & **npm**
- **PostgreSQL 14+**
- *(For mobile)*: React Native CLI / Expo CLI, Android Studio / Xcode

---

### 1. Database Setup (PostgreSQL)

Create a dedicated database for the application:

```bash
psql -U postgres -c "CREATE DATABASE student_incident_db;"
psql -U postgres -d student_incident_db -f database/schema.sql
psql -U postgres -d student_incident_db -f database/seed_data.sql
```

---

### 2. Backend Setup (Laravel API)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env
   ```
4. Configure database and JWT credentials in `.env`:
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=student_incident_db
   DB_USERNAME=postgres
   DB_PASSWORD=your_password

   JWT_SECRET=your_generated_jwt_secret
   ```
5. Generate application key and JWT secret:
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   ```
6. Run migrations & seeders (if not using standalone `schema.sql`):
   ```bash
   php artisan migrate --seed
   ```
7. Run the development server:
   ```bash
   php artisan serve --port=8000
   ```
   The backend API will be available at `http://127.0.0.1:8000/api`.

8. Run test suite:
   ```bash
   php artisan test
   ```

---

### 3. Web Setup (React Web Application)

1. Navigate to the web directory:
   ```bash
   cd web
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
   Ensure `VITE_API_BASE_URL=http://127.0.0.1:8000/api` is configured.
4. Start development server:
   ```bash
   npm run dev
   ```
   Access the dashboard at `http://localhost:5173`.

---

### 4. Mobile Setup (React Native)

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Metro bundler:
   ```bash
   npm start
   ```
4. Run on Android or iOS:
   ```bash
   npm run android
   # or
   npm run ios
   ```

---

## 🔒 User Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Admin** | Full system access, configuration, sanction policy management, user management. |
| **Dean / Disciplinary Officer** | Review incidents, approve/escalate sanctions, manage demerit thresholds. |
| **Staff / Teacher** | Report incidents, view reported history, comment on investigations. |
| **Student** | View assigned demerits, active sanctions, and personal history (read-only). |

---

## 📖 Documentation Links

- **[Project Context & Business Rules](file:///h:/equipment_reservation_system/docs/PROJECT_CONTEXT.md)**
- **[REST API Specification](file:///h:/equipment_reservation_system/docs/api-spec.md)**
- **[Database Schema DDL](file:///h:/equipment_reservation_system/database/schema.sql)**
- **[Database Seed Data](file:///h:/equipment_reservation_system/database/seed_data.sql)**
