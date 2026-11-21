import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Flame, Clock, ShieldAlert, Award, Swords,
  Zap, Snowflake, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- AUDIO SYNTHESIS ENGINE (Pure Web Audio API) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private swooshCooldown: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playSwoosh() {
    if (!this.enabled || this.swooshCooldown) return;
    this.init();
    if (!this.ctx) return;
    this.swooshCooldown = true;
    setTimeout(() => { this.swooshCooldown = false; }, 90);

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(450, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  playSlice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Crisp juicy squelch / slice
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(600 + Math.random() * 200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playCombo(count: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const scale = [523.25, 659.25, 783.99, 1046.50];
      const freq = scale[Math.min(count - 3, scale.length - 1)] || 523.25;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  playBombExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {}
  }

  playSpecialFruit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554, 659, 880, 1108];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.12);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- DATA STRUCTURES ---
export type FruitType =
  | "watermelon"
  | "orange"
  | "apple"
  | "banana"
  | "pineapple"
  | "strawberry"
  | "bomb"
  | "freeze"
  | "frenzy";

interface Fruit {
  id: string;
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  sliced: boolean;
  color: string;
}

interface SlicedHalf {
  type: FruitType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  vRot: number;
  color: string;
  side: "left" | "right";
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  decay: number;
}

interface Splatter {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
}

interface BladePoint {
  x: number;
  y: number;
  time: number;
}

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  mode: string;
  maxCombo: number;
  date: string;
}

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 560;
const GRAVITY = 0.28;

// Segment - Circle Collision Detection
function distToSegmentSquared(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): number {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return (px - x1) * (px - x1) + (py - y1) * (py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return (
    (px - (x1 + t * (x2 - x1))) * (px - (x1 + t * (x2 - x1))) +
    (py - (y1 + t * (y2 - y1))) * (py - (y1 + t * (y2 - y1)))
  );
}

function lineIntersectsCircle(
  x1: number, y1: number,
  x2: number, y2: number,
  cx: number, cy: number,
  r: number
): boolean {
  return distToSegmentSquared(cx, cy, x1, y1, x2, y2) <= r * r;
}

export default function FruitNinjaGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level React States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [gameMode, setGameMode] = useState<"classic" | "arcade" | "zen">("classic");
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [comboBanner, setComboBanner] = useState<string | null>(null);
  const [activeFrenzy, setActiveFrenzy] = useState<boolean>(false);
  const [activeFreeze, setActiveFreeze] = useState<boolean>(false);

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Engine Refs (60 FPS Performance)
  const fruitsRef = useRef<Fruit[]>([]);
  const halvesRef = useRef<SlicedHalf[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const splattersRef = useRef<Splatter[]>([]);
  const bladeTrailRef = useRef<BladePoint[]>([]);
  const isMouseDownRef = useRef<boolean>(false);
  const spawnTimerRef = useRef<number>(0);
  const frenzyTimerRef = useRef<number>(0);
  const freezeTimerRef = useRef<number>(0);
  const currentSwipeSlicedRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const gameStatsRef = useRef({ score: 0, lives: 3, timeLeft: 60 });
  const animFrameIdRef = useRef<number | null>(null);

  // Load High Score and Records
  useEffect(() => {
    const savedBest = localStorage.getItem("fruit_ninja_best_score");
    if (savedBest) setHighScore(parseInt(savedBest, 10));

    const savedRecords = localStorage.getItem("fruit_ninja_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {}
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "SenseiBlade", score: 185, mode: "Classic", maxCombo: 6, date: "2026-11-20" },
        { id: "2", name: "CyberNinja", score: 142, mode: "Arcade", maxCombo: 5, date: "2026-11-19" },
        { id: "3", name: "DojoSlicer", score: 98, mode: "Zen", maxCombo: 4, date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("fruit_ninja_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Spawn New Fruit Batch
  const spawnFruits = useCallback(() => {
    const isFrenzy = frenzyTimerRef.current > 0;
    const count = isFrenzy ? Math.floor(Math.random() * 3) + 3 : Math.floor(Math.random() * 2) + 1;

    for (let i = 0; i < count; i++) {
      const fruitTypes: FruitType[] = [
        "watermelon", "orange", "apple", "banana", "pineapple", "strawberry"
      ];
      // Random chance for special fruit or bomb
      const rand = Math.random();
      let type: FruitType = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];

      if (gameMode !== "zen" && rand < 0.22 && !isFrenzy) {
        type = "bomb";
      } else if (rand > 0.94) {
        type = Math.random() > 0.5 ? "freeze" : "frenzy";
      }

      const x = 100 + Math.random() * (CANVAS_WIDTH - 200);
      const y = CANVAS_HEIGHT + 40;
      const vx = (Math.random() - 0.5) * 5;
      const vy = -(13.5 + Math.random() * 3.5);

      const colorMap: Record<FruitType, string> = {
        watermelon: "#10b981",
        orange: "#f97316",
        apple: "#ef4444",
        banana: "#facc15",
        pineapple: "#eab308",
        strawberry: "#f43f5e",
        bomb: "#030712",
        freeze: "#38bdf8",
        frenzy: "#a855f7",
      };

      fruitsRef.current.push({
        id: Math.random().toString(36).substring(2, 9),
        type,
        x,
        y,
        vx,
        vy,
        radius: type === "watermelon" ? 34 : type === "pineapple" ? 32 : type === "bomb" ? 28 : 26,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.1,
        sliced: false,
        color: colorMap[type],
      });
    }
  }, [gameMode]);

  // Start / Reset Game
  const startNewGame = useCallback(() => {
    fruitsRef.current = [];
    halvesRef.current = [];
    particlesRef.current = [];
    bladeTrailRef.current = [];
    frenzyTimerRef.current = 0;
    freezeTimerRef.current = 0;
    maxComboRef.current = 0;

    const initialTime = gameMode === "arcade" ? 60 : gameMode === "zen" ? 90 : 0;
    gameStatsRef.current = { score: 0, lives: 3, timeLeft: initialTime };

    setScore(0);
    setLives(3);
    setTimeLeft(initialTime);
    setIsGameOver(false);
    setIsPlaying(true);
    setComboBanner(null);
    setActiveFrenzy(false);
    setActiveFreeze(false);
  }, [gameMode]);

  // Arcade / Zen Timer Countdown
  useEffect(() => {
    if (!isPlaying || isGameOver || gameMode === "classic") return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          triggerGameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, isGameOver, gameMode]);

  // Trigger Game Over
  const triggerGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);
    if (gameStatsRef.current.score > highScore) {
      setHighScore(gameStatsRef.current.score);
      localStorage.setItem("fruit_ninja_best_score", gameStatsRef.current.score.toString());
    }
  };

  // Slice a Fruit
  const sliceFruit = (fruit: Fruit) => {
    fruit.sliced = true;
    currentSwipeSlicedRef.current += 1;

    // Handle Bomb
    if (fruit.type === "bomb") {
      sounds.playBombExplosion();
      // Massive explosion particles
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: fruit.x,
          y: fruit.y,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          color: Math.random() > 0.5 ? "#f43f5e" : "#f97316",
          size: Math.random() * 6 + 2,
          alpha: 1,
          decay: 0.02,
        });
      }

      if (gameMode === "classic") {
        triggerGameOver();
      } else {
        // Arcade mode: -10 pts
        gameStatsRef.current.score = Math.max(0, gameStatsRef.current.score - 10);
        setScore(gameStatsRef.current.score);
      }
      return;
    }

    // Handle Special Fruits
    if (fruit.type === "freeze") {
      sounds.playSpecialFruit();
      freezeTimerRef.current = 5.0; // 5 seconds slow motion
      setActiveFreeze(true);
    } else if (fruit.type === "frenzy") {
      sounds.playSpecialFruit();
      frenzyTimerRef.current = 4.5;
      setActiveFrenzy(true);
    }

    sounds.playSlice();

    // Sliced Halves Physics
    halvesRef.current.push(
      {
        type: fruit.type,
        x: fruit.x - 10,
        y: fruit.y,
        vx: fruit.vx - 3,
        vy: fruit.vy - 1,
        radius: fruit.radius * 0.9,
        rotation: fruit.rotation,
        vRot: -0.15,
        color: fruit.color,
        side: "left",
        alpha: 1,
      },
      {
        type: fruit.type,
        x: fruit.x + 10,
        y: fruit.y,
        vx: fruit.vx + 3,
        vy: fruit.vy - 1,
        radius: fruit.radius * 0.9,
        rotation: fruit.rotation,
        vRot: 0.15,
        color: fruit.color,
        side: "right",
        alpha: 1,
      }
    );

    // Juice Splatter on Dojo Backing
    splattersRef.current.push({
      x: fruit.x,
      y: fruit.y,
      radius: fruit.radius * 1.3,
      color: fruit.color,
      alpha: 0.45,
    });
    if (splattersRef.current.length > 25) splattersRef.current.shift();

    // Particle Burst
    for (let i = 0; i < 18; i++) {
      particlesRef.current.push({
        x: fruit.x,
        y: fruit.y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: fruit.color,
        size: Math.random() * 4 + 2,
        alpha: 1,
        decay: 0.035,
      });
    }

    // Scoring (2x in frenzy)
    const multiplier = frenzyTimerRef.current > 0 ? 2 : 1;
    gameStatsRef.current.score += 1 * multiplier;
    setScore(gameStatsRef.current.score);
  };

  // Pointer Movement & Blade Slicing
  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isPlaying || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    const y = ((clientY - rect.top) / rect.height) * CANVAS_HEIGHT;

    sounds.playSwoosh();
    bladeTrailRef.current.push({ x, y, time: performance.now() });
    if (bladeTrailRef.current.length > 12) bladeTrailRef.current.shift();

    // Check line segment collision against fruits
    if (bladeTrailRef.current.length >= 2) {
      const p1 = bladeTrailRef.current[bladeTrailRef.current.length - 2];
      const p2 = bladeTrailRef.current[bladeTrailRef.current.length - 1];

      fruitsRef.current.forEach(fruit => {
        if (!fruit.sliced) {
          if (lineIntersectsCircle(p1.x, p1.y, p2.x, p2.y, fruit.x, fruit.y, fruit.radius)) {
            sliceFruit(fruit);
          }
        }
      });
    }
  };

  // Mouse & Touch Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    currentSwipeSlicedRef.current = 0;
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isMouseDownRef.current) {
      handlePointerMove(e.clientX, e.clientY);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    // Check Multi-Fruit Combo
    const comboCount = currentSwipeSlicedRef.current;
    if (comboCount >= 3) {
      sounds.playCombo(comboCount);
      const bonus = comboCount >= 5 ? 8 : comboCount === 4 ? 5 : 3;
      gameStatsRef.current.score += bonus;
      setScore(gameStatsRef.current.score);
      setComboBanner(`COMBO x${comboCount}! +${bonus} PTS`);
      setTimeout(() => setComboBanner(null), 1400);

      if (comboCount > maxComboRef.current) {
        maxComboRef.current = comboCount;
      }
    }
    currentSwipeSlicedRef.current = 0;
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      isMouseDownRef.current = true;
      currentSwipeSlicedRef.current = 0;
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Main 60 FPS Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      // Handle Freeze & Frenzy timers
      if (freezeTimerRef.current > 0) {
        freezeTimerRef.current -= 1 / 60;
        if (freezeTimerRef.current <= 0) setActiveFreeze(false);
      }
      if (frenzyTimerRef.current > 0) {
        frenzyTimerRef.current -= 1 / 60;
        if (frenzyTimerRef.current <= 0) setActiveFrenzy(false);
      }

      const timeSpeed = freezeTimerRef.current > 0 ? 0.35 : 1.0;

      // 1. Clear Screen & Draw Cyber Dojo Wood Floor
      ctx.fillStyle = "#1e130c"; // Deep dark wood
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Dojo Wood Texture Planks
      ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
      ctx.lineWidth = 3;
      for (let y = 0; y < CANVAS_HEIGHT; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Subtle Cyber Grid Overlay
      ctx.strokeStyle = "rgba(6, 182, 212, 0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // 2. Render Juice Splatters on Dojo Wall
      splattersRef.current.forEach(sp => {
        ctx.save();
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (!isPlaying) return;

      // 3. Fruit Spawning Logic
      spawnTimerRef.current += timeSpeed;
      const spawnInterval = frenzyTimerRef.current > 0 ? 25 : 65;
      if (spawnTimerRef.current >= spawnInterval) {
        spawnTimerRef.current = 0;
        spawnFruits();
      }

      // 4. Update & Render Fruits
      const activeFruits: Fruit[] = [];
      fruitsRef.current.forEach(f => {
        if (!f.sliced) {
          f.x += f.vx * timeSpeed;
          f.y += f.vy * timeSpeed;
          f.vy += GRAVITY * timeSpeed;
          f.rotation += f.vRot * timeSpeed;

          // Render Whole Fruit
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rotation);

          if (f.type === "bomb") {
            // Bomb Spiky Shell
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();
            // Burning Fuse Spark
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, -f.radius);
            ctx.lineTo(0, -f.radius - 8);
            ctx.stroke();
            ctx.fillStyle = Math.random() > 0.5 ? "#f97316" : "#facc15";
            ctx.beginPath();
            ctx.arc(0, -f.radius - 8, 4, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Delicious Vector Fruits
            ctx.shadowColor = f.color;
            ctx.shadowBlur = 10;
            ctx.fillStyle = f.color;
            ctx.beginPath();
            ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
            ctx.fill();

            // Fruit Inner Details
            if (f.type === "watermelon") {
              ctx.fillStyle = "#f43f5e";
              ctx.beginPath();
              ctx.arc(0, 0, f.radius - 5, 0, Math.PI * 2);
              ctx.fill();
            } else if (f.type === "orange") {
              ctx.fillStyle = "#fdba74";
              ctx.beginPath();
              ctx.arc(0, 0, f.radius - 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();

          // Check if fruit fell off bottom without being sliced
          if (f.y > CANVAS_HEIGHT + 60) {
            if (gameMode === "classic" && f.type !== "bomb") {
              gameStatsRef.current.lives -= 1;
              setLives(gameStatsRef.current.lives);
              if (gameStatsRef.current.lives <= 0) {
                triggerGameOver();
              }
            }
          } else {
            activeFruits.push(f);
          }
        }
      });
      fruitsRef.current = activeFruits;

      // 5. Update & Render Sliced Halves
      const activeHalves: SlicedHalf[] = [];
      halvesRef.current.forEach(h => {
        h.x += h.vx * timeSpeed;
        h.y += h.vy * timeSpeed;
        h.vy += GRAVITY * 1.2 * timeSpeed;
        h.rotation += h.vRot * timeSpeed;
        h.alpha -= 0.015;

        if (h.alpha > 0 && h.y < CANVAS_HEIGHT + 60) {
          ctx.save();
          ctx.globalAlpha = h.alpha;
          ctx.translate(h.x, h.y);
          ctx.rotate(h.rotation);
          ctx.fillStyle = h.color;

          // Sliced Half Semicircle
          ctx.beginPath();
          ctx.arc(0, 0, h.radius, h.side === "left" ? Math.PI / 2 : -Math.PI / 2, h.side === "left" ? -Math.PI / 2 : Math.PI / 2);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
          activeHalves.push(h);
        }
      });
      halvesRef.current = activeHalves;

      // 6. Update & Render Particle Sparks
      const activeParticles: Particle[] = [];
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          activeParticles.push(p);
        }
      });
      particlesRef.current = activeParticles;

      // 7. Render Glowing Blade Trail
      const trail = bladeTrailRef.current;
      const now = performance.now();
      while (trail.length > 0 && now - trail[0].time > 140) {
        trail.shift();
      }

      if (trail.length >= 2) {
        ctx.save();
        ctx.strokeStyle = "#38bdf8"; // Cyan Katana
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 14;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for (let i = 1; i < trail.length; i++) {
          const width = (i / trail.length) * 7.5;
          ctx.lineWidth = width;
          ctx.beginPath();
          ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
          ctx.lineTo(trail[i].x, trail[i].y);
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, gameMode, spawnFruits]);

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Fruit Ninja";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      score: gameStatsRef.current.score,
      mode: gameMode.toUpperCase(),
      maxCombo: maxComboRef.current,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("fruit_ninja_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[760px] flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/50 gap-1.5 font-mono text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold block">
              BLADE SWIPE DOJO • 60 FPS
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              FRUIT NINJA PRO
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                sounds.enabled = !sounds.enabled;
                setSoundMuted(!sounds.enabled);
              }}
              className="h-8 w-8 border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/60"
              title={soundMuted ? "Unmute" : "Mute"}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowRecords(true)}
              className="h-8 w-8 border-amber-500/40 text-amber-400 hover:bg-amber-950/60"
              title="Hall of Fame"
            >
              <Trophy className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={startNewGame}
              className="h-8 w-8 border-slate-700 text-slate-300 hover:bg-slate-800"
              title="Restart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">MODE:</span>
            {(["classic", "arcade", "zen"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { setGameMode(mode); }}
                className={`px-2.5 py-1 rounded capitalize transition-all text-xs ${
                  gameMode === mode
                    ? "bg-emerald-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {mode === "classic" ? "⚔️ Classic" : mode === "arcade" ? "⏱️ Arcade (60s)" : "🧘 Zen (90s)"}
              </button>
            ))}
          </div>

          {/* Active Buff Badges */}
          <div className="flex items-center gap-1.5">
            {activeFreeze && (
              <span className="flex items-center gap-1 text-[11px] bg-sky-950/80 border border-sky-400 text-sky-300 px-2 py-0.5 rounded animate-pulse">
                <Snowflake className="w-3.5 h-3.5" /> FREEZE TIME
              </span>
            )}
            {activeFrenzy && (
              <span className="flex items-center gap-1 text-[11px] bg-purple-950/80 border border-purple-400 text-purple-300 px-2 py-0.5 rounded animate-pulse">
                <Zap className="w-3.5 h-3.5" /> FRENZY 2X
              </span>
            )}
          </div>
        </div>

        {/* Live HUD Dashboard */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center font-mono">
          <div>
            <span className="text-[10px] text-slate-400 block">SCORE</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400">{score}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">BEST</span>
            <span className="text-base sm:text-lg font-bold text-amber-400">{Math.max(score, highScore)}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">
              {gameMode === "classic" ? "LIVES" : "TIMER"}
            </span>
            <span className="text-base sm:text-lg font-bold text-rose-400">
              {gameMode === "classic" ? "❌".repeat(Math.max(0, lives)) : `${timeLeft}s`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">STATUS</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400">
              {isPlaying ? "BLADE ACTIVE" : "DOJO IDLE"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Dojo Slicing Arena */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-emerald-950 shadow-[0_0_40px_rgba(16,185,129,0.2)] bg-slate-950 touch-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className="w-full max-w-[760px] h-auto block cursor-crosshair"
          style={{ touchAction: "none" }}
        />

        {/* Dynamic Combo Announcer Overlay */}
        {comboBanner && (
          <div className="absolute top-10 inset-x-0 flex items-center justify-center pointer-events-none animate-bounce">
            <div className="bg-slate-900/95 border-2 border-amber-400 text-amber-300 font-mono font-black text-xl sm:text-2xl px-6 py-2 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)]">
              {comboBanner}
            </div>
          </div>
        )}

        {/* Start Game Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
            <span className="text-5xl mb-2 animate-bounce">🍉</span>
            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-wider mb-2 font-mono">
              FRUIT NINJA PRO
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mb-6 leading-relaxed font-mono">
              Swipe your blade across flying fruits to slice them into delicious juicy halves. Avoid the bombs and trigger freeze & frenzy storms!
            </p>

            <Button
              onClick={startNewGame}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-8 py-5 text-base rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] tracking-wide font-mono"
            >
              DRAW BLADE (START)
            </Button>
          </div>
        )}

        {/* Game Over Debrief Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                SESSION CONCLUDED • DOJO DEBRIEF
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mb-3 text-slate-100">
                SWORD SHEATHED
              </h2>

              <div className="grid grid-cols-2 gap-2 bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">FINAL SCORE</span>
                  <span className="text-xl font-bold text-emerald-400">{score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">BEST COMBO</span>
                  <span className="text-xl font-bold text-amber-400">x{maxComboRef.current || 1}</span>
                </div>
              </div>

              {/* Hall of Fame Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter ninja callsign..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono outline-none flex-1"
                />
                <Button
                  onClick={saveRecord}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 font-mono text-xs"
                >
                  Save
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Slice Again
                </Button>
                <Link to="/games">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs">
                    All Games
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hall of Fame Records Modal */}
      {showRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-sm w-full p-5 shadow-[0_0_40px_rgba(16,185,129,0.2)] font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Trophy className="w-4 h-4" />
                <span>FRUIT NINJA HALL OF FAME</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecords(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </Button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {records.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">No ninja records registered yet.</p>
              ) : (
                records.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 font-bold ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{rec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{rec.mode}</span>
                      <span className="font-bold text-emerald-400">{rec.score} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-right">
              <Button
                onClick={() => setShowRecords(false)}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold font-mono text-xs px-4"
              >
                Close Records
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
