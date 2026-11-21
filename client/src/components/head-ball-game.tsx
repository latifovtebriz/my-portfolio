import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, List, Clock, Zap, ChevronLeft, ChevronRight, ArrowUp, 
  Volume2, VolumeX, Sparkles, RefreshCw, Flame, Snowflake, Shield, User,
  Gamepad2, CheckCircle2
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PartySocket from "partysocket";

// ============================================================================
// AUDIO SYNTHESIZER (Pure Web Audio API - zero external assets needed)
// ============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playKick(isSuper: boolean = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isSuper ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isSuper ? 240 : 160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(isSuper ? 0.6 : 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playHighKick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.15);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {}
  }

  playCrossbar() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(920, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.35);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  playWhistle(type: 'short' | 'double' | 'long' = 'double') {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const playTone = (startDelay: number, duration: number) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + startDelay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(2950, now);
        osc.frequency.setValueAtTime(3150, now + duration * 0.5);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + duration);
      };

      if (type === 'double') {
        playTone(0, 0.12);
        playTone(0.18, 0.22);
      } else if (type === 'short') {
        playTone(0, 0.14);
      } else {
        playTone(0, 0.45);
      }
    } catch {}
  }

  playGoal() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5 fanfare
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);
        gain.gain.setValueAtTime(0.18, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.09);
        osc.stop(now + 1.2);
      });
    } catch {}
  }

  playPowerUp(type: string) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === 'freeze' ? 'sine' : type === 'fireball' ? 'sawtooth' : 'triangle';
      const startFreq = type === 'freeze' ? 950 : type === 'fireball' ? 180 : 420;
      const endFreq = type === 'freeze' ? 260 : type === 'fireball' ? 750 : 1300;

      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.3);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// CHARACTER ROSTER
// ============================================================================

export interface CharacterSkin {
  id: string;
  name: string;
  title: string;
  country: string;
  flag: string;
  skinTone: string;
  hairColor: string;
  hairStyle: 'slick' | 'classic' | 'buzz' | 'cyborg' | 'flame';
  jerseyColor: string;
  jerseySecondary: string;
  bootColor: string;
  bootSecondary: string;
  speed: number;
  power: number;
}

export const CHARACTERS: CharacterSkin[] = [
  {
    id: 'leo',
    name: 'Leo 🐐',
    title: 'The Magician',
    country: 'Argentina',
    flag: '🇦🇷',
    skinTone: '#f8d2b0',
    hairColor: '#4a2e18',
    hairStyle: 'classic',
    jerseyColor: '#75aadb',
    jerseySecondary: '#ffffff',
    bootColor: '#00e676',
    bootSecondary: '#111111',
    speed: 5.6,
    power: 11.8
  },
  {
    id: 'cr7',
    name: 'CR7 ⚡',
    title: 'The Striker',
    country: 'Portugal',
    flag: '🇵🇹',
    skinTone: '#e8be99',
    hairColor: '#1a1a1a',
    hairStyle: 'slick',
    jerseyColor: '#dc2626',
    jerseySecondary: '#15803d',
    bootColor: '#ff6d00',
    bootSecondary: '#ffffff',
    speed: 5.9,
    power: 13.2
  },
  {
    id: 'kylian',
    name: 'Kylian 👑',
    title: 'Speed King',
    country: 'France',
    flag: '🇫🇷',
    skinTone: '#935f3b',
    hairColor: '#1a1a1a',
    hairStyle: 'buzz',
    jerseyColor: '#1e3a8a',
    jerseySecondary: '#fbbf24',
    bootColor: '#ec4899',
    bootSecondary: '#ffffff',
    speed: 6.3,
    power: 11.2
  },
  {
    id: 'baku_ai',
    name: 'Baku AI 🤖',
    title: 'Cyber Prodigy',
    country: 'Azerbaijan',
    flag: '🇦🇿',
    skinTone: '#cbd5e1',
    hairColor: '#06b6d4',
    hairStyle: 'cyborg',
    jerseyColor: '#0284c7',
    jerseySecondary: '#10b981',
    bootColor: '#38bdf8',
    bootSecondary: '#f43f5e',
    speed: 5.8,
    power: 12.5
  },
  {
    id: 'blaze',
    name: 'Blaze 🔥',
    title: 'Inferno Beast',
    country: 'Global',
    flag: '🔥',
    skinTone: '#d97706',
    hairColor: '#ef4444',
    hairStyle: 'flame',
    jerseyColor: '#18181b',
    jerseySecondary: '#f97316',
    bootColor: '#dc2626',
    bootSecondary: '#fbbf24',
    speed: 5.5,
    power: 13.8
  }
];

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type PowerUpType = 'freeze' | 'speed' | 'giant' | 'fireball';

export interface PowerUp {
  type: PowerUpType;
  name: string;
  icon: string;
  duration: number;
  cooldown: number;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  onGround: boolean;
  score: number;
  powerUp: PowerUpType | null;
  powerUpEndTime: number;
  frozen: boolean;
  frozenEndTime: number;
  giant: boolean;
  giantEndTime: number;
  side: 'left' | 'right';
  character: CharacterSkin;
  facing: 1 | -1;
  // Kicking states
  kickState: 'idle' | 'low' | 'high';
  kickProgress: number; // 0 to 1
  kickCooldown: number;
  // Animation
  runCycle: number;
  eyeOffset: { x: number; y: number };
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  lastTouchedBy: 'player1' | 'player2' | null;
  isFireball: boolean;
  fireballEndTime: number;
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
  type: 'confetti' | 'fire' | 'grass' | 'spark';
}

export interface GameState {
  player1: Player;
  player2: Player;
  ball: Ball;
  timeLeft: number;
  isPaused: boolean;
  lastGoalScorer: 'player1' | 'player2' | null;
  goalAnimation: number;
  screenShake: number;
}

export interface KeyState {
  left: boolean;
  right: boolean;
  up: boolean;
  lowKick: boolean;
  highKick: boolean;
}

interface HeadBallGameProps {
  onBack: () => void;
}

const GAME_WIDTH = 840;
const GAME_HEIGHT = 460;
const GROUND_Y = GAME_HEIGHT - 45;

const GOAL_WIDTH = 65;
const GOAL_HEIGHT = 135;
const GOAL_POST_WIDTH = 8;
const GOAL_DEPTH = 32;

const GRAVITY = 0.52;
const BASE_JUMP_FORCE = -13.2;
const BASE_RADIUS = 34;
const BALL_RADIUS = 18;
const FRICTION = 0.985;
const GROUND_FRICTION = 0.92;
const AIR_RESISTANCE = 0.998;
const BALL_BOUNCE = 0.74;
const WALL_BOUNCE = 0.78;
const MAX_BALL_SPEED = 18;

const MATCH_DURATION = 90;

export const POWER_UPS: PowerUp[] = [
  { type: 'freeze', name: 'Freeze Ice', icon: '❄️', duration: 2600, cooldown: 12000 },
  { type: 'speed', name: 'Hyper Speed', icon: '⚡', duration: 5000, cooldown: 10000 },
  { type: 'giant', name: 'Giant Head', icon: '🧠', duration: 6000, cooldown: 14000 },
  { type: 'fireball', name: 'Fire Meteor', icon: '🔥', duration: 3200, cooldown: 9000 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function createInitialPlayer(side: 'left' | 'right', character: CharacterSkin): Player {
  return {
    x: side === 'left' ? 160 : GAME_WIDTH - 160,
    y: GROUND_Y - BASE_RADIUS,
    vx: 0,
    vy: 0,
    radius: BASE_RADIUS,
    onGround: true,
    score: 0,
    powerUp: null,
    powerUpEndTime: 0,
    frozen: false,
    frozenEndTime: 0,
    giant: false,
    giantEndTime: 0,
    side,
    character,
    facing: side === 'left' ? 1 : -1,
    kickState: 'idle',
    kickProgress: 0,
    kickCooldown: 0,
    runCycle: 0,
    eyeOffset: { x: 0, y: 0 }
  };
}

function createInitialBall(): Ball {
  return {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT / 3,
    vx: (Math.random() - 0.5) * 4,
    vy: -2,
    radius: BALL_RADIUS,
    rotation: 0,
    lastTouchedBy: null,
    isFireball: false,
    fireballEndTime: 0
  };
}

function createInitialGameState(p1Char: CharacterSkin = CHARACTERS[0], p2Char: CharacterSkin = CHARACTERS[1]): GameState {
  return {
    player1: createInitialPlayer('left', p1Char),
    player2: createInitialPlayer('right', p2Char),
    ball: createInitialBall(),
    timeLeft: MATCH_DURATION,
    isPaused: false,
    lastGoalScorer: null,
    goalAnimation: 0,
    screenShake: 0
  };
}

// ============================================================================
// PHYSICS ENGINE
// ============================================================================

function updatePlayerPhysics(
  player: Player,
  keys: KeyState,
  ball: Ball,
  particles: Particle[]
): Player {
  const p = { ...player };

  // Handle kick animation progress
  if (p.kickState !== 'idle') {
    p.kickProgress += 0.18;
    if (p.kickProgress >= 1) {
      p.kickState = 'idle';
      p.kickProgress = 0;
    }
  }

  if (p.kickCooldown > 0) p.kickCooldown -= 1;

  // Eye tracking: calculate angle to ball
  const dx = ball.x - p.x;
  const dy = ball.y - p.y;
  const angle = Math.atan2(dy, dx);
  p.eyeOffset = {
    x: Math.cos(angle) * 4.5,
    y: Math.sin(angle) * 3.5
  };

  if (p.frozen) {
    p.vx = 0;
    p.vy = 0;
    return p;
  }

  // Handle active kick triggers
  if (keys.lowKick && p.kickState === 'idle' && p.kickCooldown <= 0) {
    p.kickState = 'low';
    p.kickProgress = 0;
    p.kickCooldown = 14;
    sound.playKick(false);
  } else if (keys.highKick && p.kickState === 'idle' && p.kickCooldown <= 0) {
    p.kickState = 'high';
    p.kickProgress = 0;
    p.kickCooldown = 16;
    sound.playHighKick();
  }

  // Adjust radius if giant
  p.radius = p.giant ? BASE_RADIUS * 1.35 : BASE_RADIUS;

  const baseSpeed = p.character.speed;
  const speed = p.powerUp === 'speed' ? baseSpeed * 1.6 : baseSpeed;

  // Horizontal movement
  if (keys.left) {
    p.vx -= speed * 0.45;
    p.runCycle += 0.25;
  }
  if (keys.right) {
    p.vx += speed * 0.45;
    p.runCycle += 0.25;
  }

  // Friction
  p.vx *= p.onGround ? GROUND_FRICTION : FRICTION;
  p.vx = clamp(p.vx, -speed, speed);

  // Jump
  if (keys.up && p.onGround) {
    p.vy = BASE_JUMP_FORCE;
    p.onGround = false;
  }

  // Gravity
  p.vy += GRAVITY;

  p.x += p.vx;
  p.y += p.vy;

  // Ground collision
  if (p.y + p.radius >= GROUND_Y) {
    p.y = GROUND_Y - p.radius;
    p.vy = 0;
    p.onGround = true;
  }

  // Boundaries
  const midField = GAME_WIDTH / 2;
  const goalWall = GOAL_WIDTH + GOAL_DEPTH;

  if (p.side === 'left') {
    p.x = clamp(p.x, goalWall + p.radius - 5, midField - p.radius);
  } else {
    p.x = clamp(p.x, midField + p.radius, GAME_WIDTH - goalWall - p.radius + 5);
  }

  // Ceiling
  if (p.y - p.radius < 0) {
    p.y = p.radius;
    p.vy = Math.abs(p.vy) * 0.4;
  }

  return p;
}

function updateBallPhysics(
  ball: Ball,
  particles: Particle[]
): Ball {
  const b = { ...ball };

  // Gravity
  b.vy += GRAVITY * 0.78;

  // Air resistance
  b.vx *= AIR_RESISTANCE;
  b.vy *= AIR_RESISTANCE;

  // Rotation based on horizontal speed
  b.rotation += b.vx * 0.05;

  // Speed clamping
  const currentSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
  if (currentSpeed > MAX_BALL_SPEED) {
    b.vx = (b.vx / currentSpeed) * MAX_BALL_SPEED;
    b.vy = (b.vy / currentSpeed) * MAX_BALL_SPEED;
  }

  // Spawn fire particles if fireball active
  if (b.isFireball && Math.random() < 0.6) {
    particles.push({
      x: b.x + (Math.random() - 0.5) * 16,
      y: b.y + (Math.random() - 0.5) * 16,
      vx: -b.vx * 0.3 + (Math.random() - 0.5) * 2,
      vy: -b.vy * 0.3 + (Math.random() - 0.5) * 2,
      color: Math.random() > 0.5 ? '#ff3b30' : '#ff9500',
      size: Math.random() * 6 + 4,
      alpha: 1,
      life: 0,
      maxLife: 20,
      type: 'fire'
    });
  }

  b.x += b.vx;
  b.y += b.vy;

  // Ground collision
  if (b.y + b.radius >= GROUND_Y) {
    b.y = GROUND_Y - b.radius;
    b.vy = -b.vy * BALL_BOUNCE;
    b.vx *= GROUND_FRICTION;

    if (Math.abs(b.vy) > 3) {
      sound.playKick(false);
    }
    if (Math.abs(b.vy) < 1) b.vy = 0;
  }

  // Ceiling collision
  if (b.y - b.radius <= 0) {
    b.y = b.radius;
    b.vy = Math.abs(b.vy) * BALL_BOUNCE;
  }

  // Outer walls collision
  if (b.x - b.radius <= 0) {
    b.x = b.radius;
    b.vx = Math.abs(b.vx) * WALL_BOUNCE;
  }
  if (b.x + b.radius >= GAME_WIDTH) {
    b.x = GAME_WIDTH - b.radius;
    b.vx = -Math.abs(b.vx) * WALL_BOUNCE;
  }

  // Goalposts & Crossbars collision
  const goalTop = GROUND_Y - GOAL_HEIGHT;
  const leftCrossbarX = GOAL_WIDTH + GOAL_DEPTH;
  const rightCrossbarX = GAME_WIDTH - GOAL_WIDTH - GOAL_DEPTH;

  // 1. Solid Left Goal Roof (Impenetrable crossbar and net roof from above)
  if (b.x <= leftCrossbarX + 4) {
    if (b.y + b.radius >= goalTop && b.vy > 0 && b.y < goalTop + 35) {
      b.y = goalTop - b.radius;
      b.vy = -Math.abs(b.vy) * BALL_BOUNCE;
      if (Math.abs(b.vy) > 2) sound.playCrossbar();
    }
  }

  // 2. Solid Right Goal Roof (Impenetrable crossbar and net roof from above)
  if (b.x >= rightCrossbarX - 4) {
    if (b.y + b.radius >= goalTop && b.vy > 0 && b.y < goalTop + 35) {
      b.y = goalTop - b.radius;
      b.vy = -Math.abs(b.vy) * BALL_BOUNCE;
      if (Math.abs(b.vy) > 2) sound.playCrossbar();
    }
  }

  // 3. Left Goal Corner & Front Post Hit
  const distLeftPost = distance(b.x, b.y, leftCrossbarX, goalTop);
  if (distLeftPost < b.radius + GOAL_POST_WIDTH) {
    const angle = Math.atan2(b.y - goalTop, b.x - leftCrossbarX);
    b.vx = Math.cos(angle) * (Math.abs(b.vx) + 4) * WALL_BOUNCE;
    b.vy = Math.sin(angle) * (Math.abs(b.vy) + 4) * WALL_BOUNCE;
    sound.playCrossbar();
  }

  // 4. Right Goal Corner & Front Post Hit
  const distRightPost = distance(b.x, b.y, rightCrossbarX, goalTop);
  if (distRightPost < b.radius + GOAL_POST_WIDTH) {
    const angle = Math.atan2(b.y - goalTop, b.x - rightCrossbarX);
    b.vx = Math.cos(angle) * (Math.abs(b.vx) + 4) * WALL_BOUNCE;
    b.vy = Math.sin(angle) * (Math.abs(b.vy) + 4) * WALL_BOUNCE;
    sound.playCrossbar();
  }

  return b;
}

function handleKickingAndCollision(
  player: Player,
  ball: Ball,
  particles: Particle[]
): { player: Player; ball: Ball; hit: boolean } {
  const p = { ...player };
  let b = { ...ball };
  let hit = false;

  // Calculate shoe position
  const shoeOffsetForward = p.facing * (p.radius * 0.7);
  let shoeX = p.x + shoeOffsetForward;
  let shoeY = p.y + p.radius * 0.65;

  // During kick animation, shoe moves forward/upward
  if (p.kickState === 'low') {
    const swing = Math.sin(p.kickProgress * Math.PI);
    shoeX += p.facing * (swing * 26);
    shoeY += swing * 4;
  } else if (p.kickState === 'high') {
    const swing = Math.sin(p.kickProgress * Math.PI);
    shoeX += p.facing * (swing * 22);
    shoeY -= swing * 26;
  }

  // 1. Shoe / Foot Hit Check
  const shoeDist = distance(shoeX, shoeY, b.x, b.y);
  const shoeHitRadius = b.radius + 18;

  if (shoeDist < shoeHitRadius && p.kickState !== 'idle' && p.kickProgress > 0.15 && p.kickProgress < 0.85) {
    hit = true;
    const isFireball = b.isFireball;
    const forceMultiplier = isFireball ? 1.8 : 1.0;
    const characterPower = (p.character.power / 10);

    if (p.kickState === 'low') {
      // Powerful driven low shot
      b.vx = p.facing * (13.5 * characterPower * forceMultiplier);
      b.vy = -3.5 - Math.random() * 2;
      sound.playKick(true);
    } else {
      // High lob / chip shot
      b.vx = p.facing * (9.5 * characterPower * forceMultiplier);
      b.vy = -12.5 * characterPower * forceMultiplier;
      sound.playHighKick();
    }

    b.lastTouchedBy = p.side === 'left' ? 'player1' : 'player2';

    // Grass chunk particles
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: shoeX,
        y: shoeY + 10,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 6 - 2,
        color: '#22c55e',
        size: Math.random() * 4 + 2,
        alpha: 1,
        life: 0,
        maxLife: 25,
        type: 'grass'
      });
    }

    return { player: p, ball: b, hit: true };
  }

  // 2. Head / Body Collision Check
  const dist = distance(p.x, p.y, b.x, b.y);
  const minDist = p.radius + b.radius;

  if (dist < minDist) {
    const nx = (b.x - p.x) / dist;
    const ny = (b.y - p.y) / dist;

    // Push ball outside player
    const overlap = minDist - dist;
    b.x += nx * overlap;
    b.y += ny * overlap;

    const baseForce = b.isFireball ? 16 : 11;
    b.vx = nx * baseForce + p.vx * 0.6;
    b.vy = ny * baseForce + p.vy * 0.6;

    // Header upwards bonus if hitting top of head
    if (ny < -0.3 && b.vy > -4) {
      b.vy = -7.5;
    }

    b.lastTouchedBy = p.side === 'left' ? 'player1' : 'player2';
    sound.playKick(false);
    return { player: p, ball: b, hit: true };
  }

  return { player: p, ball: b, hit: false };
}

function checkGoal(ball: Ball): 'player1' | 'player2' | null {
  const goalTop = GROUND_Y - GOAL_HEIGHT;
  const leftGoalLine = GOAL_WIDTH + 8;
  const rightGoalLine = GAME_WIDTH - GOAL_WIDTH - 8;

  // Ball must enter through the mouth, strictly below the crossbar and above pitch
  if (ball.x < leftGoalLine && ball.y > goalTop + ball.radius + 6 && ball.y < GROUND_Y) {
    return 'player2';
  }
  if (ball.x > rightGoalLine && ball.y > goalTop + ball.radius + 6 && ball.y < GROUND_Y) {
    return 'player1';
  }
  return null;
}

// ============================================================================
// SMART AI SYSTEM
// ============================================================================

function updateAI(
  ai: Player,
  ball: Ball,
  opponent: Player,
  difficulty: number = 0.88
): KeyState {
  const keys: KeyState = { left: false, right: false, up: false, lowKick: false, highKick: false };
  if (ai.frozen) return keys;

  const myGoalX = ai.side === 'left' ? GOAL_WIDTH + GOAL_DEPTH : GAME_WIDTH - GOAL_WIDTH - GOAL_DEPTH;
  const midField = GAME_WIDTH / 2;
  const distToBall = distance(ai.x, ai.y, ball.x, ball.y);
  const ballOnMySide = ai.side === 'left' ? ball.x < midField + 40 : ball.x > midField - 40;
  const ballMovingToGoal = ai.side === 'left' ? ball.vx < -1 : ball.vx > 1;

  // Move towards ball with tactical positioning
  let targetX = ball.x + (ai.side === 'left' ? -35 : 35);
  if (ai.side === 'left') {
    targetX = clamp(targetX, myGoalX + 45, midField - 30);
  } else {
    targetX = clamp(targetX, midField + 30, myGoalX - 45);
  }

  if (ai.x < targetX - 10) keys.right = true;
  else if (ai.x > targetX + 10) keys.left = true;

  // Jump if ball is in the air above
  const shouldJump = (distToBall < 110 && ball.y < ai.y - 10) || (ball.y < GROUND_Y - 90 && distToBall < 85);
  if (shouldJump && ai.onGround && Math.random() < difficulty) {
    keys.up = true;
  }

  // Smart Kicking
  if (distToBall < 90) {
    // If opponent is off line, lob high kick
    const opponentDistanceToGoal = Math.abs(opponent.x - (opponent.side === 'left' ? GOAL_WIDTH : GAME_WIDTH - GOAL_WIDTH));
    if (opponentDistanceToGoal > 130 && Math.random() < 0.6) {
      keys.highKick = true;
    } else {
      keys.lowKick = true;
    }
  }

  return keys;
}

// ============================================================================
// HIGH-FIDELITY HEAD BALL RENDERING ENGINE
// ============================================================================

function drawGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  particles: Particle[]
) {
  const { player1, player2, ball, goalAnimation, screenShake } = state;

  ctx.save();

  // Screen shake on massive hits or goals
  if (screenShake > 0) {
    const shakeX = (Math.random() - 0.5) * screenShake;
    const shakeY = (Math.random() - 0.5) * screenShake;
    ctx.translate(shakeX, shakeY);
  }

  // 1. Stadium Night Sky Background
  const skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGradient.addColorStop(0, '#0a0f24');
  skyGradient.addColorStop(0.5, '#131b3e');
  skyGradient.addColorStop(1, '#1b2654');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 2. Stadium Crowd in Stands
  drawStadiumStands(ctx);

  // 3. Stadium Floodlights & Ambient Cones
  drawFloodlights(ctx);

  // 4. Advertising Ribbon Boards
  drawAdRibbon(ctx);

  // 5. Grass Pitch with Striped Lawn Pattern
  drawPitchTurf(ctx);

  // 6. 3D Goalposts & Nets
  drawGoalposts(ctx);

  // 7. Pitch Lines & Center Arc
  drawPitchLines(ctx);

  // 8. Draw Head Ball Players with Cleats & Animated Eyes
  drawHeadBallPlayer(ctx, player1, goalAnimation === 1);
  drawHeadBallPlayer(ctx, player2, goalAnimation === 2);

  // 9. Particles (Confetti, Fire, Grass)
  drawParticles(ctx, particles);

  // 10. Soccer Ball with 32-panel pattern & Speed Trail
  drawBall(ctx, ball);

  // 11. Goal Celebration Splash
  if (goalAnimation > 0) {
    drawGoalCelebration(ctx, state);
  }

  ctx.restore();
}

function drawStadiumStands(ctx: CanvasRenderingContext2D) {
  // Upper stadium tier
  ctx.fillStyle = 'rgba(20, 27, 56, 0.85)';
  ctx.fillRect(0, 40, GAME_WIDTH, 140);

  // Crowd rows
  const crowdColors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#06b6d4', '#e2e8f0'];
  const now = Date.now() * 0.003;

  for (let row = 0; row < 4; row++) {
    const y = 60 + row * 24;
    for (let x = 20; x < GAME_WIDTH - 20; x += 14) {
      const colorIdx = (Math.floor(x * 0.1) + row) % crowdColors.length;
      const bob = Math.sin(now + x * 0.05) * 2;
      ctx.fillStyle = crowdColors[colorIdx];
      // Head
      ctx.beginPath();
      ctx.arc(x, y + bob, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawFloodlights(ctx: CanvasRenderingContext2D) {
  // 4 floodlights along top
  const lightX = [120, 280, 560, 720];
  for (const lx of lightX) {
    // Housing
    ctx.fillStyle = '#64748b';
    ctx.fillRect(lx - 20, 10, 40, 10);

    // Glow bulbs
    ctx.fillStyle = '#ffffff';
    for (let b = -15; b <= 15; b += 10) {
      ctx.beginPath();
      ctx.arc(lx + b, 15, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Volumetric light beam
    const beamGrad = ctx.createLinearGradient(lx, 15, lx, GROUND_Y);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    beamGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.02)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(lx - 20, 15);
    ctx.lineTo(lx + 20, 15);
    ctx.lineTo(lx + 80, GROUND_Y);
    ctx.lineTo(lx - 80, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  }
}

function drawAdRibbon(ctx: CanvasRenderingContext2D) {
  const y = GROUND_Y - GOAL_HEIGHT - 22;
  const h = 22;

  // Dark ribbon board
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, y, GAME_WIDTH, h);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, y, GAME_WIDTH, h);

  // Digital LED sponsors
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const sponsors = [
    { text: '⚽ HEAD BALL 2026', color: '#38bdf8', x: 120 },
    { text: '🔥 SUPERPOWERS ACTIVE', color: '#f59e0b', x: 290 },
    { text: 'TABRIZ ARENA', color: '#10b981', x: 420 },
    { text: '🤖 AI LEAGUE', color: '#a855f7', x: 570 },
    { text: '⚡ FAST VOLLEY', color: '#ef4444', x: 720 },
  ];

  for (const s of sponsors) {
    ctx.fillStyle = s.color;
    ctx.fillText(s.text, s.x, y + h / 2);
  }
}

function drawPitchTurf(ctx: CanvasRenderingContext2D) {
  // Ground depth block below turf
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

  // Turf grass base
  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, GROUND_Y - 8, GAME_WIDTH, 8);

  // Alternating grass stripes
  const stripeW = 44;
  for (let x = 0; x < GAME_WIDTH; x += stripeW * 2) {
    ctx.fillStyle = 'rgba(22, 101, 52, 0.45)';
    ctx.fillRect(x, GROUND_Y - GOAL_HEIGHT, stripeW, GOAL_HEIGHT);
  }
}

function drawPitchLines(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 2.5;

  // Center Line
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH / 2, GROUND_Y - GOAL_HEIGHT);
  ctx.lineTo(GAME_WIDTH / 2, GROUND_Y);
  ctx.stroke();

  // Center Arc
  ctx.beginPath();
  ctx.arc(GAME_WIDTH / 2, GROUND_Y, 70, Math.PI, Math.PI * 2);
  ctx.stroke();

  // Center Spot
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(GAME_WIDTH / 2, GROUND_Y - 4, 4, 0, Math.PI * 2);
  ctx.fill();

  // Ground Line
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(GAME_WIDTH, GROUND_Y);
  ctx.stroke();
}

function drawGoalposts(ctx: CanvasRenderingContext2D) {
  const goalTop = GROUND_Y - GOAL_HEIGHT;
  const leftX = GOAL_WIDTH + GOAL_DEPTH;
  const rightX = GAME_WIDTH - GOAL_WIDTH - GOAL_DEPTH;

  // Left Net Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(0, goalTop, leftX, GOAL_HEIGHT);

  // Left Net Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  for (let y = goalTop + 14; y < GROUND_Y; y += 14) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(leftX, y);
    ctx.stroke();
  }
  for (let x = 12; x < leftX; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, goalTop);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }

  // Left 3D Metallic Goalpost & Crossbar
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = GOAL_POST_WIDTH;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, goalTop);
  ctx.lineTo(leftX, goalTop); // Crossbar
  ctx.lineTo(leftX, GROUND_Y); // Front Post
  ctx.stroke();

  // Right Net Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.fillRect(rightX, goalTop, GOAL_WIDTH + GOAL_DEPTH, GOAL_HEIGHT);

  // Right Net Grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.lineWidth = 1;
  for (let y = goalTop + 14; y < GROUND_Y; y += 14) {
    ctx.beginPath();
    ctx.moveTo(rightX, y);
    ctx.lineTo(GAME_WIDTH, y);
    ctx.stroke();
  }
  for (let x = rightX + 12; x < GAME_WIDTH; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, goalTop);
    ctx.lineTo(x, GROUND_Y);
    ctx.stroke();
  }

  // Right 3D Goalpost
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = GOAL_POST_WIDTH;
  ctx.beginPath();
  ctx.moveTo(GAME_WIDTH, goalTop);
  ctx.lineTo(rightX, goalTop); // Crossbar
  ctx.lineTo(rightX, GROUND_Y); // Front Post
  ctx.stroke();
}

function drawHeadBallPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  celebrating: boolean
) {
  const { x, y, radius, facing, character, frozen, powerUp, kickState, kickProgress, runCycle, eyeOffset } = player;

  ctx.save();

  // 1. Shadow on pitch
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y - 2, radius * 0.9, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Power-up aura
  if (powerUp === 'speed') {
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 24;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.8)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius * 1.15, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Torso / Jersey (underneath the head)
  const jerseyY = y + radius * 0.35;
  ctx.fillStyle = character.jerseyColor;
  ctx.beginPath();
  ctx.ellipse(x, jerseyY, radius * 0.55, radius * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();

  // Jersey Secondary Stripes/Collar
  ctx.fillStyle = character.jerseySecondary;
  ctx.beginPath();
  ctx.arc(x, jerseyY - 4, radius * 0.25, 0, Math.PI);
  ctx.fill();

  // 4. The Iconic Football Boot / Cleat (with kicking swing!)
  let bootX = x + facing * (radius * 0.65);
  let bootY = y + radius * 0.75 + Math.sin(runCycle) * 3;
  let bootAngle = facing * 0.1;

  if (kickState === 'low') {
    const swing = Math.sin(kickProgress * Math.PI);
    bootX += facing * (swing * 30);
    bootY -= swing * 8;
    bootAngle = facing * swing * 1.1;

    // Motion blur arc behind shoe
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.5, radius * 0.9, -0.2, 0.8 * facing);
    ctx.stroke();
  } else if (kickState === 'high') {
    const swing = Math.sin(kickProgress * Math.PI);
    bootX += facing * (swing * 22);
    bootY -= swing * 34;
    bootAngle = -facing * swing * 1.4;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y + radius * 0.4, radius * 1.05, -0.6, 0.6);
    ctx.stroke();
  }

  // Draw Boot
  ctx.save();
  ctx.translate(bootX, bootY);
  ctx.rotate(bootAngle);

  // Boot Upper
  ctx.fillStyle = character.bootColor;
  ctx.beginPath();
  ctx.roundRect(-14, -8, 28, 14, 5);
  ctx.fill();

  // Boot Brand Stripe
  ctx.fillStyle = character.bootSecondary;
  ctx.beginPath();
  ctx.ellipse(0, -2, 8, 3, facing * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Boot Studs / Cleats
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(-10, 6, 4, 3);
  ctx.fillRect(0, 6, 4, 3);
  ctx.fillRect(8, 6, 4, 3);
  ctx.restore();

  // 5. Big Characteristic Head
  const headY = y - radius * 0.15;
  const headR = radius * 0.85;

  // Head base with skin tone
  ctx.fillStyle = character.skinTone;
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // Head subtle shading
  const headShade = ctx.createRadialGradient(x - 5, headY - 8, 2, x, headY, headR);
  headShade.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
  headShade.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = headShade;
  ctx.beginPath();
  ctx.arc(x, headY, headR, 0, Math.PI * 2);
  ctx.fill();

  // 6. Hair & Accessories
  drawHair(ctx, x, headY, headR, character, facing);

  // 7. Facial Features (Animated Tracking Eyes & Expressive Mouth)
  const eyeBaseX = x + facing * (headR * 0.35);
  const eyeBaseY = headY - 2;

  // Eyes (White Sclera)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(eyeBaseX - 7, eyeBaseY, 7, 9, 0, 0, Math.PI * 2);
  ctx.ellipse(eyeBaseX + 7, eyeBaseY, 7, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils (Tracking the ball position!)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(eyeBaseX - 7 + eyeOffset.x, eyeBaseY + eyeOffset.y, 3.8, 0, Math.PI * 2);
  ctx.arc(eyeBaseX + 7 + eyeOffset.x, eyeBaseY + eyeOffset.y, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = character.hairColor;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(eyeBaseX - 14, eyeBaseY - 11);
  ctx.lineTo(eyeBaseX - 2, eyeBaseY - 8);
  ctx.moveTo(eyeBaseX + 2, eyeBaseY - 8);
  ctx.lineTo(eyeBaseX + 14, eyeBaseY - 11);
  ctx.stroke();

  // Mouth (Excited on kick/jump, smile otherwise)
  ctx.fillStyle = '#7f1d1d';
  if (kickState !== 'idle' || !player.onGround) {
    ctx.beginPath();
    ctx.arc(eyeBaseX, eyeBaseY + 14, 6, 0, Math.PI);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeBaseX, eyeBaseY + 11, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  // 8. Freeze Ice Block Effect
  if (frozen) {
    ctx.fillStyle = 'rgba(186, 230, 253, 0.7)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(x - radius * 1.1, y - radius * 1.1, radius * 2.2, radius * 2.2, 12);
    ctx.fill();
    ctx.stroke();

    // Ice crystals
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText('❄️', x - 12, y + 8);
  }

  // 9. Celebration Flag / Emoji
  if (celebrating) {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎉', x, headY - headR - 18);
  }

  ctx.restore();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  char: CharacterSkin,
  facing: number
) {
  ctx.fillStyle = char.hairColor;

  if (char.hairStyle === 'slick') {
    // Slicked back high taper
    ctx.beginPath();
    ctx.arc(x, y - 5, r * 1.03, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
  } else if (char.hairStyle === 'classic') {
    // Classic side-part
    ctx.beginPath();
    ctx.arc(x, y - 4, r * 1.02, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();
    // Fringe
    ctx.beginPath();
    ctx.ellipse(x + facing * 8, y - r * 0.75, 12, 6, 0.4 * facing, 0, Math.PI * 2);
    ctx.fill();
  } else if (char.hairStyle === 'buzz') {
    // Clean athletic buzz cut
    ctx.beginPath();
    ctx.arc(x, y - 2, r * 1.01, Math.PI * 0.8, Math.PI * 2.2);
    ctx.fill();
  } else if (char.hairStyle === 'cyborg') {
    // Cyber robotic visor + sleek cyber plate
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(x, y - 5, r * 1.04, Math.PI * 0.85, Math.PI * 2.15);
    ctx.fill();

    // Glowing Neon Visor
    ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
    ctx.shadowColor = '#06b6d4';
    ctx.shadowBlur = 14;
    ctx.fillRect(x + facing * 2 - 16, y - 5, 32, 7);
    ctx.shadowBlur = 0;
  } else if (char.hairStyle === 'flame') {
    // Spiky flame spikes
    ctx.fillStyle = '#ef4444';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * 8 - 6, y - r * 0.7);
      ctx.lineTo(x + i * 8, y - r * 1.35 - Math.abs(i) * 2);
      ctx.lineTo(x + i * 8 + 6, y - r * 0.7);
      ctx.fill();
    }
  }
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const { x, y, radius, rotation, isFireball } = ball;

  ctx.save();

  // Ball Pitch Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  const shadowScale = Math.max(0.4, 1 - (GROUND_Y - y) / 300);
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y - 2, radius * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fireball Trail & Aura
  if (isFireball) {
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 28;
    const fireGrad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
    fireGrad.addColorStop(0, '#fef08a');
    fireGrad.addColorStop(0.35, '#f97316');
    fireGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Soccer Ball Base
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Rotate ball skin
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Authentic 32-Panel Soccer Pattern
  ctx.fillStyle = '#0f172a';
  const pentagonR = radius * 0.38;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const px = Math.cos(angle) * pentagonR;
    const py = Math.sin(angle) * pentagonR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  // Outer panel stitches
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * Math.PI / 180;
    const px = Math.cos(angle) * pentagonR;
    const py = Math.sin(angle) * pentagonR;
    const ox = Math.cos(angle) * radius;
    const oy = Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  }

  // Ball Specular Highlight
  ctx.restore();
  const specGrad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, 1, x, y, radius);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
  specGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.type === 'confetti') {
      ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawGoalCelebration(ctx: CanvasRenderingContext2D, state: GameState) {
  const text = state.lastGoalScorer === 'player1' ? 'GOAL! PLAYER 1 🎉' : 'GOAL! PLAYER 2 🎉';

  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(0, GAME_HEIGHT / 2 - 50, GAME_WIDTH, 100);

  ctx.font = '900 48px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Neon text glow
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(text, GAME_WIDTH / 2, GAME_HEIGHT / 2);

  ctx.restore();
}

// ============================================================================
// MAIN GAME COMPONENT
// ============================================================================

export default function HeadBallGame({ onBack }: HeadBallGameProps) {
  const [gameMode, setGameMode] = useState<'menu' | 'playing' | 'paused' | 'gameOver' | 'lobby'>('menu');
  const [playMode, setPlayMode] = useState<'ai' | 'local' | 'online'>('ai');

  // Selected Characters
  const [p1Character, setP1Character] = useState<CharacterSkin>(CHARACTERS[0]);
  const [p2Character, setP2Character] = useState<CharacterSkin>(CHARACTERS[1]);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gameState, setGameState] = useState<GameState>(() => createInitialGameState(CHARACTERS[0], CHARACTERS[1]));

  // Particles & Screen Effects
  const particlesRef = useRef<Particle[]>([]);

  // Online Multiplayer State
  const [roomCode, setRoomCode] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [isHost, setIsHost] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [connectionError, setConnectionError] = useState<string>("");
  const wsRef = useRef<WebSocket | PartySocket | null>(null);

  // Power-up cooldowns
  const [p1Cooldowns, setP1Cooldowns] = useState<Map<PowerUpType, number>>(new Map());
  const [p2Cooldowns, setP2Cooldowns] = useState<Map<PowerUpType, number>>(new Map());

  // Score submission
  const [playerName, setPlayerName] = useState<string>("");
  const [showScoreSubmit, setShowScoreSubmit] = useState<boolean>(false);
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  // Mobile Touch Controls
  const touchControlsRef = useRef<KeyState>({
    left: false, right: false, up: false, lowKick: false, highKick: false
  });

  // Loop refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const keysRef = useRef<{ p1: KeyState; p2: KeyState }>({
    p1: { left: false, right: false, up: false, lowKick: false, highKick: false },
    p2: { left: false, right: false, up: false, lowKick: false, highKick: false }
  });
  const lastTimeRef = useRef<number>(0);
  const frameIdRef = useRef<number>(0);

  const queryClient = useQueryClient();

  // Sync sound setting
  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery({
    queryKey: ['/api/games/headball/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('headball_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/headball/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Leo 🐐", score: 8, timeInSeconds: 90 },
        { id: 2, playerName: "CR7 ⚡", score: 7, timeInSeconds: 90 },
        { id: 3, playerName: "Baku AI 🤖", score: 6, timeInSeconds: 90 },
        { id: 4, playerName: "Kylian 👑", score: 5, timeInSeconds: 90 },
        { id: 5, playerName: "Tabriz ⚽", score: 4, timeInSeconds: 90 },
      ];
      const merged = [...localList, ...defaults];
      return merged.sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number; timeInSeconds: number }) => {
      try {
        const stored = localStorage.getItem('headball_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('headball_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/headball/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/headball/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/headball/scores'] });
      setScoreSubmitted(true);
    }
  });

  // PartyKit Multiplayer Configuration
  const isDevelopment = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const PARTYKIT_HOST = isDevelopment ? "localhost:1999" : "tabriz-portfolio-games.tebriz993.partykit.dev";

  const generateRoomCode = useCallback(() => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }, []);

  const connectToRoom = useCallback((roomId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setConnectionStatus('connecting');
    setConnectionError("");

    try {
      const ps = new PartySocket({
        host: PARTYKIT_HOST,
        room: `headball-${roomId}`,
      });

      ps.onopen = () => {
        setConnectionStatus('connected');
        if (isHost) {
          ps.send(JSON.stringify({ type: 'HOST_JOIN', payload: { roomId } }));
        } else {
          ps.send(JSON.stringify({ type: 'CLIENT_JOIN', payload: { roomId } }));
        }
      };

      ps.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'START_GAME') {
            setGameMode('playing');
            sound.playWhistle('short');
          } else if (data.type === 'GAME_STATE' && !isHost) {
            setGameState(data.payload);
          } else if (data.type === 'PLAYER_INPUT' && isHost) {
            keysRef.current.p2 = data.payload;
          }
        } catch {}
      };

      ps.onerror = () => {
        setConnectionStatus('error');
        setConnectionError("Failed to connect to multiplayer server");
      };

      wsRef.current = ps;
    } catch {
      setConnectionStatus('error');
      setConnectionError("PartyKit connection failed");
    }
  }, [PARTYKIT_HOST, isHost]);

  const createRoom = useCallback(() => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setPlayMode('online');
    setGameMode('lobby');
    connectToRoom(code);
  }, [generateRoomCode, connectToRoom]);

  const joinRoom = useCallback(() => {
    if (joinCode.length !== 6) return;
    setIsHost(false);
    setPlayMode('online');
    setRoomCode(joinCode);
    connectToRoom(joinCode);
  }, [joinCode, connectToRoom]);

  // Start match
  const startGame = (mode: 'ai' | 'local' | 'online') => {
    setPlayMode(mode);
    setScoreSubmitted(false);
    setShowScoreSubmit(false);
    setGameState(createInitialGameState(p1Character, p2Character));
    setGameMode('playing');
    sound.playWhistle('double');
  };

  const finishMatchEarly = () => {
    sound.playWhistle('long');
    setGameMode('gameOver');
    setShowScoreSubmit(true);
    setScoreSubmitted(false);
  };

  const resetGame = () => {
    if (wsRef.current) wsRef.current.close();
    setGameMode('menu');
    setScoreSubmitted(false);
    setShowScoreSubmit(false);
    setGameState(createInitialGameState(p1Character, p2Character));
  };

  // Keyboard Event Handlers
  useEffect(() => {
    if (gameMode !== 'playing') return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

      const code = e.code;

      // Player 1 controls
      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.p1.left = true;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.p1.right = true;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.p1.up = true;
      if (code === 'Space' || code === 'KeyF') keysRef.current.p1.lowKick = true;
      if (code === 'KeyE') keysRef.current.p1.highKick = true;

      // Player 1 Power-ups (1 to 4)
      if (code === 'Digit1') usePowerUp('player1', 'freeze');
      if (code === 'Digit2') usePowerUp('player1', 'speed');
      if (code === 'Digit3') usePowerUp('player1', 'giant');
      if (code === 'Digit4') usePowerUp('player1', 'fireball');

      // Player 2 controls in Local mode
      if (playMode === 'local') {
        if (code === 'KeyJ') keysRef.current.p2.left = true;
        if (code === 'KeyL') keysRef.current.p2.right = true;
        if (code === 'KeyI') keysRef.current.p2.up = true;
        if (code === 'KeyU') keysRef.current.p2.lowKick = true;
        if (code === 'KeyO') keysRef.current.p2.highKick = true;

        if (code === 'Digit7') usePowerUp('player2', 'freeze');
        if (code === 'Digit8') usePowerUp('player2', 'speed');
        if (code === 'Digit9') usePowerUp('player2', 'giant');
        if (code === 'Digit0') usePowerUp('player2', 'fireball');
      }

      // Online input stream
      if (playMode === 'online' && !isHost && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'PLAYER_INPUT',
          payload: keysRef.current.p1
        }));
      }
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

      const code = e.code;

      if (code === 'KeyA' || code === 'ArrowLeft') keysRef.current.p1.left = false;
      if (code === 'KeyD' || code === 'ArrowRight') keysRef.current.p1.right = false;
      if (code === 'KeyW' || code === 'ArrowUp') keysRef.current.p1.up = false;
      if (code === 'Space' || code === 'KeyF') keysRef.current.p1.lowKick = false;
      if (code === 'KeyE') keysRef.current.p1.highKick = false;

      if (playMode === 'local') {
        if (code === 'KeyJ') keysRef.current.p2.left = false;
        if (code === 'KeyL') keysRef.current.p2.right = false;
        if (code === 'KeyI') keysRef.current.p2.up = false;
        if (code === 'KeyU') keysRef.current.p2.lowKick = false;
        if (code === 'KeyO') keysRef.current.p2.highKick = false;
      }

      if (playMode === 'online' && !isHost && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'PLAYER_INPUT',
          payload: keysRef.current.p1
        }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameMode, playMode, isHost]);

  // Mobile Touch Event Handlers
  const handleTouch = useCallback((control: keyof KeyState, pressed: boolean) => {
    touchControlsRef.current[control] = pressed;
    keysRef.current.p1[control] = pressed;

    if (playMode === 'online' && !isHost && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'PLAYER_INPUT',
        payload: keysRef.current.p1
      }));
    }
  }, [playMode, isHost]);

  // Use Power-Up
  const usePowerUp = useCallback((playerKey: 'player1' | 'player2', type: PowerUpType) => {
    const cooldowns = playerKey === 'player1' ? p1Cooldowns : p2Cooldowns;
    const setCooldowns = playerKey === 'player1' ? setP1Cooldowns : setP2Cooldowns;
    const now = Date.now();

    if (cooldowns.get(type) && cooldowns.get(type)! > now) return;

    const power = POWER_UPS.find(p => p.type === type);
    if (!power) return;

    setCooldowns(prev => new Map(prev).set(type, now + power.cooldown));
    sound.playPowerUp(type);

    setGameState(prev => {
      const next = { ...prev };
      const me = playerKey === 'player1' ? 'player1' : 'player2';
      const enemy = playerKey === 'player1' ? 'player2' : 'player1';

      if (type === 'freeze') {
        next[enemy] = { ...next[enemy], frozen: true, frozenEndTime: now + power.duration };
      } else if (type === 'speed') {
        next[me] = { ...next[me], powerUp: 'speed', powerUpEndTime: now + power.duration };
      } else if (type === 'giant') {
        next[me] = { ...next[me], giant: true, giantEndTime: now + power.duration };
      } else if (type === 'fireball') {
        next.ball = {
          ...next.ball,
          isFireball: true,
          fireballEndTime: now + power.duration,
          vx: next.ball.vx * 1.6,
          vy: next.ball.vy * 1.6
        };
      }
      return next;
    });
  }, [p1Cooldowns, p2Cooldowns]);

  // Confetti spawner
  const spawnConfetti = useCallback((scorer: 'player1' | 'player2') => {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#8b5cf6', '#ffffff'];
    const originX = scorer === 'player1' ? GAME_WIDTH - 80 : 80;

    for (let i = 0; i < 70; i++) {
      particlesRef.current.push({
        x: originX + (Math.random() - 0.5) * 60,
        y: GROUND_Y - GOAL_HEIGHT + Math.random() * 40,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 12 - 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 3,
        alpha: 1,
        life: 0,
        maxLife: 60 + Math.random() * 40,
        type: 'confetti'
      });
    }
  }, []);

  // Main Loop
  const gameLoop = useCallback((timestamp: number) => {
    if (gameMode !== 'playing') return;

    const delta = timestamp - lastTimeRef.current;
    if (delta < 16) {
      frameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }
    lastTimeRef.current = timestamp;

    const state = gameStateRef.current;
    const now = Date.now();

    // Client renderer in online mode
    if (playMode === 'online' && !isHost) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) drawGame(ctx, state, particlesRef.current);
      }
      frameIdRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    let next = { ...state };

    // Clear expired power-ups
    if (next.player1.frozen && now > next.player1.frozenEndTime) next.player1.frozen = false;
    if (next.player2.frozen && now > next.player2.frozenEndTime) next.player2.frozen = false;
    if (next.player1.powerUp === 'speed' && now > next.player1.powerUpEndTime) next.player1.powerUp = null;
    if (next.player2.powerUp === 'speed' && now > next.player2.powerUpEndTime) next.player2.powerUp = null;
    if (next.player1.giant && now > next.player1.giantEndTime) next.player1.giant = false;
    if (next.player2.giant && now > next.player2.giantEndTime) next.player2.giant = false;
    if (next.ball.isFireball && now > next.ball.fireballEndTime) next.ball.isFireball = false;

    // Decay screen shake
    if (next.screenShake > 0) next.screenShake *= 0.88;

    // AI inputs in vs AI mode
    let p2Keys = keysRef.current.p2;
    if (playMode === 'ai') {
      p2Keys = updateAI(next.player2, next.ball, next.player1, 0.88);
    }

    // Update Player 1
    next.player1 = updatePlayerPhysics(next.player1, keysRef.current.p1, next.ball, particlesRef.current);

    // Update Player 2
    next.player2 = updatePlayerPhysics(next.player2, p2Keys, next.ball, particlesRef.current);

    // Update Ball
    next.ball = updateBallPhysics(next.ball, particlesRef.current);

    // Collisions & Kicks
    const p1Col = handleKickingAndCollision(next.player1, next.ball, particlesRef.current);
    next.player1 = p1Col.player;
    next.ball = p1Col.ball;

    const p2Col = handleKickingAndCollision(next.player2, next.ball, particlesRef.current);
    next.player2 = p2Col.player;
    next.ball = p2Col.ball;

    // Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity on particles
      p.life += 1;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);
      if (p.life >= p.maxLife) particlesRef.current.splice(i, 1);
    }

    // Goal Check
    const scorer = checkGoal(next.ball);
    if (scorer && next.goalAnimation === 0) {
      next.goalAnimation = scorer === 'player1' ? 1 : 2;
      next.lastGoalScorer = scorer;
      next.screenShake = 16;
      sound.playGoal();
      sound.playWhistle('long');
      spawnConfetti(scorer);

      if (scorer === 'player1') next.player1.score += 1;
      else next.player2.score += 1;

      // Reset positions after celebration
      setTimeout(() => {
        setGameState(cur => ({
          ...cur,
          player1: { ...cur.player1, x: 160, y: GROUND_Y - BASE_RADIUS, vx: 0, vy: 0 },
          player2: { ...cur.player2, x: GAME_WIDTH - 160, y: GROUND_Y - BASE_RADIUS, vx: 0, vy: 0 },
          ball: createInitialBall(),
          goalAnimation: 0
        }));
        sound.playWhistle('short');
      }, 2200);
    }

    setGameState(next);

    // Send state to peer in host online mode
    if (playMode === 'online' && isHost && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'GAME_STATE', payload: next }));
    }

    // Draw frame
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) drawGame(ctx, next, particlesRef.current);
    }

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameMode, playMode, isHost, spawnConfetti]);

  useEffect(() => {
    if (gameMode === 'playing') {
      lastTimeRef.current = performance.now();
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    return () => cancelAnimationFrame(frameIdRef.current);
  }, [gameMode, gameLoop]);

  // Match countdown timer
  useEffect(() => {
    if (gameMode !== 'playing') return;
    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          sound.playWhistle('long');
          setGameMode('gameOver');
          setShowScoreSubmit(true);
          return { ...prev, timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameMode]);

  const handleSubmitScore = () => {
    if (!playerName.trim()) return;
    submitScoreMutation.mutate({
      playerName: playerName.trim(),
      score: gameState.player1.score,
      timeInSeconds: MATCH_DURATION - gameState.timeLeft
    });
  };

  // ============================================================================
  // RENDER: MENU SCREEN
  // ============================================================================

  if (gameMode === 'menu') {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4 overflow-y-auto">
        <div className="max-w-3xl w-full my-auto space-y-6 py-6">
          {/* Header & Title */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="rounded-xl">
              <ChevronLeft className="h-4 w-4 mr-1" />
              All Games
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="rounded-xl"
                title={soundEnabled ? "Mute SFX" : "Enable SFX"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
              </Button>
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              Pro Edition • 2026 Head Ball Arena
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gradient">
              ⚽ HEAD BALL 2026
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Real 1v1 soccer showdown with animated cleats, low/high driven kicks, dynamic crowd, and game-changing superpowers!
            </p>
          </div>

          {/* Character Selector Carousel */}
          <Card className="glass-panel border-border/80 shadow-md rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Your Superstar
                </span>
                <span className="text-xs font-bold text-primary">
                  {p1Character.flag} {p1Character.name} — {p1Character.title}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {CHARACTERS.map((char) => {
                  const isSelected = p1Character.id === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() => setP1Character(char)}
                      className={`p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 relative ${
                        isSelected
                          ? "bg-primary/10 border-primary ring-2 ring-primary/30 shadow-md scale-102"
                          : "bg-card/60 border-border/70 hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div 
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-inner relative"
                        style={{ backgroundColor: char.skinTone }}
                      >
                        <div 
                          className="absolute inset-x-1 top-0 h-4 rounded-t-full"
                          style={{ backgroundColor: char.hairColor }}
                        />
                        <span className="relative z-10">{char.flag}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs truncate max-w-full">{char.name}</div>
                        <div className="text-[10px] text-muted-foreground">{char.country}</div>
                      </div>
                      <div className="w-full flex justify-between text-[10px] text-muted-foreground px-1 border-t border-border/40 pt-1">
                        <span>⚡ {char.speed}</span>
                        <span>💥 {char.power}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Play Modes Grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/60 cursor-pointer p-4 text-center" onClick={() => startGame('ai')}>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center text-2xl mb-3 shadow-sm">
                🤖
              </div>
              <h3 className="font-bold text-base mb-1">Single Player</h3>
              <p className="text-xs text-muted-foreground mb-4">Play against smart tactical AI</p>
              <Button className="w-full rounded-xl bg-primary text-primary-foreground font-semibold">Play vs AI</Button>
            </Card>

            <Card className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/60 cursor-pointer p-4 text-center" onClick={() => startGame('local')}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center text-2xl mb-3 shadow-sm">
                👥
              </div>
              <h3 className="font-bold text-base mb-1">Local 2 Players</h3>
              <p className="text-xs text-muted-foreground mb-4">Battle a friend on one keyboard</p>
              <Button variant="outline" className="w-full rounded-xl font-semibold">Local Match</Button>
            </Card>

            <Card className="glass-panel card-hover-effect rounded-2xl border-border/70 hover:border-primary/60 cursor-pointer p-4 text-center" onClick={createRoom}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 mx-auto flex items-center justify-center text-2xl mb-3 shadow-sm">
                🌐
              </div>
              <h3 className="font-bold text-base mb-1">Online Match</h3>
              <p className="text-xs text-muted-foreground mb-4">Host or join via 6-digit room code</p>
              <Button variant="secondary" className="w-full rounded-xl font-semibold">Create Room</Button>
            </Card>
          </div>

          {/* Controls Quick Reference & Top Leaderboard */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="glass-panel rounded-2xl border-border/70 p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-500" /> Kicking & Controls
              </h4>
              <div className="space-y-1.5 text-xs text-foreground/90">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Move Left / Right</span>
                  <span className="font-mono font-semibold">A / D or ← / →</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">Jump (Headers)</span>
                  <span className="font-mono font-semibold">W or ↑</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">🦶 Low Kick (Driven Shot)</span>
                  <span className="font-mono font-bold text-primary">Space or F</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span className="text-muted-foreground">⚡ High Kick (Lob / Chip)</span>
                  <span className="font-mono font-bold text-purple-500">E</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Superpowers</span>
                  <span className="font-mono font-semibold">1, 2, 3, 4</span>
                </div>
              </div>
            </Card>

            <Card className="glass-panel rounded-2xl border-border/70 p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-yellow-500" /> Arena Hall of Fame
              </h4>
              <div className="space-y-1.5 text-xs">
                {topScores.slice(0, 5).map((s: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-border/40 last:border-0">
                    <span className="font-medium truncate max-w-[140px]">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`} {s.playerName}
                    </span>
                    <span className="font-mono font-bold text-primary">{s.score} Goals</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: LOBBY SCREEN (Online)
  // ============================================================================

  if (gameMode === 'lobby') {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 glass-panel p-8 rounded-3xl border border-primary/30 shadow-2xl">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight">Arena Room Ready!</h2>
            <p className="text-xs text-muted-foreground">Share this room code with your opponent:</p>
          </div>

          <div className="py-4">
            <div className="text-5xl font-mono font-black tracking-widest text-primary bg-primary/10 py-4 rounded-2xl border border-primary/30 select-all shadow-inner">
              {roomCode}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-500 animate-pulse">
            <Zap className="h-4 w-4" />
            <span>Waiting for challenger to connect...</span>
          </div>

          {connectionError && (
            <div className="p-3 bg-destructive/15 border border-destructive/30 rounded-xl text-xs text-destructive">
              {connectionError}
            </div>
          )}

          <Button variant="ghost" onClick={resetGame} className="rounded-xl w-full">
            Back to Menu
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: PLAYING SCREEN
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-background flex flex-col select-none overflow-hidden">
      {/* Top TV Broadcast Scoreboard */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 bg-card/85 backdrop-blur-md border-b border-border/80 shadow-sm shrink-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {onBack && (
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
          )}
          <Button variant="outline" size="sm" onClick={resetGame} className="h-8 px-2.5 rounded-xl text-xs font-semibold">
            ← Menu
          </Button>
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-muted/60 border border-border/60">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono font-bold text-xs sm:text-sm">
              {Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          {playMode === 'ai' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={finishMatchEarly}
              className="h-8 px-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 border border-border/50 hover:bg-muted"
              title="Finish match early and save score"
            >
              <span>🏁 End & Save</span>
            </Button>
          )}
        </div>

        {/* Dynamic Match Score */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2 text-right">
            <span className="text-xs font-bold text-foreground hidden sm:inline">{p1Character.name}</span>
            <span className="text-lg sm:text-2xl font-black text-blue-500 bg-blue-500/10 px-3 py-0.5 rounded-xl border border-blue-500/20">
              {gameState.player1.score}
            </span>
          </div>

          <span className="text-muted-foreground font-black text-sm">VS</span>

          <div className="flex items-center gap-2 text-left">
            <span className="text-lg sm:text-2xl font-black text-red-500 bg-red-500/10 px-3 py-0.5 rounded-xl border border-red-500/20">
              {gameState.player2.score}
            </span>
            <span className="text-xs font-bold text-foreground hidden sm:inline">
              {playMode === 'ai' ? 'AI Bot 🤖' : p2Character.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 rounded-xl"
            title={soundEnabled ? "Mute SFX" : "Enable SFX"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 hidden md:inline">
            {playMode === 'ai' ? '🤖 vs AI' : playMode === 'local' ? '👥 2P' : '🌐 Online'}
          </span>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-full max-h-full aspect-[840/460]"
          style={{ imageRendering: 'auto' }}
        />
      </div>

      {/* Desktop Quick Power-Up Toolbar */}
      <div className="hidden md:flex justify-between items-center px-6 py-2.5 bg-card/80 border-t border-border/80 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-500 mr-2">P1 Powers:</span>
          {POWER_UPS.map((power, idx) => {
            const cooldownEnd = p1Cooldowns.get(power.type) || 0;
            const isOnCooldown = cooldownEnd > Date.now();
            const cooldownLeft = isOnCooldown ? Math.ceil((cooldownEnd - Date.now()) / 1000) : 0;

            return (
              <Button
                key={power.type}
                variant="outline"
                size="sm"
                disabled={isOnCooldown}
                onClick={() => usePowerUp('player1', power.type)}
                className="h-9 px-3 rounded-xl border border-border/70 hover:border-primary/50 relative font-semibold text-xs"
              >
                <span className="mr-1.5">{power.icon}</span>
                <span>{power.name}</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground">
                  {idx + 1}
                </kbd>
                {isOnCooldown && (
                  <div className="absolute inset-0 bg-slate-950/75 rounded-xl flex items-center justify-center text-xs font-mono font-bold text-amber-400">
                    {cooldownLeft}s
                  </div>
                )}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>🦶 Low Kick: <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-bold">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-bold">F</kbd></span>
          <span>⚡ High Kick: <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-bold">E</kbd></span>
          <span>Jump: <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground font-bold">W</kbd></span>
        </div>
      </div>

      {/* Mobile Touch Action Controls */}
      <div className="md:hidden shrink-0 px-4 py-3 bg-card/90 border-t border-border/80">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {/* Directional Pad */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-2xl active:bg-primary active:text-white touch-none"
              onTouchStart={(e) => { e.preventDefault(); handleTouch('left', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('left', false); }}
              onMouseDown={() => handleTouch('left', true)}
              onMouseUp={() => handleTouch('left', false)}
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 w-14 rounded-2xl active:bg-primary active:text-white touch-none"
              onTouchStart={(e) => { e.preventDefault(); handleTouch('right', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('right', false); }}
              onMouseDown={() => handleTouch('right', true)}
              onMouseUp={() => handleTouch('right', false)}
            >
              <ChevronRight className="h-7 w-7" />
            </Button>
          </div>

          {/* Action Buttons: Low Kick, High Kick, Jump */}
          <div className="flex items-center gap-2">
            {/* Low Kick */}
            <Button
              variant="default"
              size="lg"
              className="h-14 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-500 font-bold text-xs touch-none flex flex-col items-center justify-center shadow-md"
              onTouchStart={(e) => { e.preventDefault(); handleTouch('lowKick', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('lowKick', false); }}
              onMouseDown={() => handleTouch('lowKick', true)}
              onMouseUp={() => handleTouch('lowKick', false)}
            >
              <span>🦶</span>
              <span>LOW</span>
            </Button>

            {/* High Kick */}
            <Button
              variant="default"
              size="lg"
              className="h-14 px-3 rounded-2xl bg-purple-600 hover:bg-purple-700 active:bg-purple-500 font-bold text-xs touch-none flex flex-col items-center justify-center shadow-md"
              onTouchStart={(e) => { e.preventDefault(); handleTouch('highKick', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('highKick', false); }}
              onMouseDown={() => handleTouch('highKick', true)}
              onMouseUp={() => handleTouch('highKick', false)}
            >
              <span>⚡</span>
              <span>HIGH</span>
            </Button>

            {/* Jump */}
            <Button
              variant="default"
              size="lg"
              className="h-14 w-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-500 touch-none shadow-md"
              onTouchStart={(e) => { e.preventDefault(); handleTouch('up', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('up', false); }}
              onMouseDown={() => handleTouch('up', true)}
              onMouseUp={() => handleTouch('up', false)}
            >
              <ArrowUp className="h-7 w-7" />
            </Button>
          </div>
        </div>
      </div>

      {/* Match Over Modal */}
      {gameMode === 'gameOver' && showScoreSubmit && (
        <div className="absolute inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-7 text-center space-y-4">
              <Trophy className="h-14 w-14 mx-auto text-yellow-500 animate-bounce" />
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tight">Full Time!</h2>
                <p className="text-sm text-muted-foreground">The final referee whistle has blown.</p>
              </div>

              <div className="p-4 rounded-2xl bg-card/80 border border-border/60">
                <div className="text-2xl font-black mb-1">
                  <span className="text-blue-500">{gameState.player1.score}</span>
                  <span className="mx-2 text-muted-foreground">-</span>
                  <span className="text-red-500">{gameState.player2.score}</span>
                </div>
                <p className="text-sm font-bold text-primary">
                  {gameState.player1.score > gameState.player2.score
                    ? '🏆 Victory! Player 1 Wins!'
                    : gameState.player1.score < gameState.player2.score
                    ? 'AI / Player 2 Wins!'
                    : '🤝 Hard-Fought Draw!'}
                </p>
              </div>

              {scoreSubmitted ? (
                <div className="space-y-4 pt-2">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col items-center gap-1.5">
                    <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                    <span className="font-bold text-sm">Result Successfully Recorded!</span>
                    <span className="text-xs text-muted-foreground">Your score has been saved to the Hall of Fame.</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button onClick={() => startGame(playMode)} className="w-full rounded-xl bg-primary text-primary-foreground font-bold">
                      Play Rematch
                    </Button>
                    <div className="flex gap-2">
                      <Button onClick={resetGame} variant="outline" className="flex-1 rounded-xl font-semibold">
                        Leaderboard & Menu
                      </Button>
                      {onBack && (
                        <Button onClick={onBack} variant="secondary" className="flex-1 rounded-xl font-semibold gap-1.5">
                          <Gamepad2 className="h-4 w-4" />
                          All Games
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  <Input
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name for the Hall of Fame"
                    className="rounded-xl text-center font-bold"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitScore}
                      disabled={!playerName.trim() || submitScoreMutation.isPending}
                      className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold"
                    >
                      {submitScoreMutation.isPending ? "Recording..." : "Save Record"}
                    </Button>
                    <Button onClick={resetGame} variant="outline" className="rounded-xl font-semibold">
                      Menu
                    </Button>
                  </div>
                  {onBack && (
                    <Button onClick={onBack} variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
                      ← Back to All Games
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
