import React, { useState, useEffect } from 'react';
import {
  Settings, Save, RefreshCcw, CheckCircle2, AlertCircle,
  Calendar, Clock, MapPin, Building2, Shield, BookOpen,
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import { settingsApi } from '../../api/users';

const SETTING_ICONS = {
  max_reservation_days: Clock, require_approval: Shield, auto_reminder_hours: Clock,
  institution_name: Building2, dispatch_location: MapPin, academic_year: Calendar,
  max_items_per_reservation: BookOpen,
};

const SETTING_LABELS = {
  max_reservation_days: 'Max Loan Period (days)',
  require_approval: 'Require Admin Approval',
  auto_reminder_hours: 'Auto-Reminder Lead Time (hours)',
  institution_name: 'Institution Name',
  dispatch_location: 'Primary Dispatch Location',
  academic_year: 'Current Academic Year',
  max_items_per_reservation: 'Max Items Per Reservation',
};

const BOOLEAN_KEYS = ['require_approval'];
const NUMBER_KEYS = ['max_reservation_days', 'auto_reminder_hours', 'max_items_per_reservation'];

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [dirty, setDirty] = useState(false);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const res = await settingsApi.getAll();
      const settingsData = res.data || [];
      setSettings(settingsData);
      const vals = {};
      settingsData.forEach((s) => { vals[s.key] = s.value; });
      setValues(vals);
      setDirty(false);
    } catch (err) {
      showFeedback('error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await settingsApi.update(values);
      showFeedback('success', 'System settings saved successfully.');
      setDirty(false);
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (key, value, description) => {
    const Icon = SETTING_ICONS[key] || Settings;
    const label = SETTING_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <GlassCard key={key} padding="1.25rem 1.5rem">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-md)',
            background: 'var(--brand-teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={17} style={{ color: 'var(--brand-teal-vivid)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{label}</div>
            {description && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{description}</div>}
            {BOOLEAN_KEYS.includes(key) ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => handleChange(key, value === 'true' ? 'false' : 'true')}
                  style={{
                    width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                    background: value === 'true' ? 'var(--brand-teal-vivid)' : 'var(--glass-border-medium)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{
                    position: 'absolute', top: 3, left: value === 'true' ? 24 : 3,
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
                <span style={{ fontSize: '0.825rem', color: value === 'true' ? 'var(--brand-teal-vivid)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {value === 'true' ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ) : NUMBER_KEYS.includes(key) ? (
              <input
                type="number"
                min="1"
                className="form-input"
                style={{ maxWidth: 160 }}
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="form-input"
                value={value}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        </div>
      </GlassCard>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <GlassCard padding="1.5rem 2rem" style={{ background: 'var(--glass-surface-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">Admin Panel</span>
              {dirty && <span style={{ fontSize: '0.7rem', color: 'var(--brand-orange)', fontWeight: 700 }}>● Unsaved changes</span>}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Settings</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Configure institutional platform parameters, reservation rules, and operational settings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadSettings} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCcw size={15} /> Reset
            </button>
            <button onClick={handleSave} disabled={isSaving || !dirty} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={15} /> {isSaving ? 'Saving…' : 'Save Changes'}
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

      {/* Settings Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading settings…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1rem' }}>
          {settings.map((s) => renderInput(s.key, values[s.key] ?? s.value, s.description))}
        </div>
      )}

      {/* Danger Zone */}
      <GlassCard padding="1.5rem" style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.04)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <AlertCircle size={16} /> Danger Zone
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Destructive operations that cannot be undone. Exercise extreme caution.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-danger btn-sm" onClick={() => showFeedback('error', 'Database reset is disabled in this environment. Contact the system engineer.')}>
            Reset All Data
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => showFeedback('error', 'Audit log purge requires direct database access for safety reasons.')}>
            Purge Audit Logs
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
