import { Role } from '../types';
import { getRoleIcon, getRoleName } from '../utils/calculations';

interface InterviewHeaderProps {
  candidateName: string;
  role: Role;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  onEndInterview: () => void;
}

export function InterviewHeader({
  candidateName,
  role,
  timeRemaining,
  formatTime,
  onEndInterview,
}: InterviewHeaderProps) {
  const isLowTime = timeRemaining < 300; // менее 5 минут
  const isCriticalTime = timeRemaining < 60; // менее 1 минуты

  const handleEndInterview = () => {
    if (window.confirm('Вы уверены, что хотите завершить интервью? Все данные будут сброшены.')) {
      onEndInterview();
    }
  };

  return (
    <header className="interview-header">
      <div className="header-left">
        <div className="logo">
          <span className="logo-icon">📋</span>
          <span className="logo-text">TechInterview</span>
        </div>
      </div>

      <div className="header-center">
        <div className="candidate-badge">
          <span className="role-icon">{getRoleIcon(role)}</span>
          <span className="candidate-name">{candidateName || 'Кандидат'}</span>
          <span className="role-label">{getRoleName(role)}</span>
        </div>
      </div>

      <div className="header-right">
        <div className={`timer ${isLowTime ? 'low-time' : ''} ${isCriticalTime ? 'critical-time' : ''}`}>
          <span className="timer-icon">⏱️</span>
          <span className="timer-value">{formatTime(timeRemaining)}</span>
        </div>
        <button className="end-btn" onClick={handleEndInterview}>
          Завершить
        </button>
      </div>
    </header>
  );
}
