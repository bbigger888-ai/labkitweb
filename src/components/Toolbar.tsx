import React from 'react';
import { EditorTool, RoomType } from '../types';
import { roomTypeNames, roomTypeIcons } from '../data/rooms';
import './Toolbar.css';

interface ToolbarProps {
  currentTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  onAddRoom: (type: RoomType) => void;
  onNewProject: () => void;
  onExportProject: () => void;
  onImportProject: (file: File) => void;
  scale: number;
  onScaleChange: (scale: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showDimensions: boolean;
  onToggleDimensions: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onToolChange,
  onAddRoom,
  onNewProject,
  onExportProject,
  onImportProject,
  scale,
  onScaleChange,
  showGrid,
  onToggleGrid,
  showDimensions,
  onToggleDimensions,
}) => {
  const tools: { id: EditorTool; icon: string; label: string }[] = [
    { id: 'select', icon: '↖️', label: 'Выбор' },
    { id: 'pan', icon: '✋', label: 'Перемещение' },
  ];

  const roomTypes: RoomType[] = [
    'living',
    'bedroom',
    'kitchen',
    'bathroom',
    'hallway',
    'balcony',
    'storage',
    'office',
  ];

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportProject(file);
    }
    e.target.value = '';
  };

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <div className="toolbar-title">Файл</div>
        <div className="toolbar-buttons">
          <button className="toolbar-btn" onClick={onNewProject} title="Новый проект">
            📄 Новый
          </button>
          <label className="toolbar-btn" title="Открыть проект">
            📂 Открыть
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
          </label>
          <button className="toolbar-btn" onClick={onExportProject} title="Сохранить проект">
            💾 Сохранить
          </button>
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <div className="toolbar-title">Инструменты</div>
        <div className="toolbar-buttons">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`toolbar-btn ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
            >
              {tool.icon} {tool.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <div className="toolbar-title">Добавить комнату</div>
        <div className="toolbar-buttons room-buttons">
          {roomTypes.map((type) => (
            <button
              key={type}
              className="toolbar-btn room-btn"
              onClick={() => onAddRoom(type)}
              title={roomTypeNames[type]}
            >
              {roomTypeIcons[type]} {roomTypeNames[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-section">
        <div className="toolbar-title">Вид</div>
        <div className="toolbar-buttons">
          <button
            className={`toolbar-btn ${showGrid ? 'active' : ''}`}
            onClick={onToggleGrid}
            title="Показать сетку"
          >
            #️⃣ Сетка
          </button>
          <button
            className={`toolbar-btn ${showDimensions ? 'active' : ''}`}
            onClick={onToggleDimensions}
            title="Показать размеры"
          >
            📏 Размеры
          </button>
        </div>
        <div className="toolbar-scale">
          <label>Масштаб:</label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={scale}
            onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          />
          <span>{Math.round(scale * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
