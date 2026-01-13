import { useState, useCallback, useEffect } from 'react';
import { Project, Room, FurnitureItem, RoomType, Point, Size, DoorWindow } from '../types';
import { generateId } from '../utils/calculations';
import { roomTypeDefaults, roomTypeColors, roomTypeNames } from '../data/rooms';

const STORAGE_KEY = 'apartment-planner-project';

const createDefaultProject = (): Project => ({
  id: generateId(),
  name: 'Новый проект',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rooms: [],
  settings: {
    scale: 0.15, // 15 пикселей на сантиметр
    gridSize: 50, // сетка 50 см
    showGrid: true,
    showDimensions: true,
    currency: '₽',
  },
});

export function useProject() {
  const [project, setProject] = useState<Project>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createDefaultProject();
      }
    }
    return createDefaultProject();
  });

  // Автосохранение
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  // Обновление проекта
  const updateProject = useCallback((updates: Partial<Project>) => {
    setProject((prev) => ({
      ...prev,
      ...updates,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Создание новой комнаты
  const addRoom = useCallback(
    (type: RoomType, position: Point) => {
      const defaults = roomTypeDefaults[type];
      const newRoom: Room = {
        id: generateId(),
        name: roomTypeNames[type],
        type,
        position,
        size: { width: defaults.width, height: defaults.height },
        rotation: 0,
        color: roomTypeColors[type],
        wallHeight: defaults.wallHeight,
        floorType: type === 'bathroom' ? 'tile' : 'laminate',
        wallType: type === 'bathroom' ? 'tile' : 'paint',
        ceilingType: 'paint',
        furniture: [],
        doors: [],
        windows: [],
      };

      setProject((prev) => ({
        ...prev,
        rooms: [...prev.rooms, newRoom],
        updatedAt: new Date().toISOString(),
      }));

      return newRoom.id;
    },
    []
  );

  // Обновление комнаты
  const updateRoom = useCallback((roomId: string, updates: Partial<Room>) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Удаление комнаты
  const deleteRoom = useCallback((roomId: string) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((room) => room.id !== roomId),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Добавление мебели в комнату
  const addFurniture = useCallback(
    (roomId: string, furniture: Omit<FurnitureItem, 'id'>) => {
      const newFurniture: FurnitureItem = {
        ...furniture,
        id: generateId(),
      };

      setProject((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === roomId
            ? { ...room, furniture: [...room.furniture, newFurniture] }
            : room
        ),
        updatedAt: new Date().toISOString(),
      }));

      return newFurniture.id;
    },
    []
  );

  // Обновление мебели
  const updateFurniture = useCallback(
    (roomId: string, furnitureId: string, updates: Partial<FurnitureItem>) => {
      setProject((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                furniture: room.furniture.map((f) =>
                  f.id === furnitureId ? { ...f, ...updates } : f
                ),
              }
            : room
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Удаление мебели
  const deleteFurniture = useCallback((roomId: string, furnitureId: string) => {
    setProject((prev) => ({
      ...prev,
      rooms: prev.rooms.map((room) =>
        room.id === roomId
          ? { ...room, furniture: room.furniture.filter((f) => f.id !== furnitureId) }
          : room
      ),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  // Добавление двери/окна
  const addDoorWindow = useCallback(
    (roomId: string, type: 'door' | 'window', data: Omit<DoorWindow, 'id' | 'type'>) => {
      const newItem: DoorWindow = {
        ...data,
        id: generateId(),
        type,
      };

      setProject((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                [type === 'door' ? 'doors' : 'windows']: [
                  ...(type === 'door' ? room.doors : room.windows),
                  newItem,
                ],
              }
            : room
        ),
        updatedAt: new Date().toISOString(),
      }));

      return newItem.id;
    },
    []
  );

  // Удаление двери/окна
  const deleteDoorWindow = useCallback(
    (roomId: string, itemId: string, type: 'door' | 'window') => {
      setProject((prev) => ({
        ...prev,
        rooms: prev.rooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                [type === 'door' ? 'doors' : 'windows']: (
                  type === 'door' ? room.doors : room.windows
                ).filter((item) => item.id !== itemId),
              }
            : room
        ),
        updatedAt: new Date().toISOString(),
      }));
    },
    []
  );

  // Новый проект
  const newProject = useCallback(() => {
    setProject(createDefaultProject());
  }, []);

  // Экспорт проекта
  const exportProject = useCallback(() => {
    const dataStr = JSON.stringify(project, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [project]);

  // Импорт проекта
  const importProject = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setProject(imported);
      } catch (error) {
        console.error('Ошибка импорта проекта:', error);
        alert('Ошибка при импорте проекта. Проверьте формат файла.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    project,
    updateProject,
    addRoom,
    updateRoom,
    deleteRoom,
    addFurniture,
    updateFurniture,
    deleteFurniture,
    addDoorWindow,
    deleteDoorWindow,
    newProject,
    exportProject,
    importProject,
  };
}
