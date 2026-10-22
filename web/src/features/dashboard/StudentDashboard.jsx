import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  CalendarCheck,
  Boxes,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  AlertCircle,
  Search,
  UserCheck,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import GlassCard from '../../components/glass/GlassCard';
import { dashboardApi } from '../../api/dashboard';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [studentReservations, setStudentReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentNumber = user?.student_number || 'GU/2026/BIT/042';
  const studentName = user?.first_name ? `${user.first_name} ${user.last_name}` : 'Emmanuel Mugisha';

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsRes, resRes] = await Promise.all([
          dashboardApi.getStats(),
          reservationApi.getAll(),
        ]);
        setStats(statsRes.data);
        // Student reservations only
        const filtered = (resRes.data || []).filter(
          (r) => r.requested_by_user_id === user?.user_id || r.requester?.email === user?.email
        );
        setStudentReservations(filtered);
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const activeLoans = studentReservations.filter((r) => r.status?.status_name === 'active');
  const pendingRequests = studentReservations.filter((r) => r.status?.status_name === 'pending');

  const columns = [
    {
      key: 'reservation_id',
      header: 'Booking #',
      headerStyle: { width: '100px' },
      render: (id) => <span className="font-mono text-xs">#{id}</span>,
    },
    {
      key: 'items',
      header: 'Reserved Hardware',
      render: (_, row) => {
        const item = row.items?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {item?.model?.model_name || item?.equipment?.model?.model_name || 'Class Presentation Kit'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              Tag: {item?.equipment?.asset_tag || 'Allocated at Desk'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'requested_start_datetime',
      header: 'Pickup & Return Schedule',
      render: (start, row) => (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          {start ? new Date(start).toLocaleDateString() : 'Today'} —{' '}
          {row.requested_end_datetime ? new Date(row.requested_end_datetime).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (st) => <StatusBadge status={st?.status_name || 'pending'} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Student Greeting Banner with Class Representative Card */}
      <GlassCard
        padding="1.75rem 2rem"
        style={{
          background: 'var(--glass-surface-primary)',
          borderColor: 'var(--glass-border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                Class Representative Portal
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Cohort Coursework & Seminar Gear
              </span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Hi, {studentName}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Reserve projectors, audio microphones, and laboratory hardware for class presentations and lecture demonstrations.
            </p>
          </div>

          {/* Student ID Badge Card */}
          <div
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--glass-surface-secondary)',
              border: '1px solid var(--glass-border-medium)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-pill)',
                background: '#008080',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              {user?.first_name?.charAt(0) || 'E'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {studentName}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--brand-orange)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                ID: {studentNumber}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Class Rep • Year 3 BIT
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* KPI StatCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Active Class Loans"
          value={activeLoans.length}
          icon={CalendarCheck}
          trend={activeLoans.length > 0 ? "Due today at STC-101" : "No active loans"}
          trendType={activeLoans.length > 0 ? "up" : "neutral"}
          colorVariant="emerald"
        />
        <StatCard
          label="Pending Booking Review"
          value={pendingRequests.length}
          icon={Clock}
          trend="Awaiting technician review"
          trendType="neutral"
          colorVariant="plum"
        />
        <StatCard
          label="Available Fleet"
          value={isLoading ? '...' : (stats?.available_equipment ?? 114)}
          icon={Boxes}
          trend="Bookable across campus"
          trendType="up"
          colorVariant="plum"
        />
        <StatCard
          label="Dispatch Desk"
          value="STC-101"
          icon={MapPin}
          trend="Central Equipment Room"
          trendType="up"
          colorVariant="neutral"
        />
      </div>

      {/* Two Column Grid: My Bookings & Class Rep Handover Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Cohort Reservation History & Active Loans</h3>
            <Link to="/reservations" className="text-brand" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View Details <ArrowRight size={14} />
            </Link>
          </div>

          <DataTable
            columns={columns}
            data={studentReservations}
            isLoading={isLoading}
            searchPlaceholder="Search booking ID or equipment..."
            pageSize={5}
          />
        </div>

        {/* Campus Pickup & Class Rep Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} color="var(--brand-teal-vivid)" />
              <span>Class Representative Handover Protocol</span>
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. Counter Verification:</strong> Present your Student Number (<code style={{ fontFamily: 'var(--font-mono)' }}>{studentNumber}</code>) at STC-101 for the lab attendant to scan and release the gear.
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. Pre-Check Accessories:</strong> Ensure HDMI converters, presentation remotes, and cables are accounted for before leaving the dispatch desk.
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. Return Promptly:</strong> Return equipment immediately after the class session to prevent cohort reservation penalties.
              </div>
            </div>

            <Link to="/catalog" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <PlusCircle size={15} />
              <span>Reserve Gear for Next Lecture</span>
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
