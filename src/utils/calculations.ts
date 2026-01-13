import { Room, RoomEstimate, ProjectEstimate, MaterialCost, LaborCost } from '../types';
import {
  floorMaterialPrices,
  floorLaborPrices,
  wallMaterialPrices,
  wallLaborPrices,
  ceilingMaterialPrices,
  ceilingLaborPrices,
  additionalWorks,
} from '../data/prices';

// Генерация уникального ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Расчёт площади комнаты в м²
export function calculateArea(room: Room): number {
  return (room.size.width * room.size.height) / 10000; // см² в м²
}

// Расчёт периметра комнаты в м
export function calculatePerimeter(room: Room): number {
  return (2 * (room.size.width + room.size.height)) / 100; // см в м
}

// Расчёт площади стен в м²
export function calculateWallArea(room: Room): number {
  const perimeter = calculatePerimeter(room);
  const height = room.wallHeight / 100; // см в м

  // Вычитаем площадь дверей и окон
  let openingsArea = 0;
  for (const door of room.doors) {
    openingsArea += (door.width * door.height) / 10000;
  }
  for (const window of room.windows) {
    openingsArea += (window.width * window.height) / 10000;
  }

  return perimeter * height - openingsArea;
}

// Расчёт стоимости материалов и работ для комнаты
export function calculateRoomEstimate(room: Room, includePrep: boolean = true): RoomEstimate {
  const area = calculateArea(room);
  const perimeter = calculatePerimeter(room);
  const wallArea = calculateWallArea(room);
  const ceilingArea = area;

  const materials: MaterialCost[] = [];
  const labor: LaborCost[] = [];

  // Подготовительные работы
  if (includePrep) {
    // Грунтовка всех поверхностей
    const totalSurface = area + wallArea + ceilingArea;
    materials.push({
      name: 'Грунтовка',
      unit: 'м²',
      pricePerUnit: additionalWorks.priming.price,
      quantity: totalSurface,
      total: additionalWorks.priming.price * totalSurface,
    });
    labor.push({
      name: additionalWorks.priming.name,
      unit: 'м²',
      pricePerUnit: 0,
      quantity: totalSurface,
      total: 0,
      daysEstimate: additionalWorks.priming.daysPerM2 * totalSurface,
    });
  }

  // Пол
  const floorMaterial = floorMaterialPrices[room.floorType];
  const floorLabor = floorLaborPrices[room.floorType];

  materials.push({
    name: floorMaterial.name,
    unit: floorMaterial.unit,
    pricePerUnit: floorMaterial.price,
    quantity: area,
    total: floorMaterial.price * area,
  });

  labor.push({
    name: floorLabor.name,
    unit: 'м²',
    pricePerUnit: floorLabor.price,
    quantity: area,
    total: floorLabor.price * area,
    daysEstimate: floorLabor.daysPerM2 * area,
  });

  // Стены
  const wallMaterial = wallMaterialPrices[room.wallType];
  const wallLabor = wallLaborPrices[room.wallType];

  materials.push({
    name: wallMaterial.name,
    unit: wallMaterial.unit,
    pricePerUnit: wallMaterial.price,
    quantity: wallArea,
    total: wallMaterial.price * wallArea,
  });

  labor.push({
    name: wallLabor.name,
    unit: 'м²',
    pricePerUnit: wallLabor.price,
    quantity: wallArea,
    total: wallLabor.price * wallArea,
    daysEstimate: wallLabor.daysPerM2 * wallArea,
  });

  // Потолок
  const ceilingMaterial = ceilingMaterialPrices[room.ceilingType];
  const ceilingLabor = ceilingLaborPrices[room.ceilingType];

  materials.push({
    name: ceilingMaterial.name,
    unit: ceilingMaterial.unit,
    pricePerUnit: ceilingMaterial.price,
    quantity: ceilingArea,
    total: ceilingMaterial.price * ceilingArea,
  });

  labor.push({
    name: ceilingLabor.name,
    unit: 'м²',
    pricePerUnit: ceilingLabor.price,
    quantity: ceilingArea,
    total: ceilingLabor.price * ceilingArea,
    daysEstimate: ceilingLabor.daysPerM2 * ceilingArea,
  });

  const totalMaterials = materials.reduce((sum, m) => sum + m.total, 0);
  const totalLabor = labor.reduce((sum, l) => sum + l.total, 0);
  const totalDays = labor.reduce((sum, l) => sum + l.daysEstimate, 0);

  return {
    roomId: room.id,
    roomName: room.name,
    area,
    perimeter,
    wallArea,
    ceilingArea,
    materials,
    labor,
    totalMaterials,
    totalLabor,
    totalDays,
  };
}

// Расчёт общей стоимости проекта
export function calculateProjectEstimate(rooms: Room[]): ProjectEstimate {
  const roomEstimates = rooms.map((room) => calculateRoomEstimate(room));

  const totalArea = roomEstimates.reduce((sum, r) => sum + r.area, 0);
  const totalMaterials = roomEstimates.reduce((sum, r) => sum + r.totalMaterials, 0);
  const totalLabor = roomEstimates.reduce((sum, r) => sum + r.totalLabor, 0);
  const totalDaysEstimate = roomEstimates.reduce((sum, r) => sum + r.totalDays, 0);

  return {
    rooms: roomEstimates,
    totalArea,
    totalMaterials,
    totalLabor,
    grandTotal: totalMaterials + totalLabor,
    totalDaysEstimate: Math.ceil(totalDaysEstimate),
  };
}

// Форматирование денежной суммы
export function formatCurrency(amount: number, currency: string = '₽'): string {
  return `${Math.round(amount).toLocaleString('ru-RU')} ${currency}`;
}

// Форматирование площади
export function formatArea(area: number): string {
  return `${area.toFixed(2)} м²`;
}

// Форматирование размера в см/м
export function formatSize(cm: number): string {
  if (cm >= 100) {
    return `${(cm / 100).toFixed(2)} м`;
  }
  return `${cm} см`;
}
