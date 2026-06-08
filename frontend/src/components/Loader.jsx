export default function Loader({ text = 'Loading...' }) {
  return (
    <div className="loader-overlay">
      <div className="spinner" />
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div style={{ padding: '8px 0' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="skeleton" style={{ height: 16, width: '18%' }} />
          <div className="skeleton" style={{ height: 16, width: '14%' }} />
          <div className="skeleton" style={{ height: 16, width: '10%' }} />
          <div className="skeleton" style={{ height: 16, width: '22%' }} />
          <div className="skeleton" style={{ height: 16, width: '12%' }} />
          <div className="skeleton" style={{ height: 16, width: '12%' }} />
          <div className="skeleton" style={{ height: 16, width: '12%' }} />
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner" style={{ width:56, height:56, margin:'0 auto 16px' }} />
        <p style={{ color:'var(--text-muted)', fontFamily:"'Space Grotesk', sans-serif" }}>Loading Vitto Portal...</p>
      </div>
    </div>
  );
}
