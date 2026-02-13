import type { ConnectionStatus as Status } from '../types/gsi';

interface Props {
  status: Status;
}

export function ConnectionStatus({ status }: Props) {
  const labels: Record<Status, string> = {
    connecting: 'Подключение...',
    connected: 'Подключено',
    disconnected: 'Отключено',
  };

  return (
    <div className={`connection-status ${status}`}>
      <span className="status-dot" />
      <span className="status-text">{labels[status]}</span>
    </div>
  );
}
