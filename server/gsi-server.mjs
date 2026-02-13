// Dota 2 GSI Server
// Принимает POST-запросы от Dota 2 и транслирует данные через WebSocket

import http from 'node:http';
import { WebSocketServer } from 'ws';

const GSI_PORT = 3001;
const WS_PORT = 3002;

// WebSocket сервер для клиентов (React frontend)
const wss = new WebSocketServer({ host: '0.0.0.0', port: WS_PORT });
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`[WS] Клиент подключён. Всего: ${clients.size}`);

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Клиент отключён. Всего: ${clients.size}`);
  });
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === 1) { // OPEN
      client.send(msg);
    }
  }
}

// HTTP сервер для приёма GSI POST-запросов от Dota 2
const server = http.createServer((req, res) => {
  // CORS headers для dev-режима
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const gameState = JSON.parse(body);
        broadcast(gameState);

        const map = gameState.map;
        if (map) {
          const time = formatTime(map.clock_time);
          const state = map.game_state?.replace('DOTA_GAMERULES_STATE_', '') || '?';
          console.log(`[GSI] ${time} | ${state} | Radiant ${map.radiant_score} - ${map.dire_score} Dire`);
        }
      } catch {
        console.error('[GSI] Ошибка парсинга JSON');
      }
      res.writeHead(200);
      res.end();
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

function formatTime(seconds) {
  if (seconds == null) return '--:--';
  const neg = seconds < 0;
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${neg ? '-' : ''}${m}:${s.toString().padStart(2, '0')}`;
}

server.listen(GSI_PORT, '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║           Dota 2 GSI Monitor Server              ║
╠══════════════════════════════════════════════════╣
║  GSI HTTP:    http://localhost:${GSI_PORT}              ║
║  WebSocket:   ws://localhost:${WS_PORT}                ║
╠══════════════════════════════════════════════════╣
║  Запустите React-фронтенд:  npm run dev          ║
║  Убедитесь, что GSI конфиг в папке Dota 2       ║
╚══════════════════════════════════════════════════╝
  `);
});
