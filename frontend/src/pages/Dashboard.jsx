import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import StatsBar from '../components/StatsBar';
import ApplicationTable from '../components/ApplicationTable';
import StatusModal from '../components/StatusModal';
import { useAppContext } from '../context/AppContext';
import { useApplications } from '../hooks/useApplications';

const FILTER_TABS = [
  { value: 'all',      label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function DashboardPage() {
  const { filter, search, setFilter, setSearch, pagination } = useAppContext();
  const { fetchApplications, fetchSummary } = useApplications();
  const [selectedApp, setSelectedApp] = useState(null);

  // Initial load
  useEffect(() => {
    fetchApplications({ status: filter !== 'all' ? filter : undefined, search });
    fetchSummary();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch when filter or search changes
  useEffect(() => {
    fetchApplications({ status: filter !== 'all' ? filter : undefined, search });
  }, [filter, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = useCallback((app) => setSelectedApp(app), []);
  const handleModalClose = useCallback(() => setSelectedApp(null), []);

  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
  }, [setSearch]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Applications Dashboard</h1>
          <p>Monitor and manage all loan applications in real time.</p>
        </div>

        {/* Stats Bar */}
        <StatsBar />

        {/* Filters */}
        <div className="filters-bar">
          <div className="filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                id={`filter-${tab.value}`}
                className={`filter-tab${filter === tab.value ? ' active' : ''}`}
                onClick={() => setFilter(tab.value)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="search-input-wrapper">
            <span className="search-icon"><Search size={14} /></span>
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search by name or mobile…"
              value={search}
              onChange={handleSearchChange}
            />
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
            {pagination.total} total
          </span>
        </div>

        {/* Table */}
        <div style={{ marginBottom: 60 }}>
          <ApplicationTable onRowClick={handleRowClick} />
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedApp && (
        <StatusModal app={selectedApp} onClose={handleModalClose} />
      )}
    </div>
  );
}
