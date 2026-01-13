import { FloorType, WallType, CeilingType } from '../types';

// Цены на материалы для пола (за м²)
export const floorMaterialPrices: Record<FloorType, { name: string; price: number; unit: string }> = {
  laminate: { name: 'Ламинат', price: 800, unit: 'м²' },
  parquet: { name: 'Паркет', price: 2500, unit: 'м²' },
  tile: { name: 'Плитка напольная', price: 1200, unit: 'м²' },
  linoleum: { name: 'Линолеум', price: 400, unit: 'м²' },
  carpet: { name: 'Ковролин', price: 600, unit: 'м²' },
  concrete: { name: 'Бетонная стяжка', price: 300, unit: 'м²' },
};

// Цены на работы по полу (за м²)
export const floorLaborPrices: Record<FloorType, { name: string; price: number; daysPerM2: number }> = {
  laminate: { name: 'Укладка ламината', price: 350, daysPerM2: 0.05 },
  parquet: { name: 'Укладка паркета', price: 800, daysPerM2: 0.1 },
  tile: { name: 'Укладка плитки на пол', price: 1000, daysPerM2: 0.15 },
  linoleum: { name: 'Укладка линолеума', price: 200, daysPerM2: 0.03 },
  carpet: { name: 'Укладка ковролина', price: 250, daysPerM2: 0.03 },
  concrete: { name: 'Заливка стяжки', price: 450, daysPerM2: 0.1 },
};

// Цены на материалы для стен (за м²)
export const wallMaterialPrices: Record<WallType, { name: string; price: number; unit: string }> = {
  paint: { name: 'Краска для стен', price: 200, unit: 'м²' },
  wallpaper: { name: 'Обои', price: 450, unit: 'м²' },
  tile: { name: 'Плитка настенная', price: 900, unit: 'м²' },
  plaster: { name: 'Декоративная штукатурка', price: 600, unit: 'м²' },
  panels: { name: 'Стеновые панели', price: 800, unit: 'м²' },
};

// Цены на работы по стенам (за м²)
export const wallLaborPrices: Record<WallType, { name: string; price: number; daysPerM2: number }> = {
  paint: { name: 'Покраска стен', price: 250, daysPerM2: 0.03 },
  wallpaper: { name: 'Поклейка обоев', price: 350, daysPerM2: 0.05 },
  tile: { name: 'Укладка плитки на стены', price: 1200, daysPerM2: 0.12 },
  plaster: { name: 'Нанесение декоративной штукатурки', price: 500, daysPerM2: 0.08 },
  panels: { name: 'Монтаж стеновых панелей', price: 400, daysPerM2: 0.06 },
};

// Цены на материалы для потолка (за м²)
export const ceilingMaterialPrices: Record<CeilingType, { name: string; price: number; unit: string }> = {
  paint: { name: 'Краска для потолка', price: 180, unit: 'м²' },
  stretch: { name: 'Натяжной потолок', price: 600, unit: 'м²' },
  suspended: { name: 'Подвесной потолок', price: 800, unit: 'м²' },
  plaster: { name: 'Шпаклёвка потолка', price: 250, unit: 'м²' },
};

// Цены на работы по потолку (за м²)
export const ceilingLaborPrices: Record<CeilingType, { name: string; price: number; daysPerM2: number }> = {
  paint: { name: 'Покраска потолка', price: 300, daysPerM2: 0.04 },
  stretch: { name: 'Монтаж натяжного потолка', price: 400, daysPerM2: 0.02 },
  suspended: { name: 'Монтаж подвесного потолка', price: 600, daysPerM2: 0.08 },
  plaster: { name: 'Шпаклёвка потолка', price: 350, daysPerM2: 0.05 },
};

// Дополнительные работы
export const additionalWorks = {
  demolition: { name: 'Демонтаж старого покрытия', price: 200, daysPerM2: 0.02 },
  leveling: { name: 'Выравнивание стен', price: 400, daysPerM2: 0.06 },
  priming: { name: 'Грунтовка поверхности', price: 50, daysPerM2: 0.01 },
  electrical: { name: 'Электромонтаж (за точку)', price: 800, daysPerPoint: 0.25 },
  plumbing: { name: 'Сантехника (за точку)', price: 1500, daysPerPoint: 0.5 },
};

// Множители сложности
export const complexityMultipliers = {
  simple: { name: 'Простой ремонт', multiplier: 1 },
  standard: { name: 'Стандартный ремонт', multiplier: 1.3 },
  premium: { name: 'Премиум ремонт', multiplier: 1.8 },
  designer: { name: 'Дизайнерский ремонт', multiplier: 2.5 },
};
