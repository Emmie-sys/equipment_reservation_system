import React, { useState } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { formatDate, getStatusBadge } from '../../utils/formatters';

export default function SanctionList() {
  const [sanctions] = useState([
    {
      id: '10000000-0000-0000-0000-000000000001',
      student_name: 'Alex Rivera',
      sanction_type: 'AFTER_SCHOOL_DETENTION',
      description: 'Two sessions of 45-minute detention with supervised study.',
      start_date: '2026-09-17',
      end_date: '2026-09-18',
      status: 'COMPLETED',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      student_name: 'Alex Rivera',
      sanction_type: 'PARENTAL_CONFERENCE',
      description: 'Conference requested with Carlos Rivera regarding repeated classroom infractions.',
      start_date: '2026-09-22',
      end_date: '2026-09-25',
      status: 'ACTIVE',
    },
  ]);

  const columns = [
    { header: 'Student', key: 'student_name' },
    { 
      header: 'Sanction Type', 
      key: 'sanction_type',
      render: (row) => <span className="font-semibold text-slate-200">{row.sanction_type.replace(/_/g, ' ')}</span>
    },
    { header: 'Description', key: 'description' },
    {
      header: 'Dates',
      key: 'start_date',
      render: (row) => `${formatDate(row.start_date)} - ${formatDate(row.end_date)}`,
    },
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
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => alert(`Reviewing sanction ${row.id}`)}>
          Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Assigned Sanctions</h1>
          <p className="text-sm text-slate-400">Track and fulfill detentions, suspensions, and corrective measures.</p>
        </div>
      </div>

      <Table columns={columns} data={sanctions} />
    </div>
  );
}
