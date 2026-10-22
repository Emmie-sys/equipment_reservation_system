import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { useAuthContext } from '../context/AuthContext';

// Shared pages
import DashboardView from '../features/dashboard/DashboardView';
import LoginPage from '../features/auth/LoginPage';
import ProfilePage from '../features/profile/ProfilePage';
import NotificationsPage from '../features/notifications/NotificationsPage';
import StyleGuidePage from '../features/styleguide/StyleGuidePage';
import MessagesPage from '../features/messages/MessagesPage';

// Equipment pages (role-filtered inside the component via props)
import EquipmentCatalogPage from '../features/equipment/EquipmentCatalogPage';
import FaultyEquipmentPage from '../features/equipment/FaultyEquipmentPage';

// Reservation pages
import ReservationsPage from '../features/reservations/ReservationsPage';

// Admin / Attendant exclusive pages
import UserManagementPage from '../features/users/UserManagementPage';
import RolesManagementPage from '../features/admin/RolesManagementPage';
import SystemSettingsPage from '../features/admin/SystemSettingsPage';

/**
 * RoleRoute — Renders children only if the user has one of the allowed roles.
 * Otherwise redirects to "/" (dashboard).
 */
function RoleRoute({ children, allowedRoles }) {
  const { user } = useAuthContext();
  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();
  if (!allowedRoles.map((r) => r.toUpperCase()).includes(primaryRole)) {
    return <Navigate to="/" replace />;
  }
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Shared — all authenticated roles */}
      <Route path="/" element={<ProtectedRoute><DashboardView /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/styleguide" element={<ProtectedRoute><StyleGuidePage /></ProtectedRoute>} />

      {/* Reservations — all roles (component filters view by role) */}
      <Route path="/reservations" element={<ProtectedRoute><ReservationsPage /></ProtectedRoute>} />

      {/* Equipment Catalog — all roles (component filters availability by role) */}
      <Route path="/catalog" element={<ProtectedRoute><EquipmentCatalogPage /></ProtectedRoute>} />

      {/* Faulty Equipment — Attendant + Admin only */}
      <Route
        path="/equipment/faulty"
        element={
          <RoleRoute allowedRoles={['ADMIN', 'ATTENDANT', 'TECHNICIAN']}>
            <FaultyEquipmentPage />
          </RoleRoute>
        }
      />

      {/* User Management — Admin + Attendant */}
      <Route
        path="/users"
        element={
          <RoleRoute allowedRoles={['ADMIN', 'ATTENDANT']}>
            <UserManagementPage />
          </RoleRoute>
        }
      />

      {/* Role Management — Admin only */}
      <Route
        path="/roles"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <RolesManagementPage />
          </RoleRoute>
        }
      />

      {/* System Settings — Admin only */}
      <Route
        path="/settings"
        element={
          <RoleRoute allowedRoles={['ADMIN']}>
            <SystemSettingsPage />
          </RoleRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
