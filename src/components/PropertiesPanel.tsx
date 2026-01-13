import React from 'react';
import { Room, FurnitureItem, RoomType, FloorType, WallType, CeilingType } from '../types';
import { roomTypeNames } from '../data/rooms';
import { furnitureTemplates } from '../data/furniture';
import './PropertiesPanel.css';

interface PropertiesPanelProps {
  selectedRoom: Room | null;
  selectedFurniture: FurnitureItem | null;
  onRoomUpdate: (updates: Partial<Room>) => void;
  onFurnitureUpdate: (updates: Partial<FurnitureItem>) => void;
  onRoomDelete: () => void;
  onFurnitureDelete: () => void;
  onAddDoor: () => void;
  onAddWindow: () => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedRoom,
  selectedFurniture,
  onRoomUpdate,
  onFurnitureUpdate,
  onRoomDelete,
  onFurnitureDelete,
  onAddDoor,
  onAddWindow,
}) => {
  const roomTypes: RoomType[] = ['living', 'bedroom', 'kitchen', 'bathroom', 'hallway', 'balcony', 'storage', 'office'];
  const floorTypes: { value: FloorType; label: string }[] = [
    { value: 'laminate', label: 'Ламинат' },
    { value: 'parquet', label: 'Паркет' },
    { value: 'tile', label: 'Плитка' },
    { value: 'linoleum', label: 'Линолеум' },
    { value: 'carpet', label: 'Ковролин' },
    { value: 'concrete', label: 'Бетон' },
  ];
  const wallTypes: { value: WallType; label: string }[] = [
    { value: 'paint', label: 'Покраска' },
    { value: 'wallpaper', label: 'Обои' },
    { value: 'tile', label: 'Плитка' },
    { value: 'plaster', label: 'Декоративная штукатурка' },
    { value: 'panels', label: 'Панели' },
  ];
  const ceilingTypes: { value: CeilingType; label: string }[] = [
    { value: 'paint', label: 'Покраска' },
    { value: 'stretch', label: 'Натяжной' },
    { value: 'suspended', label: 'Подвесной' },
    { value: 'plaster', label: 'Штукатурка' },
  ];

  if (!selectedRoom && !selectedFurniture) {
    return (
      <div className="properties-panel">
        <div className="properties-empty">
          <p>Выберите комнату или элемент мебели для редактирования</p>
        </div>
      </div>
    );
  }

  if (selectedFurniture && selectedRoom) {
    const template = furnitureTemplates.find((t) => t.id === selectedFurniture.templateId);

    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Свойства мебели</h3>
          <button className="delete-btn" onClick={onFurnitureDelete} title="Удалить">
            🗑️
          </button>
        </div>

        <div className="properties-section">
          <label>Название</label>
          <input
            type="text"
            value={selectedFurniture.name}
            onChange={(e) => onFurnitureUpdate({ name: e.target.value })}
          />
        </div>

        <div className="properties-section">
          <label>Размеры (см)</label>
          <div className="size-inputs">
            <div className="input-group">
              <span>Ш:</span>
              <input
                type="number"
                value={selectedFurniture.size.width}
                min={template?.minSize.width || 10}
                max={template?.maxSize.width || 500}
                onChange={(e) =>
                  onFurnitureUpdate({
                    size: { ...selectedFurniture.size, width: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
            <div className="input-group">
              <span>Г:</span>
              <input
                type="number"
                value={selectedFurniture.size.height}
                min={template?.minSize.height || 10}
                max={template?.maxSize.height || 500}
                onChange={(e) =>
                  onFurnitureUpdate({
                    size: { ...selectedFurniture.size, height: parseInt(e.target.value) || 0 },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="properties-section">
          <label>Поворот (°)</label>
          <div className="rotation-control">
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={selectedFurniture.rotation}
              onChange={(e) => onFurnitureUpdate({ rotation: parseInt(e.target.value) })}
            />
            <span>{selectedFurniture.rotation}°</span>
          </div>
          <div className="rotation-buttons">
            <button onClick={() => onFurnitureUpdate({ rotation: 0 })}>0°</button>
            <button onClick={() => onFurnitureUpdate({ rotation: 90 })}>90°</button>
            <button onClick={() => onFurnitureUpdate({ rotation: 180 })}>180°</button>
            <button onClick={() => onFurnitureUpdate({ rotation: 270 })}>270°</button>
          </div>
        </div>

        <div className="properties-section">
          <label>Цвет</label>
          <input
            type="color"
            value={selectedFurniture.color}
            onChange={(e) => onFurnitureUpdate({ color: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (selectedRoom) {
    return (
      <div className="properties-panel">
        <div className="properties-header">
          <h3>Свойства комнаты</h3>
          <button className="delete-btn" onClick={onRoomDelete} title="Удалить комнату">
            🗑️
          </button>
        </div>

        <div className="properties-section">
          <label>Название</label>
          <input
            type="text"
            value={selectedRoom.name}
            onChange={(e) => onRoomUpdate({ name: e.target.value })}
          />
        </div>

        <div className="properties-section">
          <label>Тип комнаты</label>
          <select
            value={selectedRoom.type}
            onChange={(e) => onRoomUpdate({ type: e.target.value as RoomType })}
          >
            {roomTypes.map((type) => (
              <option key={type} value={type}>
                {roomTypeNames[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="properties-section">
          <label>Размеры (см)</label>
          <div className="size-inputs">
            <div className="input-group">
              <span>Ш:</span>
              <input
                type="number"
                value={selectedRoom.size.width}
                min={100}
                step={10}
                onChange={(e) =>
                  onRoomUpdate({
                    size: { ...selectedRoom.size, width: parseInt(e.target.value) || 100 },
                  })
                }
              />
            </div>
            <div className="input-group">
              <span>Д:</span>
              <input
                type="number"
                value={selectedRoom.size.height}
                min={100}
                step={10}
                onChange={(e) =>
                  onRoomUpdate({
                    size: { ...selectedRoom.size, height: parseInt(e.target.value) || 100 },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="properties-section">
          <label>Высота стен (см)</label>
          <input
            type="number"
            value={selectedRoom.wallHeight}
            min={200}
            max={400}
            step={10}
            onChange={(e) => onRoomUpdate({ wallHeight: parseInt(e.target.value) || 270 })}
          />
        </div>

        <div className="properties-section">
          <label>Цвет комнаты</label>
          <input
            type="color"
            value={selectedRoom.color}
            onChange={(e) => onRoomUpdate({ color: e.target.value })}
          />
        </div>

        <div className="properties-divider" />

        <div className="properties-section">
          <label>Покрытие пола</label>
          <select
            value={selectedRoom.floorType}
            onChange={(e) => onRoomUpdate({ floorType: e.target.value as FloorType })}
          >
            {floorTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="properties-section">
          <label>Покрытие стен</label>
          <select
            value={selectedRoom.wallType}
            onChange={(e) => onRoomUpdate({ wallType: e.target.value as WallType })}
          >
            {wallTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="properties-section">
          <label>Тип потолка</label>
          <select
            value={selectedRoom.ceilingType}
            onChange={(e) => onRoomUpdate({ ceilingType: e.target.value as CeilingType })}
          >
            {ceilingTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="properties-divider" />

        <div className="properties-section">
          <label>Двери и окна</label>
          <div className="door-window-buttons">
            <button onClick={onAddDoor}>🚪 Добавить дверь</button>
            <button onClick={onAddWindow}>🪟 Добавить окно</button>
          </div>
          <div className="door-window-list">
            {selectedRoom.doors.map((door, idx) => (
              <div key={door.id} className="door-window-item">
                🚪 Дверь {idx + 1} ({door.width}×{door.height} см)
              </div>
            ))}
            {selectedRoom.windows.map((window, idx) => (
              <div key={window.id} className="door-window-item">
                🪟 Окно {idx + 1} ({window.width}×{window.height} см)
              </div>
            ))}
          </div>
        </div>

        <div className="properties-divider" />

        <div className="properties-info">
          <div className="info-row">
            <span>Площадь:</span>
            <strong>{((selectedRoom.size.width * selectedRoom.size.height) / 10000).toFixed(2)} м²</strong>
          </div>
          <div className="info-row">
            <span>Периметр:</span>
            <strong>{((2 * (selectedRoom.size.width + selectedRoom.size.height)) / 100).toFixed(2)} м</strong>
          </div>
          <div className="info-row">
            <span>Мебель:</span>
            <strong>{selectedRoom.furniture.length} шт.</strong>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
