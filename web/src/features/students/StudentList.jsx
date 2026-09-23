import React, { useState } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { getStatusBadge } from '../../utils/formatters';

export default function StudentList() {
  const [students] = useState([
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      admission_number: 'STU-2026-001',
      full_name: 'Alex Rivera',
      grade: 'Grade 10-Beta',
      cumulative_demerits: 25,
      status: 'ON_PROBATION',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      admission_number: 'STU-2026-002',
      full_name: 'Maya Patel',
      grade: 'Grade 11-Gamma',
      cumulative_demerits: 5,
      status: 'ACTIVE',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      admission_number: 'STU-2026-003',
      full_name: 'Jordan Lee',
      grade: 'Grade 9-Alpha',
      cumulative_demerits: 0,
      status: 'ACTIVE',
    },
  ]);

  const columns = [
    { header: 'Admission #', key: 'admission_number' },
    { header: 'Student Name', key: 'full_name' },
    { header: 'Class / Cohort', key: 'grade' },
    {
      header: 'Demerit Score',
      key: 'cumulative_demerits',
      render: (row) => (
        <span className={`font-bold ${row.cumulative_demerits >= 20 ? 'text-rose-400' : 'text-slate-200'}`}>
          {row.cumulative_demerits} pts
        </span>
      ),
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
      header: 'Action',
      key: 'actions',
      render: (row) => (
        <Button size="sm" variant="ghost" onClick={() => alert(`Viewing student ${row.full_name}`)}>
          View Record
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Student Directory</h1>
          <p className="text-sm text-slate-400">Monitor student demerit standing and disciplinary history.</p>
        </div>
      </div>

      <Table columns={columns} data={students} />
    </div>
  );
}
