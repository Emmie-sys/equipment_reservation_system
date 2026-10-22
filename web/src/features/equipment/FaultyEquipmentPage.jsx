import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Wrench, Search, RefreshCcw, PackageX, CheckCircle2,
  RotateCcw, Hammer, Archive, X,
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import StatusBadge from '../../components/data/StatusBadge';
import DataTable from '../../components/data/DataTable';
import EmptyState from '../../components/data/EmptyState';
import { faultyApi } from '../../api/users';

const STATUS_COLORS = {
  maintenance: { bg: 'rgba(249, 115, 22, 0.12)', text: '#ea580c', border: 'rgba(249, 115, 22, 0.3)' },
  faulty:      { bg: 'rgba(239, 68, 68, 0.12)',  text: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' },
  retired:     { bg: 'rgba(100, 116, 139, 0.12)', text: '#64748b', border: 'rgba(100, 116, 139, 0.3)' },
  damaged:     { bg: 'rgba(202, 138, 4, 0.12)',   text: '#ca8a04', border: 'rgba(202, 138, 4, 0.3)' },
};

const statusOptions = ['available', 'maintenance', 'faulty', 'damaged', 'retired'];

export default function FaultyEquipmentPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('available');
  const [conditionNotes, setConditionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await faultyApi.getAll();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return !q
      || i.asset_tag?.toLowerCase().includes(q)
      || i.model_name?.toLowerCase().includes(q)
      || i.status?.toLowerCase().includes(q)
      || i.serial_number?.toLowerCase().includes(q);
  });

  const openUpdate = (item) => {
    setSelectedItem(item);
    setNewStatus('available');
    setConditionNotes('');
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      setIsUpdating(true);
      await faultyApi.updateStatus(selectedItem.equipment_id, {
        status: newStatus,
        condition_notes: conditionNotes,
        is_bookable: newStatus === 'available',
      });
      setFeedback({ type: 'success', msg: `${selectedItem.asset_tag} status updated to "${newStatus}".` });
      setModalOpen(false);
      await loadData();
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message });
    } finally {
      setIsUpdating(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const statusIcon = {
    maintenance: <Wrench size={13} />, faulty: <AlertTriangle size={13} />,
    retired: <Archive size={13} />, damaged: <Hammer size={13} />,
  };

  const columns = [
    {
      key: 'asset_tag', header: 'Asset Tag',
      render: (v) => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.8rem' }}>{v}</span>,
    },
    {
      key: 'model_name', header: 'Equipment',
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{v || 'Unknown Model'}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.manufacturer} · {row.category_name}</div>
        </div>
      ),
    },
    {
      key: 'status', header: 'Status',
      render: (v) => {
        const cfg = STATUS_COLORS[v?.toLowerCase()] || {};
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.65rem', borderRadius: 'var(--radius-pill)',
            fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
            background: cfg.bg || 'rgba(0,0,0,0.06)',
            color: cfg.text || 'var(--text-secondary)',
            border: `1px solid ${cfg.border || 'transparent'}`,
          }}>
            {statusIcon[v?.toLowerCase()]}
            {v}
          </span>
        );
      },
    },
    {
      key: 'condition_notes', header: 'Condition Notes',
      render: (v) => <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v || '—'}</span>,
    },
    {
      key: 'room_code', header: 'Location',
      render: (v, row) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {v ? `${row.building_name || ''} ${v}` : 'Unassigned'}
        </span>
      ),
    },
    {
      key: 'actions', header: 'Action', sortable: false,
      render: (_, row) => (
        <button className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} onClick={() => openUpdate(row)}>
          <RotateCcw size={13} /> Update Status
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <GlassCard padding="1.5rem 2rem" style={{ background: 'var(--glass-surface-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">Equipment Status Board</span>
              <span className="badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.3)' }}>
                {items.length} units flagged
              </span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Faulty & Unavailable Equipment</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Track equipment in maintenance, damaged, or retired states and update their status for dispatch eligibility.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadData} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={15} /> Refresh
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Feedback */}
      {feedback && (
        <div className="glass-card" style={{
          padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: feedback.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: feedback.type === 'success' ? '#22c55e' : '#dc2626',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span style={{ fontSize: '0.875rem' }}>{feedback.msg}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {['maintenance', 'faulty', 'damaged', 'retired'].map((s) => {
          const count = items.filter((i) => i.status?.toLowerCase() === s).length;
          const cfg = STATUS_COLORS[s] || {};
          return (
            <GlassCard key={s} padding="1rem 1.25rem" style={{ borderColor: cfg.border }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', color: cfg.text, letterSpacing: '0.05em' }}>{s}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: cfg.text, lineHeight: 1.2, marginTop: '0.25rem' }}>{count}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>units flagged</div>
            </GlassCard>
          );
        })}
      </div>

      {/* Search + Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by asset tag, model, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <DataTable columns={columns} data={filtered} isLoading={isLoading} emptyMessage="All equipment units are operational." />
      </div>

      {/* Status Update Modal */}
      <GlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Equipment Status"
        subtitle={`Asset: ${selectedItem?.asset_tag} · ${selectedItem?.model_name}`}
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button onClick={handleUpdate} className="btn btn-primary" disabled={isUpdating}>
              {isUpdating ? 'Updating…' : 'Confirm Update'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select className="form-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {statusOptions.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Condition Notes</label>
            <textarea className="form-textarea" rows="3" value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} placeholder="Describe the repair, fault, or return condition…" />
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
