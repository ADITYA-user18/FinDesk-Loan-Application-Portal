import { useState, useCallback, memo } from 'react';
import { StatusBadge, LanguageBadge } from './Badges';
import { useApplications } from '../hooks/useApplications';
import toast from 'react-hot-toast';

const StatusModal = memo(function StatusModal({ app, onClose }) {
  const [loading, setLoading] = useState(false);
  const { updateStatus } = useApplications();

  const handleUpdate = useCallback(async (newStatus) => {
    if (newStatus === app.status) {
      toast('Status is already ' + newStatus);
      return;
    }
    setLoading(true);
    try {
      await updateStatus(app.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      onClose();
    } catch (err) {
      toast.error(err.userMessage || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  }, [app, updateStatus, onClose]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Update Application Status</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-detail">
            <span className="modal-detail-label">Applicant</span>
            <span className="modal-detail-value">{app.name}</span>
          </div>
          <div className="modal-detail">
            <span className="modal-detail-label">Mobile</span>
            <span className="modal-detail-value">{app.mobile}</span>
          </div>
          <div className="modal-detail">
            <span className="modal-detail-label">Amount</span>
            <span className="modal-detail-value" style={{ color: 'var(--accent)', fontFamily: "'Space Grotesk', sans-serif" }}>
              ₹{Number(app.amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="modal-detail">
            <span className="modal-detail-label">Purpose</span>
            <span className="modal-detail-value">{app.purpose}</span>
          </div>
          <div className="modal-detail">
            <span className="modal-detail-label">Language</span>
            <LanguageBadge language={app.language} />
          </div>
          <div className="modal-detail" style={{ marginTop: 16 }}>
            <span className="modal-detail-label">Current</span>
            <StatusBadge status={app.status} />
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Select a new status for this application:
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn btn-success btn-sm" onClick={() => handleUpdate('approved')} disabled={loading || app.status === 'approved'}>
            {loading ? '…' : '✓ Approve'}
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => handleUpdate('rejected')} disabled={loading || app.status === 'rejected'}>
            {loading ? '…' : '✕ Reject'}
          </button>
        </div>
      </div>
    </div>
  );
});

export default StatusModal;
