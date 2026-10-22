import React, { useState, useEffect } from 'react';
import {
  Send, MessageSquare, Inbox, Users, Bell, AlertTriangle,
  CheckCircle2, Clock, RefreshCcw, Search, AlignLeft, Megaphone,
} from 'lucide-react';
import GlassCard from '../../components/glass/GlassCard';
import GlassModal from '../../components/glass/GlassModal';
import { messagesApi, usersApi } from '../../api/users';
import { useAuthContext } from '../../context/AuthContext';

const TYPE_CFG = {
  general:   { label: 'General',   color: '#008080', bg: 'rgba(0,128,128,0.12)' },
  reminder:  { label: 'Reminder',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  alert:     { label: 'Alert',     color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  broadcast: { label: 'Broadcast', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || TYPE_CFG.general;
  return (
    <span style={{
      padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-pill)',
      fontSize: '0.68rem', fontWeight: 700, textTransform: 'capitalize',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}30`,
    }}>{cfg.label}</span>
  );
};

export default function MessagesPage() {
  const { user } = useAuthContext();
  const isPrivileged = user?.roles?.some((r) => ['ADMIN', 'ATTENDANT'].includes(r));

  const [tab, setTab] = useState('received'); // received | sent | compose
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recipients, setRecipients] = useState([]);
  const [feedback, setFeedback] = useState(null);

  // Compose form
  const [form, setForm] = useState({ subject: '', body: '', message_type: 'general', recipient_user_id: '' });
  const [isSending, setIsSending] = useState(false);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const scope = isPrivileged && tab === 'all' ? 'all' : tab === 'sent' ? 'sent' : 'received';
      const res = await messagesApi.getAll({ scope });
      setMessages(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecipients = async () => {
    try {
      const res = await usersApi.getAll();
      setRecipients(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadMessages(); }, [tab]);
  useEffect(() => { if (isPrivileged) loadRecipients(); }, [isPrivileged]);

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      setIsSending(true);
      await messagesApi.compose({
        ...form,
        recipient_user_id: form.recipient_user_id ? parseInt(form.recipient_user_id) : null,
      });
      showFeedback('success', 'Message sent successfully.');
      setForm({ subject: '', body: '', message_type: 'general', recipient_user_id: '' });
      setTab('sent');
    } catch (err) {
      showFeedback('error', err.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkRead = async (msgId) => {
    await messagesApi.markRead(msgId).catch(() => {});
    setMessages((prev) => prev.map((m) => m.message_id === msgId ? { ...m, is_read: true } : m));
  };

  const tabs = [
    { key: 'received', label: 'Inbox', icon: Inbox },
    ...(isPrivileged ? [{ key: 'sent', label: 'Sent', icon: Send }] : []),
    ...(isPrivileged ? [{ key: 'compose', label: 'Compose', icon: AlignLeft }] : []),
  ];

  const tabStyle = (key) => ({
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)',
    border: 'none', cursor: 'pointer', fontSize: '0.825rem', fontWeight: 600,
    background: tab === key ? 'var(--brand-teal-dim)' : 'transparent',
    color: tab === key ? 'var(--brand-teal-vivid)' : 'var(--text-muted)',
    transition: 'all var(--transition-fast)',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header */}
      <GlassCard padding="1.5rem 2rem" style={{ background: 'var(--glass-surface-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-brand">Institutional Messaging</span>
              {!isPrivileged && <span className="badge badge-available">Read-only inbox</span>}
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Messages & Reminders</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {isPrivileged
                ? 'Compose targeted or broadcast messages and manage institutional reminders.'
                : 'View messages and reminders from the equipment desk and administrators.'}
            </p>
          </div>
          <button onClick={loadMessages} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCcw size={15} /> Refresh
          </button>
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
          {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.4rem', borderBottom: '1px solid var(--glass-border-light)', paddingBottom: '0.5rem' }}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} style={tabStyle(key)} onClick={() => setTab(key)}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* Compose Panel */}
      {tab === 'compose' && isPrivileged && (
        <GlassCard padding="1.75rem">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={18} color="var(--brand-teal-vivid)" /> Compose New Message
          </h3>
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Recipient <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank for broadcast)</span></label>
                <select className="form-input" value={form.recipient_user_id} onChange={(e) => setForm(p => ({ ...p, recipient_user_id: e.target.value }))}>
                  <option value="">— All Users (Broadcast) —</option>
                  {recipients.map((r) => (
                    <option key={r.user_id} value={r.user_id}>
                      {r.first_name} {r.last_name} ({r.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message Type</label>
                <select className="form-input" value={form.message_type} onChange={(e) => setForm(p => ({ ...p, message_type: e.target.value }))}>
                  {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject *</label>
              <input type="text" required className="form-input" placeholder="e.g. Equipment Return Reminder — CSC 312" value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Message Body *</label>
              <textarea required rows={5} className="form-textarea" placeholder="Write your message or reminder here…" value={form.body} onChange={(e) => setForm(p => ({ ...p, body: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => setForm({ subject: '', body: '', message_type: 'general', recipient_user_id: '' })} className="btn btn-secondary">Clear</button>
              <button type="submit" className="btn btn-primary" disabled={isSending} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={15} /> {isSending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Message List */}
      {tab !== 'compose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading messages…</div>
          ) : messages.length === 0 ? (
            <GlassCard padding="2.5rem" style={{ textAlign: 'center' }}>
              <MessageSquare size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No messages found.</div>
            </GlassCard>
          ) : (
            messages.map((msg) => (
              <GlassCard
                key={msg.message_id}
                padding="1rem 1.25rem"
                style={{
                  cursor: !msg.is_read ? 'pointer' : 'default',
                  borderLeft: !msg.is_read ? '3px solid var(--brand-teal-vivid)' : '3px solid transparent',
                  opacity: msg.is_read ? 0.8 : 1,
                  transition: 'opacity var(--transition-fast)',
                }}
                onClick={() => !msg.is_read && handleMarkRead(msg.message_id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <TypeBadge type={msg.message_type} />
                      {!msg.is_read && (
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--brand-orange)', display: 'inline-block' }} />
                      )}
                      <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-primary)' }}>{msg.subject}</span>
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{msg.body}</p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {tab === 'received' && msg.sender_first && (
                        <span>From: <strong>{msg.sender_first} {msg.sender_last}</strong></span>
                      )}
                      {tab === 'sent' && (
                        <span>To: <strong>{msg.recipient_first ? `${msg.recipient_first} ${msg.recipient_last}` : 'All Users'}</strong></span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : '—'}
                      </span>
                    </div>
                  </div>
                  {!msg.is_read && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--brand-teal-vivid)', fontWeight: 700, flexShrink: 0 }}>UNREAD</span>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      )}
    </div>
  );
}
