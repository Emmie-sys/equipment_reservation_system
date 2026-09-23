# Institutional Equipment Reservation System — Project Context

## 1. Executive Summary & Domain Overview
The **Institutional Equipment Reservation System** is a unified full-stack software solution designed for academic and enterprise institutions. It digitizes the lending, scheduling, and lifecycle management of institutional assets such as:
- **Audio-Visual**: High-lumen laser projectors, motorized screens, PA systems, wireless microphones.
- **Media & Photography**: DSLR and mirrorless cameras, prime lenses, carbon fiber tripods, studio lights.
- **Computing & IT**: High-performance mobile workstations, tablets, VR headsets.
- **Laboratory Electronics**: Digital oscilloscopes, function generators, multimeters, robotics kits.

The system replaces manual checkout logs and spreadsheets with a centralized, conflict-free scheduling engine.

---

## 2. Full-Stack System Architecture

```text
                 ┌──────────────────────┐
                 │      PostgreSQL      │
                 │      Database        │
                 └──────────▲───────────┘
                            │
                            │ PDO (SQL / Parameterized Queries)
                            │
                 ┌──────────┴───────────┐
                 │    PHP OOP Backend   │
                 │       REST API       │
                 └───────▲───────┬──────┘
                         │       │
                    HTTP/JSON    │ HTTP/JSON
                         │       │
              ┌──────────┘       └───────────┐
              │                              │
      ┌───────▼────────┐             ┌───────▼────────┐
      │ React Web App  │             │ React Native   │
      │    Frontend    │             │  Mobile App    │
      └────────────────┘             └────────────────┘
```

### Core Architecture Principles
1. **Frontend & Backend Separation**: The PHP backend does not render HTML. It acts purely as a stateless RESTful JSON API.
2. **Multi-Client Support**: Both the React web application (desktop/browser) and React Native mobile application (iOS/Android) consume the exact same endpoints.
3. **Database Security**: Clients never connect directly to PostgreSQL. The PHP backend enforces authentication, authorization, business logic, availability conflict checks, and parameterized queries.

---

## 3. Database Schema Overview (PostgreSQL)
The database contains 57 tables in the `public` schema. The primary operational entities include:

- **`users`**: User records with `user_id`, `uuid`, `first_name`, `last_name`, `email` (citext), `password_hash`, `account_status` ('active', 'suspended', 'inactive', 'locked').
- **`roles` & `user_roles`**: Role-based access control (`ADMIN`, `STAFF`, `STUDENT`, `TECHNICIAN`).
- **`equipment_categories`**: Hierarchical categories (`category_id`, `category_code`, `category_name`, `requires_certification`).
- **`equipment_models`**: Equipment blueprints (`model_name`, `manufacturer`, `model_number`, `specifications`, `replacement_cost`).
- **`equipment`**: Individual physical inventory units (`equipment_id`, `model_id`, `asset_tag`, `status_id`, `current_room_id`, `is_bookable`).
- **`equipment_status_types`**: Unit conditions (`available`, `reserved`, `checked_out`, `maintenance`, `retired`).
- **`reservations`**: Booking headers (`reservation_id`, `requested_by_user_id`, `status_id`, `requested_start_datetime`, `requested_end_datetime`, `purpose_type_id`, `pickup_room_id`).
- **`reservation_items`**: Individual items booked per reservation (`reservation_item_id`, `reservation_id`, `equipment_id`, `model_id`, `quantity_requested`, `line_status`).
- **`reservation_status_types`**: Booking lifecycles (`pending`, `approved`, `rejected`, `active`, `completed`, `cancelled`).
- **`approvals`**: Administrative approval/rejection audit entries (`approval_id`, `reservation_id`, `approver_user_id`, `decision`, `decision_reason`).
- **`campuses`, `buildings`, `rooms`**: Physical custody and dispatch locations.
- **`checkout_records` & `return_records`**: Dispatch and return inspections with condition notes.

---

## 4. Reservation Lifecycle & Business Logic

### 4.1 Reservation Lifecycle State Machine
```text
[ User submits reservation ]
             │
             ▼
        [ pending ] ─────── (Admin / Staff review) ───────► [ rejected ]
             │
             ▼
        [ approved ] ────── (Dispatch / Pickup) ─────────► [ active ]
             │                                                │
      (User cancels)                                   (Return / Inspect)
             ▼                                                ▼
       [ cancelled ]                                    [ completed ]
```

### 4.2 Conflict Prevention & Availability Rules
1. **Time-Overlap Query**:
   Equipment cannot be reserved for an interval `[Start_New, End_New]` if there exists an overlapping active or approved reservation:
   ```sql
   SELECT 1 FROM reservation_items ri
   JOIN reservations r ON ri.reservation_id = r.reservation_id
   JOIN reservation_status_types rst ON r.status_id = rst.status_id
   WHERE ri.equipment_id = :equipment_id
     AND rst.status_name IN ('pending', 'approved', 'active')
     AND r.requested_start_datetime < :requested_end
     AND r.requested_end_datetime > :requested_start;
   ```
2. **Chronological Validity**:
   - `requested_end_datetime` must be strictly greater than `requested_start_datetime`.
   - `requested_start_datetime` cannot be in the past.
3. **Role Authorization**:
   - Normal users/students can only view their own reservations.
   - Administrators and Technicians can approve, reject, checkout, and inspect equipment.
4. **Maintenance Lockout**:
   - If an equipment item is marked as `maintenance` or `retired` in `equipment_status_types`, it cannot be scheduled.

---

## 5. Standardized REST API Contract
All endpoints communicate using JSON.

### Standard Success Response:
```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

### Standard Error Response:
```json
{
  "success": false,
  "message": "Equipment is already reserved during the requested period.",
  "errors": {}
}
```
