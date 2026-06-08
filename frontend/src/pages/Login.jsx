import { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm]         = useState({ mobile: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const { login, isAgent }      = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const from                    = location.state?.from?.pathname || null;

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await login(form.mobile.trim(), form.password);
      toast.success(`Welcome back, ${res.user.name}!`);
      // Redirect: agent → dashboard, borrower → apply (or where they came from)
      const dest = from || (res.user.role === 'agent' ? '/dashboard' : '/apply');
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }, [form, login, navigate, from]);

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', minHeight: '100vh', paddingTop: 0 }}>
      <div className="container">
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: '#fff', margin: '0 auto 16px', boxShadow: '0 0 24px rgba(59,130,246,0.3)' }}>V</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign in to your Vitto account</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="login-mobile">Mobile Number <span>*</span></label>
                <input id="login-mobile" name="mobile" type="tel"
                  className={`form-input${errors.mobile ? ' error' : ''}`}
                  placeholder="10-digit mobile number"
                  value={form.mobile} onChange={handleChange} maxLength={10} />
                {errors.mobile && <span className="form-error">{errors.mobile}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="login-password">Password <span>*</span></label>
                <input id="login-password" name="password" type="password"
                  className={`form-input${errors.password ? ' error' : ''}`}
                  placeholder="Your password"
                  value={form.password} onChange={handleChange} />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="login-btn">
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : '→ Sign In'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 500 }}>Create one →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
