import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Trophy, User, List, RotateCcw, Volume2, VolumeX, Pause, Play,
  Sparkles, Flame, Zap, Award, Star, Gamepad2, CheckCircle2,
  Shield, Heart, Crosshair, ArrowRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Dependencies)
// ============================================================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playBouncePaddle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  playHitBrick(pitchOffset: number = 0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const freq = 480 + (pitchOffset % 8) * 45;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  playExplosion() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playLaser() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playPowerup() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.18, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.16);
      });
    } catch {}
  }

  playLoseBall() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.28);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  playStageClear() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.24, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.3);
      });
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface BrickBreakerGameProps {
  onBack: () => void;
}

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 540;

type PowerUpType = "multiball" | "laser" | "expand" | "fireball" | "shield" | "life";

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isFireball: boolean;
  isStuck: boolean;
  stuckOffset: number;
}

interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  glow: string;
  hits: number;
  maxHits: number;
  type: "normal" | "steel" | "tnt" | "gold";
  powerUp?: PowerUpType;
}

interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: PowerUpType;
  color: string;
}

interface LaserBullet {
  x: number;
  y: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

// ============================================================================
// STAGE GENERATORS
// ============================================================================

function generateStageBricks(stage: number): Brick[] {
  const bricks: Brick[] = [];
  let id = 1;

  const brickWidth = 62;
  const brickHeight = 22;
  const paddingX = 8;
  const paddingY = 8;
  const startX = 35;
  const startY = 55;
  const cols = 10;

  if (stage === 1) {
    // Stage 1: Neon Prism (5 rows rainbow)
    const rowColors = [
      { color: "#ef4444", glow: "rgba(239, 68, 68, 0.5)" }, // Red
      { color: "#f97316", glow: "rgba(249, 115, 22, 0.5)" }, // Orange
      { color: "#eab308", glow: "rgba(234, 179, 8, 0.5)" }, // Yellow
      { color: "#22c55e", glow: "rgba(34, 197, 94, 0.5)" }, // Green
      { color: "#06b6d4", glow: "rgba(6, 182, 212, 0.5)" }, // Cyan
    ];

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (brickWidth + paddingX);
        const y = startY + r * (brickHeight + paddingY);
        let type: Brick["type"] = "normal";
        let maxHits = 1;
        let powerUp: PowerUpType | undefined;

        if (r === 0 && (c === 2 || c === 7)) {
          type = "steel";
          maxHits = 2;
        } else if (r === 2 && (c === 4 || c === 5)) {
          type = "tnt";
        } else if (Math.random() < 0.22) {
          const powerChoices: PowerUpType[] = ["multiball", "laser", "expand", "fireball", "shield"];
          powerUp = powerChoices[Math.floor(Math.random() * powerChoices.length)];
        }

        bricks.push({
          id: id++,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          color: type === "steel" ? "#94a3b8" : type === "tnt" ? "#dc2626" : rowColors[r].color,
          glow: type === "steel" ? "rgba(148, 163, 184, 0.5)" : type === "tnt" ? "rgba(220, 38, 38, 0.7)" : rowColors[r].glow,
          hits: 0,
          maxHits,
          type,
          powerUp
        });
      }
    }
  } else if (stage === 2) {
    // Stage 2: Cyber Fortress (Pyramid / Castle with TNT cores)
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < cols; c++) {
        if ((r === 0 || r === 1) && (c < 2 || c > 7)) continue; // Turret gaps
        const x = startX + c * (brickWidth + paddingX);
        const y = startY + r * (brickHeight + paddingY);

        let type: Brick["type"] = "normal";
        let maxHits = 1;
        let color = "#8b5cf6";
        let glow = "rgba(139, 92, 246, 0.5)";
        let powerUp: PowerUpType | undefined;

        if (c === 4 || c === 5) {
          type = "tnt";
          color = "#dc2626";
          glow = "rgba(220, 38, 38, 0.7)";
        } else if (r === 2 || r === 4) {
          type = "steel";
          maxHits = 2;
          color = "#0ea5e9";
          glow = "rgba(14, 165, 233, 0.5)";
        } else if (Math.random() < 0.25) {
          type = "gold";
          color = "#f59e0b";
          glow = "rgba(245, 158, 11, 0.6)";
          const powerChoices: PowerUpType[] = ["multiball", "laser", "expand", "fireball", "shield", "life"];
          powerUp = powerChoices[Math.floor(Math.random() * powerChoices.length)];
        }

        bricks.push({
          id: id++,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          color,
          glow,
          hits: 0,
          maxHits,
          type,
          powerUp
        });
      }
    }
  } else {
    // Stage 3: Diamond Matrix (Vortex geometry with heavily fortified core)
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < cols; c++) {
        const distFromCenter = Math.abs(c - 4.5) + Math.abs(r - 3);
        if (distFromCenter > 5) continue;

        const x = startX + c * (brickWidth + paddingX);
        const y = startY + r * (brickHeight + paddingY);

        let type: Brick["type"] = "normal";
        let maxHits = 1;
        let color = "#ec4899";
        let glow = "rgba(236, 72, 153, 0.5)";
        let powerUp: PowerUpType | undefined;

        if (distFromCenter <= 1.5) {
          type = "tnt";
          color = "#dc2626";
          glow = "rgba(220, 38, 38, 0.7)";
        } else if (distFromCenter <= 3) {
          type = "steel";
          maxHits = 3;
          color = "#38bdf8";
          glow = "rgba(56, 189, 248, 0.6)";
        } else if (Math.random() < 0.3) {
          type = "gold";
          color = "#eab308";
          glow = "rgba(234, 179, 8, 0.6)";
          const powerChoices: PowerUpType[] = ["multiball", "laser", "expand", "fireball", "shield"];
          powerUp = powerChoices[Math.floor(Math.random() * powerChoices.length)];
        }

        bricks.push({
          id: id++,
          x,
          y,
          width: brickWidth,
          height: brickHeight,
          color,
          glow,
          hits: 0,
          maxHits,
          type,
          powerUp
        });
      }
    }
  }

  return bricks;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrickBreakerGame({ onBack }: BrickBreakerGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isStageClear, setIsStageClear] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [stage, setStage] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combos, setCombos] = useState<number>(0);
  const [bricksShattered, setBricksShattered] = useState<number>(0);

  // Active Powerups Status
  const [hasLaser, setHasLaser] = useState<boolean>(false);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [laserTimer, setLaserTimer] = useState<number>(0);

  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  // Game Physics State (Refs for 60fps Animation Loop)
  const paddleRef = useRef({
    x: CANVAS_WIDTH / 2 - 55,
    y: CANVAS_HEIGHT - 32,
    width: 110,
    height: 16,
    speed: 8.5
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[]>([]);
  const powerUpsRef = useRef<PowerUpItem[]>([]);
  const lasersRef = useRef<LaserBullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);

  const keysPressed = useRef<Set<string>>(new Set());
  const mouseTrackingRef = useRef<boolean>(true);
  const animationFrameRef = useRef<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load High Score
  useEffect(() => {
    const saved = localStorage.getItem("brick_breaker_highscore");
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/brick-breaker/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('brick_breaker_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/brick-breaker/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Arkanoid Master 🕹️", score: 8600, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 6200, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Cyber Smasher 💥", score: 4500, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Breaker 🧱", score: 3100, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Neon Striker 🌟", score: 1800, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('brick_breaker_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('brick_breaker_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'brick-breaker' }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/brick-breaker/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Spawn visual sparkles
  const spawnParticles = useCallback((x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3 + 1.5,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 10
      });
    }
  }, []);

  // Launch initial ball stuck on paddle
  const spawnInitialBall = useCallback((isStuck = true) => {
    const p = paddleRef.current;
    ballsRef.current = [{
      x: p.x + p.width / 2,
      y: p.y - 10,
      vx: 4 * (Math.random() > 0.5 ? 1 : -1),
      vy: -5.5,
      radius: 7,
      isFireball: false,
      isStuck,
      stuckOffset: p.width / 2
    }];
  }, []);

  // Fire paddle lasers
  const shootLasers = useCallback(() => {
    const p = paddleRef.current;
    sound.playLaser();
    lasersRef.current.push(
      { x: p.x + 8, y: p.y - 4, vy: -9 },
      { x: p.x + p.width - 8, y: p.y - 4, vy: -9 }
    );
  }, []);

  // Trigger TNT explosion chain reaction
  const explodeTNT = useCallback((originX: number, originY: number) => {
    sound.playExplosion();
    spawnParticles(originX, originY, "#ef4444", 25);

    const blastRadius = 90;
    bricksRef.current = bricksRef.current.map(b => {
      const dist = Math.hypot(b.x + b.width / 2 - originX, b.y + b.height / 2 - originY);
      if (dist < blastRadius) {
        setScore(s => s + 60);
        setBricksShattered(bs => bs + 1);
        spawnParticles(b.x + b.width / 2, b.y + b.height / 2, b.color, 8);
        return { ...b, hits: b.maxHits }; // destroyed!
      }
      return b;
    });
  }, [spawnParticles]);

  // Apply collected power-up
  const applyPowerUp = useCallback((type: PowerUpType) => {
    sound.playPowerup();
    if (type === "multiball") {
      const currentBalls = [...ballsRef.current];
      currentBalls.forEach(b => {
        ballsRef.current.push(
          { ...b, vx: -b.vx + (Math.random() - 0.5), vy: b.vy + (Math.random() - 0.5) },
          { ...b, vx: b.vx * 0.8, vy: -Math.abs(b.vy) * 0.9 }
        );
      });
    } else if (type === "laser") {
      setHasLaser(true);
      setLaserTimer(Date.now() + 12000);
    } else if (type === "expand") {
      setIsExpanded(true);
      paddleRef.current.width = 160;
      setTimeout(() => {
        setIsExpanded(false);
        paddleRef.current.width = 110;
      }, 12000);
    } else if (type === "fireball") {
      ballsRef.current = ballsRef.current.map(b => ({ ...b, isFireball: true }));
      setTimeout(() => {
        ballsRef.current = ballsRef.current.map(b => ({ ...b, isFireball: false }));
      }, 10000);
    } else if (type === "shield") {
      setHasShield(true);
    } else if (type === "life") {
      setLives(l => Math.min(l + 1, 5));
    }
  }, []);

  // Initialize Match / Stage
  const loadStage = useCallback((stg: number) => {
    setStage(stg);
    bricksRef.current = generateStageBricks(stg);
    powerUpsRef.current = [];
    lasersRef.current = [];
    particlesRef.current = [];
    setCombos(0);
    setHasLaser(false);
    setHasShield(false);
    setIsExpanded(false);
    paddleRef.current.width = 110;
    paddleRef.current.x = CANVAS_WIDTH / 2 - 55;
    spawnInitialBall(true);
    setIsStageClear(false);
  }, [spawnInitialBall]);

  // Launch stuck ball
  const launchBall = useCallback(() => {
    let unhitched = false;
    ballsRef.current = ballsRef.current.map(b => {
      if (b.isStuck) {
        unhitched = true;
        return { ...b, isStuck: false };
      }
      return b;
    });
    if (unhitched) {
      sound.playBouncePaddle();
    }
  }, []);

  // Main 60fps Game Loop
  const updateGame = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused || isStageClear) return;

    // 1. Move Paddle with Keyboard Keys
    const p = paddleRef.current;
    if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("KeyA")) {
      p.x = Math.max(8, p.x - p.speed);
    }
    if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("KeyD")) {
      p.x = Math.min(CANVAS_WIDTH - p.width - 8, p.x + p.speed);
    }

    // 2. Auto-laser firing if active
    if (hasLaser && Date.now() < laserTimer) {
      if (Math.random() < 0.08) {
        shootLasers();
      }
    } else if (hasLaser && Date.now() >= laserTimer) {
      setHasLaser(false);
    }

    // 3. Update Lasers
    lasersRef.current = lasersRef.current
      .map(l => ({ ...l, y: l.y + l.vy }))
      .filter(l => l.y > -20);

    lasersRef.current.forEach((l, lIdx) => {
      for (let i = 0; i < bricksRef.current.length; i++) {
        const b = bricksRef.current[i];
        if (b.hits >= b.maxHits) continue;

        if (l.x >= b.x && l.x <= b.x + b.width && l.y >= b.y && l.y <= b.y + b.height) {
          b.hits += 1;
          sound.playHitBrick();
          spawnParticles(l.x, l.y, b.color, 6);
          lasersRef.current.splice(lIdx, 1);

          if (b.hits >= b.maxHits) {
            setScore(s => s + 50);
            setBricksShattered(bs => bs + 1);
            if (b.type === "tnt") explodeTNT(b.x + b.width / 2, b.y + b.height / 2);
          }
          break;
        }
      }
    });

    // 4. Update Power-Up Drops
    powerUpsRef.current = powerUpsRef.current
      .map(pu => ({ ...pu, y: pu.y + pu.vy }))
      .filter(pu => pu.y < CANVAS_HEIGHT + 30);

    powerUpsRef.current.forEach((pu, puIdx) => {
      // Paddle catch detection
      if (
        pu.y + 12 >= p.y &&
        pu.y <= p.y + p.height &&
        pu.x >= p.x &&
        pu.x <= p.x + p.width
      ) {
        applyPowerUp(pu.type);
        spawnParticles(pu.x, pu.y, pu.color, 12);
        powerUpsRef.current.splice(puIdx, 1);
      }
    });

    // 5. Update Balls Physics & Collisions
    let activeBalls = [...ballsRef.current];

    activeBalls = activeBalls.map(ball => {
      if (ball.isStuck) {
        return {
          ...ball,
          x: p.x + ball.stuckOffset,
          y: p.y - ball.radius - 1
        };
      }

      let nextX = ball.x + ball.vx;
      let nextY = ball.y + ball.vy;

      // Wall Bounce (Left & Right)
      if (nextX - ball.radius <= 0) {
        nextX = ball.radius;
        ball.vx = Math.abs(ball.vx);
        sound.playBouncePaddle();
      } else if (nextX + ball.radius >= CANVAS_WIDTH) {
        nextX = CANVAS_WIDTH - ball.radius;
        ball.vx = -Math.abs(ball.vx);
        sound.playBouncePaddle();
      }

      // Ceiling Bounce
      if (nextY - ball.radius <= 0) {
        nextY = ball.radius;
        ball.vy = Math.abs(ball.vy);
        sound.playBouncePaddle();
      }

      // Paddle Collision (Dynamic Angle Bounce)
      if (
        nextY + ball.radius >= p.y &&
        nextY - ball.radius <= p.y + p.height &&
        nextX >= p.x - 4 &&
        nextX <= p.x + p.width + 4 &&
        ball.vy > 0
      ) {
        sound.playBouncePaddle();
        spawnParticles(nextX, p.y, "#38bdf8", 6);
        setCombos(0); // reset combo upon hitting paddle

        // Hit position from -1 (far left) to +1 (far right)
        const hitOffset = (nextX - (p.x + p.width / 2)) / (p.width / 2);
        const maxBounceAngle = (68 * Math.PI) / 180; // 68 degrees
        const bounceAngle = hitOffset * maxBounceAngle;

        const currentSpeed = Math.min(10.5, Math.hypot(ball.vx, ball.vy) * 1.01);
        ball.vx = currentSpeed * Math.sin(bounceAngle);
        ball.vy = -currentSpeed * Math.cos(bounceAngle);
        nextY = p.y - ball.radius;
      }

      // Brick Collisions
      for (let i = 0; i < bricksRef.current.length; i++) {
        const b = bricksRef.current[i];
        if (b.hits >= b.maxHits) continue;

        const brickLeft = b.x;
        const brickRight = b.x + b.width;
        const brickTop = b.y;
        const brickBottom = b.y + b.height;

        if (
          nextX + ball.radius >= brickLeft &&
          nextX - ball.radius <= brickRight &&
          nextY + ball.radius >= brickTop &&
          nextY - ball.radius <= brickBottom
        ) {
          // Brick Hit!
          b.hits += 1;
          const isDestroyed = b.hits >= b.maxHits;

          setCombos(c => {
            const nextCombo = c + 1;
            const points = isDestroyed ? 50 * nextCombo : 20;
            setScore(s => {
              const updated = s + points;
              if (updated > highScore) {
                setHighScore(updated);
                localStorage.setItem("brick_breaker_highscore", updated.toString());
              }
              return updated;
            });
            return nextCombo;
          });

          sound.playHitBrick(combos);
          spawnParticles(nextX, nextY, b.color, isDestroyed ? 14 : 6);

          if (isDestroyed) {
            setBricksShattered(bs => bs + 1);

            // Explosive TNT check
            if (b.type === "tnt") {
              explodeTNT(b.x + b.width / 2, b.y + b.height / 2);
            }

            // Drop Power-Up if equipped
            if (b.powerUp) {
              const puColors: Record<PowerUpType, string> = {
                multiball: "#38bdf8",
                laser: "#ef4444",
                expand: "#22c55e",
                fireball: "#f97316",
                shield: "#06b6d4",
                life: "#ec4899"
              };
              powerUpsRef.current.push({
                id: Date.now() + Math.random(),
                x: b.x + b.width / 2,
                y: b.y + b.height / 2,
                vy: 2.5,
                type: b.powerUp,
                color: puColors[b.powerUp]
              });
            }
          }

          // Unless fireball mode is active, bounce the ball
          if (!ball.isFireball) {
            const overlapX = Math.min(nextX + ball.radius - brickLeft, brickRight - (nextX - ball.radius));
            const overlapY = Math.min(nextY + ball.radius - brickTop, brickBottom - (nextY - ball.radius));

            if (overlapX < overlapY) {
              ball.vx = -ball.vx;
            } else {
              ball.vy = -ball.vy;
            }
          }
          break;
        }
      }

      // Check Bottom Border Loss
      if (nextY - ball.radius > CANVAS_HEIGHT) {
        if (hasShield) {
          // Shield saves the ball!
          sound.playBouncePaddle();
          setHasShield(false);
          ball.vy = -Math.abs(ball.vy);
          nextY = CANVAS_HEIGHT - 35;
        } else {
          return null; // ball fell off screen
        }
      }

      return {
        ...ball,
        x: nextX,
        y: nextY
      };
    }).filter(Boolean) as Ball[];

    // 6. Handle Life Loss when all balls are gone
    if (activeBalls.length === 0) {
      sound.playLoseBall();
      if (lives > 1) {
        setLives(l => l - 1);
        spawnInitialBall(true);
      } else {
        // Game Over!
        setLives(0);
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }
    } else {
      ballsRef.current = activeBalls;
    }

    // 7. Check Stage Clear (All destroyable bricks smashed)
    const remainingTargets = bricksRef.current.filter(b => b.type !== "steel" && b.hits < b.maxHits);
    if (remainingTargets.length === 0 && !isStageClear) {
      sound.playStageClear();
      setIsStageClear(true);
      setScore(s => s + 500 * stage);
    }
  }, [isPlaying, isGameOver, isPaused, isStageClear, hasLaser, laserTimer, hasShield, lives, stage, combos, highScore, shootLasers, applyPowerUp, explodeTNT, spawnParticles, spawnInitialBall]);

  // Render Frame on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      updateGame();

      // Clear Screen
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle Cyber Grid Background
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Bottom Laser Shield Barrier (if active)
      if (hasShield) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#06b6d4";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_HEIGHT - 6);
        ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - 6);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Render Bricks
      bricksRef.current.forEach(b => {
        if (b.hits >= b.maxHits) return;

        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(b.x, b.y, b.width, b.height, 4);
        ctx.fill();

        // Inner beveled highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.beginPath();
        ctx.roundRect(b.x + 2, b.y + 2, b.width - 4, 3, 2);
        ctx.fill();

        // Visual Crack lines for multi-hit steel bricks
        if (b.hits > 0) {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x + 8, b.y + 4);
          ctx.lineTo(b.x + b.width / 2, b.y + b.height - 4);
          ctx.stroke();
        }

        // Special Icon Indicators (TNT or Gold)
        if (b.type === "tnt") {
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText("TNT", b.x + b.width / 2, b.y + b.height / 2 + 3);
        } else if (b.powerUp) {
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, b.y + b.height / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Render Power-Up Drops
      powerUpsRef.current.forEach(pu => {
        ctx.save();
        ctx.fillStyle = pu.color;
        ctx.shadowColor = pu.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(pu.x - 12, pu.y - 8, 24, 16, 8);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        const label = pu.type === "multiball" ? "3x" : pu.type === "laser" ? "LAS" : pu.type === "expand" ? "WID" : pu.type === "fireball" ? "FIR" : pu.type === "shield" ? "SHD" : "+1";
        ctx.fillText(label, pu.x, pu.y + 3);
        ctx.restore();
      });

      // Render Lasers
      lasersRef.current.forEach(l => {
        ctx.save();
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 10;
        ctx.fillRect(l.x - 2, l.y, 4, 12);
        ctx.restore();
      });

      // Render Glowing Paddle
      const p = paddleRef.current;
      ctx.save();
      ctx.fillStyle = isExpanded ? "#22c55e" : hasLaser ? "#ef4444" : "#0284c7";
      ctx.shadowColor = isExpanded ? "#22c55e" : hasLaser ? "#ef4444" : "#38bdf8";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.roundRect(p.x, p.y, p.width, p.height, 8);
      ctx.fill();

      // Top paddle reflective surface
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.roundRect(p.x + 4, p.y + 2, p.width - 8, 3, 2);
      ctx.fill();

      // Laser cannons attachments on paddle
      if (hasLaser) {
        ctx.fillStyle = "#facc15";
        ctx.fillRect(p.x + 6, p.y - 4, 4, 6);
        ctx.fillRect(p.x + p.width - 10, p.y - 4, 4, 6);
      }
      ctx.restore();

      // Render Balls
      ballsRef.current.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.isFireball ? "#f97316" : "#ffffff";
        ctx.shadowColor = b.isFireball ? "#ea580c" : "#38bdf8";
        ctx.shadowBlur = b.isFireball ? 18 : 12;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner core
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(b.x - 1.5, b.y - 1.5, b.radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render Particles
      particlesRef.current = particlesRef.current.map(part => ({
        ...part,
        x: part.x + part.vx,
        y: part.y + part.vy,
        alpha: 1 - part.life / part.maxLife,
        life: part.life + 1
      })).filter(part => part.life < part.maxLife);

      particlesRef.current.forEach(part => {
        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.beginPath();
        ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [updateGame, isExpanded, hasLaser, hasShield]);

  // Mouse & Touch Paddle Tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseTrackingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    const p = paddleRef.current;
    p.x = Math.max(8, Math.min(CANVAS_WIDTH - p.width - 8, mouseX - p.width / 2));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const touchX = (e.touches[0].clientX - rect.left) * scaleX;

    const p = paddleRef.current;
    p.x = Math.max(8, Math.min(CANVAS_WIDTH - p.width - 8, touchX - p.width / 2));
  };

  // Keyboard Event Handlers (With strict input isolation)
  useEffect(() => {
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

      if (e.code === "Escape") {
        if (isPlaying && !isGameOver && !isStageClear) {
          setIsPaused(p => !p);
        }
        return;
      }

      if (!isPlaying || isGameOver || isPaused) return;

      if (e.code === "Space") {
        e.preventDefault();
        launchBall();
        if (hasLaser) shootLasers();
      }

      keysPressed.current.add(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isGameOver, isPaused, isStageClear, hasLaser, launchBall, shootLasers]);

  // Start / Restart match
  const startGame = () => {
    setScore(0);
    setLives(3);
    setBricksShattered(0);
    setCombos(0);
    setIsGameOver(false);
    setIsStageClear(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    loadStage(1);
  };

  // Advance to next stage
  const nextStage = () => {
    loadStage(stage + 1);
  };

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

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold font-mono">
            <span>STAGE {stage}</span>
          </div>

          {/* Lives Counter */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs font-bold font-mono">
            {Array.from({ length: lives }).map((_, i) => (
              <Heart key={i} className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
            ))}
          </div>
        </div>

        {/* Center: Score & Combo Badge */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1.5">Score:</span>
            <span className="text-lg sm:text-2xl font-black text-primary font-mono">{score}</span>
          </div>

          {combos > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black animate-pulse">
              🔥 {combos}x COMBO
            </span>
          )}

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Best: {highScore}</span>
          </div>
        </div>

        {/* Right: Sound, Leaderboard & Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 rounded-xl"
            title={soundEnabled ? "Mute SFX" : "Enable SFX"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>

          {/* Leaderboard Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-xl text-xs font-semibold">
                <Trophy className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                <span className="hidden sm:inline">Records</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto rounded-3xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Neon Breaker Hall of Fame
                </DialogTitle>
              </DialogHeader>
              <div className="mt-3 space-y-2">
                {topScores.length > 0 ? (
                  topScores.map((rec: any, idx: number) => (
                    <div key={rec.id || idx} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/70">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-black ${idx === 0 ? "text-yellow-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sm">{rec.playerName}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-primary">{rec.score} pts</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-6">No scores recorded yet!</p>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {isPlaying && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(p => !p)}
              className="h-8 px-2.5 rounded-xl text-xs font-semibold"
            >
              {isPaused ? <Play className="h-3 w-3 mr-1" /> : <Pause className="h-3 w-3 mr-1" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={startGame}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold"
            title="Start fresh run"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Arcade Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={launchBall}
          className="border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-full max-h-full aspect-[760/540] cursor-crosshair"
        />
      </div>

      {/* Bottom Mobile / Desktop Controls Guide */}
      <div className="shrink-0 bg-card/85 border-t border-border/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-20">
        <div className="flex sm:hidden w-full max-w-sm mx-auto gap-3">
          <Button
            size="lg"
            onClick={launchBall}
            className="flex-1 h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground gap-1.5"
          >
            LAUNCH BALL / FIRE
          </Button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mx-auto">
          <span>Paddle: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Mouse</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">A / D</kbd></span>
          <span>Launch / Fire Lasers: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Click</kbd></span>
          <span>Pause: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Esc</kbd></span>
        </div>
      </div>

      {/* Start Game Overlay */}
      {!isPlaying && !isGameOver && !isStageClear && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Arkanoid • DX-Ball Pro Edition 2026
              </div>

              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🧱 NEON BRICK BREAKER
                </h1>
                <p className="text-xs text-muted-foreground">
                  Shatter neon grids, detonate explosive TNT bricks, collect multiballs & dual lasers, and conquer all stages!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-xs text-left">
                <div><span className="font-bold text-sky-400">⚡ Multi-Ball:</span> 3x balls in play</div>
                <div><span className="font-bold text-red-500">🚀 Laser Blasters:</span> Shoot bricks</div>
                <div><span className="font-bold text-amber-500">💥 TNT Bricks:</span> Chain reaction blast</div>
                <div><span className="font-bold text-cyan-400">🛡️ Safety Shield:</span> Saves lost balls</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12"
              >
                START SMASHING
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stage Clear Modal */}
      {isStageClear && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center animate-in zoom-in-95">
            <CardContent className="p-7 space-y-5">
              <div className="space-y-1.5">
                <Star className="h-12 w-12 mx-auto text-yellow-500 fill-yellow-500 animate-spin" />
                <h2 className="text-3xl font-black tracking-tight text-gradient">Stage {stage} Cleared!</h2>
                <p className="text-xs text-muted-foreground">Grid perimeter successfully eradicated. +500 Bonus Score!</p>
              </div>

              <Button onClick={nextStage} size="lg" className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12 gap-2">
                <span>ENTER STAGE {stage + 1}</span>
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over Modal & Score Submission */}
      {isGameOver && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center animate-in zoom-in-95">
            <CardContent className="p-7 space-y-5">
              <div className="space-y-1.5">
                <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
                <h2 className="text-3xl font-black tracking-tight text-gradient">Session Terminated!</h2>
                <p className="text-xs text-muted-foreground">All balls depleted in the neon grid.</p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Bricks Smashed</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{bricksShattered}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Stage Reached</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{stage}</span>
                </div>
              </div>

              {/* Hall of Fame Score Submission */}
              {scoreSubmitted ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-xs">Record registered in Hall of Fame!</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your name for Leaderboard"
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
                    className="rounded-xl font-bold text-xs bg-primary text-primary-foreground shrink-0"
                  >
                    {submitScoreMutation.isPending ? "Saving..." : "Save Record"}
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={startGame} className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Play Again
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
            <p className="text-xs text-gray-300">Press Esc or click Resume to continue</p>
            <Button onClick={() => setIsPaused(false)} className="rounded-xl font-bold bg-primary text-white">
              Resume Game
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
