import type { GSIMap, GSIBuildings, GSITeamPlayer } from '../types/gsi';
import { formatGold } from '../utils/format';

interface Props {
  map: GSIMap | undefined;
  buildings: GSIBuildings | undefined;
  allplayers: Record<string, GSITeamPlayer> | undefined;
}

export function TeamStats({ map, buildings, allplayers }: Props) {
  if (!map) {
    return (
      <div className="panel team-stats">
        <h2>Команды</h2>
        <div className="empty-state">Ожидание данных матча...</div>
      </div>
    );
  }

  const radiantPlayers: GSITeamPlayer[] = [];
  const direPlayers: GSITeamPlayer[] = [];

  if (allplayers) {
    // В GSI спектаторском режиме игроки идут по индексам: 0-4 radiant, 5-9 dire
    Object.entries(allplayers).forEach(([key, p]) => {
      const idx = parseInt(key.replace('player', ''), 10);
      if (idx < 5) radiantPlayers.push(p);
      else direPlayers.push(p);
    });
  }

  const radiantNetWorth = radiantPlayers.reduce((s, p) => s + (p.net_worth || 0), 0);
  const direNetWorth = direPlayers.reduce((s, p) => s + (p.net_worth || 0), 0);

  // Подсчёт зданий
  const countBuildings = (teamBuildings: Record<string, { health: number; max_health: number }> | undefined) => {
    if (!teamBuildings) return { towers: 0, totalTowers: 11, barracks: 0, totalBarracks: 6 };
    let towers = 0, barracks = 0;
    for (const [name, b] of Object.entries(teamBuildings)) {
      if (b.health > 0) {
        if (name.includes('tower')) towers++;
        else if (name.includes('rax')) barracks++;
      }
    }
    return { towers, totalTowers: 11, barracks, totalBarracks: 6 };
  };

  const radiantBuilds = countBuildings(buildings?.radiant);
  const direBuilds = countBuildings(buildings?.dire);

  return (
    <div className="panel team-stats">
      <h2>Команды</h2>

      {/* Счёт */}
      <div className="score-board">
        <div className="team radiant-side">
          <span className="team-label">Radiant</span>
          <span className="team-score">{map.radiant_score}</span>
        </div>
        <div className="score-vs">VS</div>
        <div className="team dire-side">
          <span className="team-score">{map.dire_score}</span>
          <span className="team-label">Dire</span>
        </div>
      </div>

      {/* Net Worth сравнение */}
      {(radiantNetWorth > 0 || direNetWorth > 0) && (
        <div className="networth-compare">
          <div className="nw-bar-container">
            <div
              className="nw-bar radiant-bar"
              style={{
                width: `${(radiantNetWorth / (radiantNetWorth + direNetWorth)) * 100}%`
              }}
            />
          </div>
          <div className="nw-labels">
            <span className="radiant-text">{formatGold(radiantNetWorth)}</span>
            <span className="nw-diff">
              {radiantNetWorth > direNetWorth ? '+' : ''}{formatGold(radiantNetWorth - direNetWorth)}
            </span>
            <span className="dire-text">{formatGold(direNetWorth)}</span>
          </div>
        </div>
      )}

      {/* Здания */}
      {buildings && (
        <div className="buildings-info">
          <div className="buildings-team">
            <span className="radiant-text">R</span>
            <span>Башни: {radiantBuilds.towers}/{radiantBuilds.totalTowers}</span>
            <span>Казармы: {radiantBuilds.barracks}/{radiantBuilds.totalBarracks}</span>
          </div>
          <div className="buildings-team">
            <span className="dire-text">D</span>
            <span>Башни: {direBuilds.towers}/{direBuilds.totalTowers}</span>
            <span>Казармы: {direBuilds.barracks}/{direBuilds.totalBarracks}</span>
          </div>
        </div>
      )}

      {/* Таблица игроков (спектаторский режим) */}
      {radiantPlayers.length > 0 && (
        <>
          <h3 className="radiant-text">Radiant</h3>
          <PlayerTable players={radiantPlayers} />
          <h3 className="dire-text">Dire</h3>
          <PlayerTable players={direPlayers} />
        </>
      )}

      {/* Рошан */}
      {map.roshan_state && map.roshan_state !== 'alive' && (
        <div className="roshan-info">
          <span className="roshan-label">Рошан:</span>
          <span className="roshan-state">{map.roshan_state}</span>
          {map.roshan_state_end_seconds > 0 && (
            <span className="roshan-timer">{Math.ceil(map.roshan_state_end_seconds)}с</span>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerTable({ players }: { players: GSITeamPlayer[] }) {
  return (
    <div className="player-table">
      {players.map((p, i) => {
        const heroName = p.hero_name
          ?.replace('npc_dota_hero_', '')
          .split('_')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ') || '???';

        return (
          <div key={i} className={`player-row ${!p.hero_alive ? 'dead-player' : ''}`}>
            <span className="pr-hero">{heroName}</span>
            <span className="pr-level">Ур.{p.hero_level}</span>
            <span className="pr-kda">{p.kills}/{p.deaths}/{p.assists}</span>
            <span className="pr-cs">{p.last_hits}/{p.denies}</span>
            <span className="pr-gold gold">{formatGold(p.net_worth)}</span>
            {!p.hero_alive && p.respawn_seconds > 0 && (
              <span className="pr-respawn">{p.respawn_seconds}с</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
