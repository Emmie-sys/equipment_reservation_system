import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import StaffDashboard from './StaffDashboard';
import StudentDashboard from './StudentDashboard';

/**
 * DashboardView
 * Dynamic router that mounts the specialized, tailored dashboard for the authenticated user's role.
 */
export default function DashboardView() {
  const { user } = useAuthContext();
  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();

  switch (primaryRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'TECHNICIAN':
      return <TechnicianDashboard />;
    case 'STAFF':
      return <StaffDashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
}
