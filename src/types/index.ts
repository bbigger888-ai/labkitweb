// Основные типы для планировщика квартиры

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export type RoomType =
  | 'living'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'hallway'
  | 'balcony'
  | 'storage'
  | 'office';

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  position: Point;
  size: Size; // в сантиметрах
  rotation: number;
  color: string;
  wallHeight: number; // высота стен в см
  floorType: FloorType;
  wallType: WallType;
  ceilingType: CeilingType;
  furniture: FurnitureItem[];
  doors: DoorWindow[];
  windows: DoorWindow[];
}

export type FloorType = 'laminate' | 'parquet' | 'tile' | 'linoleum' | 'carpet' | 'concrete';
export type WallType = 'paint' | 'wallpaper' | 'tile' | 'plaster' | 'panels';
export type CeilingType = 'paint' | 'stretch' | 'suspended' | 'plaster';

export type FurnitureCategory =
  | 'seating'
  | 'tables'
  | 'storage'
  | 'beds'
  | 'kitchen'
  | 'bathroom'
  | 'appliances'
  | 'decor';

export interface FurnitureTemplate {
  id: string;
  name: string;
  category: FurnitureCategory;
  defaultSize: Size;
  minSize: Size;
  maxSize: Size;
  icon: string;
  color: string;
}

export interface FurnitureItem {
  id: string;
  templateId: string;
  name: string;
  position: Point;
  size: Size;
  rotation: number;
  color: string;
}

export interface DoorWindow {
  id: string;
  type: 'door' | 'window';
  position: Point;
  width: number;
  height: number;
  wallSide: 'top' | 'right' | 'bottom' | 'left';
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  rooms: Room[];
  settings: ProjectSettings;
}

export interface ProjectSettings {
  scale: number; // пикселей на сантиметр
  gridSize: number; // размер сетки в см
  showGrid: boolean;
  showDimensions: boolean;
  currency: string;
}

// Калькуляция затрат
export interface MaterialCost {
  name: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  total: number;
}

export interface LaborCost {
  name: string;
  unit: string;
  pricePerUnit: number;
  quantity: number;
  total: number;
  daysEstimate: number;
}

export interface RoomEstimate {
  roomId: string;
  roomName: string;
  area: number;
  perimeter: number;
  wallArea: number;
  ceilingArea: number;
  materials: MaterialCost[];
  labor: LaborCost[];
  totalMaterials: number;
  totalLabor: number;
  totalDays: number;
}

export interface ProjectEstimate {
  rooms: RoomEstimate[];
  totalArea: number;
  totalMaterials: number;
  totalLabor: number;
  grandTotal: number;
  totalDaysEstimate: number;
}

// Инструменты редактора
export type EditorTool = 'select' | 'room' | 'door' | 'window' | 'furniture' | 'measure' | 'pan';

export interface EditorState {
  tool: EditorTool;
  selectedRoomId: string | null;
  selectedFurnitureId: string | null;
  zoom: number;
  panOffset: Point;
  isDrawing: boolean;
  drawStart: Point | null;
}
