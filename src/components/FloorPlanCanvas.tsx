import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Room, FurnitureItem, EditorTool, Point, RoomType, DoorWindow } from '../types';
import { roomTypeColors } from '../data/rooms';
import './FloorPlanCanvas.css';

interface FloorPlanCanvasProps {
  rooms: Room[];
  selectedRoomId: string | null;
  selectedFurnitureId: string | null;
  scale: number;
  showGrid: boolean;
  showDimensions: boolean;
  gridSize: number;
  tool: EditorTool;
  onRoomSelect: (roomId: string | null) => void;
  onFurnitureSelect: (roomId: string, furnitureId: string | null) => void;
  onRoomMove: (roomId: string, position: Point) => void;
  onRoomResize: (roomId: string, size: { width: number; height: number }) => void;
  onFurnitureMove: (roomId: string, furnitureId: string, position: Point) => void;
  onFurnitureRotate: (roomId: string, furnitureId: string, rotation: number) => void;
  onAddRoom: (type: RoomType, position: Point) => void;
  onDropFurniture: (roomId: string, templateId: string, position: Point) => void;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  rooms,
  selectedRoomId,
  selectedFurnitureId,
  scale,
  showGrid,
  showDimensions,
  gridSize,
  tool,
  onRoomSelect,
  onFurnitureSelect,
  onRoomMove,
  onRoomResize,
  onFurnitureMove,
  onFurnitureRotate,
  onAddRoom,
  onDropFurniture,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [panOffset, setPanOffset] = useState<Point>({ x: 50, y: 50 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{
    type: 'room' | 'furniture' | 'resize' | null;
    roomId?: string;
    furnitureId?: string;
    startPos: Point;
    startObjPos: Point;
    resizeHandle?: string;
  } | null>(null);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Преобразование координат экрана в координаты плана (см)
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      return {
        x: (screenX - panOffset.x) / scale,
        y: (screenY - panOffset.y) / scale,
      };
    },
    [panOffset, scale]
  );

  // Преобразование координат плана в экранные
  const worldToScreen = useCallback(
    (worldX: number, worldY: number): Point => {
      return {
        x: worldX * scale + panOffset.x,
        y: worldY * scale + panOffset.y,
      };
    },
    [panOffset, scale]
  );

  // Отрисовка сетки
  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!showGrid) return;

      const gridSizeScreen = gridSize * scale;
      const startX = panOffset.x % gridSizeScreen;
      const startY = panOffset.y % gridSizeScreen;

      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;

      // Вертикальные линии
      for (let x = startX; x < canvasSize.width; x += gridSizeScreen) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }

      // Горизонтальные линии
      for (let y = startY; y < canvasSize.height; y += gridSizeScreen) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }

      // Более жирные линии каждый метр
      const meterSize = 100 * scale;
      const meterStartX = panOffset.x % meterSize;
      const meterStartY = panOffset.y % meterSize;

      ctx.strokeStyle = '#c0c0c0';
      ctx.lineWidth = 1;

      for (let x = meterStartX; x < canvasSize.width; x += meterSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
        ctx.stroke();
      }

      for (let y = meterStartY; y < canvasSize.height; y += meterSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
        ctx.stroke();
      }
    },
    [showGrid, gridSize, scale, panOffset, canvasSize]
  );

  // Отрисовка двери/окна
  const drawDoorWindow = useCallback(
    (ctx: CanvasRenderingContext2D, item: DoorWindow, roomPos: Point, roomSize: { width: number; height: number }) => {
      const screenPos = worldToScreen(roomPos.x, roomPos.y);
      const screenWidth = roomSize.width * scale;
      const screenHeight = roomSize.height * scale;
      const itemWidth = item.width * scale;

      ctx.save();

      // Позиционирование на стене
      let x = screenPos.x;
      let y = screenPos.y;

      switch (item.wallSide) {
        case 'top':
          x = screenPos.x + item.position.x * scale;
          break;
        case 'bottom':
          x = screenPos.x + item.position.x * scale;
          y = screenPos.y + screenHeight;
          break;
        case 'left':
          y = screenPos.y + item.position.y * scale;
          break;
        case 'right':
          x = screenPos.x + screenWidth;
          y = screenPos.y + item.position.y * scale;
          break;
      }

      // Рисование
      if (item.type === 'door') {
        ctx.fillStyle = '#8B4513';
        ctx.strokeStyle = '#5C3317';
      } else {
        ctx.fillStyle = '#87CEEB';
        ctx.strokeStyle = '#4682B4';
      }

      ctx.lineWidth = 2;

      if (item.wallSide === 'top' || item.wallSide === 'bottom') {
        ctx.fillRect(x, y - 5, itemWidth, 10);
        ctx.strokeRect(x, y - 5, itemWidth, 10);
      } else {
        ctx.fillRect(x - 5, y, 10, itemWidth);
        ctx.strokeRect(x - 5, y, 10, itemWidth);
      }

      ctx.restore();
    },
    [worldToScreen, scale]
  );

  // Отрисовка комнаты
  const drawRoom = useCallback(
    (ctx: CanvasRenderingContext2D, room: Room, isSelected: boolean) => {
      const screenPos = worldToScreen(room.position.x, room.position.y);
      const screenWidth = room.size.width * scale;
      const screenHeight = room.size.height * scale;

      // Заливка комнаты
      ctx.fillStyle = room.color;
      ctx.fillRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Стены
      ctx.strokeStyle = isSelected ? '#2196F3' : '#333';
      ctx.lineWidth = isSelected ? 4 : 3;
      ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Название комнаты
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        room.name,
        screenPos.x + screenWidth / 2,
        screenPos.y + screenHeight / 2 - 10
      );

      // Размеры
      if (showDimensions) {
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        const widthM = (room.size.width / 100).toFixed(2);
        const heightM = (room.size.height / 100).toFixed(2);
        ctx.fillText(
          `${widthM} × ${heightM} м`,
          screenPos.x + screenWidth / 2,
          screenPos.y + screenHeight / 2 + 10
        );

        const area = ((room.size.width * room.size.height) / 10000).toFixed(2);
        ctx.fillText(
          `${area} м²`,
          screenPos.x + screenWidth / 2,
          screenPos.y + screenHeight / 2 + 25
        );
      }

      // Ручки изменения размера (если выбрана)
      if (isSelected) {
        const handles = [
          { x: screenPos.x, y: screenPos.y, cursor: 'nw-resize' },
          { x: screenPos.x + screenWidth, y: screenPos.y, cursor: 'ne-resize' },
          { x: screenPos.x, y: screenPos.y + screenHeight, cursor: 'sw-resize' },
          { x: screenPos.x + screenWidth, y: screenPos.y + screenHeight, cursor: 'se-resize' },
        ];

        handles.forEach((h) => {
          ctx.fillStyle = '#2196F3';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // Двери и окна
      room.doors.forEach((door) => drawDoorWindow(ctx, door, room.position, room.size));
      room.windows.forEach((window) => drawDoorWindow(ctx, window, room.position, room.size));
    },
    [worldToScreen, scale, showDimensions, drawDoorWindow]
  );

  // Отрисовка мебели
  const drawFurniture = useCallback(
    (ctx: CanvasRenderingContext2D, furniture: FurnitureItem, roomPos: Point, isSelected: boolean) => {
      const absX = roomPos.x + furniture.position.x;
      const absY = roomPos.y + furniture.position.y;
      const screenPos = worldToScreen(absX, absY);
      const screenWidth = furniture.size.width * scale;
      const screenHeight = furniture.size.height * scale;

      ctx.save();

      // Поворот
      const centerX = screenPos.x + screenWidth / 2;
      const centerY = screenPos.y + screenHeight / 2;
      ctx.translate(centerX, centerY);
      ctx.rotate((furniture.rotation * Math.PI) / 180);
      ctx.translate(-centerX, -centerY);

      // Заливка
      ctx.fillStyle = furniture.color;
      ctx.fillRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Обводка
      ctx.strokeStyle = isSelected ? '#FF5722' : '#555';
      ctx.lineWidth = isSelected ? 3 : 1;
      ctx.strokeRect(screenPos.x, screenPos.y, screenWidth, screenHeight);

      // Название
      ctx.fillStyle = '#fff';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Обводка текста для читаемости
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 3;
      ctx.strokeText(furniture.name, centerX, centerY);
      ctx.fillText(furniture.name, centerX, centerY);

      ctx.restore();

      // Кнопка поворота (если выбрана)
      if (isSelected) {
        ctx.fillStyle = '#FF5722';
        ctx.beginPath();
        ctx.arc(screenPos.x + screenWidth + 15, screenPos.y - 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↻', screenPos.x + screenWidth + 15, screenPos.y - 15);
      }
    },
    [worldToScreen, scale]
  );

  // Основная отрисовка
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Очистка
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Сетка
    drawGrid(ctx);

    // Комнаты
    rooms.forEach((room) => {
      const isSelected = room.id === selectedRoomId;
      drawRoom(ctx, room, isSelected);

      // Мебель
      room.furniture.forEach((f) => {
        const isFurnitureSelected = room.id === selectedRoomId && f.id === selectedFurnitureId;
        drawFurniture(ctx, f, room.position, isFurnitureSelected);
      });
    });

    // Масштаб в углу
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Масштаб: ${Math.round(scale * 100)}%`, 10, canvasSize.height - 10);
  }, [
    canvasSize,
    rooms,
    selectedRoomId,
    selectedFurnitureId,
    scale,
    panOffset,
    drawGrid,
    drawRoom,
    drawFurniture,
  ]);

  // Определение элемента под курсором
  const getElementAtPosition = useCallback(
    (x: number, y: number): { type: 'room' | 'furniture' | 'resize'; roomId: string; furnitureId?: string; handle?: string } | null => {
      const worldPos = screenToWorld(x, y);

      // Проверяем комнаты в обратном порядке (верхние первыми)
      for (let i = rooms.length - 1; i >= 0; i--) {
        const room = rooms[i];
        const roomRight = room.position.x + room.size.width;
        const roomBottom = room.position.y + room.size.height;

        // Проверяем ручки изменения размера (если комната выбрана)
        if (room.id === selectedRoomId) {
          const handleSize = 10 / scale;
          const handles = [
            { x: room.position.x, y: room.position.y, handle: 'nw' },
            { x: roomRight, y: room.position.y, handle: 'ne' },
            { x: room.position.x, y: roomBottom, handle: 'sw' },
            { x: roomRight, y: roomBottom, handle: 'se' },
          ];

          for (const h of handles) {
            if (Math.abs(worldPos.x - h.x) < handleSize && Math.abs(worldPos.y - h.y) < handleSize) {
              return { type: 'resize', roomId: room.id, handle: h.handle };
            }
          }
        }

        // Проверяем мебель
        for (let j = room.furniture.length - 1; j >= 0; j--) {
          const f = room.furniture[j];
          const absX = room.position.x + f.position.x;
          const absY = room.position.y + f.position.y;

          if (
            worldPos.x >= absX &&
            worldPos.x <= absX + f.size.width &&
            worldPos.y >= absY &&
            worldPos.y <= absY + f.size.height
          ) {
            return { type: 'furniture', roomId: room.id, furnitureId: f.id };
          }
        }

        // Проверяем саму комнату
        if (
          worldPos.x >= room.position.x &&
          worldPos.x <= roomRight &&
          worldPos.y >= room.position.y &&
          worldPos.y <= roomBottom
        ) {
          return { type: 'room', roomId: room.id };
        }
      }

      return null;
    },
    [rooms, selectedRoomId, screenToWorld, scale]
  );

  // Обработчики мыши
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Панорамирование средней кнопкой или с инструментом pan
      if (e.button === 1 || tool === 'pan') {
        setIsPanning(true);
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
        return;
      }

      if (e.button !== 0) return;

      const element = getElementAtPosition(x, y);

      if (element) {
        if (element.type === 'resize') {
          const room = rooms.find((r) => r.id === element.roomId);
          if (room) {
            setDragState({
              type: 'resize',
              roomId: element.roomId,
              startPos: { x, y },
              startObjPos: { x: room.size.width, y: room.size.height },
              resizeHandle: element.handle,
            });
          }
        } else if (element.type === 'furniture') {
          onFurnitureSelect(element.roomId, element.furnitureId!);
          const room = rooms.find((r) => r.id === element.roomId);
          const furniture = room?.furniture.find((f) => f.id === element.furnitureId);
          if (furniture) {
            setDragState({
              type: 'furniture',
              roomId: element.roomId,
              furnitureId: element.furnitureId,
              startPos: { x, y },
              startObjPos: { ...furniture.position },
            });
          }
        } else if (element.type === 'room') {
          onRoomSelect(element.roomId);
          onFurnitureSelect(element.roomId, null);
          const room = rooms.find((r) => r.id === element.roomId);
          if (room && tool === 'select') {
            setDragState({
              type: 'room',
              roomId: element.roomId,
              startPos: { x, y },
              startObjPos: { ...room.position },
            });
          }
        }
      } else {
        onRoomSelect(null);
      }
    },
    [tool, panOffset, getElementAtPosition, rooms, onRoomSelect, onFurnitureSelect]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        return;
      }

      if (!dragState) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const dx = (x - dragState.startPos.x) / scale;
      const dy = (y - dragState.startPos.y) / scale;

      // Привязка к сетке
      const snap = (val: number) => Math.round(val / gridSize) * gridSize;

      if (dragState.type === 'room' && dragState.roomId) {
        const newX = snap(dragState.startObjPos.x + dx);
        const newY = snap(dragState.startObjPos.y + dy);
        onRoomMove(dragState.roomId, { x: Math.max(0, newX), y: Math.max(0, newY) });
      } else if (dragState.type === 'furniture' && dragState.roomId && dragState.furnitureId) {
        const newX = snap(dragState.startObjPos.x + dx);
        const newY = snap(dragState.startObjPos.y + dy);
        onFurnitureMove(dragState.roomId, dragState.furnitureId, { x: newX, y: newY });
      } else if (dragState.type === 'resize' && dragState.roomId && dragState.resizeHandle) {
        let newWidth = dragState.startObjPos.x;
        let newHeight = dragState.startObjPos.y;

        if (dragState.resizeHandle.includes('e')) {
          newWidth = snap(Math.max(100, dragState.startObjPos.x + dx));
        }
        if (dragState.resizeHandle.includes('w')) {
          newWidth = snap(Math.max(100, dragState.startObjPos.x - dx));
        }
        if (dragState.resizeHandle.includes('s')) {
          newHeight = snap(Math.max(100, dragState.startObjPos.y + dy));
        }
        if (dragState.resizeHandle.includes('n')) {
          newHeight = snap(Math.max(100, dragState.startObjPos.y - dy));
        }

        onRoomResize(dragState.roomId, { width: newWidth, height: newHeight });
      }
    },
    [isPanning, panStart, dragState, scale, gridSize, onRoomMove, onFurnitureMove, onRoomResize]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragState(null);
  }, []);

  // Обработка колеса мыши для масштабирования
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    // Масштабирование отключено для простоты, можно добавить потом
  }, []);

  // Обработка перетаскивания мебели из библиотеки
  const handleDragOver = useCallback((e: React.DragEvent<HTMLCanvasElement>) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLCanvasElement>) => {
      e.preventDefault();

      const templateId = e.dataTransfer.getData('furnitureTemplateId');
      if (!templateId) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const worldPos = screenToWorld(x, y);

      // Находим комнату под курсором
      for (const room of rooms) {
        if (
          worldPos.x >= room.position.x &&
          worldPos.x <= room.position.x + room.size.width &&
          worldPos.y >= room.position.y &&
          worldPos.y <= room.position.y + room.size.height
        ) {
          const localX = worldPos.x - room.position.x;
          const localY = worldPos.y - room.position.y;
          onDropFurniture(room.id, templateId, { x: localX, y: localY });
          return;
        }
      }
    },
    [rooms, screenToWorld, onDropFurniture]
  );

  return (
    <div ref={containerRef} className="floor-plan-canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="floor-plan-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      />
    </div>
  );
};
