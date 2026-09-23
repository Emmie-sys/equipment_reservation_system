# Equipment Reservation REST API Specification (v1)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication (`/auth`)

### `POST /auth/login`
Authenticates user credentials and returns a Bearer token with user roles.

**Request Body:**
```json
{
  "email": "admin@school.edu",
  "password": "Password123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User authenticated successfully.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "user_id": 1,
      "first_name": "Marcus",
      "last_name": "Vance",
      "email": "admin@school.edu",
      "roles": ["ADMIN"]
    }
  }
}
```

### `GET /auth/me`
Returns current authenticated user profile and roles.

**Headers:** `Authorization: Bearer <TOKEN>`

---

## 2. Equipment Management (`/equipment`)

### `GET /equipment`
Lists equipment inventory with filtering options (`category_id`, `status`, `search`, `is_bookable`).

**Query Parameters:**
- `category_id`: Filter by equipment category ID
- `status`: Filter by status name (e.g., `available`, `reserved`, `maintenance`)
- `search`: Keyword search matching model name, manufacturer, or asset tag

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipment catalog retrieved.",
  "data": [
    {
      "equipment_id": 1,
      "asset_tag": "AST-PRJ-001",
      "serial_number": "EPS-PL-882194",
      "status": "available",
      "is_bookable": true,
      "condition_notes": "Excellent operational condition",
      "model": {
        "model_id": 1,
        "model_name": "Epson PowerLite L530U Laser Projector",
        "manufacturer": "Epson",
        "model_number": "V11HA27020",
        "category_name": "Audio-Visual & Presentation"
      },
      "room": {
        "room_code": "STC-101",
        "room_name": "Central Equipment Dispatch Desk"
      }
    }
  ]
}
```

### `GET /equipment/{id}`
Returns full technical details and recent reservation history for a specific inventory unit.

### `GET /equipment/{id}/availability`
Checks whether a specific equipment item is available between two datetime values.

**Query Parameters:**
- `start_time` (ISO 8601 string): `2026-09-25T09:00:00Z`
- `end_time` (ISO 8601 string): `2026-09-25T13:00:00Z`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "equipment_id": 1,
    "is_available": true,
    "conflicts": []
  }
}
```

---

## 3. Categories (`/categories`)

### `GET /categories`
Returns all active equipment categories and model counts.

---

## 4. Reservations (`/reservations`)

### `GET /reservations`
Lists reservations. Standard users only see their own reservations; Admins/Technicians see all.

**Query Parameters:** `status`, `page`, `per_page`

### `POST /reservations`
Submits a new reservation request. Validates date chronology and checks for equipment schedule conflicts.

**Request Body:**
```json
{
  "equipment_id": 1,
  "start_time": "2026-09-26T10:00:00Z",
  "end_time": "2026-09-26T14:00:00Z",
  "purpose_type_id": 1,
  "purpose_details": "Capstone lab project presentation"
}
```

**Conflict Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Equipment AST-PRJ-001 is already reserved during the requested period.",
  "errors": {
    "conflict_reservation_id": 1,
    "conflicting_interval": "2026-09-26T09:00:00Z to 2026-09-26T12:00:00Z"
  }
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Reservation submitted successfully and pending approval.",
  "data": {
    "reservation_id": 2,
    "status": "pending",
    "requested_start_datetime": "2026-09-26T10:00:00Z",
    "requested_end_datetime": "2026-09-26T14:00:00Z"
  }
}
```

### `PATCH /reservations/{id}/approve`
Admin or technician approves a pending reservation.

**Request Body:**
```json
{
  "comments": "Approved. Pickup at STC-101 dispatch desk."
}
```

### `PATCH /reservations/{id}/reject`
Admin or technician rejects a reservation request.

**Request Body:**
```json
{
  "reason": "Maintenance scheduled for this asset during the requested period."
}
```

### `PATCH /reservations/{id}/cancel`
Cancels an active or pending reservation.

---

## 5. Dashboard Telemetry (`/dashboard/metrics`)
Returns operational KPIs for administrators: total assets, available units, active reservations, and overdue returns.
