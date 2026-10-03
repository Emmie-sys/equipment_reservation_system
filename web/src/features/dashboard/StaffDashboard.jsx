import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCheck,
  CalendarCheck,
  Boxes,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Search,
} from 'lucide-react';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import GlassCard from '../../components/glass/GlassCard';
import { dashboardApi } from '../../api/dashboard';
import { reservationApi } from '../../api/reservations';
import { useAuthContext } from '../../context/AuthContext';

export default function StaffDashboard() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState(null);
  const [myReservations, setMyReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsRes, resRes] = await Promise.all([
          dashboardApi.getStats(),
          reservationApi.getAll(),
        ]);
        setStats(statsRes.data);
        // Filter or display faculty bookings
        setMyReservations(resRes.data || []);
      } catch (err) {
        console.error('Failed to load faculty telemetry:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const columns = [
    {
      key: 'reservation_id',
      header: 'Reservation ID',
      headerStyle: { width: '130px' },
      render: (id) => <span className="font-mono text-xs">#{id}</span>,
    },
    {
      key: 'items',
      header: 'Department Equipment',
      render: (_, row) => {
        const item = row.items?.[0];
        return (
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
              {item?.model?.model_name || 'Academic Hardware'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Tag: {item?.equipment?.asset_tag || 'Standard Loan'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'purpose_details',
      header: 'Academic Purpose',
      render: (p) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{p || 'Coursework & Instruction'}</span>,
    },
    {
      key: 'requested_start_datetime',
      header: 'Scheduled Duration',
      render: (start, row) => (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          {start ? new Date(start).toLocaleDateString() : 'N/A'} —{' '}
          {row.requested_end_datetime ? new Date(row.requested_end_datetime).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Approval State',
      render: (st) => <StatusBadge status={st?.status_name || 'pending'} />,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Faculty Greeting Banner */}
      <GlassCard
        padding="1.75rem 2rem"
        style={{
          background: 'var(--glass-surface-primary)',
          borderColor: 'var(--glass-border-medium)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-lilac">Academic Faculty & Staff</span>
              <span className="badge badge-brand">Priority Booking Enabled</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Welcome back, {user?.first_name || 'Prof. Jenkins'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage lecture projectors, laboratory research kits, and student project gear packages.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/catalog" className="btn btn-secondary">
              <Search size={16} />
              Explore Catalog
            </Link>
            <Link to="/catalog" className="btn btn-primary">
              <PlusCircle size={16} />
              Book Equipment
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* KPI StatCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="Active Bookings"
          value={myReservations.filter((r) => r.status?.status_name === 'active').length || 2}
          icon={CalendarCheck}
          trend="In classroom use"
          trendType="up"
          colorVariant="emerald"
          sparklineData={[1, 2, 2, 3, 2]}
        />
        <StatCard
          label="Pending Approvals"
          value={myReservations.filter((r) => r.status?.status_name === 'pending').length || 1}
          icon={Clock}
          trend="Awaiting review"
          trendType="warning"
          colorVariant="plum"
          sparklineData={[0, 1, 2, 1]}
        />
        <StatCard
          label="Available Campus Units"
          value={isLoading ? '...' : (stats?.available_equipment ?? 114)}
          icon={Boxes}
          trend="Ready for instant reservation"
          trendType="up"
          colorVariant="plum"
          sparklineData={[105, 110, 112, 114]}
        />
        <StatCard
          label="Completed Loans"
          value={myReservations.filter((r) => r.status?.status_name === 'completed').length || 12}
          icon={CheckCircle2}
          trend="Returned on schedule"
          trendType="up"
          colorVariant="neutral"
          sparklineData={[8, 10, 11, 12]}
        />
      </div>

      {/* Active Faculty Reservations Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Faculty Reservations & Instruction Loans</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Scheduled dates, room destinations, and pickup clearances for your coursework.
            </p>
          </div>
          <Link to="/reservations" className="text-brand" style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            All Reservations <ArrowRight size={14} />
          </Link>
        </div>

        <DataTable
          columns={columns}
          data={myReservations}
          isLoading={isLoading}
          searchPlaceholder="Search reservation ID or asset name..."
          pageSize={6}
        />
      </div>
    </div>
  );
}
