import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  ArrowRight,
  MapPin,
  CheckCircle2,
  AlarmClock,
  Info,
  CornerDownLeft,
  MailOpen,
  ChevronRight,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

// ── Type config (minimal semantic labels & icons — app brand palette) ─────────
const TYPE_CONFIG = {
  approval: {
    icon: CheckCircle2,
    label: 'Approved',
  },
  reminder: {
    icon: AlarmClock,
    label: 'Reminder',
  },
  system: {
    icon: Info,
    label: 'System',
  },
  return: {
    icon: CornerDownLeft,
    label: 'Returned',
  },
};

// ── Notification Row ─────────────────────────────────────────────────────────
function NotificationRow({ item, index, onSelect, isSelected }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <button
      id={`notif-row-${item.id}`}
      onClick={() => onSelect(item)}
      className="notif-row"
      style={{
        animationDelay: `${index * 45}ms`,
        background: isSelected
          ? 'var(--glass-bg-elevated)'
          : item.unread
          ? 'var(--glass-bg-subtle)'
          : 'transparent',
        borderColor: isSelected
          ? 'var(--brand-forest-vivid)'
          : 'var(--glass-border-subtle)',
      }}
    >
      {/* Icon — standard brand forest-tint box */}
      <div className="notif-icon-box">
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="notif-row-body">
        <div className="notif-row-header">
          <div className="notif-type-tag-wrap">
            {item.unread && <span className="notif-unread-dot" />}
            <span className="notif-type-tag">{cfg.label.toUpperCase()}</span>
          </div>
          <span className="notif-timestamp">{item.timestamp}</span>
        </div>
        <div
          className="notif-row-title"
          style={{ fontWeight: item.unread ? 700 : 500 }}
        >
          {item.title}
        </div>
        <div className="notif-row-preview">{item.message}</div>
        {item.location && (
          <div className="notif-row-location">
            <MapPin size={11} />
            <span>{item.location}</span>
          </div>
        )}
      </div>

      <ChevronRight size={15} className="notif-chevron" />
    </button>
  );
}

// ── Detail Panel ─────────────────────────────────────────────────────────────
function NotificationDetail({ item, onClose, onDelete, onMarkUnread }) {
  const navigate = useNavigate();
  if (!item) return null;

  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.system;
  const Icon = cfg.icon;

  return (
    <div className="notif-detail-panel reveal-slide-left">
      {/* Header bar */}
      <div className="notif-detail-header">
        <div className="notif-detail-icon-box">
          <Icon size={24} />
        </div>
        <div style={{ flex: 1 }}>
          <span className="notif-type-tag">{cfg.label.toUpperCase()}</span>
          <div className="notif-detail-meta">
            {item.timestamp}{item.date ? ` · ${item.date}` : ''}
          </div>
        </div>
        <button id="notif-detail-close" className="notif-close-btn" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>

      {/* Title */}
      <h2 className="notif-detail-title">{item.title}</h2>

      {/* Message */}
      <div className="notif-detail-body">{item.message}</div>

      {/* Location chip */}
      {item.location && (
        <div className="notif-detail-chip">
          <MapPin size={13} />
          <span>{item.location}</span>
        </div>
      )}

      {/* Actions */}
      <div className="notif-detail-actions">
        {item.actionLabel && (
          <button
            id={`notif-action-primary-${item.id}`}
            className="notif-primary-btn"
            onClick={() => { if (item.actionRoute) navigate(item.actionRoute); }}
          >
            <span>{item.actionLabel}</span>
            <ArrowRight size={15} />
          </button>
        )}
        <div className="notif-detail-secondary-row">
          <button
            id={`notif-action-unread-${item.id}`}
            className="notif-secondary-btn"
            onClick={() => onMarkUnread(item.id)}
          >
            <MailOpen size={14} />
            <span>Mark Unread</span>
          </button>
          <button
            id={`notif-action-delete-${item.id}`}
            className="notif-secondary-btn notif-secondary-btn--danger"
            onClick={() => {
              if (window.confirm('Permanently delete this notification?')) {
                onDelete(item.id);
                onClose();
              }
            }}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [selected, setSelected] = useState(null);

  const handleSelect = (item) => {
    markAsRead(item.id);
    setSelected(item);
  };

  const handleClose = () => setSelected(null);

  const unread = notifications.filter((n) => n.unread);
  const read = notifications.filter((n) => !n.unread);

  return (
    <>
      <style>{`
        /* ── Notifications Page Styles ── */
        .notif-page { display: flex; flex-direction: column; gap: 0; height: 100%; }

        .notif-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.75rem 1.25rem;
          border-bottom: 1px solid var(--glass-border-subtle);
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }
        .notif-page-header-left { display: flex; align-items: center; gap: 0.85rem; }
        .notif-page-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: var(--brand-teal-dim); border: 1px solid var(--glass-border-medium);
          display: flex; align-items: center; justify-content: center;
          color: var(--brand-teal-vivid);
        }
        .notif-page-title { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.03em; color: var(--text-primary); }
        .notif-count-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: var(--brand-teal-dim); color: var(--brand-teal-vivid);
          border: 1px solid var(--glass-border-medium);
          font-size: 0.7rem; font-weight: 700;
          padding: 2px 8px; border-radius: var(--radius-pill); letter-spacing: 0.2px;
        }
        .notif-page-actions { display: flex; align-items: center; gap: 0.6rem; }
        .notif-action-btn {
          display: flex; align-items: center; gap: 0.4rem;
          background: var(--glass-bg-subtle); border: 1px solid var(--glass-border-medium);
          color: var(--text-muted); font-size: 0.72rem; font-weight: 600;
          padding: 0.4rem 0.75rem; border-radius: var(--radius-pill);
          cursor: pointer; transition: all var(--transition-fast);
        }
        .notif-action-btn:hover { color: var(--text-primary); border-color: var(--glass-border-accent); }
        .notif-action-btn--danger:hover { color: #f43f5e; border-color: rgba(244,63,94,0.35); }

        .notif-layout {
          display: flex; flex: 1; overflow: hidden;
          gap: 0;
        }

        /* ── List Column ── */
        .notif-list-col {
          width: 420px; min-width: 320px; flex-shrink: 0;
          border-right: 1px solid var(--glass-border-subtle);
          overflow-y: auto;
          padding: 1rem;
          display: flex; flex-direction: column; gap: 0;
        }
        @media (max-width: 768px) {
          .notif-list-col { width: 100%; border-right: none; }
          .notif-detail-panel { display: none; }
        }
        .notif-section-label {
          font-size: 0.65rem; font-weight: 700; letter-spacing: 1.1px;
          color: var(--text-muted); padding: 0.5rem 0.25rem 0.5rem;
          text-transform: uppercase;
        }
        .notif-row {
          display: flex; align-items: flex-start; gap: 0.75rem;
          width: 100%; text-align: left;
          padding: 0.85rem 0.9rem; border-radius: 14px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.2s var(--ease-spring);
          animation: notifRowReveal 0.4s var(--ease-spring) both;
          position: relative;
          color: inherit;
        }
        .notif-row:hover { background: var(--glass-bg-subtle) !important; transform: translateY(-1px); }
        @keyframes notifRowReveal {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notif-type-tag-wrap {
          display: flex; align-items: center; gap: 6px;
        }
        .notif-unread-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: var(--brand-teal-vivid); flex-shrink: 0;
        }
        .notif-icon-box {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: var(--brand-teal-dim);
          color: var(--brand-teal-vivid);
          border: 1px solid var(--glass-border-subtle);
        }
        .notif-row-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
        .notif-row-header { display: flex; align-items: center; justify-content: space-between; }
        .notif-type-tag {
          font-size: 0.62rem; font-weight: 700; letter-spacing: 0.8px;
          color: var(--text-muted);
        }
        .notif-timestamp { font-size: 0.68rem; color: var(--text-muted); font-weight: 500; }
        .notif-row-title {
          font-size: 0.83rem; color: var(--text-primary);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          line-height: 1.35;
        }
        .notif-row-preview {
          font-size: 0.72rem; color: var(--text-muted);
          overflow: hidden; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          line-height: 1.45;
        }
        .notif-row-location {
          display: flex; align-items: center; gap: 3px;
          font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;
        }
        .notif-chevron { color: var(--text-muted); opacity: 0.5; flex-shrink: 0; margin-top: 2px; }
        .notif-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.6rem; color: var(--text-muted); padding: 3rem 1rem; text-align: center;
        }
        .notif-empty-title { font-size: 1.05rem; font-weight: 700; color: var(--text-primary); }
        .notif-empty-sub { font-size: 0.8rem; }

        /* ── Detail Panel ── */
        .notif-detail-panel {
          flex: 1; overflow-y: auto; padding: 1.75rem;
          display: flex; flex-direction: column; gap: 1.1rem;
        }
        .notif-detail-empty {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 0.75rem; color: var(--text-muted); padding: 3rem;
        }
        .notif-detail-header {
          display: flex; align-items: flex-start; gap: 1rem;
        }
        .notif-detail-icon-box {
          width: 48px; height: 48px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          background: var(--brand-teal-dim);
          color: var(--brand-teal-vivid);
          border: 1px solid var(--glass-border-medium);
        }
        .notif-detail-meta { font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; }
        .notif-close-btn {
          background: var(--glass-bg-subtle); border: 1px solid var(--glass-border-subtle);
          color: var(--text-muted); width: 32px; height: 32px;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0; transition: all var(--transition-fast);
          margin-left: auto;
        }
        .notif-close-btn:hover { color: var(--text-primary); border-color: var(--glass-border-accent); }
        .notif-detail-title {
          font-size: 1.15rem; font-weight: 800; letter-spacing: -0.03em;
          color: var(--text-primary); line-height: 1.35; margin: 0;
        }
        .notif-detail-body {
          font-size: 0.875rem; line-height: 1.7; color: var(--text-muted);
          border-left: 2px solid var(--glass-border-medium);
          padding-left: 1rem;
        }
        .notif-detail-chip {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.45rem 0.8rem; border-radius: var(--radius-sm);
          background: var(--glass-surface-primary);
          border: 1px solid var(--glass-border-medium);
          color: var(--text-secondary);
          font-size: 0.78rem; font-weight: 600;
          align-self: flex-start;
        }
        .notif-detail-actions { display: flex; flex-direction: column; gap: 0.65rem; margin-top: auto; }
        .notif-primary-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.8rem 1.25rem; border-radius: 12px;
          background: var(--brand-teal-vivid);
          border: 1px solid var(--brand-teal-mid);
          color: var(--brand-cream-base); font-weight: 700; font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 70, 67, 0.22);
          transition: background var(--transition-fast), transform var(--transition-fast);
        }
        .notif-primary-btn:hover { background: var(--brand-teal-soft); transform: translateY(-1px); }
        .notif-detail-secondary-row { display: flex; gap: 0.6rem; }
        .notif-secondary-btn {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
          padding: 0.65rem; border-radius: 10px;
          background: var(--glass-bg-subtle); border: 1px solid var(--glass-border-medium);
          color: var(--text-muted); font-size: 0.78rem; font-weight: 600;
          cursor: pointer; transition: all var(--transition-fast);
        }
        .notif-secondary-btn:hover { color: var(--text-primary); border-color: var(--glass-border-accent); }
        .notif-secondary-btn--danger { background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.2); color: #f43f5e; }
        .notif-secondary-btn--danger:hover { background: rgba(239,68,68,0.15); }

        /* Slide-in animation for detail panel */
        .reveal-slide-left {
          animation: revealSlideLeft 0.3s var(--ease-spring) both;
        }
        @keyframes revealSlideLeft {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div className="notif-page" id="notifications-page">
        {/* Header */}
        <div className="notif-page-header">
          <div className="notif-page-header-left">
            <div className="notif-page-icon">
              <Bell size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span className="notif-page-title">Notifications</span>
                {unreadCount > 0 && (
                  <span className="notif-count-badge">{unreadCount} new</span>
                )}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                Institutional alerts & system updates
              </div>
            </div>
          </div>

          <div className="notif-page-actions">
            {unreadCount > 0 && (
              <button
                id="notif-mark-all-read"
                className="notif-action-btn"
                onClick={markAllAsRead}
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                id="notif-clear-all"
                className="notif-action-btn notif-action-btn--danger"
                onClick={() => {
                  if (window.confirm('Clear all notifications?')) {
                    clearAll();
                    setSelected(null);
                  }
                }}
              >
                <Trash2 size={13} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Split Layout */}
        <div className="notif-layout">
          {/* List */}
          <div className="notif-list-col" id="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <Bell size={42} strokeWidth={1.5} />
                <div className="notif-empty-title">All clear</div>
                <div className="notif-empty-sub">No notifications at this time.</div>
              </div>
            ) : (
              <>
                {unread.length > 0 && (
                  <>
                    <div className="notif-section-label">New</div>
                    {unread.map((item, i) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        index={i}
                        onSelect={handleSelect}
                        isSelected={selected?.id === item.id}
                      />
                    ))}
                  </>
                )}
                {read.length > 0 && (
                  <>
                    <div className="notif-section-label" style={{ marginTop: '1rem' }}>Earlier</div>
                    {read.map((item, i) => (
                      <NotificationRow
                        key={item.id}
                        item={item}
                        index={i + unread.length}
                        onSelect={handleSelect}
                        isSelected={selected?.id === item.id}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <NotificationDetail
              key={selected.id}
              item={selected}
              onClose={handleClose}
              onDelete={(id) => {
                deleteNotification(id);
                setSelected(null);
              }}
              onMarkUnread={markAsUnread}
            />
          ) : (
            <div className="notif-detail-empty">
              <Bell size={42} strokeWidth={1.5} />
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Select a notification
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                Click any item from the list to read it here.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
