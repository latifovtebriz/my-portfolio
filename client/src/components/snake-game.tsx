import React, { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  RotateCcw, Trophy, User, List, Volume2, VolumeX, Pause, Play,
  Sparkles, Flame, Zap, Shield, Award, Star, Gamepad2, CheckCircle2, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Clock
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

  playBite(isSpecial: boolean = false) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isSpecial ? "triangle" : "sine";
      osc.frequency.setValueAtTime(isSpecial ? 659.25 : 440, now);
      osc.frequency.exponentialRampToValueAtTime(isSpecial ? 1318.5 : 880, now + (isSpecial ? 0.16 : 0.09));

      gain.gain.setValueAtTime(isSpecial ? 0.35 : 0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (isSpecial ? 0.16 : 0.09));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isSpecial ? 0.16 : 0.09));
    } catch {}
  }

  playTurn() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.035);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  playDie() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface Position {
  x: number;
  y: number;
}

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
type FoodType = "normal" | "golden" | "speed" | "diamond";

interface FoodItem {
  x: number;
  y: number;
  type: FoodType;
  points: number;
  expiresAt?: number;
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

export interface SnakeSkin {
  id: string;
  name: string;
  headColor: string;
  bodyColor: string;
  tailColor: string;
  glowColor: string;
  pattern: "classic" | "neon" | "dragon" | "gold";
}

const SNAKE_SKINS: SnakeSkin[] = [
  {
    id: "emerald",
    name: "Emerald Viper",
    headColor: "#16a34a",
    bodyColor: "#22c55e",
    tailColor: "#4ade80",
    glowColor: "rgba(34, 197, 94, 0.5)",
    pattern: "classic"
  },
  {
    id: "neon",
    name: "Cyber Neon",
    headColor: "#0284c7",
    bodyColor: "#38bdf8",
    tailColor: "#818cf8",
    glowColor: "rgba(56, 189, 248, 0.7)",
    pattern: "neon"
  },
  {
    id: "dragon",
    name: "Fire Drake",
    headColor: "#dc2626",
    bodyColor: "#f97316",
    tailColor: "#fbbf24",
    glowColor: "rgba(249, 115, 22, 0.7)",
    pattern: "dragon"
  },
  {
    id: "royal",
    name: "Royal Midas",
    headColor: "#d97706",
    bodyColor: "#f59e0b",
    tailColor: "#fde047",
    glowColor: "rgba(245, 158, 11, 0.7)",
    pattern: "gold"
  }
];

interface SnakeGameProps {
  onBack: () => void;
}

const GRID_SIZE = 22; // 22 x 22 tiles
const CANVAS_SIZE = 460;
const TILE_SIZE = CANVAS_SIZE / GRID_SIZE; // ~20.9px

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SnakeGame({ onBack }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 11 },
    { x: 9, y: 11 },
    { x: 8, y: 11 }
  ]);
  const [food, setFood] = useState<FoodItem>({ x: 15, y: 11, type: "normal", points: 10 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [activeSkin, setActiveSkin] = useState<SnakeSkin>(SNAKE_SKINS[0]);
  const [isWallWrap, setIsWallWrap] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [comboTimer, setComboTimer] = useState<number>(0);

  const [applesEaten, setApplesEaten] = useState<number>(0);
  const [goldenEaten, setGoldenEaten] = useState<number>(0);
  const [gameTime, setGameTime] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const directionRef = useRef<Direction>("RIGHT");
  const nextDirectionRef = useRef<Direction>("RIGHT");
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const tongueProgressRef = useRef<number>(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load high score from local storage
  useEffect(() => {
    const saved = localStorage.getItem("snake_highscore");
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/snake/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('snake_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/snake/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Viper King 🐍", score: 680, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 540, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Cobra Master 🏆", score: 420, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Slither 🟢", score: 310, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Dragon Tail 🐉", score: 230, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('snake_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('snake_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'snake', timeInSeconds: gameTime }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/snake/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Spawn visual sparkles when eating food
  const spawnFoodParticles = useCallback((x: number, y: number, color: string) => {
    const px = (x + 0.5) * TILE_SIZE;
    const py = (y + 0.5) * TILE_SIZE;
    for (let i = 0; i < 12; i++) {
      particlesRef.current.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        color,
        size: Math.random() * 3 + 2,
        alpha: 1,
        life: 0,
        maxLife: 20 + Math.random() * 10
      });
    }
  }, []);

  // Generate random food item
  const generateFood = useCallback((currentSnake: Position[]): FoodItem => {
    let newPos: Position;
    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newPos.x && segment.y === newPos.y));

    // Chance of special foods
    const roll = Math.random();
    let type: FoodType = "normal";
    let points = 10;
    let expiresAt: number | undefined;

    if (roll < 0.15) {
      type = "diamond";
      points = 50;
      expiresAt = Date.now() + 8000;
    } else if (roll < 0.35) {
      type = "golden";
      points = 30;
      expiresAt = Date.now() + 10000;
    }

    return {
      x: newPos.x,
      y: newPos.y,
      type,
      points,
      expiresAt
    };
  }, []);

  // Game Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && !isGameOver && !isPaused) {
      timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, isPaused]);

  // Turn Direction Logic
  const changeDirection = useCallback((newDir: Direction) => {
    if (!isPlaying || isPaused) return;
    const opposites: Record<Direction, Direction> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT"
    };

    if (opposites[newDir] !== directionRef.current) {
      nextDirectionRef.current = newDir;
      sound.playTurn();
    }
  }, [isPlaying, isPaused]);

  // Keyboard Event Listener
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

      if (!isPlaying || isGameOver) return;

      const code = e.code;
      if (["ArrowUp", "KeyW"].includes(code)) {
        e.preventDefault();
        changeDirection("UP");
      } else if (["ArrowDown", "KeyS"].includes(code)) {
        e.preventDefault();
        changeDirection("DOWN");
      } else if (["ArrowLeft", "KeyA"].includes(code)) {
        e.preventDefault();
        changeDirection("LEFT");
      } else if (["ArrowRight", "KeyD"].includes(code)) {
        e.preventDefault();
        changeDirection("RIGHT");
      } else if (code === "Space" || code === "Escape") {
        e.preventDefault();
        setIsPaused(p => !p);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [changeDirection, isPlaying, isGameOver]);

  // Main Movement Step
  const stepGame = useCallback(() => {
    setSnake(currentSnake => {
      directionRef.current = nextDirectionRef.current;
      setDirection(nextDirectionRef.current);

      let head = { ...currentSnake[0] };
      switch (directionRef.current) {
        case "UP": head.y -= 1; break;
        case "DOWN": head.y += 1; break;
        case "LEFT": head.x -= 1; break;
        case "RIGHT": head.x += 1; break;
      }

      // Handle Wall Collision / Wrap
      if (isWallWrap) {
        if (head.x < 0) head.x = GRID_SIZE - 1;
        else if (head.x >= GRID_SIZE) head.x = 0;
        if (head.y < 0) head.y = GRID_SIZE - 1;
        else if (head.y >= GRID_SIZE) head.y = 0;
      } else {
        // Solid wall mode
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          sound.playDie();
          setIsGameOver(true);
          setIsPlaying(false);
          return currentSnake;
        }
      }

      // Check Body Collision
      if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        sound.playDie();
        setIsGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      const newSnake = [head, ...currentSnake];

      // Check Food Collision
      if (head.x === food.x && head.y === food.y) {
        const isSpecial = food.type !== "normal";
        sound.playBite(isSpecial);

        const earned = food.points * combo;
        setScore(sc => {
          const nextScore = sc + earned;
          if (nextScore > highScore) {
            setHighScore(nextScore);
            localStorage.setItem("snake_highscore", nextScore.toString());
          }
          return nextScore;
        });

        if (food.type === "normal") setApplesEaten(a => a + 1);
        else setGoldenEaten(g => g + 1);

        setCombo(c => Math.min(c + 1, 4));
        setComboTimer(Date.now() + 4500);

        spawnFoodParticles(head.x, head.y, isSpecial ? "#fbbf24" : "#ef4444");
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, combo, highScore, isWallWrap, generateFood, spawnFoodParticles]);

  // Game Loop Speed (Scales slightly as snake grows longer)
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      const baseSpeed = 135;
      const speed = Math.max(75, baseSpeed - Math.floor(snake.length * 1.5));
      gameIntervalRef.current = setInterval(stepGame, speed);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying, isGameOver, isPaused, snake.length, stepGame]);

  // Combo timer expiry
  useEffect(() => {
    if (combo > 1 && Date.now() > comboTimer) {
      setCombo(1);
    }
  }, [combo, comboTimer]);

  // Canvas Rendering Routine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 1. Grid Background (Subtle Tactical Checkerboard)
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? "#090d16" : "#0d1322";
          ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }

      // Outer border glow
      ctx.strokeStyle = activeSkin.glowColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, CANVAS_SIZE - 2, CANVAS_SIZE - 2);

      // 2. Food Item Rendering
      const fx = (food.x + 0.5) * TILE_SIZE;
      const fy = (food.y + 0.5) * TILE_SIZE;
      const pulse = Math.sin(Date.now() / 150) * 1.5;
      const foodRadius = (TILE_SIZE * 0.4) + pulse;

      ctx.save();
      if (food.type === "diamond") {
        // Sparkling Blue Diamond
        ctx.fillStyle = "#38bdf8";
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(fx, fy - foodRadius * 1.1);
        ctx.lineTo(fx + foodRadius * 1.1, fy);
        ctx.lineTo(fx, fy + foodRadius * 1.1);
        ctx.lineTo(fx - foodRadius * 1.1, fy);
        ctx.closePath();
        ctx.fill();
      } else if (food.type === "golden") {
        // Glowing Golden Apple
        ctx.fillStyle = "#fbbf24";
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
        ctx.fill();
        // Leaf
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.ellipse(fx + 2, fy - foodRadius - 1, 3, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Classic Shiny Red Apple
        ctx.fillStyle = "#ef4444";
        ctx.shadowColor = "#ef4444";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(fx, fy, foodRadius, 0, Math.PI * 2);
        ctx.fill();
        // Shine highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        ctx.beginPath();
        ctx.arc(fx - 2, fy - 2, foodRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();
        // Green stem/leaf
        ctx.fillStyle = "#22c55e";
        ctx.fillRect(fx - 0.5, fy - foodRadius - 2, 1.5, 3);
      }
      ctx.restore();

      // 3. Snake Body & Scales
      snake.forEach((seg, i) => {
        const sx = seg.x * TILE_SIZE;
        const sy = seg.y * TILE_SIZE;
        const isHead = i === 0;
        const isTail = i === snake.length - 1;

        ctx.save();
        if (isHead) {
          // Snake Head with Eyes and Darting Tongue
          ctx.fillStyle = activeSkin.headColor;
          ctx.shadowColor = activeSkin.glowColor;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.roundRect(sx + 1, sy + 1, TILE_SIZE - 2, TILE_SIZE - 2, 8);
          ctx.fill();

          // Animated Tongue
          tongueProgressRef.current = (tongueProgressRef.current + 0.1) % (Math.PI * 2);
          const tongueLen = Math.sin(tongueProgressRef.current) > 0.4 ? 6 : 0;
          if (tongueLen > 0) {
            ctx.fillStyle = "#ef4444";
            const hx = sx + TILE_SIZE / 2;
            const hy = sy + TILE_SIZE / 2;
            ctx.beginPath();
            if (direction === "RIGHT") {
              ctx.moveTo(sx + TILE_SIZE, hy);
              ctx.lineTo(sx + TILE_SIZE + tongueLen, hy);
            } else if (direction === "LEFT") {
              ctx.moveTo(sx, hy);
              ctx.lineTo(sx - tongueLen, hy);
            } else if (direction === "UP") {
              ctx.moveTo(hx, sy);
              ctx.lineTo(hx, sy - tongueLen);
            } else {
              ctx.moveTo(hx, sy + TILE_SIZE);
              ctx.lineTo(hx, sy + TILE_SIZE + tongueLen);
            }
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = "#ef4444";
            ctx.stroke();
          }

          // Expressive Eyes Tracking Direction
          ctx.fillStyle = "#ffffff";
          let eye1 = { x: sx + 5, y: sy + 5 };
          let eye2 = { x: sx + TILE_SIZE - 7, y: sy + 5 };

          if (direction === "RIGHT") {
            eye1 = { x: sx + TILE_SIZE - 6, y: sy + 5 };
            eye2 = { x: sx + TILE_SIZE - 6, y: sy + TILE_SIZE - 7 };
          } else if (direction === "LEFT") {
            eye1 = { x: sx + 4, y: sy + 5 };
            eye2 = { x: sx + 4, y: sy + TILE_SIZE - 7 };
          } else if (direction === "DOWN") {
            eye1 = { x: sx + 5, y: sy + TILE_SIZE - 6 };
            eye2 = { x: sx + TILE_SIZE - 7, y: sy + TILE_SIZE - 6 };
          }

          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, 2.5, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Black Pupils
          ctx.fillStyle = "#000000";
          ctx.beginPath();
          ctx.arc(eye1.x, eye1.y, 1.2, 0, Math.PI * 2);
          ctx.arc(eye2.x, eye2.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else if (isTail) {
          // Rounded Tapered Tail
          ctx.fillStyle = activeSkin.tailColor;
          ctx.beginPath();
          ctx.roundRect(sx + 3, sy + 3, TILE_SIZE - 6, TILE_SIZE - 6, 6);
          ctx.fill();
        } else {
          // Smooth Segmented Body Scales
          const progress = i / snake.length;
          ctx.fillStyle = activeSkin.bodyColor;
          ctx.beginPath();
          ctx.roundRect(sx + 1.5, sy + 1.5, TILE_SIZE - 3, TILE_SIZE - 3, 5);
          ctx.fill();

          // Pattern Accent Line
          ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
          ctx.beginPath();
          ctx.arc(sx + TILE_SIZE / 2, sy + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 4. Sparkle Particles
      particlesRef.current = particlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        alpha: 1 - p.life / p.maxLife,
        life: p.life + 1
      })).filter(p => p.life < p.maxLife);

      particlesRef.current.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [snake, food, direction, activeSkin]);

  // Start / Restart Game
  const startGame = () => {
    const initSnake = [
      { x: 10, y: 11 },
      { x: 9, y: 11 },
      { x: 8, y: 11 }
    ];
    setSnake(initSnake);
    setFood(generateFood(initSnake));
    directionRef.current = "RIGHT";
    nextDirectionRef.current = "RIGHT";
    setDirection("RIGHT");
    setScore(0);
    setCombo(1);
    setApplesEaten(0);
    setGoldenEaten(0);
    setGameTime(0);
    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    sound.playBite(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

          {/* Wall Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWallWrap(!isWallWrap)}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border-border/70"
            title="Toggle wall wrap vs solid border mode"
          >
            <span>{isWallWrap ? "🌀 Portal Walls" : "🧱 Solid Walls"}</span>
          </Button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatTime(gameTime)}</span>
          </div>
        </div>

        {/* Center: Score & Combo */}
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

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold text-muted-foreground">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Best: {highScore}</span>
          </div>
        </div>

        {/* Right: Sound, Leaderboard & Pause */}
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
                  Snake Arena Leaderboard
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
                      <div className="text-right">
                        <span className="font-mono font-bold text-sm text-primary">{rec.score} pts</span>
                        {rec.createdAt && (
                          <span className="text-xs text-muted-foreground block">
                            {new Date(rec.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
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
        </div>
      </div>

      {/* Main Playing Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border-2 border-slate-700/80 rounded-2xl shadow-2xl max-w-full max-h-full aspect-square"
          style={{ imageRendering: "auto" }}
        />
      </div>

      {/* Bottom Bar: Skin Chooser & Mobile Controls */}
      <div className="shrink-0 bg-card/85 border-t border-border/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
        {/* Snake Skins Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1 hidden sm:inline">Skin:</span>
          {SNAKE_SKINS.map((skin) => {
            const isSelected = activeSkin.id === skin.id;
            return (
              <Button
                key={skin.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSkin(skin)}
                className={`h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border ${
                  isSelected ? "border-primary ring-2 ring-primary/30" : "border-border/70"
                }`}
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: skin.headColor }} />
                <span>{skin.name.split(" ")[0]}</span>
              </Button>
            );
          })}
        </div>

        {/* Mobile Touch Directional Controls */}
        <div className="sm:hidden grid grid-cols-3 gap-1.5 w-44 mx-auto">
          <div />
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDirection("UP")}
            disabled={!isPlaying || isPaused}
            className="h-10 w-10 p-0 mx-auto rounded-xl active:bg-primary active:text-white"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <div />

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDirection("LEFT")}
            disabled={!isPlaying || isPaused}
            className="h-10 w-10 p-0 mx-auto rounded-xl active:bg-primary active:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDirection("DOWN")}
            disabled={!isPlaying || isPaused}
            className="h-10 w-10 p-0 mx-auto rounded-xl active:bg-primary active:text-white"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDirection("RIGHT")}
            disabled={!isPlaying || isPaused}
            className="h-10 w-10 p-0 mx-auto rounded-xl active:bg-primary active:text-white"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Desktop Helper Guide */}
        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
          <span>Navigate: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">WASD</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Arrows</kbd></span>
          <span>Pause: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Space</kbd></span>
        </div>
      </div>

      {/* Start Game Overlay */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Slither Championship • Pro Edition 2026
              </div>

              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🐍 SNAKE ARENA PRO
                </h1>
                <p className="text-xs text-muted-foreground">
                  Slither through the grid, collect golden apples and diamonds, rack up multipliers, and outmaneuver yourself!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-xs text-left">
                <div><span className="font-bold text-primary">🍎 Red Apple:</span> 10 pts</div>
                <div><span className="font-bold text-amber-500">🌟 Golden Apple:</span> 30 pts</div>
                <div><span className="font-bold text-sky-400">💎 Star Diamond:</span> 50 pts</div>
                <div><span className="font-bold text-emerald-400">⚡ Combos:</span> Up to 4x</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12"
              >
                START SLITHERING
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game Over Modal & Score Submission */}
      {isGameOver && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-7 space-y-5">
              <div className="space-y-1.5">
                <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
                <h2 className="text-3xl font-black tracking-tight">Run Finished!</h2>
                <p className="text-xs text-muted-foreground">The snake has bitten its own tail.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Snake Length</span>
                  <span className="text-xl font-black text-emerald-500 font-mono">{snake.length}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Apples Eaten</span>
                  <span className="text-xl font-black text-amber-500 font-mono">{applesEaten + goldenEaten}</span>
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
            <p className="text-xs text-gray-300">Press Space or click Resume to continue</p>
            <Button onClick={() => setIsPaused(false)} className="rounded-xl font-bold bg-primary text-white">
              Resume Slither
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
