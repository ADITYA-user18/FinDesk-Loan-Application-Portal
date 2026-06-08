import { Link } from 'react-router-dom';
import { FilePlus, LayoutDashboard, Globe, Zap, BarChart2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  { icon: Globe,       title: 'Multi-Language Support', desc: 'Applications in Hindi, Tamil, Telugu, Marathi, and English — borrowers choose their language.' },
  { icon: Zap,         title: 'Instant Submissions',   desc: 'Submit a loan application in under 2 minutes. Client and server-side validation ensures data quality.' },
  { icon: BarChart2,   title: 'Live Dashboard',        desc: 'Operations team can view all applications, filter by status, and approve or reject in one click.' },
  { icon: ShieldCheck, title: 'Secure by Design',      desc: 'Parameterised queries, environment variable credentials, rate limiting, and CORS protection.' },
];

export default function HomePage() {
  const { isAuthenticated, isAgent } = useAuth();

  const dashboardLink  = !isAuthenticated ? '/login' : isAgent ? '/dashboard' : '/my-applications';
  const dashboardLabel = !isAuthenticated ? 'Sign In' : isAgent ? 'View Dashboard' : 'My Applications';

  return (
    <div className="page">
      <div className="container">
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '80px 0 60px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 999, padding: '6px 18px', marginBottom: 28,
            fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 500,
          }}>
            Inclusive FinTech for Bharat
          </div>

          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(2.2rem, 6vw, 4rem)', fontWeight: 800,
            lineHeight: 1.1, marginBottom: 20,
            background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 60%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Loan Applications,<br />Simplified
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.8 }}>
            Vitto helps local-language preferred borrowers complete KYC, apply for loans,
            and repay — all without friction.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/apply" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem', gap: 8 }}>
              <FilePlus size={18} /> Apply for a Loan
            </Link>
            <Link to={dashboardLink} className="btn btn-ghost" style={{ padding: '14px 32px', fontSize: '1rem', gap: 8 }}>
              <LayoutDashboard size={18} /> {dashboardLabel}
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 80 }}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card" style={{ cursor: 'default' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, marginBottom: 14,
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={20} color="var(--primary)" strokeWidth={1.8} />
              </div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, marginBottom: 8, fontSize: '0.95rem' }}>{title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
