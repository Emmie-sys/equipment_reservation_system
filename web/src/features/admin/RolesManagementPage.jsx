import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Plus, Trash2, Edit2, Users, RefreshCcw,
  CheckCircle2, AlertCircle, Lock,
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import { rolesApi } from '../../api/users';

export default function RolesManagementPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [form, setForm] = useState({ role_name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const PROTECTED = ['ADMIN', 'STUDENT', 'LECTURER', 'ATTENDANT'];

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const res = await rolesApi.getAll();
      setRoles(res.data || []);
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadRoles(); }, []);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await rolesApi.create(form);
      showFeedback('success', `Role "${form.role_name}" created.`);
      setAddModalOpen(false);
      setForm({ role_name: '', description: '' });
      loadRoles();
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await rolesApi.update(editModal.role_id, { description: form.description });
      showFeedback('success', 'Role description updated.');
      setEditModal(null);
      loadRoles();
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (role) => {
    if (PROTECTED.includes(role.role_name)) {
      showFeedback('error', `"${role.role_name}" is a core institutional role and cannot be deleted.`);
      return;
    }
    if (!window.confirm(`Delete role "${role.role_name}"? All assigned users will lose this role.`)) return;
    try {
      await rolesApi.delete(role.role_id);
      showFeedback('success', `Role "${role.role_name}" deleted.`);
      loadRoles();
    } catch (err) {
      showFeedback('error', err.message);
    }
  };

  const ROLE_COLORS = {
    ADMIN: '#008080', ATTENDANT: '#3b82f6', LECTURER: '#8b5cf6', STUDENT: '#f59e0b',
    STAFF: '#64748b', TECHNICIAN: '#6366f1',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <GlassCard padding="1.5rem 2rem" style={{ background: 'var(--glass-surface-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">Access Control</span>
              <span className="badge badge-available">{roles.length} roles</span>
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Role Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Define and manage institutional access roles. Core system roles are protected from deletion.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadRoles} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={15} /> Refresh
            </button>
            <button onClick={() => { setForm({ role_name: '', description: '' }); setAddModalOpen(true); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> New Role
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

      {/* Roles Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading roles…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {roles.map((role) => {
            const color = ROLE_COLORS[role.role_name] || '#64748b';
            const isProtected = PROTECTED.includes(role.role_name);
            return (
              <GlassCard key={role.role_id} padding="1.25rem 1.5rem" style={{ borderLeft: `3px solid ${color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.7rem', borderRadius: 'var(--radius-pill)',
                        fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.04em',
                        background: `${color}18`, color, border: `1px solid ${color}30`,
                      }}>{role.role_name}</span>
                      {isProtected && <Lock size={12} style={{ color: 'var(--text-muted)' }} title="Protected core role" />}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.5 }}>
                      {role.description || 'No description provided.'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}
                      title="Edit description"
                      onClick={() => { setEditModal(role); setForm({ description: role.description || '' }); }}
                    >
                      <Edit2 size={12} />
                    </button>
                    {!isProtected && (
                      <button className="btn btn-danger btn-sm" style={{ padding: '0.25rem 0.5rem' }} title="Delete role" onClick={() => handleDelete(role)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  role_id: {role.role_id}
                  {isProtected && ' · core'}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Add Role Modal */}
      <GlassModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Create New Role" maxWidth="440px">
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Role Name *</label>
            <input type="text" required className="form-input" value={form.role_name}
              onChange={(e) => setForm(p => ({ ...p, role_name: e.target.value.toUpperCase() }))}
              placeholder="e.g. AUDITOR" style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', fontWeight: 700 }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Role names are automatically uppercased.</div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows="3" value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the access permissions and responsibilities of this role…" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setAddModalOpen(false)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Creating…' : 'Create Role'}</button>
          </div>
        </form>
      </GlassModal>

      {/* Edit Role Modal */}
      <GlassModal isOpen={!!editModal} onClose={() => setEditModal(null)} title={`Edit: ${editModal?.role_name}`} maxWidth="440px">
        <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows="4" value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Describe the role's access and responsibilities…" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setEditModal(null)} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
