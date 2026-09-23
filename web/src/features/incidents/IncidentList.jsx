import React, { useState } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { formatDate, getSeverityBadge, getStatusBadge } from '../../utils/formatters';

export default function IncidentList() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Initial mockup state for viewing
  const [incidents] = useState([
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      incident_number: 'INC-2026-0001',
      student_name: 'Alex Rivera',
      title: 'Repeated disruption during Chemistry lab',
      location: 'Science Lab B',
      severity: 'MODERATE',
      demerit_points: 15,
      status: 'RESOLVED',
      occurred_at: '2026-09-15',
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      incident_number: 'INC-2026-0002',
      student_name: 'Alex Rivera',
      title: 'Phone usage during quiz',
      location: 'Room 204',
      severity: 'MODERATE',
      demerit_points: 10,
      status: 'RESOLVED',
      occurred_at: '2026-09-18',
    },
  ]);

  const columns = [
    { header: 'Incident #', key: 'incident_number' },
    { header: 'Student', key: 'student_name' },
    { header: 'Title', key: 'title' },
    {
      header: 'Severity',
      key: 'severity',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getSeverityBadge(row.severity)}`}>
          {row.severity}
        </span>
      ),
    },
    { header: 'Demerits', key: 'demerit_points' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(row.status)}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Date',
      key: 'occurred_at',
      render: (row) => formatDate(row.occurred_at),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Incident Reports</h1>
          <p className="text-sm text-slate-400">Manage disciplinary infractions and report new cases.</p>
        </div>
        <Button onClick={() => setIsReportModalOpen(true)}>+ Report Incident</Button>
      </div>

      <Table columns={columns} data={incidents} />

      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Report New Disciplinary Incident"
      >
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsReportModalOpen(false); }}>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Student</label>
            <input
              type="text"
              placeholder="Search student admission or name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
            <input
              type="text"
              placeholder="e.g. Disruption during period 3"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Severity</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="MINOR">Minor (5 Demerits)</option>
              <option value="MODERATE">Moderate (15 Demerits)</option>
              <option value="MAJOR">Major (30 Demerits)</option>
              <option value="CRITICAL">Critical (50 Demerits)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Provide objective facts and witness details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              required
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Report</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
