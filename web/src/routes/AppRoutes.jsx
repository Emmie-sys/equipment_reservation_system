import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardView from '../features/dashboard/DashboardView';
import IncidentList from '../features/incidents/IncidentList';
import SanctionList from '../features/sanctions/SanctionList';
import StudentList from '../features/students/StudentList';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardView />} />
      <Route
        path="/incidents"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISCIPLINARY_OFFICER', 'TEACHER']}>
            <IncidentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sanctions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISCIPLINARY_OFFICER']}>
            <SanctionList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/students"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'DISCIPLINARY_OFFICER', 'TEACHER']}>
            <StudentList />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
