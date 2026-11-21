import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { 
  Trophy, RotateCcw, Volume2, VolumeX, Pause, Play, 
  ArrowLeft, Shield, Zap, Sparkles, Award, Rocket, Crosshair
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- AUDIO SYNTHESIS ENGINE (Pure Web Audio API) ---
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    // Lazily initialized on first user gesture
  }

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

  playLaser() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {
      // AudioContext fallback
    }
  }

  playInvaderHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    } catch {}
  }

  playExplosion(large: boolean = false) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * (large ? 0.35 : 0.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(large ? 400 : 800, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + (large ? 0.35 : 0.2));

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(large ? 0.35 : 0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + (large ? 0.35 : 0.2));

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {}
  }

  playPowerup() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const freqs = [330, 440, 550, 660, 880];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.04);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.04 + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.04);
        osc.stop(this.ctx.currentTime + idx * 0.04 + 0.08);
      });
    } catch {}
  }

  playBomb() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch {}
  }

  playWaveClear() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.25);
      });
    } catch {}
  }

  playPlayerHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- GAME DATA INTERFACES ---
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
  color: string;
  radius: number;
  piercing?: boolean;
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

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

interface Invader {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "scout" | "cruiser" | "dreadnought" | "boss";
  hp: number;
  maxHp: number;
  color: string;
  points: number;
  shootCooldown: number;
}

interface PowerUp {
  x: number;
  y: number;
  vy: number;
  type: "triple" | "laser" | "shield" | "bomb" | "life";
  symbol: string;
  color: string;
  duration: number; // in seconds
}

interface Bunker {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
}

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  wave: number;
  aliensKilled: number;
  date: string;
}

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 640;

export default function SpaceDefenderGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-level React States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [wave, setWave] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [bombs, setBombs] = useState<number>(2);
  const [shieldActive, setShieldActive] = useState<boolean>(false);
  const [weaponType, setWeaponType] = useState<string>("single");
  const [aliensKilled, setAliensKilled] = useState<number>(0);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [waveClearNotice, setWaveClearNotice] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Mutable Game Engine Refs (for 60fps loop performance)
  const playerRef = useRef({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    width: 44,
    height: 40,
    speed: 6.5,
    invincibleTimer: 0,
    shootCooldown: 0,
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const bulletsRef = useRef<Bullet[]>([]);
  const invadersRef = useRef<Invader[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const bunkersRef = useRef<Bunker[]>([]);
  const starsRef = useRef<Star[]>([]);
  const ufoRef = useRef<{ x: number; y: number; active: boolean; hp: number; points: number } | null>(null);
  const invaderDirectionRef = useRef<number>(1); // 1 = right, -1 = left
  const invaderStepTimerRef = useRef<number>(0);
  const invaderMoveIntervalRef = useRef<number>(45); // frames between steps
  const weaponTimerRef = useRef<number>(0);
  const shieldTimerRef = useRef<number>(0);
  const gameStatsRef = useRef({ score: 0, wave: 1, lives: 3, aliensKilled: 0, bombs: 2 });
  const animFrameIdRef = useRef<number | null>(null);

  // Load High Score and Records
  useEffect(() => {
    const savedBest = localStorage.getItem("space_defender_best_score");
    if (savedBest) setHighScore(parseInt(savedBest, 10));

    const savedRecords = localStorage.getItem("space_defender_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "NovaAce", score: 8500, wave: 6, aliensKilled: 120, date: "2026-11-20" },
        { id: "2", name: "StarGuardian", score: 5400, wave: 4, aliensKilled: 85, date: "2026-11-19" },
        { id: "3", name: "CyberPilot", score: 3200, wave: 3, aliensKilled: 50, date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("space_defender_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Initialize background starfield
  const initStars = useCallback(() => {
    const stars: Star[] = [];
    for (let i = 0; i < 90; i++) {
      stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.4,
        color: Math.random() > 0.4 ? "#38bdf8" : Math.random() > 0.5 ? "#c084fc" : "#ffffff",
      });
    }
    starsRef.current = stars;
  }, []);

  // Initialize bunkers
  const initBunkers = useCallback(() => {
    const bunkers: Bunker[] = [];
    const count = 4;
    const bunkerWidth = 60;
    const bunkerHeight = 32;
    const spacing = (CANVAS_WIDTH - (count * bunkerWidth)) / (count + 1);

    for (let i = 0; i < count; i++) {
      bunkers.push({
        x: spacing + i * (bunkerWidth + spacing),
        y: CANVAS_HEIGHT - 130,
        width: bunkerWidth,
        height: bunkerHeight,
        hp: 30,
        maxHp: 30,
      });
    }
    bunkersRef.current = bunkers;
  }, []);

  // Spawn Invaders for a specific Wave
  const spawnInvaders = useCallback((waveNum: number) => {
    const invaders: Invader[] = [];
    const isBossWave = waveNum % 3 === 0;

    if (isBossWave) {
      // Spawn Giant Cyber Mothership Titan
      const bossHp = 120 + (waveNum * 40);
      invaders.push({
        id: 9999,
        x: CANVAS_WIDTH / 2 - 80,
        y: 60,
        width: 160,
        height: 75,
        type: "boss",
        hp: bossHp,
        maxHp: bossHp,
        color: "#f43f5e",
        points: 3000 + (waveNum * 500),
        shootCooldown: 30,
      });

      // Flanked by escort cruisers
      for (let i = 0; i < 4; i++) {
        invaders.push({
          id: i + 1,
          x: 60 + i * 180,
          y: 160,
          width: 36,
          height: 28,
          type: "cruiser",
          hp: 3,
          maxHp: 3,
          color: "#a855f7",
          points: 150,
          shootCooldown: Math.floor(Math.random() * 60) + 40,
        });
      }
    } else {
      // Standard Fleet Formation (5 rows x 9 columns)
      const rows = Math.min(5, 3 + Math.floor(waveNum / 2));
      const cols = 9;
      const invWidth = 34;
      const invHeight = 24;
      const startX = 70;
      const startY = 65;
      const gapX = 36;
      const gapY = 24;

      let id = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let type: "scout" | "cruiser" | "dreadnought" = "scout";
          let hp = 1;
          let color = "#06b6d4"; // Cyan scout
          let points = 50;

          if (r === 0) {
            type = "dreadnought";
            hp = 3;
            color = "#f43f5e"; // Red dreadnought
            points = 200;
          } else if (r === 1 || r === 2) {
            type = "cruiser";
            hp = 2;
            color = "#a855f7"; // Purple cruiser
            points = 100;
          }

          invaders.push({
            id: id++,
            x: startX + c * (invWidth + gapX),
            y: startY + r * (invHeight + gapY),
            width: invWidth,
            height: invHeight,
            type,
            hp,
            maxHp: hp,
            color,
            points,
            shootCooldown: Math.floor(Math.random() * 120) + 60,
          });
        }
      }
    }

    invadersRef.current = invaders;
    invaderDirectionRef.current = 1;
    invaderMoveIntervalRef.current = Math.max(12, 45 - waveNum * 4);
  }, []);

  // Start / Reset Game
  const startNewGame = useCallback(() => {
    initStars();
    initBunkers();
    playerRef.current.x = CANVAS_WIDTH / 2;
    playerRef.current.y = CANVAS_HEIGHT - 60;
    playerRef.current.invincibleTimer = 60;
    bulletsRef.current = [];
    particlesRef.current = [];
    powerUpsRef.current = [];
    ufoRef.current = null;

    gameStatsRef.current = {
      score: 0,
      wave: 1,
      lives: 3,
      aliensKilled: 0,
      bombs: 2,
    };

    setScore(0);
    setWave(1);
    setLives(3);
    setBombs(2);
    setShieldActive(false);
    setWeaponType("single");
    setAliensKilled(0);
    setIsGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
    setWaveClearNotice(null);

    spawnInvaders(1);
  }, [initStars, initBunkers, spawnInvaders]);

  // Trigger Bomb / EMP Shockwave
  const fireBomb = useCallback(() => {
    if (gameStatsRef.current.bombs <= 0 || !isPlaying || isGameOver || isPaused) return;

    gameStatsRef.current.bombs -= 1;
    setBombs(gameStatsRef.current.bombs);
    sounds.playBomb();

    // Clear all enemy bullets
    bulletsRef.current = bulletsRef.current.filter(b => b.isPlayer);

    // Damage all invaders on screen
    let killedCount = 0;
    let earnedScore = 0;

    invadersRef.current.forEach(inv => {
      inv.hp -= 2;
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          x: inv.x + inv.width / 2,
          y: inv.y + inv.height / 2,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          color: "#38bdf8",
          size: Math.random() * 4 + 2,
          alpha: 1,
          decay: 0.03,
        });
      }
      if (inv.hp <= 0) {
        killedCount++;
        earnedScore += inv.points;
      }
    });

    invadersRef.current = invadersRef.current.filter(inv => inv.hp > 0);
    if (killedCount > 0) {
      gameStatsRef.current.aliensKilled += killedCount;
      gameStatsRef.current.score += earnedScore;
      setScore(gameStatsRef.current.score);
      setAliensKilled(gameStatsRef.current.aliensKilled);
    }
  }, [isPlaying, isGameOver, isPaused]);

  // Toggle Sound
  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundMuted(!sounds.enabled);
  };

  // Keyboard Event Listeners with Strict Input Field Isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return; // Do not swallow WASD or space when typing in input boxes
      }

      keysRef.current[e.code] = true;

      if (e.code === "Space") {
        e.preventDefault();
        if (!isPlaying && !isGameOver) {
          startNewGame();
        }
      }

      if (e.code === "KeyB") {
        e.preventDefault();
        fireBomb();
      }

      if (e.code === "Escape") {
        e.preventDefault();
        if (isPlaying && !isGameOver) {
          setIsPaused(prev => !prev);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      keysRef.current[e.code] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isGameOver, startNewGame, fireBomb]);

  // Handle Mouse movement for smooth paddle / starfighter steering
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || isPaused || isGameOver) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    playerRef.current.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, mouseX));
  };

  const handleCanvasClick = () => {
    if (!isPlaying && !isGameOver) {
      startNewGame();
    }
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Clear Canvas
      ctx.fillStyle = "#030712"; // Deep space black
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 1. Update and Render Starfield
      starsRef.current.forEach(star => {
        star.y += star.speed;
        if (star.y > CANVAS_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * CANVAS_WIDTH;
        }
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Cyber Grid Horizon Lines
      ctx.strokeStyle = "rgba(56, 189, 248, 0.05)";
      ctx.lineWidth = 1;
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      if (!isPlaying) {
        return;
      }

      if (isPaused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 32px monospace";
        ctx.textAlign = "center";
        ctx.fillText("TACTICAL PAUSE", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        ctx.font = "16px monospace";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText("Press ESC to Resume Defense", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);
        return;
      }

      const player = playerRef.current;

      // 2. Player Input Movement
      if (keysRef.current["ArrowLeft"] || keysRef.current["KeyA"]) {
        player.x -= player.speed;
      }
      if (keysRef.current["ArrowRight"] || keysRef.current["KeyD"]) {
        player.x += player.speed;
      }
      player.x = Math.max(player.width / 2, Math.min(CANVAS_WIDTH - player.width / 2, player.x));

      // Player Fire
      if (player.shootCooldown > 0) player.shootCooldown--;
      const isFiring = keysRef.current["Space"] || keysRef.current["ArrowUp"] || keysRef.current["KeyW"];

      if (isFiring && player.shootCooldown <= 0) {
        sounds.playLaser();
        const curWeapon = weaponTimerRef.current > 0 ? "triple" : "single";

        if (curWeapon === "single") {
          bulletsRef.current.push({
            x: player.x,
            y: player.y - 20,
            vx: 0,
            vy: -11,
            isPlayer: true,
            color: "#38bdf8",
            radius: 3.5,
          });
          player.shootCooldown = 14;
        } else if (curWeapon === "triple") {
          bulletsRef.current.push(
            { x: player.x, y: player.y - 20, vx: 0, vy: -12, isPlayer: true, color: "#facc15", radius: 4 },
            { x: player.x - 12, y: player.y - 15, vx: -2.5, vy: -11, isPlayer: true, color: "#facc15", radius: 3.5 },
            { x: player.x + 12, y: player.y - 15, vx: 2.5, vy: -11, isPlayer: true, color: "#facc15", radius: 3.5 }
          );
          player.shootCooldown = 11;
        }
      }

      // Decrement timers
      if (player.invincibleTimer > 0) player.invincibleTimer--;
      if (weaponTimerRef.current > 0) {
        weaponTimerRef.current -= dt;
        if (weaponTimerRef.current <= 0) setWeaponType("single");
      }
      if (shieldTimerRef.current > 0) {
        shieldTimerRef.current -= dt;
        if (shieldTimerRef.current <= 0) setShieldActive(false);
      }

      // 3. UFO Mystery Mothership Spawning
      if (!ufoRef.current && Math.random() < 0.0015) {
        ufoRef.current = {
          x: -50,
          y: 28,
          active: true,
          hp: 4,
          points: 1000,
        };
      }

      if (ufoRef.current && ufoRef.current.active) {
        ufoRef.current.x += 2.2;
        if (ufoRef.current.x > CANVAS_WIDTH + 60) {
          ufoRef.current = null;
        } else {
          // Render UFO
          ctx.save();
          ctx.shadowColor = "#f43f5e";
          ctx.shadowBlur = 12;
          ctx.fillStyle = "#ec4899";
          ctx.beginPath();
          ctx.ellipse(ufoRef.current.x, ufoRef.current.y, 28, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#38bdf8";
          ctx.beginPath();
          ctx.arc(ufoRef.current.x, ufoRef.current.y - 4, 10, Math.PI, 0);
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. Update Invaders Movement & Formation Stepping
      const invaders = invadersRef.current;
      invaderStepTimerRef.current++;

      if (invaders.length > 0) {
        // Dynamic speed up as invaders decrease
        const speedMultiplier = 1 + (1 - invaders.length / 45) * 1.5;
        const currentInterval = Math.max(6, Math.floor(invaderMoveIntervalRef.current / speedMultiplier));

        if (invaderStepTimerRef.current >= currentInterval) {
          invaderStepTimerRef.current = 0;

          // Check if boundary hit
          let hitEdge = false;
          let minX = CANVAS_WIDTH;
          let maxX = 0;

          invaders.forEach(inv => {
            if (inv.x < minX) minX = inv.x;
            if (inv.x + inv.width > maxX) maxX = inv.x + inv.width;
          });

          if ((invaderDirectionRef.current === 1 && maxX >= CANVAS_WIDTH - 24) ||
              (invaderDirectionRef.current === -1 && minX <= 24)) {
            hitEdge = true;
            invaderDirectionRef.current *= -1;
          }

          invaders.forEach(inv => {
            if (hitEdge) {
              inv.y += 18; // Drop down row
            } else {
              inv.x += invaderDirectionRef.current * 10;
            }

            // Invaders touching bottom / bunker level -> Game Over
            if (inv.y + inv.height >= CANVAS_HEIGHT - 80) {
              triggerGameOver();
            }
          });
        }

        // Invaders Shooting
        invaders.forEach(inv => {
          inv.shootCooldown--;
          if (inv.shootCooldown <= 0) {
            inv.shootCooldown = Math.floor(Math.random() * 140) + 70;
            // Only shoot if in front column or boss
            if (Math.random() < 0.28 || inv.type === "boss") {
              bulletsRef.current.push({
                x: inv.x + inv.width / 2,
                y: inv.y + inv.height,
                vx: inv.type === "boss" ? (Math.random() - 0.5) * 3 : 0,
                vy: inv.type === "boss" ? 6.5 : 4.8,
                isPlayer: false,
                color: inv.color,
                radius: inv.type === "boss" ? 5 : 3.5,
              });
            }
          }
        });
      } else {
        // Wave Cleared!
        handleWaveCleared();
      }

      // 5. Update & Render Bullets
      const activeBullets: Bullet[] = [];
      bulletsRef.current.forEach(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        // Draw bullet
        ctx.save();
        ctx.shadowColor = bullet.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = bullet.color;
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fill();

        // Laser trail
        ctx.strokeStyle = bullet.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.vx * 2, bullet.y - bullet.vy * 2);
        ctx.stroke();
        ctx.restore();

        let bulletDestroyed = false;

        // Player bullet hits UFO
        if (bullet.isPlayer && ufoRef.current && ufoRef.current.active) {
          const ufo = ufoRef.current;
          if (
            bullet.x >= ufo.x - 28 &&
            bullet.x <= ufo.x + 28 &&
            bullet.y >= ufo.y - 12 &&
            bullet.y <= ufo.y + 12
          ) {
            ufo.hp--;
            bulletDestroyed = true;
            sounds.playInvaderHit();

            if (ufo.hp <= 0) {
              sounds.playExplosion(true);
              ufo.active = false;
              gameStatsRef.current.score += ufo.points;
              setScore(gameStatsRef.current.score);

              // Spawn rare powerup
              powerUpsRef.current.push({
                x: ufo.x,
                y: ufo.y,
                vy: 2.2,
                type: Math.random() > 0.5 ? "triple" : "shield",
                symbol: "⚡",
                color: "#facc15",
                duration: 10,
              });
            }
          }
        }

        // Player bullet hits Invaders
        if (bullet.isPlayer && !bulletDestroyed) {
          for (let i = 0; i < invadersRef.current.length; i++) {
            const inv = invadersRef.current[i];
            if (
              bullet.x >= inv.x &&
              bullet.x <= inv.x + inv.width &&
              bullet.y >= inv.y &&
              bullet.y <= inv.y + inv.height
            ) {
              bulletDestroyed = true;
              inv.hp--;
              sounds.playInvaderHit();

              // Spark particles
              for (let p = 0; p < 5; p++) {
                particlesRef.current.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  color: inv.color,
                  size: Math.random() * 3 + 1,
                  alpha: 1,
                  decay: 0.05,
                });
              }

              if (inv.hp <= 0) {
                sounds.playExplosion(inv.type === "boss");
                gameStatsRef.current.score += inv.points;
                gameStatsRef.current.aliensKilled += 1;
                setScore(gameStatsRef.current.score);
                setAliensKilled(gameStatsRef.current.aliensKilled);

                // Chance to drop power-up
                if (Math.random() < 0.16 || inv.type === "boss") {
                  const types: ("triple" | "laser" | "shield" | "bomb" | "life")[] = [
                    "triple", "shield", "bomb", "life"
                  ];
                  const chosenType = types[Math.floor(Math.random() * types.length)];
                  const symbols = {
                    triple: "⚡",
                    shield: "🛡️",
                    bomb: "💣",
                    life: "❤️",
                    laser: "🔫"
                  };
                  const colors = {
                    triple: "#facc15",
                    shield: "#38bdf8",
                    bomb: "#f97316",
                    life: "#ef4444",
                    laser: "#a855f7"
                  };

                  powerUpsRef.current.push({
                    x: inv.x + inv.width / 2,
                    y: inv.y + inv.height / 2,
                    vy: 2.2,
                    type: chosenType,
                    symbol: symbols[chosenType],
                    color: colors[chosenType],
                    duration: 10,
                  });
                }

                invadersRef.current.splice(i, 1);
              }
              break;
            }
          }
        }

        // Enemy bullet hits Player
        if (!bullet.isPlayer && !bulletDestroyed) {
          const p = playerRef.current;
          const hitRadius = p.width / 2;
          const dist = Math.hypot(bullet.x - p.x, bullet.y - p.y);

          if (dist < hitRadius && p.invincibleTimer <= 0) {
            bulletDestroyed = true;

            if (shieldTimerRef.current > 0) {
              // Shield absorbed hit!
              sounds.playInvaderHit();
              shieldTimerRef.current = 0;
              setShieldActive(false);
              for (let k = 0; k < 12; k++) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 6,
                  vy: (Math.random() - 0.5) * 6,
                  color: "#38bdf8",
                  size: 3,
                  alpha: 1,
                  decay: 0.04,
                });
              }
            } else {
              // Player damaged
              sounds.playPlayerHit();
              gameStatsRef.current.lives -= 1;
              setLives(gameStatsRef.current.lives);
              p.invincibleTimer = 90; // invulnerability frames

              // Debris
              for (let k = 0; k < 15; k++) {
                particlesRef.current.push({
                  x: p.x,
                  y: p.y,
                  vx: (Math.random() - 0.5) * 8,
                  vy: (Math.random() - 0.5) * 8,
                  color: "#f43f5e",
                  size: 4,
                  alpha: 1,
                  decay: 0.03,
                });
              }

              if (gameStatsRef.current.lives <= 0) {
                triggerGameOver();
              }
            }
          }
        }

        // Bullet hits Defensive Bunkers
        if (!bulletDestroyed) {
          bunkersRef.current.forEach(bunker => {
            if (
              bunker.hp > 0 &&
              bullet.x >= bunker.x &&
              bullet.x <= bunker.x + bunker.width &&
              bullet.y >= bunker.y &&
              bullet.y <= bunker.y + bunker.height
            ) {
              bunker.hp -= 1;
              bulletDestroyed = true;
              for (let k = 0; k < 4; k++) {
                particlesRef.current.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  color: "#10b981",
                  size: 2,
                  alpha: 1,
                  decay: 0.06,
                });
              }
            }
          });
        }

        // Keep bullets inside bounds
        if (!bulletDestroyed && bullet.y > -20 && bullet.y < CANVAS_HEIGHT + 20) {
          activeBullets.push(bullet);
        }
      });
      bulletsRef.current = activeBullets;

      // 6. Render Bunkers with Progressive Damage Degradation
      bunkersRef.current.forEach(bunker => {
        if (bunker.hp <= 0) return;
        const healthPercent = bunker.hp / bunker.maxHp;
        ctx.save();
        ctx.fillStyle = `rgba(16, 185, 129, ${0.3 + healthPercent * 0.7})`;
        ctx.strokeStyle = "#34d399";
        ctx.lineWidth = 1.5;

        // Arch bunker shape
        ctx.beginPath();
        ctx.roundRect(bunker.x, bunker.y, bunker.width, bunker.height, [8, 8, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Holographic bunker lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(bunker.x, bunker.y + (i * bunker.height) / 4);
          ctx.lineTo(bunker.x + bunker.width, bunker.y + (i * bunker.height) / 4);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 7. Render Invaders with Animated Hulls & Glowing Eyes
      invadersRef.current.forEach(inv => {
        ctx.save();
        ctx.shadowColor = inv.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = inv.color;

        if (inv.type === "boss") {
          // Giant Titan Boss
          ctx.beginPath();
          ctx.roundRect(inv.x, inv.y, inv.width, inv.height, 16);
          ctx.fill();

          // Boss Core
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(inv.x + inv.width / 2, inv.y + inv.height / 2, 18, 0, Math.PI * 2);
          ctx.fill();

          // Boss Health Bar
          const barWidth = inv.width;
          const hpRatio = Math.max(0, inv.hp / inv.maxHp);
          ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
          ctx.fillRect(inv.x, inv.y - 14, barWidth, 6);
          ctx.fillStyle = "#ef4444";
          ctx.fillRect(inv.x, inv.y - 14, barWidth * hpRatio, 6);
        } else {
          // Normal Invaders
          const cx = inv.x + inv.width / 2;
          const cy = inv.y + inv.height / 2;

          ctx.beginPath();
          if (inv.type === "dreadnought") {
            // Heavy arrowhead
            ctx.moveTo(cx, inv.y);
            ctx.lineTo(inv.x + inv.width, inv.y + inv.height);
            ctx.lineTo(cx, inv.y + inv.height - 6);
            ctx.lineTo(inv.x, inv.y + inv.height);
            ctx.closePath();
          } else if (inv.type === "cruiser") {
            // Hexagon wing
            ctx.moveTo(cx, inv.y);
            ctx.lineTo(inv.x + inv.width, cy);
            ctx.lineTo(cx, inv.y + inv.height);
            ctx.lineTo(inv.x, cy);
            ctx.closePath();
          } else {
            // Scout insectoid
            ctx.roundRect(inv.x, inv.y, inv.width, inv.height, 6);
          }
          ctx.fill();

          // Glowing Alien Eyes
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(cx - 7, cy - 2, 2.5, 0, Math.PI * 2);
          ctx.arc(cx + 7, cy - 2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 8. Update & Render Power-Ups
      const activePowerUps: PowerUp[] = [];
      powerUpsRef.current.forEach(p => {
        p.y += p.vy;

        // Draw glowing power-up capsule
        ctx.save();
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.font = "14px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(p.symbol, p.x, p.y);
        ctx.restore();

        // Check collection by player
        const distToPlayer = Math.hypot(p.x - player.x, p.y - player.y);
        if (distToPlayer < player.width / 2 + 14) {
          sounds.playPowerup();
          if (p.type === "triple") {
            weaponTimerRef.current = p.duration;
            setWeaponType("triple");
          } else if (p.type === "shield") {
            shieldTimerRef.current = p.duration;
            setShieldActive(true);
          } else if (p.type === "bomb") {
            gameStatsRef.current.bombs = Math.min(5, gameStatsRef.current.bombs + 1);
            setBombs(gameStatsRef.current.bombs);
          } else if (p.type === "life") {
            gameStatsRef.current.lives = Math.min(5, gameStatsRef.current.lives + 1);
            setLives(gameStatsRef.current.lives);
          }
        } else if (p.y < CANVAS_HEIGHT + 30) {
          activePowerUps.push(p);
        }
      });
      powerUpsRef.current = activePowerUps;

      // 9. Render Player Starfighter
      ctx.save();
      const isInvincible = player.invincibleTimer > 0 && Math.floor(player.invincibleTimer / 6) % 2 === 0;

      if (!isInvincible) {
        // Thruster flame
        ctx.fillStyle = Math.random() > 0.5 ? "#38bdf8" : "#f97316";
        ctx.beginPath();
        ctx.moveTo(player.x - 6, player.y + 12);
        ctx.lineTo(player.x, player.y + 24 + Math.random() * 8);
        ctx.lineTo(player.x + 6, player.y + 12);
        ctx.closePath();
        ctx.fill();

        // Starfighter Hull
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#0284c7";

        // Sleek fighter polygon
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 18);
        ctx.lineTo(player.x + 22, player.y + 14);
        ctx.lineTo(player.x + 8, player.y + 10);
        ctx.lineTo(player.x, player.y + 14);
        ctx.lineTo(player.x - 8, player.y + 10);
        ctx.lineTo(player.x - 22, player.y + 14);
        ctx.closePath();
        ctx.fill();

        // Cockpit canopy
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.ellipse(player.x, player.y - 4, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Shield Aura
        if (shieldTimerRef.current > 0) {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(player.x, player.y, 28, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();

      // 10. Update & Render Particles
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
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, isPaused, isGameOver]);

  // Handle Wave Cleared
  const handleWaveCleared = () => {
    sounds.playWaveClear();
    const nextWave = gameStatsRef.current.wave + 1;
    gameStatsRef.current.wave = nextWave;
    gameStatsRef.current.score += 500 * (nextWave - 1);
    setScore(gameStatsRef.current.score);
    setWave(nextWave);

    setWaveClearNotice(`WAVE ${nextWave - 1} SECURED! BONUS +${500 * (nextWave - 1)}`);
    setTimeout(() => {
      setWaveClearNotice(null);
      spawnInvaders(nextWave);
    }, 2000);
  };

  // Trigger Game Over
  const triggerGameOver = () => {
    sounds.playExplosion(true);
    setIsGameOver(true);
    setIsPlaying(false);

    if (gameStatsRef.current.score > highScore) {
      setHighScore(gameStatsRef.current.score);
      localStorage.setItem("space_defender_best_score", gameStatsRef.current.score.toString());
    }
  };

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Star Cadet";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      score: gameStatsRef.current.score,
      wave: gameStatsRef.current.wave,
      aliensKilled: gameStatsRef.current.aliensKilled,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("space_defender_records", JSON.stringify(updated));
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
              GALAXY DEFENDER • 60 FPS
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              SPACE DEFENDER
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
        <div className="grid grid-cols-5 gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-center font-mono">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">WAVE</span>
            <span className="text-sm sm:text-base font-bold text-cyan-400">{wave}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">SCORE</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400">{score}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">BEST</span>
            <span className="text-sm sm:text-base font-bold text-amber-400">{Math.max(score, highScore)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">HULL</span>
            <span className="text-sm sm:text-base font-bold text-rose-400">
              {"❤️".repeat(Math.max(0, lives))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">EMP BOMBS [B]</span>
            <span className="text-sm sm:text-base font-bold text-orange-400">
              {"💣".repeat(Math.max(0, bombs))}
            </span>
          </div>
        </div>
      </div>

      {/* Main Canvas Screen */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.25)] bg-slate-950">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
          className="w-full max-w-[760px] h-auto cursor-crosshair block"
        />

        {/* Wave Clear Notification Banner */}
        {waveClearNotice && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none backdrop-blur-sm animate-pulse">
            <div className="bg-slate-900/90 border-2 border-emerald-500/80 rounded-xl px-8 py-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
              <Sparkles className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl font-black text-emerald-400 tracking-wider font-mono">
                {waveClearNotice}
              </h2>
              <p className="text-xs text-slate-300 font-mono mt-1">Preparing Next Defense Wave...</p>
            </div>
          </div>
        )}

        {/* Start Screen Overlay */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-4">
              <Rocket className="w-3.5 h-3.5" />
              <span>DEFEND EARTH AGAINST THE NEON SWARM</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 tracking-wider mb-2 font-mono">
              SPACE DEFENDER
            </h2>

            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              Pilot your plasma starfighter, annihilate invader fleets, dodge plasma barrages, collect shield & EMP drops, and survive the Titan Bosses!
            </p>

            {/* Controls Overview Card */}
            <div className="grid grid-cols-2 gap-3 max-w-sm w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 mb-6 text-left">
              <div>
                <span className="text-cyan-400 font-semibold block">Movement:</span>
                <span>Mouse / A & D / Arrows</span>
              </div>
              <div>
                <span className="text-cyan-400 font-semibold block">Fire Cannons:</span>
                <span>Space / Click / W</span>
              </div>
              <div>
                <span className="text-amber-400 font-semibold block">EMP Bomb:</span>
                <span>Press 'B' Key</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Pause:</span>
                <span>Esc Key</span>
              </div>
            </div>

            {/* Power-up Legend */}
            <div className="flex flex-wrap justify-center gap-3 text-xs font-mono text-slate-300 mb-6">
              <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded border border-yellow-500/30">
                ⚡ Triple Laser
              </span>
              <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded border border-cyan-500/30">
                🛡️ Energy Shield
              </span>
              <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded border border-orange-500/30">
                💣 EMP Shockwave
              </span>
              <span className="flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded border border-red-500/30">
                ❤️ Hull Repair
              </span>
            </div>

            <Button
              onClick={startNewGame}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-8 py-5 text-base rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.4)] tracking-wide font-mono"
            >
              LAUNCH DEFENSE (SPACE)
            </Button>
          </div>
        )}

        {/* Game Over Debrief Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center">
            <div className="bg-rose-950/40 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-[0_0_35px_rgba(244,63,94,0.25)]">
              <span className="text-rose-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                SYSTEM FAILURE • MISSION TERMINATED
              </span>
              <h2 className="text-3xl font-black text-rose-400 font-mono tracking-wider mb-4">
                STARFIGHTER DESTROYED
              </h2>

              <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-5 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">FINAL SCORE</span>
                  <span className="text-lg font-bold text-emerald-400">{score}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">WAVE REACHED</span>
                  <span className="text-lg font-bold text-cyan-400">{wave}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">INVADERS FELLED</span>
                  <span className="text-lg font-bold text-indigo-400">{aliensKilled}</span>
                </div>
              </div>

              {/* Hall of Fame Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter pilot callsign..."
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
                  Redeploy (Space)
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
                <span>SPACE DEFENDER HALL OF FAME</span>
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
                <p className="text-center text-sm text-slate-500 py-6">No pilot records registered yet.</p>
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
                      <span className="text-slate-400">Wave {rec.wave}</span>
                      <span className="font-bold text-emerald-400">{rec.score} pts</span>
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
