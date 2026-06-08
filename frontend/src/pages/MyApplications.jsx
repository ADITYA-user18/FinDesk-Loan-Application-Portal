import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, IndianRupee, Clock, CheckCircle2, XCircle, FolderOpen } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, LanguageBadge } from '../components/Badges';
import { TableSkeleton } from '../components/Loader';

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MyApplicationsPage() {
  const { applications, loading } = useAppContext();
  const { fetchApplications } = useApplications();
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications({});
  }, []); // eslint-disable-line

  const totalAmount = applications.reduce((sum, a) => sum + parseFloat(a.amount || 0), 0);

  const STATS = [
    { label: 'Total Applications', value: applications.length,                                     Icon: FileText,     accent: 'var(--primary)' },
    { label: 'Total Requested',    value: `₹${totalAmount.toLocaleString('en-IN')}`,              Icon: IndianRupee,  accent: 'var(--accent)' },
    { label: 'Pending',            value: applications.filter(a => a.status === 'pending').length,  Icon: Clock,        accent: 'var(--status-pending)' },
    { label: 'Approved',           value: applications.filter(a => a.status === 'approved').length, Icon: CheckCircle2, accent: 'var(--status-approved)' },
    { label: 'Rejected',           value: applications.filter(a => a.status === 'rejected').length, Icon: XCircle,      accent: 'var(--status-rejected)' },
  ];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>My Applications</h1>
          <p>All loan applications linked to your account ({user?.mobile}).</p>
        </div>

        {/* Stats bar */}
        {!loading && applications.length > 0 && (
          <div className="stats-bar" style={{ marginBottom: 24 }}>
            {STATS.map((s) => (
              <div key={s.label} className="stat-card" style={{ '--stat-accent': s.accent }}>
                <div className="stat-icon"><s.Icon size={16} color={s.accent} strokeWidth={1.8} /></div>
                <div className="stat-label">{s.label}</div>
                <div className={`stat-value ${String(s.value).length > 10 ? 'small' : ''}`}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{ marginBottom: 60 }}>
          {loading ? (
            <div className="table-wrapper"><TableSkeleton rows={5} /></div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><FolderOpen size={36} strokeWidth={1.2} color="var(--text-muted)" /></div>
              <h3>No applications yet</h3>
              <p style={{ marginBottom: 20 }}>You haven't submitted any loan applications.</p>
              <Link to="/apply" className="btn btn-primary">Apply for a Loan →</Link>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Purpose</th>
                    <th>Language</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app.id}>
                      <td className="td-amount">₹{Number(app.amount).toLocaleString('en-IN')}</td>
                      <td className="td-purpose" title={app.purpose}>{app.purpose}</td>
                      <td><LanguageBadge language={app.language} /></td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="td-date">{formatDate(app.created_at)}</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {app.id.split('-')[0]}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {applications.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: -40, marginBottom: 40 }}>
            <Link to="/apply" className="btn btn-primary">+ Apply for Another Loan</Link>
          </div>
        )}
      </div>
    </div>
  );
}
