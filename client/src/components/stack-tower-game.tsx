import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, Pause, Play,
  ArrowLeft, Sparkles, Building, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- AUDIO SYNTHESIS ENGINE (Pure Web Audio API) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

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

  // Melodic combo chime: pitches scale up with combo streak
  playPlaceNote(streak: number, perfect: boolean) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const scale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
      const noteIdx = Math.min(streak, scale.length - 1);
      const baseFreq = scale[noteIdx];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = perfect ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      if (perfect) {
        // Harmonic bell overtone
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(baseFreq * 2, this.ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start();
        osc2.stop(this.ctx.currentTime + 0.35);
      }

      const duration = perfect ? 0.4 : 0.22;
      gain.gain.setValueAtTime(perfect ? 0.25 : 0.16, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  playSlice() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  playGameOver() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [320, 290, 250, 180, 120];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.2);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- DATA STRUCTURES ---
interface Block {
  x: number;      // horizontal position on X axis
  z: number;      // horizontal position on Z axis
  y: number;      // vertical layer index
  width: number;  // dimension along X
  depth: number;  // dimension along Z
  color: string;
  hue: number;
}

interface FallingPiece {
  x: number;
  z: number;
  y: number;
  width: number;
  depth: number;
  vy: number;
  rot: number;
  color: string;
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

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  perfectStreak: number;
  date: string;
}

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 640;
const BLOCK_HEIGHT = 20;
const INITIAL_SIZE = 140;

// Isometric projection helper
// Project 3D (x, y, z) into 2D canvas coordinates (sx, sy)
function project(x: number, y: number, z: number, cameraY: number): { sx: number; sy: number } {
  const originX = CANVAS_WIDTH / 2;
  const originY = CANVAS_HEIGHT / 2 + 100;
  const isoX = (x - z) * Math.cos(Math.PI / 6);
  const isoY = (x + z) * Math.sin(Math.PI / 6) - (y - cameraY) * BLOCK_HEIGHT;
  return {
    sx: originX + isoX,
    sy: originY + isoY,
  };
}

export default function StackTowerGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Engine Refs
  const stackRef = useRef<Block[]>([]);
  const fallingPiecesRef = useRef<FallingPiece[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const activeBlockRef = useRef<{
    x: number;
    z: number;
    width: number;
    depth: number;
    axis: "x" | "z";
    direction: number;
    speed: number;
    color: string;
    hue: number;
  } | null>(null);

  const cameraYRef = useRef<number>(0);
  const targetCameraYRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);
  const gameStatsRef = useRef({ score: 0, combo: 0, maxCombo: 0 });

  // Load High Score and Records
  useEffect(() => {
    const savedBest = localStorage.getItem("stack_tower_best_score");
    if (savedBest) setHighScore(parseInt(savedBest, 10));

    const savedRecords = localStorage.getItem("stack_tower_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "SkyArchitect", score: 45, perfectStreak: 12, date: "2026-11-20" },
        { id: "2", name: "IsoBuilder", score: 32, perfectStreak: 8, date: "2026-11-19" },
        { id: "3", name: "TowerMaster", score: 20, perfectStreak: 5, date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("stack_tower_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Initialize Base Tower
  const initBaseTower = useCallback(() => {
    const baseColor = "hsl(190, 85%, 55%)";
    stackRef.current = [
      {
        x: -INITIAL_SIZE / 2,
        z: -INITIAL_SIZE / 2,
        y: 0,
        width: INITIAL_SIZE,
        depth: INITIAL_SIZE,
        color: baseColor,
        hue: 190,
      },
    ];
    fallingPiecesRef.current = [];
    particlesRef.current = [];
    cameraYRef.current = 0;
    targetCameraYRef.current = 0;
  }, []);

  // Spawn New Moving Top Block
  const spawnMovingBlock = useCallback((layerIndex: number) => {
    const prevBlock = stackRef.current[stackRef.current.length - 1];
    const axis: "x" | "z" = layerIndex % 2 === 1 ? "x" : "z";
    const hue = (190 + layerIndex * 6) % 360;
    const color = `hsl(${hue}, 85%, 58%)`;

    const speed = Math.min(6.5, 3.2 + layerIndex * 0.08);

    if (axis === "x") {
      activeBlockRef.current = {
        x: -240,
        z: prevBlock.z,
        width: prevBlock.width,
        depth: prevBlock.depth,
        axis: "x",
        direction: 1,
        speed,
        color,
        hue,
      };
    } else {
      activeBlockRef.current = {
        x: prevBlock.x,
        z: -240,
        width: prevBlock.width,
        depth: prevBlock.depth,
        axis: "z",
        direction: 1,
        speed,
        color,
        hue,
      };
    }
  }, []);

  // Start New Game
  const startNewGame = useCallback(() => {
    initBaseTower();
    gameStatsRef.current = { score: 0, combo: 0, maxCombo: 0 };
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    spawnMovingBlock(1);
  }, [initBaseTower, spawnMovingBlock]);

  // Drop / Place Current Moving Block
  const placeBlock = useCallback(() => {
    if (!activeBlockRef.current || isGameOver || isPaused || !isPlaying) return;

    const moving = activeBlockRef.current;
    const topBlock = stackRef.current[stackRef.current.length - 1];
    const layer = stackRef.current.length;

    let overlap = 0;
    let overhang = 0;
    let placedX = moving.x;
    let placedZ = moving.z;
    let placedWidth = moving.width;
    let placedDepth = moving.depth;
    let slicedPiece: FallingPiece | null = null;
    let isPerfect = false;

    const PERFECT_THRESHOLD = 3.5;

    if (moving.axis === "x") {
      const diff = moving.x - topBlock.x;
      if (Math.abs(diff) < PERFECT_THRESHOLD) {
        // Perfect Snap!
        isPerfect = true;
        placedX = topBlock.x;
      } else if (diff > 0) {
        // Overhang to the right (+X)
        overlap = moving.width - diff;
        if (overlap <= 0) {
          triggerGameOver();
          return;
        }
        placedWidth = overlap;
        placedX = moving.x;
        overhang = diff;
        slicedPiece = {
          x: moving.x + overlap,
          z: moving.z,
          y: layer,
          width: overhang,
          depth: moving.depth,
          vy: 0,
          rot: 0,
          color: moving.color,
          alpha: 1,
        };
      } else {
        // Overhang to the left (-X)
        overlap = moving.width + diff;
        if (overlap <= 0) {
          triggerGameOver();
          return;
        }
        placedWidth = overlap;
        placedX = topBlock.x;
        overhang = -diff;
        slicedPiece = {
          x: moving.x,
          z: moving.z,
          y: layer,
          width: overhang,
          depth: moving.depth,
          vy: 0,
          rot: 0,
          color: moving.color,
          alpha: 1,
        };
      }
    } else {
      // Z Axis
      const diff = moving.z - topBlock.z;
      if (Math.abs(diff) < PERFECT_THRESHOLD) {
        // Perfect Snap!
        isPerfect = true;
        placedZ = topBlock.z;
      } else if (diff > 0) {
        // Overhang to the front (+Z)
        overlap = moving.depth - diff;
        if (overlap <= 0) {
          triggerGameOver();
          return;
        }
        placedDepth = overlap;
        placedZ = moving.z;
        overhang = diff;
        slicedPiece = {
          x: moving.x,
          z: moving.z + overlap,
          y: layer,
          width: moving.width,
          depth: overhang,
          vy: 0,
          rot: 0,
          color: moving.color,
          alpha: 1,
        };
      } else {
        // Overhang to the back (-Z)
        overlap = moving.depth + diff;
        if (overlap <= 0) {
          triggerGameOver();
          return;
        }
        placedDepth = overlap;
        placedZ = topBlock.z;
        overhang = -diff;
        slicedPiece = {
          x: moving.x,
          z: moving.z,
          y: layer,
          width: moving.width,
          depth: overhang,
          vy: 0,
          rot: 0,
          color: moving.color,
          alpha: 1,
        };
      }
    }

    // Handle Combo & Audio
    if (isPerfect) {
      gameStatsRef.current.combo += 1;
      if (gameStatsRef.current.combo > gameStatsRef.current.maxCombo) {
        gameStatsRef.current.maxCombo = gameStatsRef.current.combo;
        setMaxCombo(gameStatsRef.current.maxCombo);
      }
      setCombo(gameStatsRef.current.combo);
      sounds.playPlaceNote(gameStatsRef.current.combo, true);

      // Reward on 5x streak: expand block slightly
      if (gameStatsRef.current.combo % 5 === 0) {
        placedWidth = Math.min(INITIAL_SIZE, placedWidth + 10);
        placedDepth = Math.min(INITIAL_SIZE, placedDepth + 10);
      }

      // Sparkles at corners
      const p = project(placedX, layer, placedZ, cameraYRef.current);
      for (let i = 0; i < 18; i++) {
        particlesRef.current.push({
          x: p.sx + (Math.random() - 0.5) * 80,
          y: p.sy + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 2,
          color: "#ffffff",
          size: Math.random() * 3 + 2,
          alpha: 1,
          decay: 0.035,
        });
      }
    } else {
      gameStatsRef.current.combo = 0;
      setCombo(0);
      sounds.playSlice();
      if (slicedPiece) {
        fallingPiecesRef.current.push(slicedPiece);
      }
    }

    // Add successfully placed block
    stackRef.current.push({
      x: placedX,
      z: placedZ,
      y: layer,
      width: placedWidth,
      depth: placedDepth,
      color: moving.color,
      hue: moving.hue,
    });

    // Update Score
    gameStatsRef.current.score = layer;
    setScore(layer);
    if (layer > highScore) {
      setHighScore(layer);
      localStorage.setItem("stack_tower_best_score", layer.toString());
    }

    // Shift camera upward
    targetCameraYRef.current = Math.max(0, layer - 8);

    // Spawn next block
    spawnMovingBlock(layer + 1);
  }, [isGameOver, isPaused, isPlaying, highScore, spawnMovingBlock]);

  // Trigger Game Over
  const triggerGameOver = () => {
    sounds.playGameOver();
    setIsGameOver(true);
    setIsPlaying(false);

    // Turn current moving block into falling debris
    if (activeBlockRef.current) {
      fallingPiecesRef.current.push({
        x: activeBlockRef.current.x,
        z: activeBlockRef.current.z,
        y: stackRef.current.length,
        width: activeBlockRef.current.width,
        depth: activeBlockRef.current.depth,
        vy: 1,
        rot: 0.05,
        color: activeBlockRef.current.color,
        alpha: 1,
      });
      activeBlockRef.current = null;
    }
  };

  // Toggle Sound Mute
  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundMuted(!sounds.enabled);
  };

  // Keyboard Event Isolation: Strict Check for Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return; // Allow wasd or space to be typed into input fields without triggering drop
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (!isPlaying && !isGameOver) {
          startNewGame();
        } else if (isPlaying && !isGameOver) {
          placeBlock();
        }
      }

      if (e.code === "Escape") {
        e.preventDefault();
        if (isPlaying && !isGameOver) {
          setIsPaused(prev => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isGameOver, startNewGame, placeBlock]);

  // Canvas Click / Tap to Drop
  const handleCanvasInteraction = () => {
    if (!isPlaying && !isGameOver) {
      startNewGame();
    } else if (isPlaying && !isGameOver) {
      placeBlock();
    }
  };

  // Main 60 FPS Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      // Smooth Camera Scroll Interpolation
      cameraYRef.current += (targetCameraYRef.current - cameraYRef.current) * 0.08;
      const camY = cameraYRef.current;

      // Dynamic Sky Gradient based on Tower Height
      const currentHue = (220 + score * 4) % 360;
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, `hsl(${currentHue}, 45%, 8%)`);
      gradient.addColorStop(0.5, `hsl(${currentHue + 20}, 40%, 12%)`);
      gradient.addColorStop(1, "#030712");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Subtle Background Geometric Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }

      // Draw Isometric Block Function
      const drawIsoBlock = (
        bx: number,
        by: number,
        bz: number,
        bw: number,
        bd: number,
        hue: number,
        alpha: number = 1
      ) => {
        ctx.save();
        ctx.globalAlpha = alpha;

        // 4 Top Vertices (y = by + 1)
        const p1 = project(bx, by + 1, bz, camY);              // Back
        const p2 = project(bx + bw, by + 1, bz, camY);         // Right
        const p3 = project(bx + bw, by + 1, bz + bd, camY);    // Front
        const p4 = project(bx, by + 1, bz + bd, camY);         // Left

        // Bottom Vertices (y = by)
        const b2 = project(bx + bw, by, bz, camY);
        const b3 = project(bx + bw, by, bz + bd, camY);
        const b4 = project(bx, by, bz + bd, camY);

        // 1. Left / Front-Left Face (Darker Shading)
        ctx.fillStyle = `hsl(${hue}, 75%, 38%)`;
        ctx.beginPath();
        ctx.moveTo(p4.sx, p4.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.lineTo(b3.sx, b3.sy);
        ctx.lineTo(b4.sx, b4.sy);
        ctx.closePath();
        ctx.fill();

        // 2. Right / Front-Right Face (Medium Shading)
        ctx.fillStyle = `hsl(${hue}, 80%, 46%)`;
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(b2.sx, b2.sy);
        ctx.lineTo(b3.sx, b3.sy);
        ctx.closePath();
        ctx.fill();

        // 3. Top Face (Bright Shading + Gloss)
        ctx.fillStyle = `hsl(${hue}, 85%, 60%)`;
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.lineTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.closePath();
        ctx.fill();

        // Neon Edge Highlights
        ctx.strokeStyle = `hsla(${hue}, 90%, 80%, 0.4)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      };

      // 1. Render Tower Stack
      stackRef.current.forEach(block => {
        drawIsoBlock(block.x, block.y, block.z, block.width, block.depth, block.hue);
      });

      // 2. Update & Render Moving Active Block
      if (activeBlockRef.current && isPlaying && !isPaused) {
        const m = activeBlockRef.current;
        const currentLayer = stackRef.current.length;

        if (m.axis === "x") {
          m.x += m.speed * m.direction;
          if (m.x > 260) m.direction = -1;
          if (m.x < -260) m.direction = 1;
        } else {
          m.z += m.speed * m.direction;
          if (m.z > 260) m.direction = -1;
          if (m.z < -260) m.direction = 1;
        }

        drawIsoBlock(m.x, currentLayer, m.z, m.width, m.depth, m.hue);
      }

      // 3. Update & Render Sliced Falling Pieces
      const activeFalling: FallingPiece[] = [];
      fallingPiecesRef.current.forEach(p => {
        p.vy += 0.45; // Gravity
        p.y -= p.vy * 0.05;
        p.alpha -= 0.02;

        if (p.alpha > 0) {
          drawIsoBlock(p.x, p.y, p.z, p.width, p.depth, 200, p.alpha);
          activeFalling.push(p);
        }
      });
      fallingPiecesRef.current = activeFalling;

      // 4. Update & Render Particles
      const activeParticles: Particle[] = [];
      particlesRef.current.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = pt.alpha;
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          activeParticles.push(pt);
        }
      });
      particlesRef.current = activeParticles;

      // Pause Overlay
      if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 32px monospace";
        ctx.textAlign = "center";
        ctx.fillText("CONSTRUCTION PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Press ESC to Resume Building", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, isPaused, score]);

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Tower Architect";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      score: gameStatsRef.current.score,
      perfectStreak: gameStatsRef.current.maxCombo,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("stack_tower_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[760px] flex flex-col gap-2 mb-3">
        <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 gap-1.5 font-mono text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
              3D ISOMETRIC • 60 FPS
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              STACK TOWER PRO
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleSound}
              className="h-8 w-8 border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/60"
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
              disabled={!isPlaying || isGameOver}
              onClick={() => setIsPaused(prev => !prev)}
              className="h-8 w-8 border-indigo-500/40 text-indigo-400 hover:bg-indigo-950/60"
              title="Pause Game (Esc)"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Live HUD Dashboard */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-center font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">TOWER HEIGHT</span>
            <span className="text-base sm:text-lg font-bold text-cyan-400">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">BEST HEIGHT</span>
            <span className="text-base sm:text-lg font-bold text-amber-400">{Math.max(score, highScore)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">PERFECT STREAK</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400">
              {combo > 0 ? `🔥 ${combo}x` : "0x"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">RECORD STREAK</span>
            <span className="text-base sm:text-lg font-bold text-indigo-400">
              {Math.max(combo, maxCombo)}x
            </span>
          </div>
        </div>
      </div>

      {/* Main Isometric Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasInteraction}
          className="w-full max-w-[760px] h-auto cursor-pointer block"
        />

        {/* Start Screen Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4">
              <Building className="w-3.5 h-3.5" />
              <span>SKY-HIGH ARCHITECTURAL CHALLENGE</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 tracking-wider mb-2 font-mono">
              STACK TOWER PRO
            </h2>

            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Drop sliding blocks with razor-sharp timing! Perfect placements snap into place with musical chime chords and expand your tower foundation.
            </p>

            {/* Controls Overview Card */}
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 mb-6 text-left">
              <div>
                <span className="text-cyan-400 font-semibold block">Drop Block:</span>
                <span>Space / Click / Tap</span>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold block">Perfect Snap:</span>
                <span>Chime Notes + Bonus</span>
              </div>
              <div>
                <span className="text-amber-400 font-semibold block">5x Streak:</span>
                <span>Expands Foundation</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Pause:</span>
                <span>Esc Key</span>
              </div>
            </div>

            <Button
              onClick={startNewGame}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-5 text-base rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] tracking-wide font-mono"
            >
              START BUILDING (SPACE)
            </Button>
          </div>
        )}

        {/* Game Over Debrief Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-[0_0_35px_rgba(244,63,94,0.25)]">
              <span className="text-rose-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                TOWER COLLAPSED • SESSION OVER
              </span>
              <h2 className="text-3xl font-black text-rose-400 font-mono tracking-wider mb-4">
                CONSTRUCTION COMPLETE
              </h2>

              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-5 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">FINAL HEIGHT</span>
                  <span className="text-xl font-bold text-emerald-400">{score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">MAX STREAK</span>
                  <span className="text-xl font-bold text-amber-400">{maxCombo}x</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">PERSONAL BEST</span>
                  <span className="text-xl font-bold text-cyan-400">{Math.max(score, highScore)}</span>
                </div>
              </div>

              {/* Hall of Fame Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter architect callsign..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono outline-none flex-1"
                />
                <Button
                  onClick={saveRecord}
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-4 font-mono text-xs"
                >
                  Save Record
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startNewGame}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-5 py-2 font-mono"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Rebuild Tower (Space)
                </Button>
                <Link to="/games">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono">
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
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Trophy className="w-5 h-5" />
                <span>STACK TOWER HALL OF FAME</span>
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

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {records.length === 0 ? (
                <p className="text-center text-sm text-slate-500 py-6">No tower records registered yet.</p>
              ) : (
                records.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-slate-950/60 border border-slate-800 px-3 py-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-5 font-bold ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{rec.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">Streak {rec.perfectStreak}x</span>
                      <span className="font-bold text-emerald-400">Height: {rec.score}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 text-right">
              <Button
                onClick={() => setShowRecords(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs px-5"
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
