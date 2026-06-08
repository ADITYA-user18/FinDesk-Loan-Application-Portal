import { memo } from 'react';

const STATUS_DOT = { pending: '●', approved: '✓', rejected: '✕' };

export const StatusBadge = memo(function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span>{STATUS_DOT[status]}</span>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
});

export const LanguageBadge = memo(function LanguageBadge({ language }) {
  return <span className={`lang-badge lang-${language}`}>{language}</span>;
});
