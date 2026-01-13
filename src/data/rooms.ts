import { RoomType } from '../types';

export const roomTypeNames: Record<RoomType, string> = {
  living: 'Гостиная',
  bedroom: 'Спальня',
  kitchen: 'Кухня',
  bathroom: 'Ванная',
  hallway: 'Прихожая',
  balcony: 'Балкон',
  storage: 'Кладовая',
  office: 'Кабинет',
};

export const roomTypeColors: Record<RoomType, string> = {
  living: '#E8D4A8',
  bedroom: '#C8D4E8',
  kitchen: '#D4E8C8',
  bathroom: '#D4E8E8',
  hallway: '#E8E0D4',
  balcony: '#E8E8D4',
  storage: '#D8D8D8',
  office: '#E8D8E0',
};

export const roomTypeDefaults: Record<RoomType, { width: number; height: number; wallHeight: number }> = {
  living: { width: 500, height: 400, wallHeight: 270 },
  bedroom: { width: 400, height: 350, wallHeight: 270 },
  kitchen: { width: 350, height: 300, wallHeight: 270 },
  bathroom: { width: 250, height: 200, wallHeight: 270 },
  hallway: { width: 200, height: 350, wallHeight: 270 },
  balcony: { width: 300, height: 100, wallHeight: 250 },
  storage: { width: 150, height: 150, wallHeight: 270 },
  office: { width: 300, height: 300, wallHeight: 270 },
};

export const roomTypeIcons: Record<RoomType, string> = {
  living: '🛋️',
  bedroom: '🛏️',
  kitchen: '🍳',
  bathroom: '🚿',
  hallway: '🚪',
  balcony: '🌅',
  storage: '📦',
  office: '💼',
};
