import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Trophy, User, List, RotateCcw, Volume2, VolumeX, Shield, Zap, Target, 
  Flame, Bomb, Award, BarChart3, Clock, Heart, Skull, Play, Pause, 
  Gamepad2, CheckCircle2, ChevronRight, Crosshair, Sparkles
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================================================
// AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Assets)
// ============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCannon(isHeavy: boolean = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Punchy oscillator drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isHeavy ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isHeavy ? 180 : 220, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + (isHeavy ? 0.25 : 0.16));

      gain.gain.setValueAtTime(isHeavy ? 0.55 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isHeavy ? 0.25 : 0.16));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isHeavy ? 0.25 : 0.16));

      // Noise burst for mechanical gun blast
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(isHeavy ? 600 : 900, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }

  playRicochet() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.14);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  playExplosion(size: 'small' | 'large' | 'boss' = 'small') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const duration = size === 'boss' ? 0.7 : size === 'large' ? 0.45 : 0.28;

      // Low frequency sub-bass thud
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(size === 'boss' ? 95 : 120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + duration);
      oscGain.gain.setValueAtTime(size === 'boss' ? 0.65 : 0.45, now);
      oscGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // Filtered explosion rumble
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.45));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(size === 'boss' ? 400 : 700, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + duration);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(size === 'boss' ? 0.7 : 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch {}
  }

  playPowerup() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.2, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 fanfare
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.25, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.35);
      });
    } catch {}
  }

  playHitArmor() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TankGameProps {
  onBack: () => void;
}

export type WeaponType = 'cannon' | 'scatter' | 'ricochet' | 'missile';
export type EnemyClass = 'scout' | 'medium' | 'heavy' | 'boss';

export interface WeaponInfo {
  type: WeaponType;
  name: string;
  icon: string;
  damage: number;
  speed: number;
  cooldown: number;
  description: string;
}

export const WEAPON_TYPES: Record<WeaponType, WeaponInfo> = {
  cannon: {
    type: 'cannon',
    name: 'Armor Piercing AP',
    icon: '🎯',
    damage: 35,
    speed: 10,
    cooldown: 260,
    description: 'High-velocity armor-piercing kinetic rounds'
  },
  scatter: {
    type: 'scatter',
    name: 'Scatter Shotgun',
    icon: '💥',
    damage: 22,
    speed: 9,
    cooldown: 420,
    description: 'Fires 3 spread shells for devastating close-quarters combat'
  },
  ricochet: {
    type: 'ricochet',
    name: 'Plasma Ricochet',
    icon: '⚡',
    damage: 28,
    speed: 11,
    cooldown: 340,
    description: 'Shells bounce up to 3 times off obstacles and walls'
  },
  missile: {
    type: 'missile',
    name: 'Valkyrie Missile',
    icon: '🚀',
    damage: 75,
    speed: 7,
    cooldown: 650,
    description: 'High-explosive missile that tracks nearest enemy tanks'
  }
};

export interface Tank {
  id: string;
  x: number;
  y: number;
  rotation: number;
  turretRotation: number;
  health: number;
  maxHealth: number;
  isPlayer: boolean;
  enemyClass?: EnemyClass;
  lastShot: number;
  color: string;
  accentColor: string;
  speed: number;
  size: number;
  shieldEndTime?: number;
  recoil: number;
  // AI navigation & behavior
  targetX?: number;
  targetY?: number;
  aiState?: 'patrol' | 'chase' | 'attack' | 'flank' | 'boss_rage';
  stuckCounter?: number;
  lastX?: number;
  lastY?: number;
  specialCooldown?: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  isPlayer: boolean;
  damage: number;
  type: WeaponType;
  bouncesLeft: number;
  homingTargetId?: string;
  color: string;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rock' | 'wall' | 'bush' | 'bunker';
  destructible: boolean;
  health: number;
  maxHealth: number;
}

export interface Explosion {
  x: number;
  y: number;
  frame: number;
  maxFrames: number;
  size: number;
  color: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'smoke' | 'spark' | 'debris' | 'casing' | 'scorch';
}

export interface Landmine {
  id: number;
  x: number;
  y: number;
  isPlayer: boolean;
  armedTime: number;
}

export interface Airstrike {
  id: number;
  x: number;
  y: number;
  eta: number; // timestamp when bomb lands
  radius: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'health' | 'shield' | 'ammo_scatter' | 'ammo_ricochet' | 'ammo_missile' | 'airstrike';
}

export interface CombatStats {
  shotsFired: number;
  shotsHit: number;
  accuracy: number;
  scoutsKilled: number;
  mediumsKilled: number;
  heaviesKilled: number;
  bossesKilled: number;
  totalKills: number;
  damageDealt: number;
  damageTaken: number;
  powerupsCollected: number;
  minesDetonated: number;
  airstrikesUsed: number;
  wallsDestroyed: number;
  maxComboStreak: number;
  survivalTimeSeconds: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 480;
const TANK_BASE_SIZE = 38;
const PLAYER_MAX_HEALTH = 100;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

function normalizeAngle(angle: number): number {
  while (angle > 180) angle -= 360;
  while (angle < -180) angle += 360;
  return angle;
}

function lerpAngle(a: number, b: number, t: number): number {
  const diff = normalizeAngle(b - a);
  return a + diff * t;
}

function checkCircleRectCollision(
  cx: number, cy: number, radius: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const distX = cx - closestX;
  const distY = cy - closestY;
  return (distX * distX + distY * distY) < (radius * radius);
}

function hasLineOfSight(
  x1: number, y1: number, x2: number, y2: number,
  obstacles: Obstacle[]
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.ceil(dist / 16);

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const px = x1 + dx * t;
    const py = y1 + dy * t;
    for (const obs of obstacles) {
      if (obs.type !== 'bush' && px >= obs.x && px <= obs.x + obs.width && py >= obs.y && py <= obs.y + obs.height) {
        return false;
      }
    }
  }
  return true;
}

// ============================================================================
// LEVEL & MAP GENERATION
// ============================================================================

function generateObstacles(level: number): Obstacle[] {
  const obs: Obstacle[] = [];

  // Strategic perimeter bunkers & boundary defensive walls
  obs.push({ x: 70, y: 30, width: 140, height: 14, type: 'wall', destructible: true, health: 6, maxHealth: 6 });
  obs.push({ x: CANVAS_WIDTH - 210, y: 30, width: 140, height: 14, type: 'wall', destructible: true, health: 6, maxHealth: 6 });
  obs.push({ x: 70, y: CANVAS_HEIGHT - 44, width: 140, height: 14, type: 'wall', destructible: true, health: 6, maxHealth: 6 });
  obs.push({ x: CANVAS_WIDTH - 210, y: CANVAS_HEIGHT - 44, width: 140, height: 14, type: 'wall', destructible: true, health: 6, maxHealth: 6 });

  // Flank defensive barriers
  obs.push({ x: 50, y: 130, width: 14, height: 110, type: 'wall', destructible: false, health: 999, maxHealth: 999 });
  obs.push({ x: CANVAS_WIDTH - 64, y: 130, width: 14, height: 110, type: 'wall', destructible: false, health: 999, maxHealth: 999 });

  // Center Fortress / Cover Layout (changes every level)
  const isBossWave = level % 3 === 0;
  if (!isBossWave) {
    obs.push({ x: CANVAS_WIDTH / 2 - 60, y: CANVAS_HEIGHT / 2 - 40, width: 120, height: 14, type: 'wall', destructible: true, health: 8, maxHealth: 8 });
    obs.push({ x: CANVAS_WIDTH / 2 - 60, y: CANVAS_HEIGHT / 2 + 28, width: 120, height: 14, type: 'wall', destructible: true, health: 8, maxHealth: 8 });
  }

  // Hard steel rocks (ricochet anchors)
  obs.push({ x: 190, y: 170, width: 34, height: 34, type: 'rock', destructible: false, health: 999, maxHealth: 999 });
  obs.push({ x: CANVAS_WIDTH - 224, y: 170, width: 34, height: 34, type: 'rock', destructible: false, health: 999, maxHealth: 999 });

  // Tactical Bushes (Camouflage)
  obs.push({ x: 260, y: 80, width: 44, height: 44, type: 'bush', destructible: false, health: 999, maxHealth: 999 });
  obs.push({ x: CANVAS_WIDTH - 304, y: 80, width: 44, height: 44, type: 'bush', destructible: false, health: 999, maxHealth: 999 });
  obs.push({ x: CANVAS_WIDTH / 2 - 22, y: CANVAS_HEIGHT - 120, width: 44, height: 44, type: 'bush', destructible: false, health: 999, maxHealth: 999 });

  return obs;
}

function generateEnemies(level: number): Tank[] {
  const enemies: Tank[] = [];
  const isBossWave = level % 3 === 0;

  if (isBossWave) {
    // 👑 BOSS ENCOUNTER: Goliath Dreadnought + Escorts
    const bossHp = 220 + level * 50;
    enemies.push({
      id: `boss-${level}`,
      x: CANVAS_WIDTH / 2 - 32,
      y: 65,
      rotation: 90,
      turretRotation: 90,
      health: bossHp,
      maxHealth: bossHp,
      isPlayer: false,
      enemyClass: 'boss',
      lastShot: 0,
      color: '#991b1b',
      accentColor: '#fbbf24',
      speed: 1.35,
      size: 54,
      recoil: 0,
      aiState: 'attack',
      specialCooldown: Date.now() + 3000
    });

    // 2 Scout Escorts
    for (let i = 0; i < 2; i++) {
      enemies.push({
        id: `escort-${i}`,
        x: i === 0 ? 120 : CANVAS_WIDTH - 160,
        y: 80,
        rotation: 90,
        turretRotation: 90,
        health: 30,
        maxHealth: 30,
        isPlayer: false,
        enemyClass: 'scout',
        lastShot: 0,
        color: '#ca8a04',
        accentColor: '#fef08a',
        speed: 3.1,
        size: 32,
        recoil: 0,
        aiState: 'patrol'
      });
    }
    return enemies;
  }

  // Standard Squad Wave: Mix of Scouts, Mediums, and Heavies
  const totalCount = Math.min(2 + level, 7);
  for (let i = 0; i < totalCount; i++) {
    let enemyClass: EnemyClass = 'scout';
    if (level >= 2 && i % 2 === 1) enemyClass = 'medium';
    if (level >= 4 && i === 0) enemyClass = 'heavy';

    const hp = enemyClass === 'heavy' ? 80 : enemyClass === 'medium' ? 50 : 28;
    const speed = enemyClass === 'scout' ? 2.9 : enemyClass === 'medium' ? 2.1 : 1.5;
    const color = enemyClass === 'heavy' ? '#b91c1c' : enemyClass === 'medium' ? '#4d7c0f' : '#d97706';
    const accent = enemyClass === 'heavy' ? '#f87171' : enemyClass === 'medium' ? '#84cc16' : '#fde047';

    enemies.push({
      id: `enemy-${level}-${i}`,
      x: 100 + (i * ((CANVAS_WIDTH - 200) / totalCount)),
      y: 45 + (i % 2) * 55,
      rotation: 90 + (Math.random() - 0.5) * 40,
      turretRotation: 90,
      health: hp,
      maxHealth: hp,
      isPlayer: false,
      enemyClass,
      lastShot: 0,
      color,
      accentColor: accent,
      speed,
      size: enemyClass === 'heavy' ? 44 : enemyClass === 'scout' ? 32 : 38,
      recoil: 0,
      aiState: 'patrol'
    });
  }

  return enemies;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TankGame({ onBack }: TankGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Score & Level Progression
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(1);
  const [comboTimer, setComboTimer] = useState(0);

  // Tactical Weapons & Arsenal
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('cannon');
  const [ammo, setAmmo] = useState({
    cannon: Infinity,
    scatter: 18,
    ricochet: 15,
    missile: 6
  });

  // Tactical Super-Abilities
  const [airstrikeCharges, setAirstrikeCharges] = useState(2);
  const [landmineCharges, setLandmineCharges] = useState(3);
  const [airstrikeCooldown, setAirstrikeCooldown] = useState(0);

  // Player Tank State
  const [playerTank, setPlayerTank] = useState<Tank>({
    id: 'player',
    x: CANVAS_WIDTH / 2 - TANK_BASE_SIZE / 2,
    y: CANVAS_HEIGHT - 85,
    rotation: -90,
    turretRotation: -90,
    health: PLAYER_MAX_HEALTH,
    maxHealth: PLAYER_MAX_HEALTH,
    isPlayer: true,
    lastShot: 0,
    color: '#2563eb',
    accentColor: '#60a5fa',
    speed: 3.5,
    size: TANK_BASE_SIZE,
    recoil: 0,
    shieldEndTime: 0
  });

  // World State
  const [enemies, setEnemies] = useState<Tank[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [powerups, setPowerups] = useState<PowerUp[]>([]);
  const [landmines, setLandmines] = useState<Landmine[]>([]);
  const [airstrikes, setAirstrikes] = useState<Airstrike[]>([]);

  // Analytics & Performance debrief
  const [stats, setStats] = useState<CombatStats>({
    shotsFired: 0,
    shotsHit: 0,
    accuracy: 0,
    scoutsKilled: 0,
    mediumsKilled: 0,
    heaviesKilled: 0,
    bossesKilled: 0,
    totalKills: 0,
    damageDealt: 0,
    damageTaken: 0,
    powerupsCollected: 0,
    minesDetonated: 0,
    airstrikesUsed: 0,
    wallsDestroyed: 0,
    maxComboStreak: 1,
    survivalTimeSeconds: 0
  });

  // Leaderboard & Result Submission
  const [playerName, setPlayerName] = useState("");
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [screenShake, setScreenShake] = useState(0);
  const [gameStartTime, setGameStartTime] = useState<number>(Date.now());
  const [gameTime, setGameTime] = useState<number>(0);

  // Refs for smooth 60fps RAF loop
  const keysPressed = useRef<Set<string>>(new Set());
  const mousePos = useRef<{ x: number; y: number }>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 });
  const mouseDown = useRef<boolean>(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const playerRef = useRef(playerTank);
  const enemiesRef = useRef(enemies);
  const bulletsRef = useRef(bullets);
  const obstaclesRef = useRef(obstacles);
  const landminesRef = useRef(landmines);
  const airstrikesRef = useRef(airstrikes);
  const statsRef = useRef(stats);
  const currentWeaponRef = useRef(currentWeapon);
  const ammoRef = useRef(ammo);

  useEffect(() => { sound.enabled = soundEnabled; }, [soundEnabled]);
  useEffect(() => { playerRef.current = playerTank; }, [playerTank]);
  useEffect(() => { enemiesRef.current = enemies; }, [enemies]);
  useEffect(() => { bulletsRef.current = bullets; }, [bullets]);
  useEffect(() => { obstaclesRef.current = obstacles; }, [obstacles]);
  useEffect(() => { landminesRef.current = landmines; }, [landmines]);
  useEffect(() => { airstrikesRef.current = airstrikes; }, [airstrikes]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { currentWeaponRef.current = currentWeapon; }, [currentWeapon]);
  useEffect(() => { ammoRef.current = ammo; }, [ammo]);

  const queryClient = useQueryClient();

  // Top Scores with graceful localStorage fallback
  const { data: topScores = [] } = useQuery({
    queryKey: ['/api/games/tank/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('tank_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const res = await fetch('/api/games/tank/scores?limit=10');
        if (res.ok) {
          const apiScores = (await res.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "General Patton 🎖️", score: 4800, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Iron Commander 🛡️", score: 3600, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Tabriz Tanker 💥", score: 2900, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Tiger Ace 🐅", score: 2100, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Baku Recon ⚡", score: 1500, createdAt: new Date().toISOString() }
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('tank_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('tank_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const res = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'tank', timeInSeconds: gameTime }),
      });
      if (!res.ok) throw new Error('Score save fallback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/tank/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Spawn visual particles
  const spawnExplosion = useCallback((x: number, y: number, size: number = 28, color: string = '#f97316') => {
    setExplosions(prev => [...prev, { x, y, frame: 0, maxFrames: 22, size, color }]);
    setScreenShake(Math.min(size * 0.35, 12));

    // Spawn sparks and debris
    const newParticles: Particle[] = [];
    for (let i = 0; i < 14; i++) {
      newParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: Math.random() > 0.5 ? '#fbbf24' : '#ef4444',
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 15,
        type: 'spark'
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  // Deploy Landmine (`E`)
  const placeLandmine = useCallback(() => {
    if (landmineCharges <= 0 || !isPlaying || isGameOver) return;
    const p = playerRef.current;
    const rad = (p.rotation + 180) * Math.PI / 180;
    const mineX = p.x + p.size / 2 + Math.cos(rad) * (p.size / 2 + 10);
    const mineY = p.y + p.size / 2 + Math.sin(rad) * (p.size / 2 + 10);

    setLandmines(prev => [...prev, { id: Date.now(), x: mineX, y: mineY, isPlayer: true, armedTime: Date.now() + 600 }]);
    setLandmineCharges(c => c - 1);
    sound.playHitArmor();
  }, [landmineCharges, isPlaying, isGameOver]);

  // Call Orbital Artillery (`Q`)
  const triggerAirstrike = useCallback(() => {
    if (airstrikeCharges <= 0 || !isPlaying || isGameOver || Date.now() < airstrikeCooldown) return;
    const targetX = mousePos.current.x;
    const targetY = mousePos.current.y;

    setAirstrikes(prev => [
      ...prev,
      { id: Date.now(), x: targetX, y: targetY, eta: Date.now() + 1100, radius: 95 },
      { id: Date.now() + 1, x: targetX + (Math.random() - 0.5) * 70, y: targetY + (Math.random() - 0.5) * 70, eta: Date.now() + 1350, radius: 85 }
    ]);

    setAirstrikeCharges(c => c - 1);
    setAirstrikeCooldown(Date.now() + 12000);
    setStats(s => ({ ...s, airstrikesUsed: s.airstrikesUsed + 1 }));
    sound.playRicochet();
  }, [airstrikeCharges, isPlaying, isGameOver, airstrikeCooldown]);

  // Main 60FPS Game Loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!isPlaying || isGameOver || isPaused) return;

    const delta = timestamp - lastTimeRef.current;
    if (delta < 15) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = timestamp;

    const now = Date.now();
    const player = playerRef.current;
    const currentEnemies = enemiesRef.current;
    const currentObstacles = obstaclesRef.current;

    // Turret rotation tracking crosshair
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    const angleToMouse = Math.atan2(
      mousePos.current.y - playerCenterY,
      mousePos.current.x - playerCenterX
    ) * 180 / Math.PI;

    // Movement vector from WASD / Arrow Keys
    let moveX = 0;
    let moveY = 0;
    if (keysPressed.current.has('KeyW') || keysPressed.current.has('ArrowUp')) moveY -= 1;
    if (keysPressed.current.has('KeyS') || keysPressed.current.has('ArrowDown')) moveY += 1;
    if (keysPressed.current.has('KeyA') || keysPressed.current.has('ArrowLeft')) moveX -= 1;
    if (keysPressed.current.has('KeyD') || keysPressed.current.has('ArrowRight')) moveX += 1;

    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      moveX /= len;
      moveY /= len;
    }

    let newPlayerX = player.x + moveX * player.speed;
    let newPlayerY = player.y + moveY * player.speed;
    let newBodyRotation = player.rotation;

    if (moveX !== 0 || moveY !== 0) {
      newBodyRotation = Math.atan2(moveY, moveX) * 180 / Math.PI;
    }

    // Boundary & obstacle collision check
    const playerRadius = player.size / 2 - 2;
    newPlayerX = clamp(newPlayerX, 0, CANVAS_WIDTH - player.size);
    newPlayerY = clamp(newPlayerY, 0, CANVAS_HEIGHT - player.size);

    let blocked = false;
    for (const obs of currentObstacles) {
      if (obs.type !== 'bush' && checkCircleRectCollision(newPlayerX + player.size / 2, newPlayerY + player.size / 2, playerRadius, obs.x, obs.y, obs.width, obs.height)) {
        blocked = true;
        break;
      }
    }
    for (const enemy of currentEnemies) {
      if (distance(newPlayerX + player.size / 2, newPlayerY + player.size / 2, enemy.x + enemy.size / 2, enemy.y + enemy.size / 2) < playerRadius + enemy.size / 2 - 2) {
        blocked = true;
        break;
      }
    }

    if (blocked) {
      newPlayerX = player.x;
      newPlayerY = player.y;
    }

    // Player Shooting Logic
    const weapon = WEAPON_TYPES[currentWeaponRef.current];
    const hasAmmo = currentWeaponRef.current === 'cannon' || (ammoRef.current[currentWeaponRef.current] || 0) > 0;

    if ((mouseDown.current || keysPressed.current.has('Space')) && now - player.lastShot > weapon.cooldown && hasAmmo) {
      const rad = angleToMouse * Math.PI / 180;
      const muzzleX = playerCenterX + Math.cos(rad) * (player.size / 2 + 10);
      const muzzleY = playerCenterY + Math.sin(rad) * (player.size / 2 + 10);

      // Decrement special ammo
      if (currentWeaponRef.current !== 'cannon') {
        setAmmo(prev => ({ ...prev, [currentWeaponRef.current]: prev[currentWeaponRef.current] - 1 }));
      }

      setStats(s => ({ ...s, shotsFired: s.shotsFired + (currentWeaponRef.current === 'scatter' ? 3 : 1) }));

      if (currentWeaponRef.current === 'scatter') {
        // 3 spread pellets
        const spreads = [-0.18, 0, 0.18];
        const newBullets: Bullet[] = spreads.map((spreadAngle, i) => {
          const actualAngle = rad + spreadAngle;
          return {
            id: Date.now() + i,
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(actualAngle) * weapon.speed,
            vy: Math.sin(actualAngle) * weapon.speed,
            rotation: (actualAngle * 180) / Math.PI,
            isPlayer: true,
            damage: weapon.damage,
            type: 'scatter',
            bouncesLeft: 0,
            color: '#f59e0b'
          };
        });
        setBullets(b => [...b, ...newBullets]);
        sound.playCannon(false);
      } else if (currentWeaponRef.current === 'ricochet') {
        // Plasma bouncing round
        setBullets(b => [
          ...b,
          {
            id: Date.now(),
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(rad) * weapon.speed,
            vy: Math.sin(rad) * weapon.speed,
            rotation: angleToMouse,
            isPlayer: true,
            damage: weapon.damage,
            type: 'ricochet',
            bouncesLeft: 3,
            color: '#38bdf8'
          }
        ]);
        sound.playRicochet();
      } else if (currentWeaponRef.current === 'missile') {
        // Homing missile
        const nearestEnemy = currentEnemies[0];
        setBullets(b => [
          ...b,
          {
            id: Date.now(),
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(rad) * weapon.speed,
            vy: Math.sin(rad) * weapon.speed,
            rotation: angleToMouse,
            isPlayer: true,
            damage: weapon.damage,
            type: 'missile',
            bouncesLeft: 0,
            homingTargetId: nearestEnemy?.id,
            color: '#ef4444'
          }
        ]);
        sound.playCannon(true);
      } else {
        // Standard AP Cannon
        setBullets(b => [
          ...b,
          {
            id: Date.now(),
            x: muzzleX,
            y: muzzleY,
            vx: Math.cos(rad) * weapon.speed,
            vy: Math.sin(rad) * weapon.speed,
            rotation: angleToMouse,
            isPlayer: true,
            damage: weapon.damage,
            type: 'cannon',
            bouncesLeft: 0,
            color: '#fbbf24'
          }
        ]);
        sound.playCannon(false);
      }

      setPlayerTank(prev => ({
        ...prev,
        lastShot: now,
        recoil: 6
      }));
    }

    // Decay player recoil
    setPlayerTank(prev => ({
      ...prev,
      x: newPlayerX,
      y: newPlayerY,
      rotation: lerpAngle(prev.rotation, newBodyRotation, 0.18),
      turretRotation: angleToMouse,
      recoil: Math.max(0, prev.recoil - 0.4)
    }));

    // Update Game Timer
    setGameTime(Math.floor((now - gameStartTime) / 1000));

    // Update Artillery Airstrikes
    setAirstrikes(prev => {
      const active: Airstrike[] = [];
      for (const strike of prev) {
        if (now >= strike.eta) {
          // Detonate artillery!
          spawnExplosion(strike.x, strike.y, strike.radius, '#ef4444');
          sound.playExplosion('large');

          // Damage enemies in strike radius
          setEnemies(en => en.map(e => {
            const dist = distance(strike.x, strike.y, e.x + e.size / 2, e.y + e.size / 2);
            if (dist < strike.radius) {
              const damage = Math.round(130 * (1 - dist / strike.radius));
              const newHp = e.health - damage;
              setStats(s => ({ ...s, damageDealt: s.damageDealt + damage }));
              if (newHp <= 0) return null as any;
              return { ...e, health: newHp };
            }
            return e;
          }).filter(Boolean));

          // Damage obstacles
          setObstacles(obs => obs.map(o => {
            if (o.destructible && distance(strike.x, strike.y, o.x + o.width / 2, o.y + o.height / 2) < strike.radius) {
              return null as any;
            }
            return o;
          }).filter(Boolean));
        } else {
          active.push(strike);
        }
      }
      return active;
    });

    // Update AI Enemies & Enemy Bullets
    const newEnemyBullets: Bullet[] = [];
    const updatedEnemies: Tank[] = [];

    for (const e of currentEnemies) {
      const enemyCopy = { ...e };
      const enemyCenterX = enemyCopy.x + enemyCopy.size / 2;
      const enemyCenterY = enemyCopy.y + enemyCopy.size / 2;

      const distToPlayer = distance(enemyCenterX, enemyCenterY, playerCenterX, playerCenterY);
      const angleToPlayer = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX) * 180 / Math.PI;
      const canSeePlayer = hasLineOfSight(enemyCenterX, enemyCenterY, playerCenterX, playerCenterY, currentObstacles);

      // AI Turret Tracking
      if (canSeePlayer) {
        enemyCopy.turretRotation = lerpAngle(enemyCopy.turretRotation, angleToPlayer, 0.16);
      }

      // Tactical Movement
      let moveAngle = enemyCopy.rotation;
      let isMoving = true;

      if (enemyCopy.enemyClass === 'boss') {
        // Boss moves menacingly towards center and strafes
        const bossTargetY = 110 + Math.sin(now / 800) * 45;
        const bossTargetX = CANVAS_WIDTH / 2 + Math.cos(now / 1200) * 160;
        moveAngle = Math.atan2(bossTargetY - enemyCenterY, bossTargetX - enemyCenterX) * 180 / Math.PI;
      } else if (canSeePlayer && distToPlayer < 140) {
        // Back away if player gets too close
        moveAngle = angleToPlayer + 180;
      } else if (canSeePlayer && distToPlayer < 280) {
        // Flank / Strafe around player
        moveAngle = angleToPlayer + 80 + Math.sin(now / 500) * 30;
      } else {
        // Seek player position
        moveAngle = angleToPlayer;
      }

      enemyCopy.rotation = lerpAngle(enemyCopy.rotation, moveAngle, 0.08);

      const rad = enemyCopy.rotation * Math.PI / 180;
      let nextX = enemyCopy.x + Math.cos(rad) * enemyCopy.speed;
      let nextY = enemyCopy.y + Math.sin(rad) * enemyCopy.speed;

      nextX = clamp(nextX, 10, CANVAS_WIDTH - enemyCopy.size - 10);
      nextY = clamp(nextY, 10, CANVAS_HEIGHT - enemyCopy.size - 10);

      // Collision with obstacles
      let enemyBlocked = false;
      for (const obs of currentObstacles) {
        if (obs.type !== 'bush' && checkCircleRectCollision(nextX + enemyCopy.size / 2, nextY + enemyCopy.size / 2, enemyCopy.size / 2, obs.x, obs.y, obs.width, obs.height)) {
          enemyBlocked = true;
          break;
        }
      }
      if (!enemyBlocked) {
        enemyCopy.x = nextX;
        enemyCopy.y = nextY;
      }

      // Enemy Shooting logic
      const shootInterval = enemyCopy.enemyClass === 'boss' ? 750 : enemyCopy.enemyClass === 'heavy' ? 1200 : enemyCopy.enemyClass === 'scout' ? 1400 : 1600;
      if (canSeePlayer && now - enemyCopy.lastShot > shootInterval) {
        const turretDiff = Math.abs(normalizeAngle(enemyCopy.turretRotation - angleToPlayer));
        if (turretDiff < 25) {
          const enemyMuzzleRad = enemyCopy.turretRotation * Math.PI / 180;
          const enemyMuzzleX = enemyCenterX + Math.cos(enemyMuzzleRad) * (enemyCopy.size / 2 + 8);
          const enemyMuzzleY = enemyCenterY + Math.sin(enemyMuzzleRad) * (enemyCopy.size / 2 + 8);

          if (enemyCopy.enemyClass === 'boss') {
            // Triple boss volley
            [-0.2, 0, 0.2].forEach((spread, idx) => {
              newEnemyBullets.push({
                id: Date.now() + idx + Math.random(),
                x: enemyMuzzleX,
                y: enemyMuzzleY,
                vx: Math.cos(enemyMuzzleRad + spread) * 7.5,
                vy: Math.sin(enemyMuzzleRad + spread) * 7.5,
                rotation: enemyCopy.turretRotation + (spread * 180) / Math.PI,
                isPlayer: false,
                damage: 22,
                type: 'cannon',
                bouncesLeft: 0,
                color: '#ef4444'
              });
            });
            sound.playCannon(true);
          } else {
            newEnemyBullets.push({
              id: Date.now() + Math.random(),
              x: enemyMuzzleX,
              y: enemyMuzzleY,
              vx: Math.cos(enemyMuzzleRad) * 8.5,
              vy: Math.sin(enemyMuzzleRad) * 8.5,
              rotation: enemyCopy.turretRotation,
              isPlayer: false,
              damage: enemyCopy.enemyClass === 'heavy' ? 24 : 14,
              type: 'cannon',
              bouncesLeft: 0,
              color: '#ef4444'
            });
            sound.playCannon(false);
          }
          enemyCopy.lastShot = now;
        }
      }

      updatedEnemies.push(enemyCopy);
    }

    setEnemies(updatedEnemies);
    if (newEnemyBullets.length > 0) {
      setBullets(prev => [...prev, ...newEnemyBullets]);
    }

    // Update Landmines (Check if enemy or player steps on mine)
    setLandmines(prev => {
      const activeMines: Landmine[] = [];
      for (const mine of prev) {
        let detonated = false;
        if (now > mine.armedTime) {
          for (const enemy of updatedEnemies) {
            if (distance(mine.x, mine.y, enemy.x + enemy.size / 2, enemy.y + enemy.size / 2) < enemy.size / 2 + 14) {
              detonated = true;
              spawnExplosion(mine.x, mine.y, 45, '#ef4444');
              sound.playExplosion('large');
              setStats(s => ({ ...s, minesDetonated: s.minesDetonated + 1 }));

              // Damage enemy severely
              setEnemies(enList => enList.map(e => {
                if (e.id === enemy.id) {
                  const newHp = e.health - 95;
                  if (newHp <= 0) return null as any;
                  return { ...e, health: newHp };
                }
                return e;
              }).filter(Boolean));
              break;
            }
          }
        }
        if (!detonated) activeMines.push(mine);
      }
      return activeMines;
    });

    // Update Bullets & Collisions
    setBullets(prevBullets => {
      const activeBullets: Bullet[] = [];

      for (const bullet of prevBullets) {
        let vx = bullet.vx;
        let vy = bullet.vy;
        let newX = bullet.x + vx;
        let newY = bullet.y + vy;

        // Guided missile homing behavior
        if (bullet.type === 'missile' && bullet.homingTargetId) {
          const target = updatedEnemies.find(e => e.id === bullet.homingTargetId) || updatedEnemies[0];
          if (target) {
            const tx = target.x + target.size / 2;
            const ty = target.y + target.size / 2;
            const targetAngle = Math.atan2(ty - bullet.y, tx - bullet.x);
            const currentAngle = Math.atan2(vy, vx);
            const turnAngle = lerpAngle(currentAngle * 180 / Math.PI, targetAngle * 180 / Math.PI, 0.12) * Math.PI / 180;
            const speed = 7.5;
            vx = Math.cos(turnAngle) * speed;
            vy = Math.sin(turnAngle) * speed;
            newX = bullet.x + vx;
            newY = bullet.y + vy;
          }
        }

        // Screen boundary collision
        if (newX < 0 || newX > CANVAS_WIDTH || newY < 0 || newY > CANVAS_HEIGHT) {
          if (bullet.type === 'ricochet' && bullet.bouncesLeft > 0) {
            if (newX < 0 || newX > CANVAS_WIDTH) vx = -vx;
            if (newY < 0 || newY > CANVAS_HEIGHT) vy = -vy;
            sound.playRicochet();
            activeBullets.push({
              ...bullet,
              x: clamp(newX, 5, CANVAS_WIDTH - 5),
              y: clamp(newY, 5, CANVAS_HEIGHT - 5),
              vx, vy,
              rotation: Math.atan2(vy, vx) * 180 / Math.PI,
              bouncesLeft: bullet.bouncesLeft - 1
            });
            continue;
          }
          continue;
        }

        // Obstacle Collision
        let hitObstacle = false;
        let hitIdx = -1;

        for (let i = 0; i < currentObstacles.length; i++) {
          const obs = currentObstacles[i];
          if (obs.type !== 'bush' && checkCircleRectCollision(newX, newY, 4, obs.x, obs.y, obs.width, obs.height)) {
            hitObstacle = true;
            hitIdx = i;
            break;
          }
        }

        if (hitObstacle) {
          if (bullet.type === 'ricochet' && bullet.bouncesLeft > 0) {
            vx = -vx;
            vy = -vy;
            sound.playRicochet();
            activeBullets.push({
              ...bullet,
              x: newX + vx,
              y: newY + vy,
              vx, vy,
              rotation: Math.atan2(vy, vx) * 180 / Math.PI,
              bouncesLeft: bullet.bouncesLeft - 1
            });
            continue;
          }

          spawnExplosion(newX, newY, 14, '#fbbf24');
          if (hitIdx >= 0) {
            setObstacles(obsList => obsList.map((o, idx) => {
              if (idx === hitIdx && o.destructible) {
                const nextHp = o.health - 1;
                if (nextHp <= 0) {
                  setStats(s => ({ ...s, wallsDestroyed: s.wallsDestroyed + 1 }));
                  sound.playExplosion('small');
                  return null as any;
                }
                return { ...o, health: nextHp };
              }
              return o;
            }).filter(Boolean));
          }
          continue;
        }

        // Tank Hits Check
        if (bullet.isPlayer) {
          let hitEnemy = false;
          setEnemies(enList => enList.map(enemy => {
            const ecx = enemy.x + enemy.size / 2;
            const ecy = enemy.y + enemy.size / 2;
            if (distance(newX, newY, ecx, ecy) < enemy.size / 2 + 5) {
              hitEnemy = true;
              spawnExplosion(ecx, ecy, enemy.enemyClass === 'boss' ? 36 : 26, '#f97316');
              sound.playHitArmor();

              const nextHealth = enemy.health - bullet.damage;
              setStats(s => ({
                ...s,
                shotsHit: s.shotsHit + 1,
                damageDealt: s.damageDealt + bullet.damage
              }));

              if (nextHealth <= 0) {
                // Enemy Killed!
                const killPoints = enemy.enemyClass === 'boss' ? 1200 : enemy.enemyClass === 'heavy' ? 300 : enemy.enemyClass === 'medium' ? 180 : 100;
                setScore(sc => sc + killPoints * combo);
                setCombo(cb => cb + 1);
                setComboTimer(now + 4500);

                sound.playExplosion(enemy.enemyClass === 'boss' ? 'boss' : 'large');

                // Track stats by enemy class
                setStats(s => {
                  const updated = {
                    ...s,
                    totalKills: s.totalKills + 1,
                    scoutsKilled: enemy.enemyClass === 'scout' ? s.scoutsKilled + 1 : s.scoutsKilled,
                    mediumsKilled: enemy.enemyClass === 'medium' ? s.mediumsKilled + 1 : s.mediumsKilled,
                    heaviesKilled: enemy.enemyClass === 'heavy' ? s.heaviesKilled + 1 : s.heaviesKilled,
                    bossesKilled: enemy.enemyClass === 'boss' ? s.bossesKilled + 1 : s.bossesKilled,
                    maxComboStreak: Math.max(s.maxComboStreak, combo)
                  };
                  return updated;
                });

                // Drop power-up on defeat
                if (Math.random() < 0.65 || enemy.enemyClass === 'boss') {
                  const dropTypes: PowerUp['type'][] = ['health', 'shield', 'ammo_scatter', 'ammo_ricochet', 'ammo_missile'];
                  const drop = dropTypes[Math.floor(Math.random() * dropTypes.length)];
                  setPowerups(pups => [...pups, { id: Date.now() + Math.random(), x: ecx, y: ecy, type: drop }]);
                }

                return null as any;
              }
              return { ...enemy, health: nextHealth };
            }
            return enemy;
          }).filter(Boolean));

          if (hitEnemy) continue;
        } else {
          // Enemy bullet hitting player
          if (distance(newX, newY, playerCenterX, playerCenterY) < player.size / 2 + 4) {
            spawnExplosion(playerCenterX, playerCenterY, 22, '#ef4444');
            const hasShield = (player.shieldEndTime || 0) > now;

            if (hasShield) {
              sound.playHitArmor();
            } else {
              sound.playExplosion('small');
              setStats(s => ({ ...s, damageTaken: s.damageTaken + bullet.damage }));

              setPlayerTank(p => {
                const nextHp = p.health - bullet.damage;
                if (nextHp <= 0) {
                  // Game Over
                  setIsGameOver(true);
                  setIsPlaying(false);
                  sound.playExplosion('boss');
                }
                return { ...p, health: Math.max(0, nextHp) };
              });
            }
            continue;
          }
        }

        activeBullets.push({ ...bullet, x: newX, y: newY, vx, vy });
      }

      return activeBullets;
    });

    // Update Particles
    setParticles(prev => prev.map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      alpha: 1 - p.life / p.maxLife,
      life: p.life + 1
    })).filter(p => p.life < p.maxLife));

    // Update Explosions
    setExplosions(prev => prev.map(e => ({ ...e, frame: e.frame + 1 })).filter(e => e.frame < e.maxFrames));

    // Collect Power-ups
    setPowerups(prev => prev.filter(pup => {
      if (distance(playerCenterX, playerCenterY, pup.x, pup.y) < player.size / 2 + 16) {
        sound.playPowerup();
        setStats(s => ({ ...s, powerupsCollected: s.powerupsCollected + 1 }));

        if (pup.type === 'health') {
          setPlayerTank(p => ({ ...p, health: Math.min(p.health + 35, PLAYER_MAX_HEALTH) }));
        } else if (pup.type === 'shield') {
          setPlayerTank(p => ({ ...p, shieldEndTime: now + 7500 }));
        } else if (pup.type === 'ammo_scatter') {
          setAmmo(a => ({ ...a, scatter: a.scatter + 15 }));
        } else if (pup.type === 'ammo_ricochet') {
          setAmmo(a => ({ ...a, ricochet: a.ricochet + 12 }));
        } else if (pup.type === 'ammo_missile') {
          setAmmo(a => ({ ...a, missile: a.missile + 5 }));
        }
        return false;
      }
      return true;
    }));

    // Reset Combo after timer expires
    if (now > comboTimer && combo > 1) {
      setCombo(1);
    }

    // Check Wave Completion
    if (updatedEnemies.length === 0) {
      sound.playVictory();
      setLevel(lvl => {
        const nextLvl = lvl + 1;
        setEnemies(generateEnemies(nextLvl));
        setObstacles(generateObstacles(nextLvl));
        setBullets([]);
        setScore(sc => sc + 600 * nextLvl);
        setLandmineCharges(c => Math.min(c + 2, 4));
        setAirstrikeCharges(c => Math.min(c + 1, 3));
        return nextLvl;
      });
    }

    // Render Canvas Scene
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGameScene(
          ctx,
          playerRef.current,
          enemiesRef.current,
          bulletsRef.current,
          obstaclesRef.current,
          powerups,
          explosions,
          particles,
          landminesRef.current,
          airstrikesRef.current,
          mousePos.current,
          screenShake,
          level
        );
      }
    }

    if (screenShake > 0) setScreenShake(s => Math.max(0, s - 0.7));

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, isPaused, combo, comboTimer, gameStartTime, spawnExplosion, screenShake, level]);

  // Canvas Drawing Routine
  const drawGameScene = (
    ctx: CanvasRenderingContext2D,
    player: Tank,
    enemies: Tank[],
    bullets: Bullet[],
    obstacles: Obstacle[],
    powerups: PowerUp[],
    explosions: Explosion[],
    particles: Particle[],
    mines: Landmine[],
    strikes: Airstrike[],
    crosshair: { x: number; y: number },
    shake: number,
    level: number
  ) => {
    ctx.save();

    // Apply Screen Shake
    if (shake > 0) {
      const shakeX = (Math.random() - 0.5) * shake;
      const shakeY = (Math.random() - 0.5) * shake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Battlefield Terrain
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle tactical grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let x = 0; x < CANVAS_WIDTH; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 35) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // 2. Landmines
    for (const mine of mines) {
      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(mine.x, mine.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Airstrike Target Reticles
    for (const strike of strikes) {
      ctx.save();
      const pulse = Math.sin(Date.now() / 80) * 4;
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(strike.x, strike.y, strike.radius + pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fill();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // 4. Obstacles
    for (const obs of obstacles) {
      ctx.save();
      if (obs.type === 'rock') {
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (obs.type === 'wall') {
        const healthPercent = obs.health / obs.maxHealth;
        ctx.fillStyle = obs.destructible ? `rgb(${Math.round(180 * healthPercent + 40)}, ${Math.round(90 * healthPercent + 20)}, 20)` : '#334155';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      } else if (obs.type === 'bush') {
        ctx.fillStyle = 'rgba(34, 197, 94, 0.65)';
        ctx.beginPath();
        ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, obs.width / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Power-up Crates
    for (const pup of powerups) {
      ctx.save();
      const glow = pup.type === 'health' ? '#10b981' : pup.type === 'shield' ? '#38bdf8' : pup.type === 'ammo_missile' ? '#ef4444' : '#f59e0b';
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(pup.x - 12, pup.y - 12, 24, 24);
      ctx.strokeStyle = glow;
      ctx.lineWidth = 2;
      ctx.strokeRect(pup.x - 12, pup.y - 12, 24, 24);
      ctx.fillStyle = glow;
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const symbol = pup.type === 'health' ? '✚' : pup.type === 'shield' ? '🛡️' : pup.type === 'ammo_missile' ? '🚀' : '⚡';
      ctx.fillText(symbol, pup.x, pup.y);
      ctx.restore();
    }

    // Helper: Draw High-Fidelity Tank
    const renderTank = (t: Tank) => {
      ctx.save();
      const cx = t.x + t.size / 2;
      const cy = t.y + t.size / 2;

      // Energy Shield Bubble
      const isShielded = (t.shieldEndTime || 0) > Date.now();
      if (isShielded) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(cx, cy, t.size * 0.85, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();
        ctx.restore();
      }

      // Hull and Tracks
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((t.rotation * Math.PI) / 180);

      // Left and Right Tracks
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-t.size / 2, -t.size / 2 + 1, t.size, 7);
      ctx.fillRect(-t.size / 2, t.size / 2 - 8, t.size, 7);

      // Armor Hull
      ctx.fillStyle = t.color;
      ctx.fillRect(-t.size / 2 + 4, -t.size / 2 + 6, t.size - 8, t.size - 12);

      // Accent Hull Plate
      ctx.fillStyle = t.accentColor;
      ctx.fillRect(-t.size / 4, -t.size / 4, t.size / 2, t.size / 2);
      ctx.restore();

      // Rotating Turret with Recoil
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((t.turretRotation * Math.PI) / 180);

      // Cannon Barrel
      const barrelLen = t.enemyClass === 'boss' ? t.size * 0.9 : t.size * 0.7;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-t.recoil, -3, barrelLen, 6);

      // Muzzle Brake
      ctx.fillStyle = t.accentColor;
      ctx.fillRect(barrelLen - t.recoil - 2, -4, 4, 8);

      // Turret Dome
      ctx.fillStyle = t.accentColor;
      ctx.beginPath();
      ctx.arc(0, 0, t.size * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Health Bar
      if (t.health < t.maxHealth || t.enemyClass === 'boss') {
        const hpPercent = Math.max(0, t.health / t.maxHealth);
        const barW = t.size * 1.1;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
        ctx.fillRect(cx - barW / 2, cy - t.size / 2 - 12, barW, 5);
        ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : hpPercent > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(cx - barW / 2, cy - t.size / 2 - 12, barW * hpPercent, 5);
      }

      ctx.restore();
    };

    // 6. Draw Tanks
    for (const enemy of enemies) renderTank(enemy);
    if (player.health > 0) renderTank(player);

    // 7. Draw Bullets & Trails
    for (const b of bullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate((b.rotation * Math.PI) / 180);

      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(0, 0, b.type === 'missile' ? 4 : 3, 0, Math.PI * 2);
      ctx.fill();

      // Exhaust tracer
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(-12, -1.5, 12, 3);
      ctx.restore();
    }

    // 8. Draw Explosions
    for (const exp of explosions) {
      const progress = exp.frame / exp.maxFrames;
      const r = exp.size * (0.4 + progress * 0.6);
      ctx.save();
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle = exp.color;
      ctx.beginPath();
      ctx.arc(exp.x, exp.y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 9. Crosshair Target
    ctx.save();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(crosshair.x, crosshair.y, 14, 0, Math.PI * 2);
    ctx.moveTo(crosshair.x - 20, crosshair.y);
    ctx.lineTo(crosshair.x + 20, crosshair.y);
    ctx.moveTo(crosshair.x, crosshair.y - 20);
    ctx.lineTo(crosshair.x, crosshair.y + 20);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not intercept keystrokes if typing inside an input, textarea or editable field
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']")
        )
      ) {
        return;
      }

      if (e.code === 'Escape' && isPlaying && !isGameOver) {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (!isPlaying || isGameOver || isPaused) return;

      const code = e.code;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(code)) {
        e.preventDefault();
      }
      keysPressed.current.add(code);

      // Weapon selection shortcuts (1, 2, 3, 4)
      if (code === 'Digit1') setCurrentWeapon('cannon');
      if (code === 'Digit2') setCurrentWeapon('scatter');
      if (code === 'Digit3') setCurrentWeapon('ricochet');
      if (code === 'Digit4') setCurrentWeapon('missile');

      // Tactical Abilities: Q = Airstrike, E = Landmine
      if (code === 'KeyQ') triggerAirstrike();
      if (code === 'KeyE') placeLandmine();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target && (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          target.closest("input, textarea, select, [contenteditable='true']")
        )
      ) {
        return;
      }
      keysPressed.current.delete(e.code);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_WIDTH / rect.width;
        const scaleY = CANVAS_HEIGHT / rect.height;
        mousePos.current = {
          x: (e.clientX - rect.left) * scaleX,
          y: (e.clientY - rect.top) * scaleY
        };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [triggerAirstrike, placeLandmine]);

  // Start RAF loop
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      lastTimeRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, isPaused, gameLoop]);

  // Start / Restart match
  const startGame = () => {
    const now = Date.now();
    setGameStartTime(now);
    setGameTime(0);
    setLevel(1);
    setScore(0);
    setCombo(1);
    setCurrentWeapon('cannon');
    setAmmo({ cannon: Infinity, scatter: 18, ricochet: 15, missile: 6 });
    setAirstrikeCharges(2);
    setLandmineCharges(3);
    setAirstrikeCooldown(0);

    setPlayerTank({
      id: 'player',
      x: CANVAS_WIDTH / 2 - TANK_BASE_SIZE / 2,
      y: CANVAS_HEIGHT - 85,
      rotation: -90,
      turretRotation: -90,
      health: PLAYER_MAX_HEALTH,
      maxHealth: PLAYER_MAX_HEALTH,
      isPlayer: true,
      lastShot: 0,
      color: '#2563eb',
      accentColor: '#60a5fa',
      speed: 3.5,
      size: TANK_BASE_SIZE,
      recoil: 0,
      shieldEndTime: 0
    });

    setEnemies(generateEnemies(1));
    setObstacles(generateObstacles(1));
    setBullets([]);
    setExplosions([]);
    setParticles([]);
    setPowerups([]);
    setLandmines([]);
    setAirstrikes([]);
    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    setStats({
      shotsFired: 0,
      shotsHit: 0,
      accuracy: 0,
      scoutsKilled: 0,
      mediumsKilled: 0,
      heaviesKilled: 0,
      bossesKilled: 0,
      totalKills: 0,
      damageDealt: 0,
      damageTaken: 0,
      powerupsCollected: 0,
      minesDetonated: 0,
      airstrikesUsed: 0,
      wallsDestroyed: 0,
      maxComboStreak: 1,
      survivalTimeSeconds: 0
    });

    sound.playCannon(true);
  };

  // Calculate combat rating rank
  const calculateRank = (accuracy: number, totalKills: number, score: number) => {
    if (score >= 4000 || (accuracy > 65 && totalKills >= 15)) return { title: 'Supreme Commander ⭐⭐⭐', badge: '🎖️' };
    if (score >= 2500 || (accuracy > 50 && totalKills >= 10)) return { title: 'Armored Ace ⭐⭐', badge: '🏅' };
    if (score >= 1200 || totalKills >= 6) return { title: 'Frontline Veteran ⭐', badge: '🥈' };
    return { title: 'Recon Gunner', badge: '🥉' };
  };

  const finalAccuracy = stats.shotsFired > 0 ? Math.round((stats.shotsHit / stats.shotsFired) * 100) : 0;
  const rankInfo = calculateRank(finalAccuracy, stats.totalKills, score);

  return (
    <div className="fixed inset-0 bg-background flex flex-col select-none overflow-hidden">
      {/* Top TV Scoreboard Header */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 sm:px-6 sm:py-3 bg-card/85 backdrop-blur-md border-b border-border/80 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onBack}
            className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 shadow-sm border border-border/70 hover:bg-primary hover:text-primary-foreground transition-colors"
            title="Return to My Games"
          >
            <Gamepad2 className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">My Games</span>
          </Button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60">
            <span className="text-xs font-bold text-primary">Wave {level}</span>
            {level % 3 === 0 && (
              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
                BOSS
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>

        {/* Center: Score & Combo Multiplier */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1.5">Score:</span>
            <span className="text-lg sm:text-2xl font-black text-primary font-mono">{score}</span>
          </div>

          {combo > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-black animate-bounce">
              {combo}x COMBO
            </span>
          )}
        </div>

        {/* Right: HP & Sound Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            <div className="w-16 sm:w-24 h-2.5 bg-muted rounded-full overflow-hidden border border-border/70">
              <div
                className={`h-full transition-all ${
                  playerTank.health > 50 ? 'bg-emerald-500' : playerTank.health > 25 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(playerTank.health / PLAYER_MAX_HEALTH) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold">{playerTank.health}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 rounded-xl"
            title={soundEnabled ? "Mute SFX" : "Enable SFX"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>

          {isPlaying && (
            <Button variant="outline" size="sm" onClick={() => setIsPaused(p => !p)} className="h-8 px-2.5 rounded-xl text-xs font-semibold">
              {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}
        </div>
      </div>

      {/* Main Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-full max-h-full aspect-[840/480] cursor-crosshair"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Weapons & Tactical Support Toolbar */}
      <div className="hidden md:flex justify-between items-center px-6 py-2.5 bg-card/85 border-t border-border/80 shrink-0">
        {/* Weapon Slots */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">Arsenal:</span>
          {(['cannon', 'scatter', 'ricochet', 'missile'] as WeaponType[]).map((wKey, idx) => {
            const w = WEAPON_TYPES[wKey];
            const isSelected = currentWeapon === wKey;
            const remaining = ammo[wKey];

            return (
              <Button
                key={wKey}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentWeapon(wKey)}
                className={`h-9 px-3 rounded-xl font-semibold text-xs border relative ${
                  isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border/70 hover:border-primary/50'
                }`}
              >
                <span className="mr-1.5">{w.icon}</span>
                <span>{w.name.split(' ')[0]}</span>
                <span className="ml-2 font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-foreground">
                  {remaining === Infinity ? '∞' : remaining}
                </span>
                <kbd className="ml-1.5 text-[9px] text-muted-foreground font-mono">[{idx + 1}]</kbd>
              </Button>
            );
          })}
        </div>

        {/* Tactical Support Buttons (Q & E) */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerAirstrike}
            disabled={airstrikeCharges <= 0 || Date.now() < airstrikeCooldown}
            className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-rose-500/40 hover:bg-rose-500/10"
            title="Call Artillery Airstrike"
          >
            <span>🛰️</span>
            <span>Airstrike</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold">
              {airstrikeCharges}
            </span>
            <kbd className="text-[9px] text-muted-foreground font-mono">[Q]</kbd>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={placeLandmine}
            disabled={landmineCharges <= 0}
            className="h-9 px-3 rounded-xl text-xs font-semibold gap-1.5 border-amber-500/40 hover:bg-amber-500/10"
            title="Deploy Landmine"
          >
            <span>💣</span>
            <span>Landmine</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">
              {landmineCharges}
            </span>
            <kbd className="text-[9px] text-muted-foreground font-mono">[E]</kbd>
          </Button>
        </div>
      </div>

      {/* Start Game Overlay */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Armor Division • Pro Edition 2026
              </div>

              <div className="space-y-2">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🎖️ TANK BATTLE PRO
                </h1>
                <p className="text-sm text-muted-foreground">
                  Command heavy battle armor, deploy strategic airstrikes, and conquer escalating waves of tactical enemy tanks!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-left p-4 rounded-2xl bg-card/80 border border-border/60">
                <div><span className="font-bold text-primary">WASD / Arrows:</span> Maneuver Tank</div>
                <div><span className="font-bold text-primary">Mouse:</span> Aim Turret</div>
                <div><span className="font-bold text-primary">Click / Space:</span> Fire Cannon</div>
                <div><span className="font-bold text-primary">1-4:</span> Switch Weapons</div>
                <div><span className="font-bold text-primary">Q:</span> Orbital Airstrike</div>
                <div><span className="font-bold text-primary">E:</span> Deploy Landmines</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg hover:shadow-primary/25 h-12"
              >
                DEPLOY TANK SQUADRON
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Combat Performance Analytics Modal (Game Over) */}
      {isGameOver && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-lg w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden my-auto">
            <CardContent className="p-6 sm:p-7 space-y-5">
              {/* Header & Rank */}
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold uppercase tracking-wider">
                  <Skull className="h-3.5 w-3.5" />
                  Mission Debrief & Analytics
                </div>
                <h2 className="text-3xl font-black tracking-tight">Battle Analysis</h2>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-2xl">{rankInfo.badge}</span>
                  <span className="text-base font-bold text-primary">{rankInfo.title}</span>
                </div>
              </div>

              {/* 4 Core Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Accuracy</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{finalAccuracy}%</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Total Kills</span>
                  <span className="text-xl font-black text-emerald-500 font-mono">{stats.totalKills}</span>
                </div>
                <div className="p-3 rounded-2xl bg-card/80 border border-border/60">
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Waves Beat</span>
                  <span className="text-xl font-black text-blue-500 font-mono">Lvl {level}</span>
                </div>
              </div>

              {/* Detailed Breakdown Statistics */}
              <div className="p-3.5 rounded-2xl bg-card/60 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Enemies Defeated:</span>
                  <span className="font-semibold text-foreground">
                    {stats.scoutsKilled} Scouts • {stats.mediumsKilled} Mediums • {stats.heaviesKilled} Heavies • {stats.bossesKilled} Bosses
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Damage Ratio:</span>
                  <span className="font-semibold text-foreground">
                    {stats.damageDealt} Dealt / {stats.damageTaken} Received
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Max Kill Streak:</span>
                  <span className="font-semibold text-amber-500">{stats.maxComboStreak}x Multiplier</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tactical Support:</span>
                  <span className="font-semibold text-foreground">
                    {stats.airstrikesUsed} Airstrikes • {stats.minesDetonated} Mines • {stats.wallsDestroyed} Walls Crumbled
                  </span>
                </div>
              </div>

              {/* Hall of Fame Score Submission */}
              {scoreSubmitted ? (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-xs">Combat record successfully saved to the Hall of Fame!</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your commander name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="rounded-xl font-bold text-xs"
                    maxLength={20}
                  />
                  <Button
                    onClick={() => {
                      if (playerName.trim()) {
                        submitScoreMutation.mutate({
                          playerName: playerName.trim(),
                          score
                        });
                      }
                    }}
                    disabled={!playerName.trim() || submitScoreMutation.isPending}
                    className="rounded-xl font-bold text-xs shrink-0 bg-primary text-primary-foreground"
                  >
                    {submitScoreMutation.isPending ? "Recording..." : "Record Score"}
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <Button onClick={startGame} className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Deploy Again
                </Button>
                <Button onClick={onBack} variant="outline" className="flex-1 rounded-xl font-semibold text-xs h-10 gap-1.5">
                  <Gamepad2 className="h-4 w-4" />
                  All Games
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center text-white space-y-3">
            <h2 className="text-4xl font-black tracking-tight">GAME PAUSED</h2>
            <p className="text-sm text-gray-300">Press ESC or click Resume to continue</p>
            <Button onClick={() => setIsPaused(false)} className="rounded-xl font-bold bg-primary text-white">
              Resume Battle
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
