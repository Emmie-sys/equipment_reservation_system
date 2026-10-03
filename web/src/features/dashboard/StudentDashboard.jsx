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

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsRes, resRes] = await Promise.all([
          dashboardApi.getStats(),
          reservationApi.getAll(),
        ]);
        setStats(statsRes.data);
        // Student reservations
        setStudentReservations(resRes.data || []);
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const columns = [
    {
      key: 'reservation_id',
      header: 'Booking #',
      headerStyle: { width: '110px' },
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
              {item?.model?.model_name || 'Student Loan Equipment'}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Tag: {item?.equipment?.asset_tag || 'Pending Tag'}
            </div>
          </div>
        );
      },
    },
    {
      key: 'requested_start_datetime',
      header: 'Pickup & Return Dates',
      render: (start, row) => (
        <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
          {start ? new Date(start).toLocaleDateString() : 'N/A'} —{' '}
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Student Greeting Banner */}
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
              <span className="badge badge-lilac">Enrolled Student Portal</span>
              <span className="badge badge-brand">Instant Equipment Loans</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              Hi, {user?.first_name || 'Alex'}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Book coursework cameras, laptops, lab sensors, and presentation projectors with zero hassle.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/catalog" className="btn btn-secondary">
              <Search size={16} />
              Browse Catalog
            </Link>
            <Link to="/catalog" className="btn btn-primary">
              <PlusCircle size={16} />
              New Loan Request
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* KPI StatCards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.25rem' }}>
        <StatCard
          label="My Active Loans"
          value="1"
          icon={CalendarCheck}
          trend="Due in 2 days"
          trendType="up"
          colorVariant="emerald"
          sparklineData={[0, 1, 1, 1]}
        />
        <StatCard
          label="Pending Authorization"
          value="0"
          icon={Clock}
          trend="No pending requests"
          trendType="neutral"
          colorVariant="plum"
          sparklineData={[1, 0, 0, 0]}
        />
        <StatCard
          label="Available Units on Campus"
          value={isLoading ? '...' : (stats?.available_equipment ?? 114)}
          icon={Boxes}
          trend="Ready for instant reservation"
          trendType="up"
          colorVariant="plum"
          sparklineData={[100, 108, 114]}
        />
        <StatCard
          label="Pickup Depot"
          value="STC-101"
          icon={MapPin}
          trend="Science & Tech Complex"
          trendType="up"
          colorVariant="neutral"
        />
      </div>

      {/* Two Column Grid: My Bookings & Campus Pickup Guide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>My Reservation History & Loans</h3>
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

        {/* Campus Pickup & Care Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--brand-forest-vivid)" />
              <span>Campus Dispatch Guidelines</span>
            </h4>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: 1.5 }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>1. Present Student ID:</strong> Show your active university barcode badge at Room STC-101.
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>2. Verify Kit Accessories:</strong> Check chargers, lens caps, and protective bags before leaving the desk.
              </div>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>3. Timely Returns:</strong> Return items by 5:00 PM on the designated date to keep your borrowing privileges active.
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
