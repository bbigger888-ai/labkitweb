import { useGameState } from './hooks/useGameState';
import { PlayerStats } from './components/PlayerStats';
import { TeamStats } from './components/TeamStats';
import { MapTimings } from './components/MapTimings';
import { ConnectionStatus } from './components/ConnectionStatus';
import { formatTime } from './utils/format';

export default function App() {
  const { gameState, status, timings } = useGameState();

  const hasGame = !!gameState?.map;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dota 2 Monitor</h1>
        {hasGame && gameState?.map && (
          <div className="header-info">
            <span className="header-clock">{formatTime(gameState.map.clock_time)}</span>
            <span className="header-score">
              <span className="radiant-text">{gameState.map.radiant_score}</span>
              {' - '}
              <span className="dire-text">{gameState.map.dire_score}</span>
            </span>
          </div>
        )}
        <ConnectionStatus status={status} />
      </header>

      {!hasGame ? (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>Ожидание подключения Dota 2</h2>
            <p>Убедитесь, что:</p>
            <ol>
              <li>GSI сервер запущен (<code>npm run server</code>)</li>
              <li>
                Файл <code>gamestate_integration_monitor.cfg</code> скопирован в<br />
                <code>Steam/steamapps/common/dota 2 beta/game/dota/cfg/gamestate_integration/</code>
              </li>
              <li>Dota 2 запущена и идёт матч (или просмотр реплея)</li>
            </ol>
            <div className="status-indicator">
              <ConnectionStatus status={status} />
            </div>
          </div>
        </div>
      ) : (
        <main className="dashboard">
          <div className="dashboard-left">
            <PlayerStats
              player={gameState?.player}
              hero={gameState?.hero}
              abilities={gameState?.abilities}
              items={gameState?.items}
            />
          </div>
          <div className="dashboard-center">
            <TeamStats
              map={gameState?.map}
              buildings={gameState?.buildings}
              allplayers={gameState?.allplayers}
            />
          </div>
          <div className="dashboard-right">
            <MapTimings
              map={gameState?.map}
              timings={timings}
            />
          </div>
        </main>
      )}
    </div>
  );
}
