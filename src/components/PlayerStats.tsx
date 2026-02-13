import type { GSIPlayer, GSIHero, GSIAbility, GSIItems, GSIItem } from '../types/gsi';
import { heroDisplayName, formatGold, itemDisplayName } from '../utils/format';

interface Props {
  player: GSIPlayer | undefined;
  hero: GSIHero | undefined;
  abilities: Record<string, GSIAbility> | undefined;
  items: GSIItems | undefined;
}

export function PlayerStats({ player, hero, abilities, items }: Props) {
  if (!player || !hero) {
    return (
      <div className="panel player-stats">
        <h2>Игрок</h2>
        <div className="empty-state">Ожидание данных игрока...</div>
      </div>
    );
  }

  const hpPercent = hero.health_percent;
  const manaPercent = hero.mana_percent;

  return (
    <div className="panel player-stats">
      <div className="player-header">
        <h2>{heroDisplayName(hero.name)}</h2>
        <span className="player-name">{player.name}</span>
        <span className="player-level">Ур. {hero.level}</span>
      </div>

      {/* HP / Mana */}
      <div className="bars">
        <div className="bar-container">
          <div className="bar hp-bar" style={{ width: `${hpPercent}%` }} />
          <span className="bar-text">{hero.health} / {hero.max_health}</span>
        </div>
        <div className="bar-container">
          <div className="bar mana-bar" style={{ width: `${manaPercent}%` }} />
          <span className="bar-text">{Math.floor(hero.mana)} / {hero.max_mana}</span>
        </div>
      </div>

      {/* KDA */}
      <div className="kda-row">
        <div className="kda-item">
          <span className="kda-value kills">{player.kills}</span>
          <span className="kda-label">Убийства</span>
        </div>
        <span className="kda-sep">/</span>
        <div className="kda-item">
          <span className="kda-value deaths">{player.deaths}</span>
          <span className="kda-label">Смерти</span>
        </div>
        <span className="kda-sep">/</span>
        <div className="kda-item">
          <span className="kda-value assists">{player.assists}</span>
          <span className="kda-label">Ассисты</span>
        </div>
      </div>

      {/* Gold / XP */}
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-label">Золото</span>
          <span className="stat-value gold">{formatGold(player.gold)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">GPM</span>
          <span className="stat-value">{player.gpm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">XPM</span>
          <span className="stat-value">{player.xpm}</span>
        </div>
        <div className="stat">
          <span className="stat-label">LH / DN</span>
          <span className="stat-value">{player.last_hits} / {player.denies}</span>
        </div>
        {player.kill_streak > 2 && (
          <div className="stat">
            <span className="stat-label">Серия</span>
            <span className="stat-value streak">{player.kill_streak}</span>
          </div>
        )}
      </div>

      {/* Статусы героя */}
      <div className="hero-statuses">
        {!hero.alive && <span className="status dead">МЁРТВ ({hero.respawn_seconds}с)</span>}
        {hero.silenced && <span className="status silenced">Молчание</span>}
        {hero.stunned && <span className="status stunned">Оглушён</span>}
        {hero.hexed && <span className="status hexed">Hex</span>}
        {hero.smoked && <span className="status smoked">Smoke</span>}
        {hero.magicimmune && <span className="status bkb">BKB</span>}
        {hero.aghanims_scepter && <span className="status aghs">Aghs</span>}
        {hero.aghanims_shard && <span className="status shard">Shard</span>}
      </div>

      {/* Способности */}
      {abilities && (
        <div className="abilities-section">
          <h3>Способности</h3>
          <div className="abilities-row">
            {Object.values(abilities).map((ab, i) => (
              <div key={i} className={`ability ${ab.cooldown > 0 ? 'on-cooldown' : ''} ${ab.ultimate ? 'ultimate' : ''}`}>
                <span className="ability-name">{ab.name.replace('_', ' ').slice(0, 12)}</span>
                <span className="ability-level">Ур. {ab.level}</span>
                {ab.cooldown > 0 && <span className="ability-cd">{Math.ceil(ab.cooldown)}с</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Предметы */}
      {items && (
        <div className="items-section">
          <h3>Предметы</h3>
          <div className="items-grid">
            {(['slot0', 'slot1', 'slot2', 'slot3', 'slot4', 'slot5'] as const).map((slot) => {
              const item: GSIItem | undefined = items[slot];
              const name = itemDisplayName(item?.name);
              return (
                <div key={slot} className={`item-slot ${name ? '' : 'empty'}`}>
                  {name && (
                    <>
                      <span className="item-name">{name}</span>
                      {item?.cooldown ? <span className="item-cd">{Math.ceil(item.cooldown)}с</span> : null}
                      {item?.charges ? <span className="item-charges">x{item.charges}</span> : null}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {items.neutral0?.name && items.neutral0.name !== 'empty' && (
            <div className="neutral-item">
              Нейтр: {itemDisplayName(items.neutral0.name)}
            </div>
          )}
        </div>
      )}

      {/* Buyback */}
      <div className="buyback-info">
        <span>Buyback: {formatGold(hero.buyback_cost)}</span>
        {hero.buyback_cooldown > 0 && <span className="bb-cd">КД: {Math.ceil(hero.buyback_cooldown)}с</span>}
      </div>
    </div>
  );
}
