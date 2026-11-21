import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, Pause, Play,
  ArrowLeft, Sparkles, Cherry, Heart, Award, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- AUDIO SYNTHESIS ENGINE (Pure Web Audio API) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private wakaStep: boolean = false;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;

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

  playWaka() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      this.wakaStep = !this.wakaStep;
      const freq = this.wakaStep ? 480 : 320;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playPowerPellet() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playEatGhost() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554, 659, 880];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.04 + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.08);
      });
    } catch {}
  }

  playDeath() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch {}
  }

  playFruit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [587, 880, 1174];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.06);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + idx * 0.06 + 0.12);
      });
    } catch {}
  }

  playLevelClear() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- 19x22 CANONICAL MAZE MAP ---
// 1 = Wall, 0 = Dot, 2 = Power Pellet, 3 = Empty/Tunnel, 4 = Ghost House, 5 = Ghost Gate
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 3, 1, 3, 1, 1, 1, 0, 1, 1, 1, 1],
  [3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3],
  [1, 1, 1, 1, 0, 1, 3, 1, 1, 5, 1, 1, 3, 1, 0, 1, 1, 1, 1],
  [3, 3, 3, 3, 0, 3, 3, 1, 4, 4, 4, 1, 3, 3, 0, 3, 3, 3, 3], // Tunnel Row 10
  [1, 1, 1, 1, 0, 1, 3, 1, 1, 1, 1, 1, 3, 1, 0, 1, 1, 1, 1],
  [3, 3, 3, 1, 0, 1, 3, 3, 3, 3, 3, 3, 3, 1, 0, 1, 3, 3, 3],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  [1, 2, 0, 1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 0, 2, 1],
  [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const ROWS = INITIAL_MAP.length; // 22
const COLS = INITIAL_MAP[0].length; // 19
const TILE_SIZE = 24;
const CANVAS_WIDTH = COLS * TILE_SIZE; // 456
const CANVAS_HEIGHT = ROWS * TILE_SIZE; // 528

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | "NONE";

interface Ghost {
  id: "blinky" | "pinky" | "inky" | "clyde";
  name: string;
  x: number;
  y: number;
  dir: Direction;
  targetX: number;
  targetY: number;
  baseColor: string;
  state: "chase" | "scatter" | "frightened" | "eaten";
  speed: number;
  homeX: number;
  homeY: number;
  scatterCornerX: number;
  scatterCornerY: number;
  lastTurnX: number;
  lastTurnY: number;
}

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  level: number;
  date: string;
}

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [fruitActive, setFruitActive] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Engine Refs
  const mapRef = useRef<number[][]>([]);
  const dotsRemainingRef = useRef<number>(0);
  const pacmanRef = useRef({
    x: 9 * TILE_SIZE + TILE_SIZE / 2,
    y: 16 * TILE_SIZE + TILE_SIZE / 2,
    dir: "NONE" as Direction,
    nextDir: "NONE" as Direction,
    speed: 2.4,
    mouthAngle: 0.2,
    mouthDir: 1,
  });

  const ghostsRef = useRef<Ghost[]>([]);
  const ghostScoreChainRef = useRef<number>(200);
  const frightenedTimerRef = useRef<number>(0);
  const modeTimerRef = useRef<number>(0);
  const globalModeRef = useRef<"scatter" | "chase">("scatter");
  const fruitRef = useRef<{ x: number; y: number; active: boolean; timer: number }>({
    x: 9 * TILE_SIZE + TILE_SIZE / 2,
    y: 12 * TILE_SIZE + TILE_SIZE / 2,
    active: false,
    timer: 0,
  });

  const animFrameIdRef = useRef<number | null>(null);
  const gameStatsRef = useRef({ score: 0, level: 1, lives: 3 });

  // Load High Score and Records
  useEffect(() => {
    const savedBest = localStorage.getItem("pacman_cyber_best_score");
    if (savedBest) setHighScore(parseInt(savedBest, 10));

    const savedRecords = localStorage.getItem("pacman_cyber_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "PacChampion", score: 14800, level: 3, date: "2026-11-20" },
        { id: "2", name: "CyberChomper", score: 9600, level: 2, date: "2026-11-19" },
        { id: "3", name: "RetroWaka", score: 5400, level: 1, date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("pacman_cyber_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Initialize Ghosts
  const initGhosts = useCallback(() => {
    ghostsRef.current = [
      {
        id: "blinky",
        name: "Blinky",
        x: 9 * TILE_SIZE + TILE_SIZE / 2,
        y: 8 * TILE_SIZE + TILE_SIZE / 2,
        dir: "LEFT",
        targetX: 0,
        targetY: 0,
        baseColor: "#ef4444", // Red
        state: "scatter",
        speed: 2.1,
        homeX: 9 * TILE_SIZE + TILE_SIZE / 2,
        homeY: 10 * TILE_SIZE + TILE_SIZE / 2,
        scatterCornerX: 18 * TILE_SIZE,
        scatterCornerY: 0,
        lastTurnX: -1,
        lastTurnY: -1,
      },
      {
        id: "pinky",
        name: "Pinky",
        x: 9 * TILE_SIZE + TILE_SIZE / 2,
        y: 10 * TILE_SIZE + TILE_SIZE / 2,
        dir: "UP",
        targetX: 0,
        targetY: 0,
        baseColor: "#f472b6", // Pink
        state: "scatter",
        speed: 2.0,
        homeX: 9 * TILE_SIZE + TILE_SIZE / 2,
        homeY: 10 * TILE_SIZE + TILE_SIZE / 2,
        scatterCornerX: 0,
        scatterCornerY: 0,
        lastTurnX: -1,
        lastTurnY: -1,
      },
      {
        id: "inky",
        name: "Inky",
        x: 8 * TILE_SIZE + TILE_SIZE / 2,
        y: 10 * TILE_SIZE + TILE_SIZE / 2,
        dir: "UP",
        targetX: 0,
        targetY: 0,
        baseColor: "#06b6d4", // Cyan
        state: "scatter",
        speed: 1.95,
        homeX: 8 * TILE_SIZE + TILE_SIZE / 2,
        homeY: 10 * TILE_SIZE + TILE_SIZE / 2,
        scatterCornerX: 18 * TILE_SIZE,
        scatterCornerY: 21 * TILE_SIZE,
        lastTurnX: -1,
        lastTurnY: -1,
      },
      {
        id: "clyde",
        name: "Clyde",
        x: 10 * TILE_SIZE + TILE_SIZE / 2,
        y: 10 * TILE_SIZE + TILE_SIZE / 2,
        dir: "UP",
        targetX: 0,
        targetY: 0,
        baseColor: "#fb923c", // Orange
        state: "scatter",
        speed: 1.9,
        homeX: 10 * TILE_SIZE + TILE_SIZE / 2,
        homeY: 10 * TILE_SIZE + TILE_SIZE / 2,
        scatterCornerX: 0,
        scatterCornerY: 21 * TILE_SIZE,
        lastTurnX: -1,
        lastTurnY: -1,
      },
    ];
  }, []);

  // Initialize Map
  const initBoard = useCallback(() => {
    let dots = 0;
    const newMap = INITIAL_MAP.map(row =>
      row.map(cell => {
        if (cell === 0 || cell === 2) dots++;
        return cell;
      })
    );
    mapRef.current = newMap;
    dotsRemainingRef.current = dots;

    pacmanRef.current.x = 9 * TILE_SIZE + TILE_SIZE / 2;
    pacmanRef.current.y = 16 * TILE_SIZE + TILE_SIZE / 2;
    pacmanRef.current.dir = "NONE";
    pacmanRef.current.nextDir = "NONE";

    initGhosts();
    frightenedTimerRef.current = 0;
    modeTimerRef.current = 0;
    globalModeRef.current = "scatter";
    fruitRef.current.active = false;
  }, [initGhosts]);

  // Start / Reset Game
  const startNewGame = useCallback(() => {
    initBoard();
    gameStatsRef.current = { score: 0, level: 1, lives: 3 };
    setScore(0);
    setLevel(1);
    setLives(3);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  }, [initBoard]);

  // Check if tile is a wall (cannot walk through)
  const isWall = (tileX: number, tileY: number, forGhost: boolean = false): boolean => {
    if (tileY < 0 || tileY >= ROWS) return true;
    // Tunnel wrap rows
    if (tileY === 10 && (tileX < 0 || tileX >= COLS)) return false;
    if (tileX < 0 || tileX >= COLS) return true;

    const val = mapRef.current[tileY][tileX];
    if (val === 1) return true;
    if (val === 5 && !forGhost) return true; // Pacman cannot cross ghost gate
    return false;
  };

  // Move Pac-Man & Ghosts (60 FPS Update)
  const updateGame = () => {
    const pacman = pacmanRef.current;

    // Pacman continuous mouth chomping
    pacman.mouthAngle += 0.04 * pacman.mouthDir;
    if (pacman.mouthAngle > 0.38) pacman.mouthDir = -1;
    if (pacman.mouthAngle < 0.04) pacman.mouthDir = 1;

    // Mode alternation: 7s scatter, 20s chase
    if (frightenedTimerRef.current <= 0) {
      modeTimerRef.current += 1 / 60;
      if (globalModeRef.current === "scatter" && modeTimerRef.current > 7) {
        globalModeRef.current = "chase";
        modeTimerRef.current = 0;
      } else if (globalModeRef.current === "chase" && modeTimerRef.current > 20) {
        globalModeRef.current = "scatter";
        modeTimerRef.current = 0;
      }
    } else {
      frightenedTimerRef.current -= 1 / 60;
    }

    // Pacman Turn Logic
    const curTileX = Math.floor(pacman.x / TILE_SIZE);
    const curTileY = Math.floor(pacman.y / TILE_SIZE);
    const centerX = curTileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = curTileY * TILE_SIZE + TILE_SIZE / 2;

    const atCenter = Math.hypot(pacman.x - centerX, pacman.y - centerY) <= pacman.speed;

    // Check if nextDir can be taken
    if (pacman.nextDir !== "NONE") {
      let targetNextTileX = curTileX;
      let targetNextTileY = curTileY;
      if (pacman.nextDir === "UP") targetNextTileY--;
      if (pacman.nextDir === "DOWN") targetNextTileY++;
      if (pacman.nextDir === "LEFT") targetNextTileX--;
      if (pacman.nextDir === "RIGHT") targetNextTileX++;

      // Immediate reversal allowed anytime
      const isReversal =
        (pacman.dir === "LEFT" && pacman.nextDir === "RIGHT") ||
        (pacman.dir === "RIGHT" && pacman.nextDir === "LEFT") ||
        (pacman.dir === "UP" && pacman.nextDir === "DOWN") ||
        (pacman.dir === "DOWN" && pacman.nextDir === "UP");

      if (pacman.dir === "NONE") {
        if (!isWall(targetNextTileX, targetNextTileY)) {
          pacman.dir = pacman.nextDir;
          pacman.nextDir = "NONE";
        }
      } else if (isReversal) {
        pacman.dir = pacman.nextDir;
        pacman.nextDir = "NONE";
      } else if (atCenter && !isWall(targetNextTileX, targetNextTileY)) {
        pacman.x = centerX;
        pacman.y = centerY;
        pacman.dir = pacman.nextDir;
        pacman.nextDir = "NONE";
      }
    }

    // Move Pacman in current dir
    if (pacman.dir !== "NONE") {
      let forwardTileX = curTileX;
      let forwardTileY = curTileY;
      if (pacman.dir === "UP") forwardTileY--;
      if (pacman.dir === "DOWN") forwardTileY++;
      if (pacman.dir === "LEFT") forwardTileX--;
      if (pacman.dir === "RIGHT") forwardTileX++;

      if (isWall(forwardTileX, forwardTileY)) {
        if (
          (pacman.dir === "LEFT" && pacman.x - pacman.speed <= centerX) ||
          (pacman.dir === "RIGHT" && pacman.x + pacman.speed >= centerX) ||
          (pacman.dir === "UP" && pacman.y - pacman.speed <= centerY) ||
          (pacman.dir === "DOWN" && pacman.y + pacman.speed >= centerY)
        ) {
          pacman.x = centerX;
          pacman.y = centerY;
          pacman.dir = "NONE";
        } else {
          if (pacman.dir === "UP") pacman.y -= pacman.speed;
          if (pacman.dir === "DOWN") pacman.y += pacman.speed;
          if (pacman.dir === "LEFT") pacman.x -= pacman.speed;
          if (pacman.dir === "RIGHT") pacman.x += pacman.speed;
        }
      } else {
        if (pacman.dir === "LEFT" || pacman.dir === "RIGHT") {
          pacman.y = centerY;
          pacman.x += pacman.dir === "LEFT" ? -pacman.speed : pacman.speed;
        } else {
          pacman.x = centerX;
          pacman.y += pacman.dir === "UP" ? -pacman.speed : pacman.speed;
        }
      }
    }

    // Tunnel wrap around
    if (pacman.x < 0) pacman.x = CANVAS_WIDTH;
    if (pacman.x > CANVAS_WIDTH) pacman.x = 0;

    // Dot Eating & Scoring
    const pacTileX = Math.floor(pacman.x / TILE_SIZE);
    const pacTileY = Math.floor(pacman.y / TILE_SIZE);

    if (pacTileX >= 0 && pacTileX < COLS && pacTileY >= 0 && pacTileY < ROWS) {
      const tileVal = mapRef.current[pacTileY][pacTileX];
      if (tileVal === 0) {
        // Eat normal dot
        mapRef.current[pacTileY][pacTileX] = 3;
        dotsRemainingRef.current--;
        gameStatsRef.current.score += 10;
        setScore(gameStatsRef.current.score);
        sounds.playWaka();

        // Spawn bonus fruit when dots are half eaten
        if (dotsRemainingRef.current === 70 && !fruitRef.current.active) {
          fruitRef.current.active = true;
          fruitRef.current.timer = 15;
          setFruitActive(true);
        }
      } else if (tileVal === 2) {
        // Eat Power Pellet
        mapRef.current[pacTileY][pacTileX] = 3;
        dotsRemainingRef.current--;
        gameStatsRef.current.score += 50;
        setScore(gameStatsRef.current.score);
        sounds.playPowerPellet();

        // Frighten all non-eaten ghosts
        frightenedTimerRef.current = 8.5; // 8.5 seconds
        ghostScoreChainRef.current = 200;
        ghostsRef.current.forEach(g => {
          if (g.state !== "eaten") {
            g.state = "frightened";
          }
        });
      }
    }

    // Eat Bonus Fruit
    if (fruitRef.current.active) {
      fruitRef.current.timer -= 1 / 60;
      if (fruitRef.current.timer <= 0) {
        fruitRef.current.active = false;
        setFruitActive(false);
      } else {
        const distFruit = Math.hypot(pacman.x - fruitRef.current.x, pacman.y - fruitRef.current.y);
        if (distFruit < TILE_SIZE / 1.5) {
          sounds.playFruit();
          fruitRef.current.active = false;
          setFruitActive(false);
          gameStatsRef.current.score += 500;
          setScore(gameStatsRef.current.score);
        }
      }
    }

    // Check Level Complete (all dots eaten)
    if (dotsRemainingRef.current <= 0) {
      sounds.playLevelClear();
      gameStatsRef.current.level += 1;
      setLevel(gameStatsRef.current.level);
      initBoard();
      return;
    }

    // Update Ghost AI & Movement
    ghostsRef.current.forEach(ghost => {
      // Set current state
      if (ghost.state !== "eaten") {
        ghost.state = frightenedTimerRef.current > 0 ? "frightened" : globalModeRef.current;
      }

      // Calculate Target Tile based on Canonical Personalities
      if (ghost.state === "scatter") {
        ghost.targetX = ghost.scatterCornerX;
        ghost.targetY = ghost.scatterCornerY;
      } else if (ghost.state === "eaten") {
        ghost.targetX = ghost.homeX;
        ghost.targetY = ghost.homeY;
        // Reached home -> revive
        if (Math.hypot(ghost.x - ghost.homeX, ghost.y - ghost.homeY) < 6) {
          ghost.state = "chase";
        }
      } else if (ghost.state === "frightened") {
        // Random wander
        ghost.targetX = Math.random() * CANVAS_WIDTH;
        ghost.targetY = Math.random() * CANVAS_HEIGHT;
      } else {
        // Chase Mode:
        if (ghost.id === "blinky") {
          // Blinky: Directly targets Pac-Man's tile
          ghost.targetX = pacman.x;
          ghost.targetY = pacman.y;
        } else if (ghost.id === "pinky") {
          // Pinky: Targets 4 tiles ahead of Pac-Man
          let aheadX = pacman.x;
          let aheadY = pacman.y;
          if (pacman.dir === "UP") aheadY -= 4 * TILE_SIZE;
          if (pacman.dir === "DOWN") aheadY += 4 * TILE_SIZE;
          if (pacman.dir === "LEFT") aheadX -= 4 * TILE_SIZE;
          if (pacman.dir === "RIGHT") aheadX += 4 * TILE_SIZE;
          ghost.targetX = aheadX;
          ghost.targetY = aheadY;
        } else if (ghost.id === "inky") {
          // Inky: Vector from Blinky through 2 tiles ahead of Pac-Man
          const blinky = ghostsRef.current.find(g => g.id === "blinky") || ghost;
          const pivotX = pacman.x + (pacman.dir === "RIGHT" ? 2 * TILE_SIZE : -2 * TILE_SIZE);
          const pivotY = pacman.y + (pacman.dir === "DOWN" ? 2 * TILE_SIZE : -2 * TILE_SIZE);
          ghost.targetX = pivotX + (pivotX - blinky.x);
          ghost.targetY = pivotY + (pivotY - blinky.y);
        } else if (ghost.id === "clyde") {
          // Clyde: Chases if > 8 tiles away; retreats to corner if close
          const dist = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
          if (dist > 8 * TILE_SIZE) {
            ghost.targetX = pacman.x;
            ghost.targetY = pacman.y;
          } else {
            ghost.targetX = ghost.scatterCornerX;
            ghost.targetY = ghost.scatterCornerY;
          }
        }
      }

      const currentSpeed = ghost.state === "eaten" ? 4.5 : ghost.state === "frightened" ? 1.4 : ghost.speed;

      // Ghost intersection navigation
      const gTileX = Math.floor(ghost.x / TILE_SIZE);
      const gTileY = Math.floor(ghost.y / TILE_SIZE);
      const gCenterX = gTileX * TILE_SIZE + TILE_SIZE / 2;
      const gCenterY = gTileY * TILE_SIZE + TILE_SIZE / 2;

      const isNewTile = ghost.lastTurnX !== gTileX || ghost.lastTurnY !== gTileY;
      const atGIntersection = Math.hypot(ghost.x - gCenterX, ghost.y - gCenterY) <= currentSpeed * 1.2;

      if (isNewTile && atGIntersection) {
        ghost.x = gCenterX;
        ghost.y = gCenterY;
        ghost.lastTurnX = gTileX;
        ghost.lastTurnY = gTileY;

        // Determine all legal directions (ghosts cannot reverse)
        const possibleDirs: { dir: Direction; tx: number; ty: number }[] = [];
        const opposite: Record<Direction, Direction> = {
          UP: "DOWN",
          DOWN: "UP",
          LEFT: "RIGHT",
          RIGHT: "LEFT",
          NONE: "NONE",
        };

        const testMoves: { dir: Direction; dx: number; dy: number }[] = [
          { dir: "UP", dx: 0, dy: -1 },
          { dir: "DOWN", dx: 0, dy: 1 },
          { dir: "LEFT", dx: -1, dy: 0 },
          { dir: "RIGHT", dx: 1, dy: 0 },
        ];

        testMoves.forEach(move => {
          if (move.dir !== opposite[ghost.dir]) {
            if (!isWall(gTileX + move.dx, gTileY + move.dy, true)) {
              possibleDirs.push({
                dir: move.dir,
                tx: (gTileX + move.dx) * TILE_SIZE + TILE_SIZE / 2,
                ty: (gTileY + move.dy) * TILE_SIZE + TILE_SIZE / 2,
              });
            }
          }
        });

        if (possibleDirs.length === 0 && ghost.dir !== "NONE") {
          const rev = opposite[ghost.dir];
          if (!isWall(gTileX + (rev === "LEFT" ? -1 : rev === "RIGHT" ? 1 : 0), gTileY + (rev === "UP" ? -1 : rev === "DOWN" ? 1 : 0), true)) {
            possibleDirs.push({
              dir: rev,
              tx: gCenterX,
              ty: gCenterY,
            });
          }
        }

        if (possibleDirs.length > 0) {
          if (ghost.state === "frightened") {
            // Random choice in frightened mode
            ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)].dir;
          } else {
            // Minimize distance to target
            possibleDirs.sort((a, b) => {
              const distA = Math.hypot(a.tx - ghost.targetX, a.ty - ghost.targetY);
              const distB = Math.hypot(b.tx - ghost.targetX, b.ty - ghost.targetY);
              return distA - distB;
            });
            ghost.dir = possibleDirs[0].dir;
          }
        }
      }

      // Move ghost
      if (ghost.dir === "UP") {
        ghost.y -= currentSpeed;
        ghost.x = gCenterX;
      } else if (ghost.dir === "DOWN") {
        ghost.y += currentSpeed;
        ghost.x = gCenterX;
      } else if (ghost.dir === "LEFT") {
        ghost.x -= currentSpeed;
        ghost.y = gCenterY;
      } else if (ghost.dir === "RIGHT") {
        ghost.x += currentSpeed;
        ghost.y = gCenterY;
      }

      // Tunnel wrap
      if (ghost.x < 0) ghost.x = CANVAS_WIDTH;
      if (ghost.x > CANVAS_WIDTH) ghost.x = 0;

      // Check Collision with Pac-Man
      const distToPac = Math.hypot(ghost.x - pacman.x, ghost.y - pacman.y);
      if (distToPac < TILE_SIZE * 0.75) {
        if (ghost.state === "frightened") {
          // Eat Ghost!
          sounds.playEatGhost();
          ghost.state = "eaten";
          const pointsEarned = ghostScoreChainRef.current;
          ghostScoreChainRef.current *= 2;
          gameStatsRef.current.score += pointsEarned;
          setScore(gameStatsRef.current.score);
        } else if (ghost.state !== "eaten") {
          // Pacman hit!
          sounds.playDeath();
          gameStatsRef.current.lives -= 1;
          setLives(gameStatsRef.current.lives);

          if (gameStatsRef.current.lives <= 0) {
            triggerGameOver();
          } else {
            // Reset positions
            pacman.x = 9 * TILE_SIZE + TILE_SIZE / 2;
            pacman.y = 16 * TILE_SIZE + TILE_SIZE / 2;
            pacman.dir = "NONE";
            pacman.nextDir = "NONE";
            initGhosts();
          }
        }
      }
    });
  };

  // Trigger Game Over
  const triggerGameOver = () => {
    setIsGameOver(true);
    setIsPlaying(false);

    if (gameStatsRef.current.score > highScore) {
      setHighScore(gameStatsRef.current.score);
      localStorage.setItem("pacman_cyber_best_score", gameStatsRef.current.score.toString());
    }
  };

  // Keyboard Event Isolation: WASD in input does not trigger game movement
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        pacmanRef.current.nextDir = "UP";
        if (!isPlaying && !isGameOver) startNewGame();
      } else if (e.code === "ArrowDown" || e.code === "KeyS") {
        e.preventDefault();
        pacmanRef.current.nextDir = "DOWN";
        if (!isPlaying && !isGameOver) startNewGame();
      } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        e.preventDefault();
        pacmanRef.current.nextDir = "LEFT";
        if (!isPlaying && !isGameOver) startNewGame();
      } else if (e.code === "ArrowRight" || e.code === "KeyD") {
        e.preventDefault();
        pacmanRef.current.nextDir = "RIGHT";
        if (!isPlaying && !isGameOver) startNewGame();
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (!isPlaying && !isGameOver) startNewGame();
      }

      if (e.code === "Escape") {
        e.preventDefault();
        if (isPlaying && !isGameOver) {
          setIsPaused(prev => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, startNewGame]);

  // Main 60 FPS Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pulseTimer = 0;

    const render = () => {
      animFrameIdRef.current = requestAnimationFrame(render);

      if (isPlaying && !isPaused && !isGameOver) {
        updateGame();
      }

      pulseTimer += 0.05;

      // Clear Canvas Background
      ctx.fillStyle = "#030712"; // Deep black
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Render Maze Walls & Pellets
      if (mapRef.current.length > 0) {
        for (let r = 0; r < ROWS; r++) {
          for (let c = 0; c < COLS; c++) {
            const val = mapRef.current[r][c];
            const px = c * TILE_SIZE;
            const py = r * TILE_SIZE;

            if (val === 1) {
              // Neon Cyber Wall
              ctx.save();
              ctx.strokeStyle = "#3b82f6"; // Blue wall
              ctx.lineWidth = 2;
              ctx.shadowColor = "#3b82f6";
              ctx.shadowBlur = 6;
              ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);
              ctx.restore();
            } else if (val === 5) {
              // Ghost Gate
              ctx.fillStyle = "rgba(244, 114, 182, 0.6)";
              ctx.fillRect(px, py + TILE_SIZE / 2 - 2, TILE_SIZE, 4);
            } else if (val === 0) {
              // Normal Dot
              ctx.fillStyle = "#fef08a"; // Soft yellow
              ctx.beginPath();
              ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, 2.5, 0, Math.PI * 2);
              ctx.fill();
            } else if (val === 2) {
              // Energizer Power Pellet (Pulsing)
              const pulseSize = 5 + Math.sin(pulseTimer * 3) * 1.5;
              ctx.save();
              ctx.fillStyle = "#ffffff";
              ctx.shadowColor = "#facc15";
              ctx.shadowBlur = 12;
              ctx.beginPath();
              ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, pulseSize, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }
          }
        }
      }

      // Render Bonus Fruit
      if (fruitRef.current.active) {
        ctx.save();
        ctx.font = "18px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🍒", fruitRef.current.x, fruitRef.current.y);
        ctx.restore();
      }

      // Render Pac-Man
      const pac = pacmanRef.current;
      ctx.save();
      ctx.fillStyle = "#facc15"; // Cyber Yellow
      ctx.shadowColor = "#facc15";
      ctx.shadowBlur = 12;

      let rotation = 0;
      if (pac.dir === "UP") rotation = 1.5 * Math.PI;
      if (pac.dir === "DOWN") rotation = 0.5 * Math.PI;
      if (pac.dir === "LEFT") rotation = Math.PI;
      if (pac.dir === "RIGHT") rotation = 0;

      ctx.beginPath();
      ctx.moveTo(pac.x, pac.y);
      ctx.arc(
        pac.x,
        pac.y,
        TILE_SIZE / 2 - 1.5,
        rotation + pac.mouthAngle * Math.PI,
        rotation + (2 - pac.mouthAngle) * Math.PI
      );
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Render Ghosts
      ghostsRef.current.forEach(ghost => {
        ctx.save();
        const isFrightened = ghost.state === "frightened";
        const isEaten = ghost.state === "eaten";
        const isFrightenedEnding = isFrightened && frightenedTimerRef.current < 2.5;

        let ghostColor = ghost.baseColor;
        if (isFrightened) {
          ghostColor = isFrightenedEnding && Math.floor(pulseTimer * 8) % 2 === 0 ? "#ffffff" : "#1d4ed8"; // Flashing blue/white
        }

        const gx = ghost.x;
        const gy = ghost.y;
        const radius = TILE_SIZE / 2 - 2;

        if (!isEaten) {
          ctx.fillStyle = ghostColor;
          ctx.shadowColor = ghostColor;
          ctx.shadowBlur = 10;

          // Ghost Head (Half circle)
          ctx.beginPath();
          ctx.arc(gx, gy - 2, radius, Math.PI, 0, false);
          // Ghost Skirt
          ctx.lineTo(gx + radius, gy + radius);
          // Wavy bottom skirt tentacles
          ctx.lineTo(gx + radius / 2, gy + radius - 4);
          ctx.lineTo(gx, gy + radius);
          ctx.lineTo(gx - radius / 2, gy + radius - 4);
          ctx.lineTo(gx - radius, gy + radius);
          ctx.closePath();
          ctx.fill();
        }

        // Eyes
        const eyeOffsetX = ghost.dir === "RIGHT" ? 2 : ghost.dir === "LEFT" ? -2 : 0;
        const eyeOffsetY = ghost.dir === "DOWN" ? 2 : ghost.dir === "UP" ? -2 : 0;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(gx - 4 + eyeOffsetX, gy - 4 + eyeOffsetY, 3, 0, Math.PI * 2);
        ctx.arc(gx + 4 + eyeOffsetX, gy - 4 + eyeOffsetY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = isFrightened ? "#facc15" : "#0284c7";
        ctx.beginPath();
        ctx.arc(gx - 4 + eyeOffsetX * 1.5, gy - 4 + eyeOffsetY * 1.5, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + 4 + eyeOffsetX * 1.5, gy - 4 + eyeOffsetY * 1.5, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Pause Screen
      if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 26px monospace";
        ctx.textAlign = "center";
        ctx.fillText("SIMULATION PAUSED", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "14px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Press ESC to Resume Maze", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, isPaused, isGameOver]);

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Pac Pilot";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      score: gameStatsRef.current.score,
      level: gameStatsRef.current.level,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("pacman_cyber_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[460px] flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md px-3 py-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 gap-1.5 font-mono text-xs">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
              CANONICAL GHOST AI • 60 FPS
            </span>
            <h1 className="text-sm sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-cyan-400">
              PAC-MAN PRO
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                sounds.enabled = !sounds.enabled;
                setSoundMuted(!sounds.enabled);
              }}
              className="h-7 w-7 border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/60"
              title={soundMuted ? "Unmute" : "Mute"}
            >
              {soundMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowRecords(true)}
              className="h-7 w-7 border-amber-500/40 text-amber-400 hover:bg-amber-950/60"
              title="Hall of Fame"
            >
              <Trophy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={!isPlaying || isGameOver}
              onClick={() => setIsPaused(prev => !prev)}
              className="h-7 w-7 border-indigo-500/40 text-indigo-400 hover:bg-indigo-950/60"
              title="Pause Game (Esc)"
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Live HUD Dashboard */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-900/70 border border-slate-800 rounded-lg p-1.5 text-center font-mono">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400">SCORE</span>
            <span className="text-xs sm:text-sm font-bold text-yellow-400">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400">HIGH</span>
            <span className="text-xs sm:text-sm font-bold text-amber-400">{Math.max(score, highScore)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400">LIVES</span>
            <span className="text-xs sm:text-sm font-bold text-rose-400">
              {"🟡".repeat(Math.max(0, lives))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400">LEVEL</span>
            <span className="text-xs sm:text-sm font-bold text-cyan-400">{level}</span>
          </div>
        </div>
      </div>

      {/* Main Maze Canvas Container */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.25)] bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full max-w-[456px] h-auto block"
        />

        {/* Start Screen Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 text-center">
            <span className="text-4xl mb-2 animate-bounce">🟡</span>
            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-cyan-400 tracking-wider mb-2 font-mono">
              PAC-MAN PRO
            </h2>

            <p className="text-xs text-slate-300 max-w-xs mb-4 leading-relaxed font-mono">
              Chomp all dots, avoid the 4 autonomous ghosts, seize the pulsing Power Pellets, and hunt them down!
            </p>

            {/* Ghost Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono mb-4 text-left bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Blinky: Direct Chaser</span>
              </div>
              <div className="flex items-center gap-1.5 text-pink-400">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Pinky: Ambusher (+4)</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Inky: Vector Flanker</span>
              </div>
              <div className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Clyde: Shy Wanderer</span>
              </div>
            </div>

            <Button
              onClick={startNewGame}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black px-6 py-4 rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.4)] tracking-wide font-mono text-sm"
            >
              START GAME (SPACE)
            </Button>
          </div>
        )}

        {/* Game Over Debrief Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 text-center">
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-5 max-w-sm w-full shadow-[0_0_30px_rgba(244,63,94,0.25)]">
              <span className="text-rose-400 font-mono text-[10px] uppercase tracking-widest font-bold block mb-1">
                LIVES DEPLETED • SESSION OVER
              </span>
              <h2 className="text-2xl font-black text-rose-400 font-mono tracking-wider mb-3">
                GAME OVER
              </h2>

              <div className="grid grid-cols-2 gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 mb-4 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">FINAL SCORE</span>
                  <span className="text-base font-bold text-yellow-400">{score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">LEVEL REACHED</span>
                  <span className="text-base font-bold text-cyan-400">{level}</span>
                </div>
              </div>

              {/* Hall of Fame Input */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Enter callsign..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-900 border border-slate-700 focus:border-yellow-400 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none flex-1"
                />
                <Button
                  onClick={saveRecord}
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-3 font-mono text-xs"
                >
                  Save
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={startNewGame}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Play Again
                </Button>
                <Link to="/games">
                  <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono">
                    All Games
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Direction Controls */}
      <div className="flex flex-col items-center gap-1 mt-3 sm:hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => { pacmanRef.current.nextDir = "UP"; }}
          className="w-12 h-10 border-slate-700 text-cyan-400"
        >
          ▲
        </Button>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => { pacmanRef.current.nextDir = "LEFT"; }}
            className="w-12 h-10 border-slate-700 text-cyan-400"
          >
            ◀
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { pacmanRef.current.nextDir = "DOWN"; }}
            className="w-12 h-10 border-slate-700 text-cyan-400"
          >
            ▼
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { pacmanRef.current.nextDir = "RIGHT"; }}
            className="w-12 h-10 border-slate-700 text-cyan-400"
          >
            ▶
          </Button>
        </div>
      </div>

      {/* Hall of Fame Records Modal */}
      {showRecords && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-yellow-500/40 rounded-2xl max-w-sm w-full p-5 shadow-[0_0_40px_rgba(250,204,21,0.2)] font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm">
                <Trophy className="w-4 h-4" />
                <span>PAC-MAN HALL OF FAME</span>
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
                <p className="text-center text-xs text-slate-500 py-4">No records registered yet.</p>
              ) : (
                records.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-4 font-bold ${idx === 0 ? "text-yellow-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{rec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Lvl {rec.level}</span>
                      <span className="font-bold text-yellow-400">{rec.score} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-right">
              <Button
                onClick={() => setShowRecords(false)}
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold font-mono text-xs px-4"
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
