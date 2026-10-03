import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, Inbox } from 'lucide-react';
import EmptyState from './EmptyState';
import { TableSkeleton } from './SkeletonLoader';

/**
 * DataTable
 * Universal, responsive data table with sorting, search, pagination, and Apple glass styling.
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no items matching your criteria.',
  searchPlaceholder = 'Filter records...',
  pageSize = 8,
  onRowClick,
  actions,
  className = '',
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Sorting handler
  const handleSort = (field) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted dataset
  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((val) => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') {
            return Object.values(val).some((nested) =>
              String(nested).toLowerCase().includes(term)
            );
          }
          return String(val).toLowerCase().includes(term);
        })
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField] ?? '';
        const valB = b[sortField] ?? '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className={`table-container ${className}`}>
      {/* Table Toolbar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--glass-border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px', maxWidth: '380px' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="form-input"
            style={{ paddingLeft: '2.4rem', height: '36px', fontSize: '0.825rem' }}
          />
        </div>

        {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
      </div>

      {/* Table Area */}
      {isLoading ? (
        <TableSkeleton rows={pageSize} cols={columns.length} />
      ) : paginatedData.length === 0 ? (
        <div style={{ padding: '2rem' }}>
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={Inbox}
          />
        </div>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={col.key || idx}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    style={{
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                      ...col.headerStyle,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span>{col.header}</span>
                      {col.sortable !== false && sortField === col.key && (
                        sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, rIdx) => (
                <tr
                  key={row[keyField] ?? rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col, cIdx) => (
                    <td key={col.key || cIdx} style={col.cellStyle}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && filteredData.length > 0 && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderTop: '1px solid var(--glass-border-subtle)',
            background: 'var(--glass-surface-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.55rem' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ padding: '0 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.25rem 0.55rem' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
