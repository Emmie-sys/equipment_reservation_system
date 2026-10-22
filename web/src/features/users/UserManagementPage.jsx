import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Edit2, UserX, ShieldCheck,
  GraduationCap, Wrench, UserCheck, RefreshCcw, CheckCircle2, AlertCircle,
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import DataTable from '../../components/data/DataTable';
import { usersApi } from '../../api/users';
import { useAuthContext } from '../../context/AuthContext';

const ROLE_CFG = {
  ADMIN:     { label: 'Admin',     icon: ShieldCheck, color: '#008080' },
  ATTENDANT: { label: 'Attendant', icon: Wrench,      color: '#3b82f6' },
  LECTURER:  { label: 'Lecturer',  icon: GraduationCap, color: '#8b5cf6' },
  STUDENT:   { label: 'Student',   icon: UserCheck,   color: '#f59e0b' },
};

function RolePill({ role }) {
  const cfg = ROLE_CFG[role?.toUpperCase()] || { label: role, color: '#64748b' };
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-pill)',
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
      background: `${cfg.color}18`, color: cfg.color,
      border: `1px solid ${cfg.color}30`,
    }}>
      {Icon && <Icon size={11} />}
      {cfg.label}
    </span>
  );
}

const ROLES_LIST = ['STUDENT', 'LECTURER', 'ATTENDANT', 'ADMIN'];

export default function UserManagementPage() {
  const { user: actorUser } = useAuthContext();
  const isAdmin = actorUser?.roles?.includes('ADMIN');

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add user form
  const [addForm, setAddForm] = useState({
    first_name: '', other_name: '', last_name: '', student_number: '',
    email: '', password: 'emmie', phone_number: '+256-700-000000',
    year_of_study: 1, role: 'STUDENT',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit user form
  const [editForm, setEditForm] = useState({ first_name: '', last_name: '', phone_number: '', account_status: 'active', role: '' });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await usersApi.getAll(params);
      setUsers(res.data || []);
    } catch (err) {
      showFeedback('error', err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [search, roleFilter]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await usersApi.create(addForm);
      showFeedback('success', `User "${addForm.first_name} ${addForm.last_name}" added successfully.`);
      setAddModalOpen(false);
      setAddForm({ first_name: '', other_name: '', last_name: '', student_number: '', email: '', password: 'emmie', phone_number: '+256-700-000000', year_of_study: 1, role: 'STUDENT' });
      loadUsers();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to add user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await usersApi.update(selectedUser.user_id, editForm);
      showFeedback('success', 'User updated successfully.');
      setEditModalOpen(false);
      loadUsers();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (u) => {
    if (!window.confirm(`Deactivate ${u.first_name} ${u.last_name}? They will lose system access.`)) return;
    try {
      await usersApi.deactivate(u.user_id);
      showFeedback('success', `${u.first_name} ${u.last_name} has been deactivated.`);
      loadUsers();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const columns = [
    {
      key: 'first_name', header: 'Name',
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'var(--brand-teal-dim)', color: 'var(--brand-teal-vivid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.8rem', flexShrink: 0,
          }}>
            {row.first_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.first_name} {row.last_name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'student_number', header: 'Student #',
      render: (v) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{v || '—'}</span>,
    },
    {
      key: 'roles', header: 'Role',
      render: (v) => {
        const roles = Array.isArray(v) ? v : [];
        return (
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {roles.length > 0 ? roles.map((r) => <RolePill key={r} role={r} />) : <RolePill role="STUDENT" />}
          </div>
        );
      },
    },
    {
      key: 'account_status', header: 'Status',
      render: (v) => (
        <span style={{
          display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-pill)',
          fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize',
          background: v === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
          color: v === 'active' ? '#22c55e' : '#ef4444',
          border: `1px solid ${v === 'active' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
        }}>{v || 'active'}</span>
      ),
    },
    {
      key: 'phone_number', header: 'Phone',
      render: (v) => <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v || '—'}</span>,
    },
    ...(isAdmin ? [{
      key: 'actions', header: 'Actions', sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className="btn btn-secondary btn-sm" title="Edit" style={{ padding: '0.25rem 0.5rem' }}
            onClick={() => { setSelectedUser(row); setEditForm({ first_name: row.first_name, last_name: row.last_name, phone_number: row.phone_number || '', account_status: row.account_status || 'active', role: row.roles?.[0] || 'STUDENT' }); setEditModalOpen(true); }}>
            <Edit2 size={13} />
          </button>
          {row.user_id !== actorUser?.user_id && (
            <button className="btn btn-danger btn-sm" title="Deactivate" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDeactivate(row)}>
              <UserX size={13} />
            </button>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <GlassCard padding="1.5rem 2rem" style={{ background: 'var(--glass-surface-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">University Directory</span>
              <span className="badge badge-available">{users.length} users</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage institutional users, assign roles, and provision new accounts into the SSO directory.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadUsers} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={15} /> Refresh
            </button>
            <button onClick={() => setAddModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserPlus size={16} /> Add User
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Feedback */}
      {feedback && (
        <div className="glass-card" style={{
          padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem',
          background: feedback.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: feedback.type === 'success' ? '#22c55e' : '#dc2626',
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Filters + Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 400 }}>
            <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" className="form-input" placeholder="Search name, email, student#…" value={search}
              onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: '2.5rem' }} />
          </div>
          <select className="form-input" style={{ width: 'auto', minWidth: 150 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <DataTable columns={columns} data={users} isLoading={isLoading} searchPlaceholder="Search…" pageSize={10} />
      </div>

      {/* Add User Modal */}
      <GlassModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add User to Directory" maxWidth="560px">
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input type="text" required className="form-input" value={addForm.first_name} onChange={(e) => setAddForm(p => ({ ...p, first_name: e.target.value }))} placeholder="e.g. Emmanuel" />
            </div>
            <div className="form-group">
              <label className="form-label">Other Name / Surname</label>
              <input type="text" className="form-input" value={addForm.other_name} onChange={(e) => setAddForm(p => ({ ...p, other_name: e.target.value }))} placeholder="e.g. Mugisha" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" required className="form-input" value={addForm.email} onChange={(e) => setAddForm(p => ({ ...p, email: e.target.value }))} placeholder="name@gu.ac.ug" />
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select required className="form-input" value={addForm.role} onChange={(e) => setAddForm(p => ({ ...p, role: e.target.value }))}>
                {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID # (if applicable)</label>
              <input type="text" className="form-input" value={addForm.student_number} onChange={(e) => setAddForm(p => ({ ...p, student_number: e.target.value }))} placeholder="GU/2026/BIT/001" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input type="text" className="form-input" value={addForm.password} onChange={(e) => setAddForm(p => ({ ...p, password: e.target.value }))} placeholder="emmie" style={{ fontFamily: 'var(--font-mono)' }} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="text" className="form-input" value={addForm.phone_number} onChange={(e) => setAddForm(p => ({ ...p, phone_number: e.target.value }))} placeholder="+256-700-000000" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={() => setAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              <UserPlus size={15} /> {isSubmitting ? 'Adding…' : 'Add User'}
            </button>
          </div>
        </form>
      </GlassModal>

      {/* Edit User Modal */}
      {isAdmin && (
        <GlassModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={`Edit: ${selectedUser?.first_name} ${selectedUser?.last_name}`} maxWidth="480px">
          <form onSubmit={handleEditUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" value={editForm.first_name} onChange={(e) => setEditForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" value={editForm.last_name} onChange={(e) => setEditForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={editForm.role} onChange={(e) => setEditForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Account Status</label>
                <select className="form-input" value={editForm.account_status} onChange={(e) => setEditForm(p => ({ ...p, account_status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-input" value={editForm.phone_number} onChange={(e) => setEditForm(p => ({ ...p, phone_number: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={() => setEditModalOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </form>
        </GlassModal>
      )}
    </div>
  );
}
