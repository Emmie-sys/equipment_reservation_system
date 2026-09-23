export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getSeverityBadge(severity) {
  const styles = {
    MINOR: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    MODERATE: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    MAJOR: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };
  return styles[severity] || 'bg-slate-700 text-slate-300';
}

export function getStatusBadge(status) {
  const styles = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    PENDING_REVIEW: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    RESOLVED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    DISMISSED: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
    ON_PROBATION: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  };
  return styles[status] || 'bg-slate-700 text-slate-300';
}
