import React from 'react';

export default function DashboardView() {
  const metrics = [
    { label: 'Total Incidents This Term', value: '42', change: '+8% vs last month', color: 'text-indigo-400' },
    { label: 'Active Sanctions', value: '7', change: '2 pending completion', color: 'text-amber-400' },
    { label: 'Students on Probation', value: '3', change: 'Demerits >= 20', color: 'text-rose-400' },
    { label: 'Resolution Rate', value: '94.2%', change: 'Avg response: 18h', color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Disciplinary Operations Dashboard</h1>
        <p className="text-slate-400 mt-1">Real-time telemetry on student conduct, infractions, and sanction compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{m.label}</span>
            <div className={`text-3xl font-bold mt-2 ${m.color}`}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-1">{m.change}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur">
        <h2 className="text-lg font-bold text-white mb-2">Institutional Demerit Threshold Tiers</h2>
        <div className="space-y-3 mt-4 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="font-medium text-slate-200">Level 1: Official Warning</span>
            <span className="text-xs font-semibold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">20 Demerits</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="font-medium text-slate-200">Level 2: After-School Detention</span>
            <span className="text-xs font-semibold bg-amber-500/20 text-amber-400 px-2 py-1 rounded">40 Demerits</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="font-medium text-slate-200">Level 3: Suspension Review & Probation</span>
            <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-1 rounded">60 Demerits</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="font-medium text-slate-200">Level 4: Disciplinary Board Hearing</span>
            <span className="text-xs font-semibold bg-rose-500/20 text-rose-400 px-2 py-1 rounded">80 Demerits</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
            <span className="font-medium text-slate-200">Level 5: Expulsion Recommendation</span>
            <span className="text-xs font-semibold bg-red-900/40 text-rose-300 px-2 py-1 rounded">100 Demerits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
