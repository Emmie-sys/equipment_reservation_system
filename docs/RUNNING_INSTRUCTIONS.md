# How to Run the Equipment Reservation System

This guide provides clear, step-by-step instructions to run the PHP Backend, the React Web Frontend, and the React Native Mobile App (with Expo Go).

---

## Architecture Overview
```
                     ┌────────────────────────┐
                     │  PostgreSQL Database   │
                     │  (Port 5432, pw: emmie)│
                     └───────────▲────────────┘
                                 │
                     ┌───────────┴────────────┐
                     │      PHP REST API      │
                     │     (Port 8000)        │
                     └──────▲──────────▲──────┘
                            │          │
              ┌─────────────┴─┐      ┌─┴────────────────┐
              │ React Web App │      │ React Native App │
              │ (Port 5173)   │      │ (Expo Go Mobile) │
              └───────────────┘      └──────────────────┘
```

---

## System Prerequisites
1. PostgreSQL 16: Running on port 5432 with database equipment_reservation and password emmie.
2. PHP 8.2+: Available via XAMPP (C:\xampp\php\php.exe) or system PATH.
3. Node.js (v18+) and npm: Installed.
4. Expo Go App: Installed on your physical phone (from Google Play Store or Apple App Store).

---

## Step 1: Running the Backend REST API

### Method A: Using the Runner Script (Recommended)
From the repository root:
```powershell
.\run_backend.ps1
```

### Method B: Manual Execution
In your PHP configuration (`C:\xampp\php\php.ini`), verify the PostgreSQL extensions are active:
```ini
extension=pdo_pgsql
extension=pgsql
```

Then start the PHP server:
```powershell
cd H:\equipment_reservation_system\backend
& C:\xampp\php\php.exe -S 0.0.0.0:8000 -t public
```

The API will now be accessible at:
- Local Web: `http://localhost:8000/api/v1`
- LAN IP (for mobile devices): `http://<YOUR_COMPUTER_IP>:8000/api/v1`

---

## Step 2: Running the React Web Frontend

The web application is kept as standard npm commands in the terminal.

Open a terminal window:
```powershell
cd H:\equipment_reservation_system\web
npm run dev
```

Open your browser to:
```
http://localhost:5173
```

### Demo Logins (Clickable on Login Screen)
- Administrator / Technician:
  - Email: `admin@institution.edu`
  - Password: `emmie`
  - Rights: View all requests, approve/reject bookings, manage equipment inventory.
- Student / Requester:
  - Email: `student@institution.edu`
  - Password: `emmie`
  - Rights: Browse equipment catalog, check availability, request bookings, cancel own pending bookings.

---

## Step 3: Running the Mobile App (Expo Go on your Phone)

### 3.1 Automated Startup (Recommended)
The runner script automatically detects your active Wi-Fi IP address, ignores virtual adapters (such as VirtualBox or VMware), sets the Metro packager host, and writes `mobile/.env`.

From the repository root or inside `mobile`:
```powershell
.\run_mobile.ps1
```

Options available:
- `.\run_mobile.ps1 -DryRun` : Validates IP detection, writes `.env`, checks backend connectivity, and exits without launching Metro.
- `.\run_mobile.ps1 -Tunnel` : Launches Expo via a secure tunnel. Use this if your Wi-Fi network has client/AP isolation or your phone cannot reach your laptop directly.
- `.\run_mobile.ps1 -Clear`  : Clears the Metro bundler cache.
- `.\run_mobile.ps1 -Ip 192.168.x.x` : Manually overrides the IP address.

### 3.2 Connect with Expo Go
1. Connect your phone to the same Wi-Fi network as your computer (Wi-Fi: `192.168.31.225`).
2. Verify connectivity: Open your mobile browser and navigate to:
   ```text
   http://192.168.31.225:8000/api/v1/health
   ```
   If it displays `{"status":"ok",...}`, your phone can reach the backend.
3. Open Expo Go on your mobile device.
4. Android: Tap "Scan QR Code" and scan the QR code displayed in your terminal.
5. iOS: Open the native Camera app, scan the QR code, and tap the prompt to open in Expo Go.

### 3.3 Troubleshooting Mobile Connection Issues

#### Error: "Something went wrong" or offline screen in Expo Go
- **Cause 1: Virtual network adapter was picked**: On machines with VirtualBox or VMware installed, Metro may bind to `192.168.56.1`. The updated `run_mobile.ps1` script explicitly bypasses virtual adapters and forces your physical Wi-Fi IP. Ensure you terminate the old terminal running Expo (`Ctrl+C`) and start fresh with `.\run_mobile.ps1`.
- **Cause 2: Wi-Fi AP Isolation**: Many office, university, or guest Wi-Fi networks block devices from connecting to each other directly. To bypass this, launch Expo in tunnel mode:
  ```powershell
  .\run_mobile.ps1 -Tunnel
  ```
  Or press `s` inside the running Expo terminal to toggle tunnel mode.
- **Cause 3: Windows Firewall**: Ensure Windows Firewall allows inbound connections for Node.js and port 8000 on Private/Public networks.

---

## Step 4: Quick Health Verification Checklist

| Component | Target URL | Expected Response |
| :--- | :--- | :--- |
| PostgreSQL | localhost:5432 | Connected via database.php |
| Backend API | http://localhost:8000/api/v1/equipment | JSON list of equipment assets |
| Web Frontend | http://localhost:5173 | Dark-mode EquipReserve dashboard and catalog |
| Mobile Client | Expo Go App | Interactive catalog, booking form and my reservations |

---

## Troubleshooting Tips
- Conflict Detected Error: This is intentional business logic when two reservations overlap for the same equipment item during the requested start/end window.
- Backend Offline: Ensure `.\run_backend.ps1` is running in a separate terminal before starting the mobile app.
