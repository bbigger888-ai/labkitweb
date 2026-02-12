import React, { useRef, useEffect, useState, useCallback } from 'react';
import './CastleDefenseGame.css';

// === Types ===

interface Position {
  x: number;
  y: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  pathIndex: number;
  type: EnemyType;
  reward: number;
  frozen: number; // freeze timer
}

type EnemyType = 'goblin' | 'orc' | 'troll' | 'dragon';

interface Tower {
  id: number;
  gridX: number;
  gridY: number;
  type: TowerType;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  lastFired: number;
  level: number;
}

type TowerType = 'archer' | 'mage' | 'cannon';

interface Projectile {
  x: number;
  y: number;
  targetId: number;
  speed: number;
  damage: number;
  towerType: TowerType;
}

interface WaveConfig {
  enemies: { type: EnemyType; count: number }[];
  delay: number; // ms between spawns
}

// === Constants ===

const GRID_SIZE = 40;
const COLS = 25;
const ROWS = 15;
const CANVAS_W = COLS * GRID_SIZE;
const CANVAS_H = ROWS * GRID_SIZE;

const PATH: Position[] = [
  { x: 0, y: 7 },
  { x: 3, y: 7 },
  { x: 3, y: 3 },
  { x: 7, y: 3 },
  { x: 7, y: 11 },
  { x: 11, y: 11 },
  { x: 11, y: 5 },
  { x: 15, y: 5 },
  { x: 15, y: 12 },
  { x: 19, y: 12 },
  { x: 19, y: 7 },
  { x: 24, y: 7 },
];

const TOWER_INFO: Record<TowerType, { cost: number; damage: number; range: number; fireRate: number; color: string; name: string; emoji: string }> = {
  archer: { cost: 50, damage: 15, range: 3.5, fireRate: 2, color: '#4CAF50', name: 'Лучник', emoji: '🏹' },
  mage:   { cost: 80, damage: 25, range: 3, fireRate: 1.2, color: '#9C27B0', name: 'Маг', emoji: '🔮' },
  cannon: { cost: 120, damage: 60, range: 2.5, fireRate: 0.6, color: '#FF5722', name: 'Пушка', emoji: '💣' },
};

const ENEMY_INFO: Record<EnemyType, { hp: number; speed: number; reward: number; color: string; emoji: string }> = {
  goblin: { hp: 40, speed: 1.5, reward: 10, color: '#8BC34A', emoji: '👺' },
  orc:    { hp: 100, speed: 1.0, reward: 20, color: '#795548', emoji: '👹' },
  troll:  { hp: 250, speed: 0.7, reward: 40, color: '#607D8B', emoji: '🧌' },
  dragon: { hp: 500, speed: 1.2, reward: 100, color: '#F44336', emoji: '🐉' },
};

const UPGRADE_COST_MULT = 1.5;

function generateWaves(count: number): WaveConfig[] {
  const waves: WaveConfig[] = [];
  for (let i = 0; i < count; i++) {
    const enemies: { type: EnemyType; count: number }[] = [];
    const goblins = 3 + i * 2;
    enemies.push({ type: 'goblin', count: goblins });
    if (i >= 2) enemies.push({ type: 'orc', count: Math.floor(i / 2) });
    if (i >= 5) enemies.push({ type: 'troll', count: Math.floor((i - 3) / 3) });
    if (i >= 8) enemies.push({ type: 'dragon', count: Math.floor((i - 7) / 3) });
    waves.push({ enemies, delay: Math.max(400, 800 - i * 30) });
  }
  return waves;
}

const TOTAL_WAVES = 20;
const WAVES = generateWaves(TOTAL_WAVES);

// === Path helpers ===

function getPathPixel(index: number, fraction: number): Position {
  const from = PATH[index];
  const to = PATH[Math.min(index + 1, PATH.length - 1)];
  return {
    x: (from.x + (to.x - from.x) * fraction) * GRID_SIZE + GRID_SIZE / 2,
    y: (from.y + (to.y - from.y) * fraction) * GRID_SIZE + GRID_SIZE / 2,
  };
}

function isOnPath(gx: number, gy: number): boolean {
  for (let i = 0; i < PATH.length - 1; i++) {
    const a = PATH[i];
    const b = PATH[i + 1];
    const minX = Math.min(a.x, b.x);
    const maxX = Math.max(a.x, b.x);
    const minY = Math.min(a.y, b.y);
    const maxY = Math.max(a.y, b.y);
    if (gx >= minX && gx <= maxX && gy >= minY && gy <= maxY) return true;
  }
  return false;
}

function dist(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

// === Component ===

interface Props {
  onClose: () => void;
}

export function CastleDefenseGame({ onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game state refs (mutable for animation loop)
  const stateRef = useRef({
    gold: 200,
    lives: 20,
    wave: 0,
    waveActive: false,
    enemies: [] as Enemy[],
    towers: [] as Tower[],
    projectiles: [] as Projectile[],
    spawnQueue: [] as { type: EnemyType; delay: number }[],
    spawnTimer: 0,
    nextId: 1,
    gameOver: false,
    victory: false,
    score: 0,
    lastTime: 0,
  });

  const [selectedTower, setSelectedTower] = useState<TowerType>('archer');
  const [uiGold, setUiGold] = useState(200);
  const [uiLives, setUiLives] = useState(20);
  const [uiWave, setUiWave] = useState(0);
  const [uiWaveActive, setUiWaveActive] = useState(false);
  const [uiGameOver, setUiGameOver] = useState(false);
  const [uiVictory, setUiVictory] = useState(false);
  const [uiScore, setUiScore] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  const [selectedTowerObj, setSelectedTowerObj] = useState<Tower | null>(null);

  const animFrameRef = useRef(0);

  // Sync UI state
  const syncUI = useCallback(() => {
    const s = stateRef.current;
    setUiGold(s.gold);
    setUiLives(s.lives);
    setUiWave(s.wave);
    setUiWaveActive(s.waveActive);
    setUiGameOver(s.gameOver);
    setUiVictory(s.victory);
    setUiScore(s.score);
  }, []);

  // Start wave
  const startWave = useCallback(() => {
    const s = stateRef.current;
    if (s.waveActive || s.gameOver || s.victory) return;
    if (s.wave >= TOTAL_WAVES) {
      s.victory = true;
      syncUI();
      return;
    }
    const waveConfig = WAVES[s.wave];
    const queue: { type: EnemyType; delay: number }[] = [];
    let accDelay = 500;
    for (const group of waveConfig.enemies) {
      for (let i = 0; i < group.count; i++) {
        queue.push({ type: group.type, delay: accDelay });
        accDelay += waveConfig.delay;
      }
    }
    s.spawnQueue = queue;
    s.spawnTimer = 0;
    s.waveActive = true;
    s.wave++;
    syncUI();
  }, [syncUI]);

  // Place tower
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor(mx / GRID_SIZE);
    const gy = Math.floor(my / GRID_SIZE);

    const s = stateRef.current;

    // Check if clicking existing tower
    const existingTower = s.towers.find(t => t.gridX === gx && t.gridY === gy);
    if (existingTower) {
      setSelectedTowerObj({ ...existingTower });
      return;
    }

    setSelectedTowerObj(null);

    if (s.gameOver || s.victory) return;
    if (isOnPath(gx, gy)) return;
    if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;

    const info = TOWER_INFO[selectedTower];
    if (s.gold < info.cost) return;

    s.gold -= info.cost;
    s.towers.push({
      id: s.nextId++,
      gridX: gx,
      gridY: gy,
      type: selectedTower,
      damage: info.damage,
      range: info.range,
      fireRate: info.fireRate,
      lastFired: 0,
      level: 1,
    });
    syncUI();
  }, [selectedTower, syncUI]);

  // Upgrade tower
  const upgradeTower = useCallback(() => {
    if (!selectedTowerObj) return;
    const s = stateRef.current;
    const tower = s.towers.find(t => t.id === selectedTowerObj.id);
    if (!tower || tower.level >= 3) return;
    const upgradeCost = Math.floor(TOWER_INFO[tower.type].cost * UPGRADE_COST_MULT * tower.level);
    if (s.gold < upgradeCost) return;
    s.gold -= upgradeCost;
    tower.level++;
    tower.damage = Math.floor(TOWER_INFO[tower.type].damage * (1 + 0.5 * (tower.level - 1)));
    tower.range = TOWER_INFO[tower.type].range + 0.3 * (tower.level - 1);
    tower.fireRate = TOWER_INFO[tower.type].fireRate * (1 + 0.2 * (tower.level - 1));
    setSelectedTowerObj({ ...tower });
    syncUI();
  }, [selectedTowerObj, syncUI]);

  // Sell tower
  const sellTower = useCallback(() => {
    if (!selectedTowerObj) return;
    const s = stateRef.current;
    const idx = s.towers.findIndex(t => t.id === selectedTowerObj.id);
    if (idx === -1) return;
    const tower = s.towers[idx];
    const sellPrice = Math.floor(TOWER_INFO[tower.type].cost * 0.6 * tower.level);
    s.gold += sellPrice;
    s.towers.splice(idx, 1);
    setSelectedTowerObj(null);
    syncUI();
  }, [selectedTowerObj, syncUI]);

  // Mouse move for hover
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    setHoveredCell({ x: Math.floor(mx / GRID_SIZE), y: Math.floor(my / GRID_SIZE) });
  }, []);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    stateRef.current.lastTime = performance.now();

    function update(dt: number) {
      const s = stateRef.current;
      if (s.gameOver || s.victory) return;

      // Spawn enemies
      if (s.spawnQueue.length > 0) {
        s.spawnTimer += dt * 1000;
        while (s.spawnQueue.length > 0 && s.spawnTimer >= s.spawnQueue[0].delay) {
          const spawn = s.spawnQueue.shift()!;
          const info = ENEMY_INFO[spawn.type];
          const startPos = getPathPixel(0, 0);
          s.enemies.push({
            id: s.nextId++,
            x: startPos.x,
            y: startPos.y,
            hp: info.hp,
            maxHp: info.hp,
            speed: info.speed,
            pathIndex: 0,
            type: spawn.type,
            reward: info.reward,
            frozen: 0,
          });
        }
      }

      // Move enemies
      for (const enemy of s.enemies) {
        if (enemy.pathIndex >= PATH.length - 1) continue;
        const speedMult = enemy.frozen > 0 ? 0.4 : 1;
        enemy.frozen = Math.max(0, enemy.frozen - dt);

        const target = PATH[enemy.pathIndex + 1];
        const tx = target.x * GRID_SIZE + GRID_SIZE / 2;
        const ty = target.y * GRID_SIZE + GRID_SIZE / 2;
        const dx = tx - enemy.x;
        const dy = ty - enemy.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const move = enemy.speed * GRID_SIZE * dt * speedMult;

        if (d <= move) {
          enemy.x = tx;
          enemy.y = ty;
          enemy.pathIndex++;
        } else {
          enemy.x += (dx / d) * move;
          enemy.y += (dy / d) * move;
        }
      }

      // Check enemies reaching the end
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        if (s.enemies[i].pathIndex >= PATH.length - 1) {
          s.lives--;
          s.enemies.splice(i, 1);
          if (s.lives <= 0) {
            s.gameOver = true;
            return;
          }
        }
      }

      // Tower shooting
      const now = performance.now() / 1000;
      for (const tower of s.towers) {
        if (now - tower.lastFired < 1 / tower.fireRate) continue;
        const tx = tower.gridX * GRID_SIZE + GRID_SIZE / 2;
        const ty = tower.gridY * GRID_SIZE + GRID_SIZE / 2;
        const rangePixels = tower.range * GRID_SIZE;

        let closest: Enemy | null = null;
        let closestDist = Infinity;
        for (const enemy of s.enemies) {
          const d = dist(tx, ty, enemy.x, enemy.y);
          if (d <= rangePixels && d < closestDist) {
            closest = enemy;
            closestDist = d;
          }
        }

        if (closest) {
          tower.lastFired = now;
          s.projectiles.push({
            x: tx,
            y: ty,
            targetId: closest.id,
            speed: 400,
            damage: tower.damage,
            towerType: tower.type,
          });
        }
      }

      // Move projectiles
      for (let i = s.projectiles.length - 1; i >= 0; i--) {
        const proj = s.projectiles[i];
        const target = s.enemies.find(e => e.id === proj.targetId);
        if (!target) {
          s.projectiles.splice(i, 1);
          continue;
        }

        const dx = target.x - proj.x;
        const dy = target.y - proj.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        const move = proj.speed * dt;

        if (d <= move) {
          // Hit
          target.hp -= proj.damage;
          if (proj.towerType === 'mage') {
            target.frozen = 1.5;
          }
          // Cannon splash
          if (proj.towerType === 'cannon') {
            for (const enemy of s.enemies) {
              if (enemy.id !== target.id && dist(target.x, target.y, enemy.x, enemy.y) < GRID_SIZE * 1.5) {
                enemy.hp -= proj.damage * 0.4;
              }
            }
          }
          s.projectiles.splice(i, 1);
        } else {
          proj.x += (dx / d) * move;
          proj.y += (dy / d) * move;
        }
      }

      // Remove dead enemies
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        if (s.enemies[i].hp <= 0) {
          s.gold += s.enemies[i].reward;
          s.score += s.enemies[i].reward;
          s.enemies.splice(i, 1);
        }
      }

      // Check wave complete
      if (s.waveActive && s.spawnQueue.length === 0 && s.enemies.length === 0) {
        s.waveActive = false;
        if (s.wave >= TOTAL_WAVES) {
          s.victory = true;
        }
      }
    }

    function draw() {
      const s = stateRef.current;
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Background
      ctx.fillStyle = '#2d5a1b';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * GRID_SIZE, 0);
        ctx.lineTo(x * GRID_SIZE, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * GRID_SIZE);
        ctx.lineTo(CANVAS_W, y * GRID_SIZE);
        ctx.stroke();
      }

      // Path
      ctx.strokeStyle = '#8B7355';
      ctx.lineWidth = GRID_SIZE * 0.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(PATH[0].x * GRID_SIZE + GRID_SIZE / 2, PATH[0].y * GRID_SIZE + GRID_SIZE / 2);
      for (let i = 1; i < PATH.length; i++) {
        ctx.lineTo(PATH[i].x * GRID_SIZE + GRID_SIZE / 2, PATH[i].y * GRID_SIZE + GRID_SIZE / 2);
      }
      ctx.stroke();

      // Path border
      ctx.strokeStyle = '#6B5335';
      ctx.lineWidth = GRID_SIZE * 0.9;
      ctx.globalCompositeOperation = 'destination-over';
      ctx.beginPath();
      ctx.moveTo(PATH[0].x * GRID_SIZE + GRID_SIZE / 2, PATH[0].y * GRID_SIZE + GRID_SIZE / 2);
      for (let i = 1; i < PATH.length; i++) {
        ctx.lineTo(PATH[i].x * GRID_SIZE + GRID_SIZE / 2, PATH[i].y * GRID_SIZE + GRID_SIZE / 2);
      }
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';

      // Castle at the end
      const castlePos = PATH[PATH.length - 1];
      const cx = castlePos.x * GRID_SIZE + GRID_SIZE / 2;
      const cy = castlePos.y * GRID_SIZE + GRID_SIZE / 2;
      ctx.font = `${GRID_SIZE * 1.2}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏰', cx, cy);

      // Spawn point
      const spawnPos = PATH[0];
      ctx.font = `${GRID_SIZE * 0.8}px serif`;
      ctx.fillText('⚔️', spawnPos.x * GRID_SIZE + GRID_SIZE / 2, spawnPos.y * GRID_SIZE + GRID_SIZE / 2);

      // Towers
      for (const tower of s.towers) {
        const tx = tower.gridX * GRID_SIZE + GRID_SIZE / 2;
        const ty = tower.gridY * GRID_SIZE + GRID_SIZE / 2;
        const info = TOWER_INFO[tower.type];

        // Base
        ctx.fillStyle = info.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(tower.gridX * GRID_SIZE + 2, tower.gridY * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = info.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(tower.gridX * GRID_SIZE + 2, tower.gridY * GRID_SIZE + 2, GRID_SIZE - 4, GRID_SIZE - 4);

        // Emoji
        ctx.font = `${GRID_SIZE * 0.6}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.emoji, tx, ty);

        // Level indicator
        if (tower.level > 1) {
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#FFD700';
          ctx.fillText('★'.repeat(tower.level - 1), tx, ty - GRID_SIZE * 0.35);
        }

        // Range circle for selected
        if (selectedTowerObj && selectedTowerObj.id === tower.id) {
          ctx.beginPath();
          ctx.arc(tx, ty, tower.range * GRID_SIZE, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Hover preview
      if (hoveredCell && !s.gameOver && !s.victory) {
        const hx = hoveredCell.x;
        const hy = hoveredCell.y;
        if (hx >= 0 && hx < COLS && hy >= 0 && hy < ROWS) {
          const onPath = isOnPath(hx, hy);
          const occupied = s.towers.some(t => t.gridX === hx && t.gridY === hy);
          const canPlace = !onPath && !occupied && s.gold >= TOWER_INFO[selectedTower].cost;

          ctx.fillStyle = canPlace ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.3)';
          ctx.fillRect(hx * GRID_SIZE, hy * GRID_SIZE, GRID_SIZE, GRID_SIZE);

          if (canPlace) {
            ctx.beginPath();
            ctx.arc(
              hx * GRID_SIZE + GRID_SIZE / 2,
              hy * GRID_SIZE + GRID_SIZE / 2,
              TOWER_INFO[selectedTower].range * GRID_SIZE,
              0, Math.PI * 2
            );
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Enemies
      for (const enemy of s.enemies) {
        const info = ENEMY_INFO[enemy.type];
        const size = GRID_SIZE * 0.7;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(enemy.x, enemy.y + size * 0.4, size * 0.35, size * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Emoji
        ctx.font = `${size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info.emoji, enemy.x, enemy.y);

        // HP bar
        const barW = GRID_SIZE * 0.7;
        const barH = 4;
        const barX = enemy.x - barW / 2;
        const barY = enemy.y - size * 0.5 - 6;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        const hpRatio = enemy.hp / enemy.maxHp;
        ctx.fillStyle = hpRatio > 0.5 ? '#4CAF50' : hpRatio > 0.25 ? '#FF9800' : '#F44336';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);

        // Freeze indicator
        if (enemy.frozen > 0) {
          ctx.fillStyle = 'rgba(100,180,255,0.4)';
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Projectiles
      for (const proj of s.projectiles) {
        let color = '#FFD700';
        let radius = 3;
        if (proj.towerType === 'mage') { color = '#E040FB'; radius = 4; }
        if (proj.towerType === 'cannon') { color = '#FF6D00'; radius = 5; }

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Game over / Victory overlay
      if (s.gameOver || s.victory) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.font = 'bold 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = s.victory ? '#FFD700' : '#F44336';
        ctx.fillText(s.victory ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ', CANVAS_W / 2, CANVAS_H / 2 - 20);
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#fff';
        ctx.fillText(`Счёт: ${s.score}`, CANVAS_W / 2, CANVAS_H / 2 + 30);
      }
    }

    function gameLoop(time: number) {
      const s = stateRef.current;
      const dt = Math.min((time - s.lastTime) / 1000, 0.1);
      s.lastTime = time;

      update(dt);
      draw();
      syncUI();

      animFrameRef.current = requestAnimationFrame(gameLoop);
    }

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [syncUI, hoveredCell, selectedTowerObj, selectedTower]);

  // Reset game
  const resetGame = useCallback(() => {
    const s = stateRef.current;
    s.gold = 200;
    s.lives = 20;
    s.wave = 0;
    s.waveActive = false;
    s.enemies = [];
    s.towers = [];
    s.projectiles = [];
    s.spawnQueue = [];
    s.spawnTimer = 0;
    s.gameOver = false;
    s.victory = false;
    s.score = 0;
    setSelectedTowerObj(null);
    syncUI();
  }, [syncUI]);

  const upgradeCost = selectedTowerObj && selectedTowerObj.level < 3
    ? Math.floor(TOWER_INFO[selectedTowerObj.type].cost * UPGRADE_COST_MULT * selectedTowerObj.level)
    : null;
  const sellPrice = selectedTowerObj
    ? Math.floor(TOWER_INFO[selectedTowerObj.type].cost * 0.6 * selectedTowerObj.level)
    : 0;

  return (
    <div className="castle-game-overlay">
      <div className="castle-game-container">
        <div className="castle-game-header">
          <h2>🏰 Оборона замка</h2>
          <button className="castle-game-close" onClick={onClose}>✕</button>
        </div>

        <div className="castle-game-stats">
          <span className="stat">💰 {uiGold}</span>
          <span className="stat">❤️ {uiLives}</span>
          <span className="stat">🌊 Волна: {uiWave}/{TOTAL_WAVES}</span>
          <span className="stat">⭐ Счёт: {uiScore}</span>
        </div>

        <div className="castle-game-body">
          <div className="castle-game-canvas-wrapper">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredCell(null)}
            />
          </div>

          <div className="castle-game-sidebar">
            <div className="tower-selection">
              <h3>Башни</h3>
              {(Object.entries(TOWER_INFO) as [TowerType, typeof TOWER_INFO[TowerType]][]).map(([type, info]) => (
                <button
                  key={type}
                  className={`tower-btn ${selectedTower === type ? 'active' : ''} ${uiGold < info.cost ? 'disabled' : ''}`}
                  onClick={() => { setSelectedTower(type); setSelectedTowerObj(null); }}
                >
                  <span className="tower-emoji">{info.emoji}</span>
                  <span className="tower-name">{info.name}</span>
                  <span className="tower-cost">💰 {info.cost}</span>
                </button>
              ))}
            </div>

            {selectedTowerObj && (
              <div className="tower-info-panel">
                <h3>{TOWER_INFO[selectedTowerObj.type].emoji} {TOWER_INFO[selectedTowerObj.type].name} (Ур. {selectedTowerObj.level})</h3>
                <p>Урон: {selectedTowerObj.damage}</p>
                <p>Дальность: {selectedTowerObj.range.toFixed(1)}</p>
                <p>Скорость: {selectedTowerObj.fireRate.toFixed(1)}/с</p>
                {upgradeCost !== null && (
                  <button
                    className={`upgrade-btn ${uiGold < upgradeCost ? 'disabled' : ''}`}
                    onClick={upgradeTower}
                    disabled={uiGold < upgradeCost}
                  >
                    ⬆️ Улучшить (💰 {upgradeCost})
                  </button>
                )}
                <button className="sell-btn" onClick={sellTower}>
                  💰 Продать ({sellPrice})
                </button>
              </div>
            )}

            <div className="enemy-info">
              <h3>Враги</h3>
              {(Object.entries(ENEMY_INFO) as [EnemyType, typeof ENEMY_INFO[EnemyType]][]).map(([type, info]) => (
                <div key={type} className="enemy-row">
                  <span>{info.emoji}</span>
                  <span className="enemy-hp">❤️{info.hp}</span>
                </div>
              ))}
            </div>

            <div className="game-controls">
              {!uiWaveActive && !uiGameOver && !uiVictory && (
                <button className="wave-btn" onClick={startWave}>
                  🌊 {uiWave === 0 ? 'Начать' : `Волна ${uiWave + 1}`}
                </button>
              )}
              {uiWaveActive && (
                <div className="wave-progress">⚔️ Идёт атака...</div>
              )}
              {(uiGameOver || uiVictory) && (
                <button className="wave-btn" onClick={resetGame}>🔄 Заново</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
