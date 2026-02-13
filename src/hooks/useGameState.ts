import { useState, useEffect, useRef, useCallback } from 'react';
import type { GSIState, ConnectionStatus, DerivedTimings } from '../types/gsi';

const WS_URL = 'ws://localhost:3002';
const RECONNECT_DELAY = 2000;

export function useGameState() {
  const [gameState, setGameState] = useState<GSIState | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      setStatus('connected');
      console.log('[WS] Подключено к GSI серверу');
    };

    ws.onmessage = (event) => {
      try {
        const data: GSIState = JSON.parse(event.data);
        setGameState(data);
      } catch {
        console.error('[WS] Ошибка парсинга данных');
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const timings = gameState?.map ? computeTimings(gameState.map.clock_time, gameState.map.daytime, gameState.map.game_state) : null;

  return { gameState, status, timings };
}

function computeTimings(clockTime: number, daytime: boolean, gameState: string): DerivedTimings {
  const t = clockTime;

  // Руны баунти: каждые 3 минуты (0:00, 3:00, 6:00...)
  const bountyInterval = 180;
  const nextBounty = bountyInterval - (t % bountyInterval);

  // Руны силы: каждые 2 минуты начиная с 6:00
  let nextPower = 0;
  if (t < 360) {
    nextPower = 360 - t;
  } else {
    const powerInterval = 120;
    nextPower = powerInterval - ((t - 360) % powerInterval);
  }

  // Руны мудрости: каждые 7 минут начиная с 7:00
  let nextWisdom = 0;
  if (t < 420) {
    nextWisdom = 420 - t;
  } else {
    const wisdomInterval = 420;
    nextWisdom = wisdomInterval - ((t - 420) % wisdomInterval);
  }

  // Стаки: каждую минуту на :55 секунде
  const nextStack = 55 - (t % 60);
  const adjustedStack = nextStack <= 0 ? nextStack + 60 : nextStack;

  // День/Ночь: каждые 5 минут
  const dayNightCycle = 300;
  const dayNightSwitch = dayNightCycle - (t % dayNightCycle);

  // Фаза игры
  let gamePhase = 'Неизвестно';
  switch (gameState) {
    case 'DOTA_GAMERULES_STATE_HERO_SELECTION': gamePhase = 'Выбор героев'; break;
    case 'DOTA_GAMERULES_STATE_STRATEGY_TIME': gamePhase = 'Стратегия'; break;
    case 'DOTA_GAMERULES_STATE_PRE_GAME': gamePhase = 'Подготовка'; break;
    case 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS': gamePhase = 'Игра идёт'; break;
    case 'DOTA_GAMERULES_STATE_POST_GAME': gamePhase = 'Игра окончена'; break;
    default: gamePhase = gameState?.replace('DOTA_GAMERULES_STATE_', '') || 'Ожидание';
  }

  return {
    nextBountyRune: nextBounty,
    nextPowerRune: nextPower,
    nextWisdomRune: nextWisdom,
    nextStackTiming: adjustedStack,
    dayNightSwitch,
    roshanMinRespawn: 480,  // 8 минут
    roshanMaxRespawn: 660,  // 11 минут
    gamePhase,
  };
}
