import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Check } from 'lucide-react';
import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import CustomSelect from '../components/CustomSelect';
import toast from 'react-hot-toast';

const LANGUAGES = ['Hindi', 'Tamil', 'Telugu', 'Marathi', 'English'];

const INITIAL_FORM = { name: '', mobile: '', amount: '', purpose: '', language: '' };

function validate(data) {
  const errors = {};
  if (!data.name.trim() || data.name.trim().length < 2)
    errors.name = 'Full name must be at least 2 characters.';
  if (!/^[6-9]\d{9}$/.test(data.mobile.trim()))
    errors.mobile = 'Enter a valid 10-digit Indian mobile number.';
  const amt = parseFloat(data.amount);
  if (!data.amount || isNaN(amt) || amt < 1000)
    errors.amount = 'Minimum loan amount is ₹1,000.';
  else if (amt > 10_000_000)
    errors.amount = 'Amount cannot exceed ₹1,00,00,000.';
  if (!data.purpose.trim() || data.purpose.trim().length < 5)
    errors.purpose = 'Loan purpose must be at least 5 characters.';
  if (!data.language)
    errors.language = 'Please select a preferred language.';
  return errors;
}

export default function ApplyPage() {
  const { user, isBorrower, isAgent } = useAuth();

  // Pre-fill from auth user — borrower gets their own name/mobile automatically
  const initialForm = useMemo(() => ({
    name:     user?.name   || '',
    mobile:   user?.mobile || '',
    amount:   '',
    purpose:  '',
    language: '',
  }), [user]);

  const [form, setForm]             = useState(initialForm);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const { submitApplication } = useApplications();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const res = await submitApplication({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        amount: parseFloat(form.amount),
        purpose: form.purpose.trim(),
        language: form.language,
      });
      setConfirmation(res);
      setForm(INITIAL_FORM);
      toast.success('Application submitted!');
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors?.length) {
        toast.error(err.response.data.message);
      } else {
        toast.error(err.userMessage || 'Submission failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, submitApplication]);

  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(confirmation?.reference || '')
      .then(() => {
        setCopied(true);
        toast.success('Reference ID copied!');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => toast.error('Copy failed — select and copy manually.'));
  }, [confirmation]);

  if (confirmation) {
    return (
      <div className="page">
        <div className="container" style={{ paddingTop: 60, paddingBottom: 60 }}>
          <div className="confirm-card">
            <div className="confirm-icon">✓</div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.5rem', marginBottom: 8 }}>
              Application Submitted!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
              Your loan application has been received. Reference number:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="confirm-ref" style={{ flex: 1 }}>{confirmation.reference}</div>
              <button
                onClick={handleCopy}
                title="Copy reference ID"
                style={{
                  flexShrink: 0, width: 36, height: 36, borderRadius: 8,
                  background: copied ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.1)',
                  border: `1px solid ${copied ? 'rgba(52,211,153,0.4)' : 'rgba(251,191,36,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  color: copied ? 'var(--status-approved)' : 'var(--primary)',
                }}
              >
                {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={15} strokeWidth={2} />}
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>
              Our team will review your application and update the status. You can track it on the Dashboard.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmation(null)}>Apply Again</button>
              {/* Borrowers → My Applications, Agents → Dashboard */}
              <Link
                to={isAgent ? '/dashboard' : '/my-applications'}
                className="btn btn-primary"
              >
                {isAgent ? 'View Dashboard →' : 'View My Applications →'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Loan Application</h1>
          <p>Fill in the details below to submit your loan request. All fields are required.</p>
        </div>

        <div style={{ maxWidth: 680, margin: '0 auto 60px' }}>
          <div className="card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-grid">
                {/* Applicant Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="name">
                    Full Name <span>*</span>
                  </label>
                  <input
                    id="name" name="name" type="text"
                    className={`form-input${errors.name ? ' error' : ''}`}
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name} onChange={handleChange}
                    autoComplete="name"
                    readOnly={isBorrower}  // borrower: pre-filled from account
                    style={isBorrower ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                  />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                {/* Mobile */}
                <div className="form-group">
                  <label className="form-label" htmlFor="mobile">
                    Mobile Number <span>*</span>
                  </label>
                  <input
                    id="mobile" name="mobile" type="tel"
                    className={`form-input${errors.mobile ? ' error' : ''}`}
                    placeholder="10-digit mobile number"
                    value={form.mobile} onChange={handleChange}
                    maxLength={10}
                    readOnly={isBorrower}  // borrower: pre-filled from account
                    style={isBorrower ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                  />
                  {errors.mobile && <span className="form-error">{errors.mobile}</span>}
                </div>

                {/* Loan Amount */}
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">
                    Loan Amount (₹) <span>*</span>
                  </label>
                  <input
                    id="amount" name="amount" type="number"
                    className={`form-input${errors.amount ? ' error' : ''}`}
                    placeholder="Min ₹1,000 — e.g. 50000"
                    value={form.amount} onChange={handleChange}
                    min={1000} step={1000}
                  />
                  {errors.amount && <span className="form-error">{errors.amount}</span>}
                </div>

                {/* Language */}
                <div className="form-group">
                  <label className="form-label" htmlFor="language">
                    Preferred Language <span>*</span>
                  </label>
                  <CustomSelect
                    id="language"
                    value={form.language}
                    onChange={(val) => setForm(f => ({ ...f, language: val }))}
                    options={LANGUAGES}
                    placeholder="Select language…"
                    error={!!errors.language}
                  />
                  {errors.language && <span className="form-error">{errors.language}</span>}
                </div>

                {/* Purpose */}
                <div className="form-group full">
                  <label className="form-label" htmlFor="purpose">
                    Loan Purpose <span>*</span>
                  </label>
                  <textarea
                    id="purpose" name="purpose"
                    className={`form-textarea${errors.purpose ? ' error' : ''}`}
                    placeholder="Describe the purpose of the loan (e.g. Working capital for tailoring business)"
                    value={form.purpose} onChange={handleChange}
                    rows={3}
                  />
                  {errors.purpose && <span className="form-error">{errors.purpose}</span>}
                </div>
              </div>

              <div style={{ marginTop: 28 }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                  id="submit-application-btn"
                >
                  {submitting ? (
                    <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Submitting…</>
                  ) : (
                    '→ Submit Application'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
