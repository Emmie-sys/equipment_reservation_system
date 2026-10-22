import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AttendantDashboard from './AttendantDashboard';
import LecturerDashboard from './LecturerDashboard';
import StudentDashboard from './StudentDashboard';

/**
 * DashboardView
 * Dynamic router that mounts the specialized, tailored dashboard for the authenticated user's role:
 * - ADMIN: Institutional Governance, Inventory Value, Student Provisioning
 * - ATTENDANT: Dispatch Desk, Check-in Handover, Check-out Return, Student Verification
 * - LECTURER: Academic Coursework Bookings, Lecture Practical Scheduling, Class Rep Delegation
 * - STUDENT: Class Representative Portal, Cohort Active Loans, Student ID Card, Loan Guidelines
 */
export default function DashboardView() {
  const { user } = useAuthContext();
  const primaryRole = (user?.roles?.[0] || 'STUDENT').toUpperCase();

  switch (primaryRole) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'ATTENDANT':
    case 'TECHNICIAN':
      return <AttendantDashboard />;
    case 'LECTURER':
    case 'STAFF':
      return <LecturerDashboard />;
    case 'STUDENT':
    default:
      return <StudentDashboard />;
  }
}
