# RESERViT — Phase 2 Progress Report
## UI Redesign, Mobile Frontend Build & SDK Upgrade

**Period**: September 29–30, 2026
**Prepared**: September 30, 2026
**System Name**: RESERViT (Equipment Reservation System)
**Continuation of**: PROGRESS_REPORT_PHASE_1.md

---

## Executive Summary

Phase 2 focused on two major work streams running in parallel:

1. **UI Polish & Brand Alignment** — A comprehensive audit and refactor of the web frontend to enforce the RESERViT design language across all dashboards and pages, eliminating all gradients and fixing icon color clashing.
2. **Mobile Frontend Build** — Construction of a complete React Native / Expo mobile application from scratch, covering all core user flows: login, dashboard, equipment catalog, reservations, and new reservation submission.

The phase concluded with diagnosing and fixing Expo SDK compatibility issues (SDK 51 → SDK 57) and resolving three critical dependency problems that were preventing the app from loading in Expo Go on a physical device.

---

## 1. Work Stream A: Web Frontend UI Redesign

### 1.1 Design Mandate (User Requirements)

The following requirements drove all Phase 2 web changes:

> "I don't want any gradient, whether in cards or anything else, just use the given colors professionally."
> "Most icons are having clashing colors, fix that too."

### 1.2 Global CSS Overhaul — `index.css`

All `linear-gradient` and `radial-gradient` declarations were removed from the global stylesheet and replaced with solid, brand-consistent surfaces using the established CSS variable system:

| CSS Section | Before | After |
| :--- | :--- | :--- |
| Canvas background | `radial-gradient(...)` | `var(--color-canvas)` solid |
| Primary buttons | `linear-gradient(...)` | `var(--color-brand-emerald)` solid |
| Active nav links | `linear-gradient(...)` | `background: var(--color-surface-secondary)` |
| Skeleton loaders | `linear-gradient(...)` | Solid muted surface |
| Brand glyph | `linear-gradient(...)` | Solid `#09381F` Forest Pine |

### 1.3 Components Refactored

#### `StatCard.jsx`
- Replaced hard-coded, clashing icon background colors with a **variant map** tied to the theme palette
- Icon variants: `forest` (green), `plum` (lilac), `neutral` (muted)
- Each variant uses coordinated `bg`, `icon color`, and `border` tokens from the design system

#### `LineChart.jsx`
- Replaced SVG `linearGradient` fill under the activity line with a solid, low-opacity fill using brand colors
- Chart line and fill now use `#1B6A41` (Botanical Emerald) at reduced opacity

#### `AppShell.jsx`
- Removed gradient sidebar background
- Active navigation item now uses a solid surface highlight, not a gradient pill

### 1.4 Dashboards & Pages Refactored

Every page that previously had gradient headers, hero banners, or card backgrounds was updated:

| File | Change |
| :--- | :--- |
| `AdminDashboard.jsx` | Hero banner → solid `surfacePrimary`; icon palette harmonized |
| `StaffDashboard.jsx` | Card headers → solid brand surfaces |
| `StudentDashboard.jsx` | Welcome banner → solid; icon colors mapped to theme |
| `EquipmentCatalogPage.jsx` | Header → solid; availability badge colors fixed |
| `LoginPage.jsx` | Brand glyph → solid Forest Pine; no gradient overlay |
| `ProfilePage.jsx` | Avatar / header area → solid surface |
| `StyleGuidePage.jsx` | All component demos updated to reflect new token usage |

---

## 2. Work Stream B: Mobile Frontend Build (React Native + Expo)

### 2.1 Architecture & Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React Native (Expo managed workflow) |
| Language | TypeScript |
| Navigation | React Navigation v6 (bottom tabs + native stack) |
| Icons | `@expo/vector-icons` (Ionicons set) |
| API Client | Custom `fetch`-based client in `src/api/client.ts` |
| Auth State | React Context (`AuthContext.tsx`) |
| Token Storage | In-memory (`utils/storage.ts`) |
| Theme | Custom token system (`src/theme.ts`) |

### 2.2 Mobile Design Token System — `src/theme.ts`

A new design token file was created for the mobile app, mirroring the web brand system but adapted for React Native's `StyleSheet` API:

**Brand Primitives**

| Token | Value | Usage |
| :--- | :--- | :--- |
| `brandForestDark` | `#09381F` | Primary brand, button backgrounds, glyph |
| `brandForestMid` | `#155E38` | Hover/pressed surfaces |
| `brandForestVivid` | `#1B6A41` | Active states, icon backgrounds |
| `brandLilacBase` | `#E6D4E6` | Accent highlights, primary button text |
| `brandPlumDeep` | `#5A2D5C` | Secondary accent, maintenance badges |

**Surface Tokens (Zero Gradients)**

| Token | Value | Usage |
| :--- | :--- | :--- |
| `canvasBg` | `#05130A` | App background |
| `surfacePrimary` | `rgba(10, 33, 20, 0.78)` | Cards, panels |
| `surfaceCard` | `#0A2616` | Static card background |
| `surfaceInput` | `rgba(9, 56, 31, 0.45)` | Text input fields |

**Harmonious Icon Color Variants**

| Variant | Background | Icon Color | Usage |
| :--- | :--- | :--- | :--- |
| `forest` | green-tinted bg | `#34D399` | Active, available states |
| `lilac` | plum-tinted bg | `#E6D4E6` | Pending, secondary stats |
| `neutral` | muted bg | `#CBD5E1` | Location, informational |

### 2.3 Reusable Components Built

| Component | File | Description |
| :--- | :--- | :--- |
| Glass Card | `GlassCard.tsx` | Pressable and static card with brand border + surface |
| Badge | `Badge.tsx` | Status pill (available, pending, active, rejected, brand, lilac) |
| Button | `Button.tsx` | Branded Pressable — variants: primary, secondary, plum, danger, outline |
| Stat Card | `StatCard.tsx` | KPI metric card with icon, value, label, trend — uses theme icon variants |
| App Header | `AppHeader.tsx` | Top navigation bar with RESERViT logo, user initials avatar, logout button |

### 2.4 Screens Built

#### `LoginScreen.tsx`
- Branded header with `R` glyph in Forest Pine
- Institutional SSO form (email + password)
- Error display with red alert box
- **Demo credential buttons**: one-tap pre-fill for Student, Staff, Admin
- Connected to `/api/v1/auth/login`

#### `HomeScreen.tsx` (Dashboard)
- **Welcome banner**: user first name greeting, two quick-action buttons (Browse Catalog, My Bookings)
- **4 KPI StatCards**: Active Loans, Pending Requests, Campus Units, Pickup Depot
- **Active Loans list**: real data from `/api/v1/reservations`, filtered by `active` status
- **Empty state**: illustrated with icon + copy when no active loans
- **Campus Pickup Info card**: hours and depot location
- Pull-to-refresh support

#### `EquipmentCatalogScreen.tsx`
- Category filter pills (All, Computing, Audiovisual, Photography, Laboratory)
- Live search input connected to `/api/v1/equipment?search=`
- Equipment list cards showing: model name, manufacturer, category, asset tag, location, availability badge
- **Reserve button** navigates to `NewReservationScreen` with equipment context passed as route param
- Pull-to-refresh support

#### `NewReservationScreen.tsx`
- Selected equipment summary card (name, asset tag, depot location)
- Date/time input fields for Start and Return
- **Check Availability** button — calls `/api/v1/equipment/{id}/availability`
- **Loan Purpose selector** — pill selection (Coursework, Research, Thesis, Org Presentation)
- Project details text area
- **Confirm Loan Request** button — posts to `/api/v1/reservations`
- Success alert with navigation to My Bookings

#### `MyReservationsScreen.tsx`
- Status filter tabs: All, Active, Pending, Completed
- Reservation cards showing: equipment name, purpose, date range, status badge
- **Cancel button** on pending reservations — with confirmation alert
- **Return Equipment button** on active reservations
- Empty states per filter tab
- Pull-to-refresh support

### 2.5 Navigation Structure

```
AppNavigator
  └── Stack (auth gate)
       ├── Login (unauthenticated)
       └── MainTabs (authenticated)
            ├── HomeTab     → HomeScreen
            ├── CatalogTab  → CatalogStack
            │    ├── CatalogList   → EquipmentCatalogScreen
            │    └── NewReservation → NewReservationScreen
            └── MyReservations    → MyReservationsScreen
```

**Tab Bar Style**: Dark background (`#05130A`), active tab in `#34D399` (Forest Green), inactive in muted lilac.

### 2.6 API Client — `src/api/client.ts`

The mobile API client resolves the backend URL dynamically using a priority chain:

1. **`EXPO_PUBLIC_API_URL`** environment variable (from `mobile/.env`) — set automatically by `run_mobile.ps1`
2. **Metro bundler `hostUri`** — auto-detected from `expo-constants` for Expo Go on a physical device
3. **Hardcoded LAN IP fallback** — last resort

This means the correct backend IP is resolved automatically when launching via `run_mobile.ps1` — no manual editing required on network changes.

---

## 3. SDK & Dependency Upgrade (September 24 & 30, 2026)

### 3.1 Expo SDK 51 → SDK 57 Upgrade

**Trigger**: Expo Go on the physical device was on SDK 57; the project was on SDK 51 — incompatible.

**Packages Upgraded**:

| Package | Old Version | New Version |
| :--- | :--- | :--- |
| `expo` | `~51.x` | `~57.0.26` |
| `react` | `18.x` | `19.2.3` |
| `react-native` | `0.74.x` | `0.86.3` |
| `expo-status-bar` | — | `~57.0.1` |
| `react-native-safe-area-context` | — | `~5.7.0` |
| `react-native-screens` | — | `~4.26.0` |

### 3.2 Three Critical Issues Fixed (September 30, 2026)

`npx expo-doctor` revealed the following issues:

| # | Issue | Impact | Fix |
| :--- | :--- | :--- | :--- |
| 1 | `expo-font` not installed | App crash — `@expo/vector-icons` requires `expo-font` as a peer dependency | Installed via `npx expo install expo-font` |
| 2 | TypeScript `7.0.2` installed (expected `~6.0.3`) | Build warnings, potential Metro bundler issues | Downgraded via `npm install --save-dev typescript@~6.0.3` |
| 3 | `app.json` contained invalid `splash` field | SDK 57 schema validation failure logged as an error | Removed `splash` key; kept only valid SDK 57 fields |

**Final state after fixes**:
```
npx expo install --check
→ Dependencies are up to date

npx tsc --noEmit
→ 0 errors
```

### 3.3 Updated `app.json`

```json
{
  "expo": {
    "name": "RESERViT",
    "slug": "equipreserve-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#05130A",
    "ios": { "supportsTablet": true },
    "android": { "adaptiveIcon": { "backgroundColor": "#09381F" } },
    "plugins": ["expo-font"]
  }
}
```

---

## 4. Phase 2 Delivered Checklist

### Web
| Deliverable | Status |
| :--- | :--- |
| All gradients removed from `index.css` | ✅ Complete |
| `StatCard.jsx` icon palette harmonized (no clashing colors) | ✅ Complete |
| `LineChart.jsx` SVG gradient replaced with solid fill | ✅ Complete |
| `AppShell.jsx` sidebar gradient removed | ✅ Complete |
| All 4 dashboards — gradient headers replaced with solid surfaces | ✅ Complete |
| `LoginPage.jsx`, `ProfilePage.jsx`, `StyleGuidePage.jsx` refactored | ✅ Complete |
| `EquipmentCatalogPage.jsx` badge colors harmonized | ✅ Complete |

### Mobile
| Deliverable | Status |
| :--- | :--- |
| `src/theme.ts` — gradient-free mobile design token system | ✅ Complete |
| `GlassCard.tsx`, `Badge.tsx`, `Button.tsx`, `StatCard.tsx` components | ✅ Complete |
| `AppHeader.tsx` — branded top bar with avatar + logout | ✅ Complete |
| `LoginScreen.tsx` — demo credential buttons, API-connected | ✅ Complete |
| `HomeScreen.tsx` — live dashboard with KPI cards + active loans | ✅ Complete |
| `EquipmentCatalogScreen.tsx` — search, filter, reserve | ✅ Complete |
| `NewReservationScreen.tsx` — availability check + booking submission | ✅ Complete |
| `MyReservationsScreen.tsx` — filter tabs, cancel, return actions | ✅ Complete |
| `AppNavigator.tsx` — bottom tab + stack navigation | ✅ Complete |
| `AuthContext.tsx` — user interface aligned with backend data | ✅ Complete |
| Expo SDK 51 → SDK 57 upgrade | ✅ Complete |
| `expo-font` peer dependency installed | ✅ Complete |
| TypeScript version corrected to `~6.0.3` | ✅ Complete |
| `app.json` schema errors fixed | ✅ Complete |
| `run_mobile.ps1` updated — auto-detects LAN IP, writes `mobile/.env` | ✅ Complete |

---

## 5. Current System State (End of Phase 2)

All three services are running and operational:

| Service | Command | URL / Access |
| :--- | :--- | :--- |
| Backend API | `.\run_backend.ps1` | `http://localhost:8000/api/v1` |
| Web Frontend | `npm run dev` (in `/web`) | `http://localhost:5173` |
| Mobile App | `.\run_mobile.ps1 -Clear` (in `/mobile`) | Expo Go — scan QR code |

---

## 6. Outstanding Work (Phase 3 Roadmap)

### Mobile
- [ ] `ProfileScreen.tsx` — user info, role badge, logout, app version (4th tab)
- [ ] Push notifications for booking approvals (Expo Notifications)
- [ ] Barcode / QR scanner for instant check-in (expo-camera)
- [ ] Offline catalog caching with AsyncStorage

### Web
- [ ] Equipment Management CRUD for Admins/Technicians (create, edit, decommission)
- [ ] User Management screen (change roles, activate/deactivate accounts)
- [ ] Equipment availability calendar view
- [ ] CSV/PDF export of reservation and audit logs

### Backend
- [ ] Email notifications via SMTP (booking approved, return reminder)
- [ ] Pagination for equipment and reservations (`?page=&per_page=`)
- [ ] PostgreSQL full-text search with `tsvector`
- [ ] Incident/damage reporting endpoint

---

*This report covers Phase 2: September 29–30, 2026.*
*Continuation from PROGRESS_REPORT_PHASE_1.md (Phase 1: September 23–28, 2026).*
