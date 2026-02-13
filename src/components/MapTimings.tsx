import type { GSIMap } from '../types/gsi';
import type { DerivedTimings } from '../types/gsi';
import { formatTime } from '../utils/format';

interface Props {
  map: GSIMap | undefined;
  timings: DerivedTimings | null;
}

export function MapTimings({ map, timings }: Props) {
  if (!map) {
    return (
      <div className="panel map-timings">
        <h2>Карта и таймеры</h2>
        <div className="empty-state">Ожидание данных карты...</div>
      </div>
    );
  }

  return (
    <div className="panel map-timings">
      <h2>Карта и таймеры</h2>

      {/* Игровое время и фаза */}
      <div className="game-clock">
        <span className="clock-time">{formatTime(map.clock_time)}</span>
        <span className="clock-phase">{timings?.gamePhase || ''}</span>
        {map.paused && <span className="paused-badge">ПАУЗА</span>}
      </div>

      {/* День/Ночь */}
      <div className="day-night">
        <span className={`dn-indicator ${map.daytime ? 'day' : 'night'}`}>
          {map.daytime ? '☀ День' : '🌙 Ночь'}
        </span>
        {map.nightstalker_night && <span className="ns-night">NS Ночь</span>}
        {timings && (
          <span className="dn-timer">
            Смена через: {formatTime(timings.dayNightSwitch)}
          </span>
        )}
      </div>

      {/* Таймеры рун */}
      {timings && (
        <div className="rune-timers">
          <h3>Руны</h3>
          <div className="timers-grid">
            <TimerCard
              label="Баунти"
              seconds={timings.nextBountyRune}
              color="var(--color-gold)"
              urgent={timings.nextBountyRune <= 30}
            />
            <TimerCard
              label="Сила"
              seconds={timings.nextPowerRune}
              color="var(--color-rune)"
              urgent={timings.nextPowerRune <= 30}
            />
            <TimerCard
              label="Мудрость"
              seconds={timings.nextWisdomRune}
              color="var(--color-xp)"
              urgent={timings.nextWisdomRune <= 30}
            />
          </div>
        </div>
      )}

      {/* Стаки */}
      {timings && (
        <div className="stack-timer">
          <h3>Стак крипов</h3>
          <div className={`stack-countdown ${timings.nextStackTiming <= 5 ? 'urgent' : ''}`}>
            {formatTime(timings.nextStackTiming)}
          </div>
          <span className="stack-hint">Отводите на :53-:55</span>
        </div>
      )}

      {/* Рошан */}
      <div className="roshan-section">
        <h3>Рошан</h3>
        {map.roshan_state === 'alive' || !map.roshan_state ? (
          <span className="roshan-alive">Жив</span>
        ) : (
          <div className="roshan-dead-info">
            <span className="roshan-status">{map.roshan_state}</span>
            {map.roshan_state_end_seconds > 0 && (
              <span className="roshan-countdown">{formatTime(map.roshan_state_end_seconds)}</span>
            )}
          </div>
        )}
      </div>

      {/* Матч ID */}
      <div className="match-info">
        <span className="match-id">Матч: {map.matchid}</span>
        <span className="map-name">{map.name}</span>
      </div>
    </div>
  );
}

function TimerCard({ label, seconds, color, urgent }: {
  label: string;
  seconds: number;
  color: string;
  urgent: boolean;
}) {
  return (
    <div className={`timer-card ${urgent ? 'urgent' : ''}`} style={{ borderColor: color }}>
      <span className="timer-label">{label}</span>
      <span className="timer-value" style={{ color }}>{formatTime(seconds)}</span>
    </div>
  );
}
