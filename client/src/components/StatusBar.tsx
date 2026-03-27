import { Status } from '../context/AppContext';

interface Props {
  status: Status;
  message?: string | null;
}

const CONFIG: Record<Status, { label: string; icon: string; className: string }> = {
  idle: { label: 'Ready', icon: '◦', className: 'status-idle' },
  loading: { label: 'Processing…', icon: '⟳', className: 'status-loading' },
  success: { label: 'Success!', icon: '✓', className: 'status-success' },
  error: { label: 'Error', icon: '✕', className: 'status-error' },
};

export function StatusBar({ status, message }: Props) {
  const cfg = CONFIG[status];
  return (
    <div
      className={`status-bar ${cfg.className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className={`status-icon ${status === 'loading' ? 'spin' : ''}`}>{cfg.icon}</span>
      <span className="status-text">
        {cfg.label}
        {message && status === 'error' ? `: ${message}` : ''}
      </span>
    </div>
  );
}
