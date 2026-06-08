import { memo, useCallback } from 'react';
import { FolderOpen } from 'lucide-react';
import { StatusBadge, LanguageBadge } from './Badges';
import { TableSkeleton } from './Loader';
import { useAppContext } from '../context/AppContext';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatAmount(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

const ApplicationTable = memo(function ApplicationTable({ onRowClick }) {
  const { filteredApps, loading } = useAppContext();

  const handleClick = useCallback((app) => onRowClick(app), [onRowClick]);

  if (loading) {
    return (
      <div className="table-wrapper">
        <table>
          <thead><tr>
            <th>Applicant</th><th>Mobile</th><th>Amount</th>
            <th>Purpose</th><th>Language</th><th>Status</th><th>Date</th>
          </tr></thead>
        </table>
        <TableSkeleton rows={7} />
      </div>
    );
  }

  if (!filteredApps.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><FolderOpen size={36} strokeWidth={1.2} color="var(--text-muted)" /></div>
        <h3>No applications found</h3>
        <p>Try adjusting your filters or search term.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Mobile</th>
            <th>Amount</th>
            <th>Purpose</th>
            <th>Language</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredApps.map((app) => (
            <tr key={app.id} onClick={() => handleClick(app)} title="Click to update status">
              <td className="td-name">{app.name}</td>
              <td>{app.mobile}</td>
              <td className="td-amount">{formatAmount(app.amount)}</td>
              <td className="td-purpose" title={app.purpose}>{app.purpose}</td>
              <td><LanguageBadge language={app.language} /></td>
              <td><StatusBadge status={app.status} /></td>
              <td className="td-date">{formatDate(app.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default ApplicationTable;
