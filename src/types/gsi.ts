// Dota 2 Game State Integration типы данных

export interface GSIPlayer {
  steamid: string;
  accountid: string;
  name: string;
  activity: string;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  kill_streak: number;
  commands_issued: number;
  kill_list: Record<string, number>;
  team_name: string;
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gold_from_hero_kills: number;
  gold_from_creep_kills: number;
  gold_from_income: number;
  gold_from_shared: number;
  gpm: number;
  xpm: number;
}

export interface GSIHero {
  xpos: number;
  ypos: number;
  id: number;
  name: string;
  level: number;
  xp: number;
  alive: boolean;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  health: number;
  max_health: number;
  health_percent: number;
  mana: number;
  max_mana: number;
  mana_percent: number;
  silenced: boolean;
  stunned: boolean;
  disarmed: boolean;
  magicimmune: boolean;
  hexed: boolean;
  muted: boolean;
  break: boolean;
  aghanims_scepter: boolean;
  aghanims_shard: boolean;
  smoked: boolean;
  has_debuff: boolean;
  talent_tree: number[];
  attributes_level: number;
}

export interface GSIAbility {
  name: string;
  level: number;
  can_cast: boolean;
  passive: boolean;
  ability_active: boolean;
  cooldown: number;
  ultimate: boolean;
}

export interface GSIItem {
  name: string;
  purchaser?: number;
  can_cast?: boolean;
  cooldown?: number;
  passive?: boolean;
  charges?: number;
}

export interface GSIItems {
  slot0?: GSIItem;
  slot1?: GSIItem;
  slot2?: GSIItem;
  slot3?: GSIItem;
  slot4?: GSIItem;
  slot5?: GSIItem;
  stash0?: GSIItem;
  stash1?: GSIItem;
  stash2?: GSIItem;
  stash3?: GSIItem;
  stash4?: GSIItem;
  stash5?: GSIItem;
  teleport0?: GSIItem;
  neutral0?: GSIItem;
}

export interface GSIMap {
  name: string;
  matchid: string;
  game_time: number;
  clock_time: number;
  daytime: boolean;
  nightstalker_night: boolean;
  radiant_score: number;
  dire_score: number;
  game_state: 'DOTA_GAMERULES_STATE_INIT' | 'DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD' |
    'DOTA_GAMERULES_STATE_HERO_SELECTION' | 'DOTA_GAMERULES_STATE_STRATEGY_TIME' |
    'DOTA_GAMERULES_STATE_PRE_GAME' | 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS' |
    'DOTA_GAMERULES_STATE_POST_GAME' | string;
  paused: boolean;
  win_team: string;
  customgamename: string;
  ward_purchase_cooldown: number;
  roshan_state: string;
  roshan_state_end_seconds: number;
}

export interface GSIBuilding {
  health: number;
  max_health: number;
}

export interface GSIBuildings {
  radiant: Record<string, GSIBuilding>;
  dire: Record<string, GSIBuilding>;
}

export interface GSIDraft {
  activeteam: number;
  pick: boolean;
  activeteam_time_remaining: number;
  radiant_bonus_time: number;
  dire_bonus_time: number;
  team0?: Record<string, { id: number; class: string; name: string }>;
  team1?: Record<string, { id: number; class: string; name: string }>;
}

export interface GSIWearable {
  wearable: number;
  style: number;
}

export interface GSITeamPlayer {
  steamid: string;
  accountid: string;
  name: string;
  kills: number;
  deaths: number;
  assists: number;
  last_hits: number;
  denies: number;
  gold: number;
  gold_reliable: number;
  gold_unreliable: number;
  gpm: number;
  xpm: number;
  net_worth: number;
  hero_id: number;
  hero_name: string;
  hero_level: number;
  hero_alive: boolean;
  respawn_seconds: number;
  buyback_cost: number;
  buyback_cooldown: number;
  health: number;
  max_health: number;
  health_percent: number;
  mana: number;
  max_mana: number;
  mana_percent: number;
  ultimate_state: string;
  ultimate_cooldown: number;
}

export interface GSIState {
  provider?: {
    name: string;
    appid: number;
    version: number;
    timestamp: number;
  };
  player?: GSIPlayer;
  hero?: GSIHero;
  abilities?: Record<string, GSIAbility>;
  items?: GSIItems;
  map?: GSIMap;
  buildings?: GSIBuildings;
  draft?: GSIDraft;
  wearables?: Record<string, GSIWearable>;
  // Spectator mode: all players
  allplayers?: Record<string, GSITeamPlayer>;
}

// Вычисляемые данные для UI
export interface DerivedTimings {
  nextBountyRune: number;       // секунд до следующей руны баунти
  nextPowerRune: number;        // секунд до следующей руны силы
  nextWisdomRune: number;       // секунд до следующей руны мудрости
  nextStackTiming: number;      // секунд до следующего стака
  dayNightSwitch: number;       // секунд до смены дня/ночи
  roshanMinRespawn: number;     // мин респаун рошана (секунд)
  roshanMaxRespawn: number;     // макс респаун рошана (секунд)
  gamePhase: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
