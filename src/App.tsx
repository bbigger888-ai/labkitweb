import React, { useState, useCallback } from 'react';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import { Toolbar } from './components/Toolbar';
import { FurnitureLibrary } from './components/FurnitureLibrary';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CostCalculator } from './components/CostCalculator';
import { CastleDefenseGame } from './components/CastleDefenseGame';
import { useProject } from './hooks/useProject';
import { EditorTool, RoomType, Point, FurnitureItem } from './types';
import { furnitureTemplates } from './data/furniture';
import './App.css';

function App() {
  const {
    project,
    updateProject,
    addRoom,
    updateRoom,
    deleteRoom,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    addDoorWindow,
    newProject,
    exportProject,
    importProject,
  } = useProject();

  const [tool, setTool] = useState<EditorTool>('select');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showGame, setShowGame] = useState(false);

  const selectedRoom = project.rooms.find((r) => r.id === selectedRoomId) || null;
  const selectedFurniture =
    selectedRoom?.furniture.find((f) => f.id === selectedFurnitureId) || null;

  // Обработчики для панели инструментов
  const handleAddRoom = useCallback(
    (type: RoomType) => {
      // Находим свободное место для новой комнаты
      let maxX = 0;
      project.rooms.forEach((room) => {
        const roomRight = room.position.x + room.size.width;
        if (roomRight > maxX) maxX = roomRight;
      });

      const position: Point = { x: maxX + 50, y: 50 };
      const roomId = addRoom(type, position);
      setSelectedRoomId(roomId);
      setSelectedFurnitureId(null);
    },
    [project.rooms, addRoom]
  );

  const handleRoomSelect = useCallback((roomId: string | null) => {
    setSelectedRoomId(roomId);
    if (!roomId) {
      setSelectedFurnitureId(null);
    }
  }, []);

  const handleFurnitureSelect = useCallback((roomId: string, furnitureId: string | null) => {
    setSelectedRoomId(roomId);
    setSelectedFurnitureId(furnitureId);
  }, []);

  const handleRoomMove = useCallback(
    (roomId: string, position: Point) => {
      updateRoom(roomId, { position });
    },
    [updateRoom]
  );

  const handleRoomResize = useCallback(
    (roomId: string, size: { width: number; height: number }) => {
      updateRoom(roomId, { size });
    },
    [updateRoom]
  );

  const handleFurnitureMove = useCallback(
    (roomId: string, furnitureId: string, position: Point) => {
      updateFurniture(roomId, furnitureId, { position });
    },
    [updateFurniture]
  );

  const handleFurnitureRotate = useCallback(
    (roomId: string, furnitureId: string, rotation: number) => {
      updateFurniture(roomId, furnitureId, { rotation });
    },
    [updateFurniture]
  );

  const handleDropFurniture = useCallback(
    (roomId: string, templateId: string, position: Point) => {
      const template = furnitureTemplates.find((t) => t.id === templateId);
      if (!template) return;

      const furniture: Omit<FurnitureItem, 'id'> = {
        templateId: template.id,
        name: template.name,
        position: {
          x: Math.max(0, position.x - template.defaultSize.width / 2),
          y: Math.max(0, position.y - template.defaultSize.height / 2),
        },
        size: { ...template.defaultSize },
        rotation: 0,
        color: template.color,
      };

      const furnitureId = addFurniture(roomId, furniture);
      setSelectedRoomId(roomId);
      setSelectedFurnitureId(furnitureId);
    },
    [addFurniture]
  );

  const handleRoomUpdate = useCallback(
    (updates: Partial<typeof selectedRoom>) => {
      if (selectedRoomId && updates) {
        updateRoom(selectedRoomId, updates);
      }
    },
    [selectedRoomId, updateRoom]
  );

  const handleFurnitureUpdate = useCallback(
    (updates: Partial<FurnitureItem>) => {
      if (selectedRoomId && selectedFurnitureId) {
        updateFurniture(selectedRoomId, selectedFurnitureId, updates);
      }
    },
    [selectedRoomId, selectedFurnitureId, updateFurniture]
  );

  const handleRoomDelete = useCallback(() => {
    if (selectedRoomId) {
      deleteRoom(selectedRoomId);
      setSelectedRoomId(null);
      setSelectedFurnitureId(null);
    }
  }, [selectedRoomId, deleteRoom]);

  const handleFurnitureDelete = useCallback(() => {
    if (selectedRoomId && selectedFurnitureId) {
      deleteFurniture(selectedRoomId, selectedFurnitureId);
      setSelectedFurnitureId(null);
    }
  }, [selectedRoomId, selectedFurnitureId, deleteFurniture]);

  const handleAddDoor = useCallback(() => {
    if (selectedRoomId) {
      addDoorWindow(selectedRoomId, 'door', {
        position: { x: 50, y: 0 },
        width: 90,
        height: 210,
        wallSide: 'top',
      });
    }
  }, [selectedRoomId, addDoorWindow]);

  const handleAddWindow = useCallback(() => {
    if (selectedRoomId) {
      addDoorWindow(selectedRoomId, 'window', {
        position: { x: 100, y: 0 },
        width: 120,
        height: 150,
        wallSide: 'top',
      });
    }
  }, [selectedRoomId, addDoorWindow]);

  const handleScaleChange = useCallback(
    (scale: number) => {
      updateProject({ settings: { ...project.settings, scale } });
    },
    [project.settings, updateProject]
  );

  const handleToggleGrid = useCallback(() => {
    updateProject({
      settings: { ...project.settings, showGrid: !project.settings.showGrid },
    });
  }, [project.settings, updateProject]);

  const handleToggleDimensions = useCallback(() => {
    updateProject({
      settings: { ...project.settings, showDimensions: !project.settings.showDimensions },
    });
  }, [project.settings, updateProject]);

  const handleNewProject = useCallback(() => {
    if (
      project.rooms.length === 0 ||
      window.confirm('Создать новый проект? Текущие изменения будут потеряны.')
    ) {
      newProject();
      setSelectedRoomId(null);
      setSelectedFurnitureId(null);
    }
  }, [project.rooms.length, newProject]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">Планировщик квартиры</span>
        </div>
        <div className="app-actions">
          <button className="calculator-btn" onClick={() => setShowGame(true)}>
            🏰 Оборона замка
          </button>
          <button className="calculator-btn" onClick={() => setShowCalculator(true)}>
            🧮 Расчёт стоимости
          </button>
        </div>
      </header>

      <Toolbar
        currentTool={tool}
        onToolChange={setTool}
        onAddRoom={handleAddRoom}
        onNewProject={handleNewProject}
        onExportProject={exportProject}
        onImportProject={importProject}
        scale={project.settings.scale}
        onScaleChange={handleScaleChange}
        showGrid={project.settings.showGrid}
        onToggleGrid={handleToggleGrid}
        showDimensions={project.settings.showDimensions}
        onToggleDimensions={handleToggleDimensions}
      />

      <div className="app-content">
        <PropertiesPanel
          selectedRoom={selectedRoom}
          selectedFurniture={selectedFurniture}
          onRoomUpdate={handleRoomUpdate}
          onFurnitureUpdate={handleFurnitureUpdate}
          onRoomDelete={handleRoomDelete}
          onFurnitureDelete={handleFurnitureDelete}
          onAddDoor={handleAddDoor}
          onAddWindow={handleAddWindow}
        />

        <FloorPlanCanvas
          rooms={project.rooms}
          selectedRoomId={selectedRoomId}
          selectedFurnitureId={selectedFurnitureId}
          scale={project.settings.scale}
          showGrid={project.settings.showGrid}
          showDimensions={project.settings.showDimensions}
          gridSize={project.settings.gridSize}
          tool={tool}
          onRoomSelect={handleRoomSelect}
          onFurnitureSelect={handleFurnitureSelect}
          onRoomMove={handleRoomMove}
          onRoomResize={handleRoomResize}
          onFurnitureMove={handleFurnitureMove}
          onFurnitureRotate={handleFurnitureRotate}
          onAddRoom={addRoom}
          onDropFurniture={handleDropFurniture}
        />

        <FurnitureLibrary />
      </div>

      {showGame && (
        <CastleDefenseGame onClose={() => setShowGame(false)} />
      )}

      {showCalculator && (
        <CostCalculator
          rooms={project.rooms}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
}

export default App;
