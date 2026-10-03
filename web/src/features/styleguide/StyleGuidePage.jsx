import React, { useState } from 'react';
import { 
  Laptop, 
  Layers, 
  CalendarCheck, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import Input from '../../components/forms/Input';
import PasswordField from '../../components/forms/PasswordField';
import Select from '../../components/forms/Select';
import { useTheme } from '../../context/ThemeContext';

export default function StyleGuidePage() {
  const { theme, toggleTheme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  const sampleTableData = [
    { id: '#RES-101', equipment: 'Epson PowerLite Laser Projector', tag: 'AST-PRJ-001', requester: 'Dr. Marcus Vance', status: 'approved', date: 'Oct 24, 2026' },
    { id: '#RES-102', equipment: 'Canon EOS R6 Mark II Camera', tag: 'AST-CAM-001', requester: 'Prof. Sarah Jenkins', status: 'active', date: 'Oct 25, 2026' },
    { id: '#RES-103', equipment: 'Apple MacBook Pro M3 Max', tag: 'AST-LAP-001', requester: 'Alex Rivera', status: 'pending', date: 'Oct 26, 2026' },
    { id: '#RES-104', equipment: 'Rigol Digital Oscilloscope', tag: 'AST-ENG-001', requester: 'Robert Miller', status: 'maintenance', date: 'Oct 27, 2026' },
  ];

  const tableColumns = [
    { key: 'id', header: 'ID', headerStyle: { width: '90px' } },
    { 
      key: 'equipment', 
      header: 'Equipment Asset', 
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Tag: {row.tag}</div>
        </div>
      ) 
    },
    { key: 'requester', header: 'Requester' },
    { key: 'date', header: 'Scheduled' },
    { 
      key: 'status', 
      header: 'Status', 
      render: (val) => <StatusBadge status={val} /> 
    },
  ];

  const sampleSplineData = [
    { label: 'Mon', value: 14 },
    { label: 'Tue', value: 28 },
    { label: 'Wed', value: 22 },
    { label: 'Thu', value: 36 },
    { label: 'Fri', value: 48 },
    { label: 'Sat', value: 30 },
    { label: 'Sun', value: 42 },
  ];

  const sampleBarData = [
    { label: 'AV / Projectors', value: 45, color: '#1B6A41' },
    { label: 'Cameras & Media', value: 38, color: '#238051' },
    { label: 'Workstations', value: 52, color: '#5A2D5C' },
    { label: 'Engineering Kits', value: 26, color: '#155E38' },
  ];

  const sampleDonutData = [
    { label: 'In Active Use', value: 68, color: '#1B6A41' },
    { label: 'Available / Idle', value: 42, color: '#E6D4E6' },
    { label: 'In Maintenance', value: 6, color: '#5A2D5C' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '3rem' }}>
      {/* Header Banner */}
      <div
        className="glass-card"
        style={{
          background: 'var(--glass-surface-primary)',
          borderColor: 'var(--glass-border-medium)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">RESERViT Design System</span>
              <span className="badge badge-lilac">Version 2.0 • Apple Glass</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Living Design Tokens & Component Library</h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '0.4rem' }}>
              Calibrated on brand colors <strong>#09381F</strong> (Forest Pine) and <strong>#E6D4E6</strong> (Pale Lilac Mist), paired with typography in <strong>Chirp / Plus Jakarta Sans</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={toggleTheme} className="btn btn-secondary">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </button>
            <button onClick={() => setModalOpen(true)} className="btn btn-primary">
              <Sparkles size={16} />
              Open Glass Modal
            </button>
          </div>
        </div>
      </div>

      {/* 1. Color Palette Tokens */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>1. Calibrated Brand & Accent Palette</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', background: '#09381F', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700 }}>Forest Pine (Primary)</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#09381F • var(--brand-forest-dark)</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', background: '#E6D4E6', marginBottom: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Pale Lilac Mist (Highlight)</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#E6D4E6 • var(--brand-lilac-base)</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', background: '#1B6A41', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700 }}>Botanical Emerald (Accent 1)</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#1B6A41 • var(--brand-forest-vivid)</div>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <div style={{ width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', background: '#5A2D5C', marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700 }}>Royal Plum (Accent 2)</div>
            <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>#5A2D5C • var(--brand-plum-deep)</div>
          </div>
        </div>
      </section>

      {/* 2. KPI StatCards with Sparklines */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>2. KPI StatCards & Telemetry Sparklines</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <StatCard
            label="Total Catalog Units"
            value="148"
            icon={Laptop}
            trend="+12 this semester"
            trendType="up"
            colorVariant="emerald"
            sparklineData={[120, 125, 130, 138, 142, 148]}
          />
          <StatCard
            label="Available Now"
            value="114"
            icon={CheckCircle2}
            trend="77% fleet ready"
            trendType="up"
            colorVariant="plum"
            sparklineData={[90, 102, 110, 108, 114]}
          />
          <StatCard
            label="Pending Review"
            value="7"
            icon={Clock}
            trend="Needs authorization"
            trendType="warning"
            colorVariant="plum"
            sparklineData={[4, 8, 5, 9, 7]}
          />
          <StatCard
            label="Active Loans Today"
            value="28"
            icon={CalendarCheck}
            trend="All verified on time"
            trendType="up"
            colorVariant="neutral"
            sparklineData={[18, 22, 24, 25, 28]}
          />
        </div>
      </section>

      {/* 3. Interactive Data Table */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>3. Data Table (Sorting, Filtering & Pagination)</h3>
        <DataTable
          columns={tableColumns}
          data={sampleTableData}
          searchPlaceholder="Search reservation ID, item or student..."
          pageSize={4}
        />
      </section>

      {/* 4. Native SVG Data Visualizations */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>4. Native SVG Data Visualizations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '1rem' }}>Weekly Reservation Activity</h4>
            <LineChart data={sampleSplineData} height={180} strokeColor="#1B6A41" />
          </GlassCard>

          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '1rem' }}>Inventory by Category</h4>
            <BarChart data={sampleBarData} height={180} barColor="#1B6A41" />
          </GlassCard>

          <GlassCard padding="1.5rem">
            <h4 style={{ marginBottom: '1rem', textAlign: 'center' }}>Equipment Fleet Utilization</h4>
            <DonutChart data={sampleDonutData} centerValue="92%" centerLabel="Utilization" />
          </GlassCard>
        </div>
      </section>

      {/* 5. Button and Status Hierarchy */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>5. Buttons & Status Badges</h3>
        <GlassCard padding="1.5rem" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>Button Variants</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button className="btn btn-primary">Primary Action</button>
              <button className="btn btn-secondary">Secondary Glass</button>
              <button className="btn btn-plum">Plum Brand Accent</button>
              <button className="btn btn-danger">Destructive / Reject</button>
              <button className="btn btn-ghost">Ghost Link</button>
              <button className="btn btn-primary btn-sm">Small Button</button>
              <button className="btn btn-primary btn-lg">Large Action</button>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>Telemetry Status Chips</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
              <StatusBadge status="available" />
              <StatusBadge status="reserved" />
              <StatusBadge status="checked_out" />
              <StatusBadge status="maintenance" />
              <StatusBadge status="retired" />
              <StatusBadge status="pending" />
              <StatusBadge status="approved" />
              <StatusBadge status="rejected" />
              <StatusBadge status="completed" />
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 6. Form Controls */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3>6. Form Controls & Validation States</h3>
        <GlassCard padding="1.5rem">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            <Input label="Institutional Email" placeholder="user@school.edu" defaultValue="admin@school.edu" />
            <PasswordField label="Access Password" defaultValue="Password123!" />
            <Select
              label="Campus Dispatch Desk"
              options={[
                { value: 'STC-101', label: 'STC-101 (Central Dispatch Desk)' },
                { value: 'MPAC-204', label: 'MPAC-204 (Media Production Room)' },
              ]}
            />
          </div>
        </GlassCard>
      </section>

      {/* Glass Modal Sample */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Sample Action Dialog"
        subtitle="Accessible dialog with frosted glass elevation and keyboard navigation."
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={() => setModalOpen(false)} className="btn btn-primary">
              Confirm Action
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          This dialog uses optical translucency with `backdrop-filter: blur(16px)` and an inner specular border highlight, maintaining WCAG AA compliant text contrast in both light and dark themes.
        </p>
      </GlassModal>
    </div>
  );
}
