import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardView from '../features/dashboard/DashboardView';
import EquipmentCatalogPage from '../features/equipment/EquipmentCatalogPage';
import ReservationsPage from '../features/reservations/ReservationsPage';
import LoginPage from '../features/auth/LoginPage';
import StyleGuidePage from '../features/styleguide/StyleGuidePage';
import ProfilePage from '../features/profile/ProfilePage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/catalog"
        element={
          <ProtectedRoute>
            <EquipmentCatalogPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <ReservationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route path="/styleguide"
        element={
          <ProtectedRoute>
            <StyleGuidePage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
