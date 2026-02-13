/** Форматирует секунды в MM:SS */
export function formatTime(seconds: number | undefined | null): string {
  if (seconds == null) return '--:--';
  const neg = seconds < 0;
  const abs = Math.abs(Math.floor(seconds));
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${neg ? '-' : ''}${m}:${s.toString().padStart(2, '0')}`;
}

/** Форматирует число с разделителями тысяч */
export function formatGold(gold: number | undefined): string {
  if (gold == null) return '0';
  if (Math.abs(gold) >= 1000) {
    return `${(gold / 1000).toFixed(1)}k`;
  }
  return gold.toString();
}

/** Возвращает читаемое имя героя из системного имени */
export function heroDisplayName(name: string | undefined): string {
  if (!name) return 'Неизвестно';
  return name
    .replace('npc_dota_hero_', '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/** Возвращает читаемое имя предмета */
export function itemDisplayName(name: string | undefined): string {
  if (!name || name === 'empty') return '';
  return name
    .replace('item_', '')
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
