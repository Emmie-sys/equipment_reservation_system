import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  User,
  KeyRound,
  Hash,
  Phone,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import GlassModal from '../glass/GlassModal';
import { studentsApi } from '../../api/students';

export default function ProvisionStudentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    other_name: '',
    last_name: '',
    student_number: '',
    email: '',
    password: 'emmie',
    phone_number: '+256-700-000000',
    year_of_study: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        last_name: formData.last_name || formData.other_name || 'Student',
      };
      const res = await studentsApi.provision(payload);
      setSuccessMsg(`Student #${res.data.student_number} successfully registered in the university directory!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
        setSuccessMsg(null);
        setFormData({
          first_name: '',
          other_name: '',
          last_name: '',
          student_number: '',
          email: '',
          password: 'emmie',
          phone_number: '+256-700-000000',
          year_of_study: 1,
        });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to provision student in directory.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Register University Student" maxWidth="560px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Provision a student directly into the university directory for equipment loans and reservation eligibility.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--status-rejected-bg)',
              border: '1px solid var(--status-rejected-border)',
              color: 'var(--status-rejected-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(22, 163, 74, 0.14)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. Emmanuel"
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Other Name / Surname</label>
              <input
                type="text"
                name="other_name"
                value={formData.other_name}
                onChange={handleChange}
                placeholder="e.g. Mugisha"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID Number *</label>
              <input
                type="text"
                name="student_number"
                required
                value={formData.student_number}
                onChange={handleChange}
                placeholder="e.g. GU/2026/BIT/042"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select
                name="year_of_study"
                value={formData.year_of_study}
                onChange={handleChange}
                className="form-input"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
                <option value={5}>Year 5</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">University Email *</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. student@gu.ac.ug or personal email"
              className="form-input"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group">
              <label className="form-label">Initial Password</label>
              <input
                type="text"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Default: emmie"
                className="form-input"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Contact</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+256-7..."
                className="form-input"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <UserPlus size={16} />
              {isLoading ? 'Registering...' : 'Provision Student'}
            </button>
          </div>
        </form>
      </div>
    </GlassModal>
  );
}
