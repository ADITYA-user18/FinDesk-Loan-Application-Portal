import { memo, useMemo } from 'react';
import { FileText, IndianRupee, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const STATS_CONFIG = [
  { key: 'totalApplications', label: 'Total Applications', Icon: FileText,       accent: 'var(--primary)',         format: (v) => v },
  { key: 'totalAmount',       label: 'Total Loan Amount',  Icon: IndianRupee,     accent: 'var(--accent)',          format: (v) => `₹${Number(v).toLocaleString('en-IN')}` },
  { key: 'pending',           label: 'Pending',            Icon: Clock,           accent: 'var(--status-pending)',  format: (v) => v, from: 'byStatus' },
  { key: 'approved',          label: 'Approved',           Icon: CheckCircle2,    accent: 'var(--status-approved)', format: (v) => v, from: 'byStatus' },
  { key: 'rejected',          label: 'Rejected',           Icon: XCircle,         accent: 'var(--status-rejected)', format: (v) => v, from: 'byStatus' },
  { key: 'averageAmount',     label: 'Avg. Loan Amount',   Icon: TrendingUp,      accent: 'var(--primary)',         format: (v) => `₹${Number(v).toLocaleString('en-IN')}` },
];

const StatsBar = memo(function StatsBar() {
  const { summary, summaryLoading } = useAppContext();

  const stats = useMemo(() => {
    if (!summary) return [];
    return STATS_CONFIG.map((cfg) => ({
      ...cfg,
      value: cfg.from === 'byStatus' ? summary.byStatus?.[cfg.key] ?? 0 : summary[cfg.key] ?? 0,
    }));
  }, [summary]);

  if (summaryLoading) {
    return (
      <div className="stats-bar">
        {STATS_CONFIG.map((_, i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 28, width: 120 }} />
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.key} className="stat-card" style={{ '--stat-accent': s.accent }}>
          <div className="stat-icon">
            <s.Icon size={16} color={s.accent} strokeWidth={1.8} />
          </div>
          <div className="stat-label">{s.label}</div>
          <div className={`stat-value ${String(s.format(s.value)).length > 10 ? 'small' : ''}`}>
            {s.format(s.value)}
          </div>
        </div>
      ))}
    </div>
  );
});

export default StatsBar;
