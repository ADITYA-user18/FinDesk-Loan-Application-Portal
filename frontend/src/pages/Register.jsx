import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ROLE_OPTIONS = [
  { value: 'borrower', label: '🏠 Borrower — Apply for loans', desc: 'Submit and track your own loan applications' },
  { value: 'agent',    label: '🏢 Agent — Operations team',    desc: 'Review all applications and update statuses' },
];

export default function RegisterPage() {
  const [form, setForm]       = useState({ name: '', mobile: '', password: '', confirmPassword: '', role: 'borrower' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) errs.mobile = 'Enter a valid 10-digit mobile number.';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await register({ name: form.name.trim(), mobile: form.mobile.trim(), password: form.password, role: form.role });
      toast.success(`Account created! Welcome, ${res.user.name}`);
      navigate(res.user.role === 'agent' ? '/dashboard' : '/apply', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }, [form, register, navigate]);

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', minHeight: '100vh', paddingTop: 0, paddingBottom: 40 }}>
      <div className="container">
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#3b82f6,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.4rem', color: '#fff', margin: '0 auto 16px', boxShadow: '0 0 24px rgba(59,130,246,0.3)' }}>V</div>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '1.6rem', fontWeight: 700, marginBottom: 6 }}>Create your account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Join Vitto's loan application platform</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              {/* Role selector */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {ROLE_OPTIONS.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => { setForm((p) => ({ ...p, role: r.value })); }}
                    style={{
                      padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'left', cursor: 'pointer',
                      border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.role === r.value ? 'rgba(59,130,246,0.08)' : 'var(--bg-input)',
                      transition: 'var(--transition)',
                    }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{r.desc}</div>
                  </button>
                ))}
              </div>

              <div className="form-grid" style={{ marginBottom: 0 }}>
                <div className="form-group full">
                  <label className="form-label" htmlFor="reg-name">Full Name <span>*</span></label>
                  <input id="reg-name" name="name" type="text"
                    className={`form-input${errors.name ? ' error' : ''}`}
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group full">
                  <label className="form-label" htmlFor="reg-mobile">Mobile Number <span>*</span></label>
                  <input id="reg-mobile" name="mobile" type="tel"
                    className={`form-input${errors.mobile ? ' error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={form.mobile} onChange={handleChange} maxLength={10} />
                  {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-password">Password <span>*</span></label>
                  <input id="reg-password" name="password" type="password"
                    className={`form-input${errors.password ? ' error' : ''}`}
                    placeholder="Min 6 characters"
                    value={form.password} onChange={handleChange} />
                  {errors.password && <span className="form-error">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-confirm">Confirm Password <span>*</span></label>
                  <input id="reg-confirm" name="confirmPassword" type="password"
                    className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                    placeholder="Repeat password"
                    value={form.confirmPassword} onChange={handleChange} />
                  {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading} id="register-btn" style={{ marginTop: 24 }}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</> : '→ Create Account'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 500 }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
