import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Trophy, User, List, RotateCcw, Volume2, VolumeX, Pause, Play,
  Sparkles, Flame, Zap, Award, Star, Gamepad2, CheckCircle2,
  Shield, ArrowUp, ArrowDown
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

  playJump() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(740, now + 0.1);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  playDoubleJump() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playCollect() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.14);
      });
    } catch {}
  }

  playShield() {
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
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        gain.gain.setValueAtTime(0.2, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.04 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.2);
      });
    } catch {}
  }

  playMilestone() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.08);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playHit() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

interface DinoGameProps {
  onBack: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  type: "cactus" | "bird";
  birdFlyLevel?: "low" | "mid";
}

interface Collectible {
  id: number;
  x: number;
  y: number;
  type: "egg" | "shield";
}

export interface DinoSkin {
  id: string;
  name: string;
  mainColor: string;
  accentColor: string;
  glowColor: string;
}

const DINO_SKINS: DinoSkin[] = [
  { id: "emerald", name: "Emerald Rex", mainColor: "#10b981", accentColor: "#059669", glowColor: "rgba(16, 185, 129, 0.4)" },
  { id: "cyber", name: "Cyber Mecha", mainColor: "#06b6d4", accentColor: "#0284c7", glowColor: "rgba(6, 182, 212, 0.5)" },
  { id: "magma", name: "Magma Drake", mainColor: "#ef4444", accentColor: "#dc2626", glowColor: "rgba(239, 68, 68, 0.5)" },
  { id: "midas", name: "Golden Raptor", mainColor: "#f59e0b", accentColor: "#d97706", glowColor: "rgba(245, 158, 11, 0.5)" }
];

const GAME_WIDTH = 840;
const GAME_HEIGHT = 220;
const DINO_WIDTH = 64;
const DINO_HEIGHT = 64;
const GROUND_HEIGHT = 26;
const GRAVITY = 0.95;
const JUMP_FORCE = -14.5;
const DOUBLE_JUMP_FORCE = -12.5;
const INITIAL_SPEED = 7.5;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DinoGame({ onBack }: DinoGameProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [activeSkin, setActiveSkin] = useState<DinoSkin>(DINO_SKINS[0]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [eggsCollected, setEggsCollected] = useState<number>(0);
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [jumpCount, setJumpCount] = useState<number>(0);

  const [dinoY, setDinoY] = useState<number>(GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT);
  const [isDucking, setIsDucking] = useState<boolean>(false);
  const [dinoLegState, setDinoLegState] = useState<number>(0);

  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [collectibles, setCollectibles] = useState<Collectible[]>([]);
  const [gameSpeed, setGameSpeed] = useState<number>(INITIAL_SPEED);

  // Parallax layers
  const [cloudOffset, setCloudOffset] = useState<number>(0);
  const [mountainOffset, setMountainOffset] = useState<number>(0);
  const [groundOffset, setGroundOffset] = useState<number>(0);

  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const dinoVelocityRef = useRef<number>(0);
  const dinoYRef = useRef<number>(GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT);
  const isDuckingRef = useRef<boolean>(false);
  const jumpCountRef = useRef<number>(0);
  const obstaclesPassedRef = useRef<number>(0);
  const lastScoreMilestoneRef = useRef<number>(0);
  const gameLoopRef = useRef<number>();

  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("dino_highscore");
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/dino/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('dino_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/dino/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "T-Rex Champion 🦖", score: 2840, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 2150, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Speed Raptor 💨", score: 1680, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Runner 🏃", score: 1220, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Jurassic Ace 🌴", score: 890, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('dino_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('dino_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'dino' }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/dino/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Jump logic (Ground Jump + Double Jump)
  const jump = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused || isDuckingRef.current) return;

    const groundY = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;
    const isGrounded = dinoYRef.current >= groundY - 4;

    if (isGrounded) {
      sound.playJump();
      dinoVelocityRef.current = JUMP_FORCE;
      jumpCountRef.current = 1;
      setJumpCount(1);
    } else if (jumpCountRef.current === 1) {
      // Mid-air Double Jump!
      sound.playDoubleJump();
      dinoVelocityRef.current = DOUBLE_JUMP_FORCE;
      jumpCountRef.current = 2;
      setJumpCount(2);
    }
  }, [isPlaying, isGameOver, isPaused]);

  // Duck logic
  const startDuck = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused) return;
    isDuckingRef.current = true;
    setIsDucking(true);
  }, [isPlaying, isGameOver, isPaused]);

  const stopDuck = useCallback(() => {
    isDuckingRef.current = false;
    setIsDucking(false);
  }, []);

  // Collision detection helper
  const checkCollision = useCallback((dinoRect: { x: number; y: number; width: number; height: number }, obs: Obstacle) => {
    const obsY = obs.type === "cactus"
      ? GAME_HEIGHT - GROUND_HEIGHT - obs.height
      : obs.birdFlyLevel === "low"
      ? GAME_HEIGHT - GROUND_HEIGHT - obs.height - 18 // Low flight - must duck!
      : GAME_HEIGHT - GROUND_HEIGHT - obs.height - 52; // Mid flight - can run under or jump

    const margin = 5;
    return (
      dinoRect.x + margin < obs.x + obs.width - margin &&
      dinoRect.x + dinoRect.width - margin > obs.x + margin &&
      dinoRect.y + margin < obsY + obs.height - margin &&
      dinoRect.y + dinoRect.height - margin > obsY + margin
    );
  }, []);

  // Main Game Loop (Physics & Spawning)
  const gameLoop = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    // Increment Score
    setScore(prev => {
      const next = prev + 1;
      if (next > highScore) {
        setHighScore(next);
        localStorage.setItem("dino_highscore", next.toString());
      }

      // 100-point milestone chime
      if (next - lastScoreMilestoneRef.current >= 100) {
        lastScoreMilestoneRef.current = next;
        sound.playMilestone();
      }
      return next;
    });

    // Update leg running animation
    setDinoLegState(prev => (prev === 0 ? 1 : 0));

    // Update Parallax backgrounds
    setCloudOffset(c => (c + gameSpeed * 0.2) % GAME_WIDTH);
    setMountainOffset(m => (m + gameSpeed * 0.5) % GAME_WIDTH);
    setGroundOffset(g => (g + gameSpeed) % 40);

    // Update Dino Vertical Physics
    const groundY = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;
    dinoVelocityRef.current += GRAVITY;
    dinoYRef.current += dinoVelocityRef.current;

    if (dinoYRef.current >= groundY) {
      dinoYRef.current = groundY;
      dinoVelocityRef.current = 0;
      jumpCountRef.current = 0;
      setJumpCount(0);
    }
    setDinoY(dinoYRef.current);

    // Update Obstacles Movement
    setObstacles(prev => {
      const updated = prev
        .map(o => ({ ...o, x: o.x - gameSpeed }))
        .filter(o => o.x + o.width > -40);

      // Track passed obstacles for smooth speed scaling
      prev.forEach(o => {
        const dinoRight = 55 + DINO_WIDTH;
        if (o.x > dinoRight && o.x - gameSpeed <= dinoRight) {
          obstaclesPassedRef.current++;
          if (obstaclesPassedRef.current % 4 === 0) {
            setGameSpeed(sp => Math.min(sp + 0.3, 13.5));
          }
        }
      });

      // Spawn new obstacles
      const last = updated[updated.length - 1];
      const minDistance = Math.max(240, 480 - gameSpeed * 15);
      const shouldSpawn = !last || (GAME_WIDTH - last.x >= minDistance + Math.random() * 120);

      if (shouldSpawn && Math.random() < 0.035) {
        const isBird = Math.random() < 0.35 && obstaclesPassedRef.current > 3;
        const newObs: Obstacle = {
          x: GAME_WIDTH,
          width: isBird ? 46 : (Math.random() < 0.4 ? 42 : 26),
          height: isBird ? 34 : (Math.random() < 0.4 ? 46 : 38),
          type: isBird ? "bird" : "cactus",
          birdFlyLevel: isBird ? (Math.random() < 0.55 ? "low" : "mid") : undefined
        };
        updated.push(newObs);
      }

      return updated;
    });

    // Update Collectibles (Golden Eggs & Shields)
    setCollectibles(prev => {
      const updated = prev
        .map(c => ({ ...c, x: c.x - gameSpeed }))
        .filter(c => c.x > -30);

      // Random chance to spawn collectible
      if (Math.random() < 0.007 && updated.length === 0) {
        const isShield = Math.random() < 0.25;
        updated.push({
          id: Date.now(),
          x: GAME_WIDTH + 80,
          y: GAME_HEIGHT - GROUND_HEIGHT - 65 - Math.random() * 45,
          type: isShield ? "shield" : "egg"
        });
      }
      return updated;
    });

    // Check Collectible Pickups
    const curHeight = isDuckingRef.current ? DINO_HEIGHT / 2 : DINO_HEIGHT;
    const curY = isDuckingRef.current ? dinoYRef.current + DINO_HEIGHT / 2 : dinoYRef.current;
    const dinoHitbox = { x: 55, y: curY, width: DINO_WIDTH, height: curHeight };

    setCollectibles(prev => {
      const uncollected: Collectible[] = [];
      prev.forEach(item => {
        const itemHitbox = { x: item.x, y: item.y, width: 24, height: 24 };
        const collided = (
          dinoHitbox.x < itemHitbox.x + itemHitbox.width &&
          dinoHitbox.x + dinoHitbox.width > itemHitbox.x &&
          dinoHitbox.y < itemHitbox.y + itemHitbox.height &&
          dinoHitbox.y + dinoHitbox.height > itemHitbox.y
        );

        if (collided) {
          if (item.type === "shield") {
            sound.playShield();
            setHasShield(true);
          } else {
            sound.playCollect();
            setScore(s => s + 50);
            setEggsCollected(e => e + 1);
          }
        } else {
          uncollected.push(item);
        }
      });
      return uncollected;
    });

    // Check Obstacle Collisions
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (checkCollision(dinoHitbox, obs)) {
        if (hasShield) {
          // Shield absorbs the blow!
          sound.playShield();
          setHasShield(false);
          // Remove the obstacle
          setObstacles(o => o.filter((_, idx) => idx !== i));
          break;
        } else {
          // Fatal collision
          sound.playHit();
          setIsGameOver(true);
          setIsPlaying(false);
          return;
        }
      }
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, isPaused, gameSpeed, obstacles, checkCollision, hasShield, highScore]);

  // Request Animation Frame Driver
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, isPaused, gameLoop]);

  // Keyboard Event Listener (With strict input isolation)
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
        if (isPlaying && !isGameOver) {
          setIsPaused(p => !p);
        }
        return;
      }

      if (!isPlaying || isGameOver || isPaused) return;

      if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        jump();
      } else if (["ArrowDown", "KeyS"].includes(e.code)) {
        e.preventDefault();
        startDuck();
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

      if (["ArrowDown", "KeyS"].includes(e.code)) {
        stopDuck();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isPlaying, isGameOver, isPaused, jump, startDuck, stopDuck]);

  // Start / Reset Game
  const startGame = () => {
    const groundY = GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT;
    setScore(0);
    setEggsCollected(0);
    setHasShield(false);
    setJumpCount(0);
    setGameSpeed(INITIAL_SPEED);
    setObstacles([]);
    setCollectibles([]);

    dinoYRef.current = groundY;
    dinoVelocityRef.current = 0;
    jumpCountRef.current = 0;
    obstaclesPassedRef.current = 0;
    lastScoreMilestoneRef.current = 0;

    setIsDucking(false);
    isDuckingRef.current = false;
    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    sound.playJump();
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

          {/* Skin Chooser */}
          <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            {DINO_SKINS.map((skin) => (
              <Button
                key={skin.id}
                variant={activeSkin.id === skin.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSkin(skin)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold gap-1.5"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: skin.mainColor }} />
                <span>{skin.name.split(" ")[0]}</span>
              </Button>
            ))}
          </div>

          {hasShield && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-xs font-bold animate-pulse">
              <Shield className="h-3.5 w-3.5" />
              <span>SHIELD ACTIVE</span>
            </div>
          )}
        </div>

        {/* Center: Score & Eggs */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1.5">Score:</span>
            <span className="text-lg sm:text-2xl font-black text-primary font-mono">{score}</span>
          </div>

          {eggsCollected > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold font-mono">
              <span>🥚 {eggsCollected}</span>
            </div>
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
                  Dino Runner Hall of Fame
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

      {/* Main Jurassic Running Arena */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <div
          className="relative border-2 border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: "min(96vw, 840px)", height: GAME_HEIGHT }}
        >
          {/* Sky Gradient (Dusk/Sunset dynamic vibe) */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/80 to-amber-950/50" />

          {/* Clouds Parallax Layer */}
          <div className="absolute inset-0" style={{ transform: `translateX(-${cloudOffset}px)` }}>
            {[0, 1, 2].map(i => (
              <div key={`cloud-${i}`} className="absolute" style={{ left: i * GAME_WIDTH }}>
                <div className="absolute top-4 left-16 flex gap-1 opacity-40">
                  <div className="w-10 h-6 bg-slate-300 rounded-full" />
                  <div className="w-12 h-7 bg-slate-300 rounded-full -ml-3" />
                  <div className="w-10 h-6 bg-slate-300 rounded-full -ml-3" />
                </div>
                <div className="absolute top-8 left-96 flex gap-1 opacity-30">
                  <div className="w-8 h-5 bg-slate-300 rounded-full" />
                  <div className="w-10 h-6 bg-slate-300 rounded-full -ml-2" />
                </div>
              </div>
            ))}
          </div>

          {/* Mountains Silhouette Layer */}
          <div className="absolute bottom-0 left-0 right-0 h-28" style={{ transform: `translateX(-${mountainOffset}px)` }}>
            {[0, 1, 2].map(i => (
              <div key={`mountain-${i}`} className="absolute bottom-0" style={{ left: i * GAME_WIDTH, width: GAME_WIDTH }}>
                <svg viewBox="0 0 840 70" className="w-full h-16 opacity-35" fill="#334155">
                  <polygon points="0,70 120,15 240,70" />
                  <polygon points="180,70 340,8 500,70" />
                  <polygon points="420,70 580,20 740,70" />
                  <polygon points="680,70 840,10 900,70" />
                </svg>
              </div>
            ))}
          </div>

          {/* Scrolling Ground Track */}
          <div
            className="absolute bottom-0 w-full bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border-t-2 border-amber-600/70"
            style={{ height: GROUND_HEIGHT }}
          >
            <div className="absolute inset-0 flex" style={{ transform: `translateX(-${groundOffset}px)` }}>
              {Array.from({ length: 30 }).map((_, idx) => (
                <div key={idx} className="w-10 h-full border-r border-amber-500/15" />
              ))}
            </div>
          </div>

          {/* The Running Dino */}
          <div
            className="absolute flex items-center justify-center transition-all"
            style={{
              left: 55,
              bottom: GAME_HEIGHT - dinoY - DINO_HEIGHT,
              width: DINO_WIDTH,
              height: DINO_HEIGHT,
              filter: `drop-shadow(0 0 8px ${activeSkin.glowColor})`
            }}
          >
            {hasShield && (
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400 bg-cyan-400/20 animate-ping opacity-75" />
            )}

            {isDucking ? (
              // Ducking Dino SVG
              <svg width="64" height="64" viewBox="0 0 70 70" fill="none" className="w-full h-full">
                <path d="M 12 30 Q 10 24 14 26 L 24 40 L 16 34 Z" fill={activeSkin.mainColor} />
                <rect x="16" y="54" width="7" height="16" rx="3" fill={activeSkin.accentColor} />
                <ellipse cx="19.5" cy="66" rx="5" ry="4" fill={activeSkin.accentColor} />
                <rect x="36" y="54" width="7" height="16" rx="3" fill={activeSkin.accentColor} />
                <ellipse cx="39.5" cy="66" rx="5" ry="4" fill={activeSkin.accentColor} />
                <ellipse cx="28" cy="48" rx="18" ry="12" fill={activeSkin.mainColor} />
                <path d="M 44 45 Q 50 48 54 52" stroke={activeSkin.mainColor} strokeWidth="10" fill="none" strokeLinecap="round" />
                <ellipse cx="58" cy="56" rx="10" ry="9" fill={activeSkin.mainColor} />
                <circle cx="62" cy="54" r="3" fill="white" />
                <circle cx="62.5" cy="54" r="1.5" fill="black" />
                <path d="M 62 58 Q 64 60 66 58" stroke={activeSkin.accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
              </svg>
            ) : (
              // Standing / Running Dino SVG
              <svg width="64" height="64" viewBox="0 0 64 80" fill="none" className="w-full h-full">
                <path d="M 14 50 L 8 44 L 12 52 Z" fill={activeSkin.mainColor} />
                {/* Back Leg */}
                <g transform={dinoLegState === 0 ? "translate(0, -3)" : "translate(0, 0)"}>
                  <rect x="16" y="64" width="7" height="16" rx="3" fill={activeSkin.accentColor} />
                  <ellipse cx="19.5" cy="76" rx="5" ry="4" fill={activeSkin.accentColor} />
                </g>
                {/* Front Leg */}
                <g transform={dinoLegState === 1 ? "translate(0, -3)" : "translate(0, 0)"}>
                  <rect x="28" y="64" width="7" height="16" rx="3" fill={activeSkin.accentColor} />
                  <ellipse cx="31.5" cy="76" rx="5" ry="4" fill={activeSkin.accentColor} />
                </g>
                <ellipse cx="24" cy="50" rx="13" ry="18" fill={activeSkin.mainColor} />
                <ellipse cx="24" cy="54" rx="9" ry="12" fill="white" opacity="0.25" />
                <path d="M 32 42 Q 36 34 40 30" stroke={activeSkin.mainColor} strokeWidth="9" fill="none" strokeLinecap="round" />
                <ellipse cx="44" cy="24" rx="12" ry="11" fill={activeSkin.mainColor} />
                <ellipse cx="48" cy="22" rx="5" ry="4" fill="white" />
                <circle cx="49" cy="22" r="2.5" fill="black" />
                <circle cx="49.5" cy="21" r="1" fill="white" />
                <path d="M 46 28 Q 48 31 52 28" stroke={activeSkin.accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                <ellipse cx="30" cy="40" rx="3" ry="6" fill={activeSkin.accentColor} />
              </svg>
            )}
          </div>

          {/* Obstacles (Cacti & Birds) */}
          {obstacles.map((obs, idx) => {
            const obsBottom = obs.type === "cactus"
              ? GROUND_HEIGHT
              : obs.birdFlyLevel === "low"
              ? GROUND_HEIGHT + 18
              : GROUND_HEIGHT + 52;

            return (
              <div
                key={idx}
                className="absolute flex items-center justify-center"
                style={{
                  left: obs.x,
                  bottom: obsBottom,
                  width: obs.width,
                  height: obs.height
                }}
              >
                {obs.type === "cactus" ? (
                  // Glowing Cactus
                  <svg width="100%" height="100%" viewBox="0 0 40 60" fill="none">
                    <rect x="14" y="8" width="12" height="52" rx="6" fill="#15803d" />
                    <path d="M 14 25 Q 8 25 8 30 L 8 35 Q 8 37 10 37 L 14 37" fill="#15803d" />
                    <path d="M 26 30 Q 32 30 32 35 L 32 40 Q 32 42 30 42 L 26 42" fill="#15803d" />
                    <circle cx="20" cy="6" r="3" fill="#f43f5e" />
                  </svg>
                ) : (
                  // Flying Pterodactyl Bird
                  <svg width="100%" height="100%" viewBox="0 0 50 40" fill="none">
                    <ellipse cx="25" cy="20" rx="12" ry="10" fill="#64748b" />
                    <circle cx="15" cy="16" r="8" fill="#64748b" />
                    <path d="M 32 18 Q 42 12 44 16 Q 42 20 32 22" fill="#94a3b8" />
                    <circle cx="13" cy="14" r="2" fill="white" />
                    <circle cx="12.5" cy="14" r="1" fill="black" />
                    <path d="M 10 16 L 4 15 L 10 18 Z" fill="#f97316" />
                  </svg>
                )}
              </div>
            );
          })}

          {/* Collectibles (Eggs & Shields) */}
          {collectibles.map(item => (
            <div
              key={item.id}
              className="absolute flex items-center justify-center animate-bounce"
              style={{
                left: item.x,
                bottom: item.y,
                width: 24,
                height: 24
              }}
            >
              {item.type === "shield" ? (
                <div className="w-6 h-6 rounded-full bg-cyan-400 border border-cyan-200 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                  <Shield className="h-3.5 w-3.5 text-slate-900" />
                </div>
              ) : (
                <div className="text-xl filter drop-shadow">
                  🥚
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Mobile & Controls Bar */}
      <div className="shrink-0 bg-card/85 border-t border-border/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-20">
        {/* Mobile On-Screen Action Buttons */}
        <div className="flex sm:hidden items-center justify-center gap-3 w-full max-w-sm mx-auto">
          <Button
            variant="default"
            size="lg"
            onClick={jump}
            disabled={!isPlaying || isGameOver || isPaused}
            className="flex-1 h-12 rounded-xl text-sm font-bold bg-primary text-primary-foreground gap-1.5"
          >
            <ArrowUp className="h-4 w-4" />
            JUMP {jumpCount === 1 ? "(2x)" : ""}
          </Button>
          <Button
            variant="outline"
            size="lg"
            onMouseDown={startDuck}
            onMouseUp={stopDuck}
            onTouchStart={startDuck}
            onTouchEnd={stopDuck}
            disabled={!isPlaying || isGameOver || isPaused}
            className="flex-1 h-12 rounded-xl text-sm font-bold gap-1.5"
          >
            <ArrowDown className="h-4 w-4" />
            DUCK
          </Button>
        </div>

        {/* Desktop Helper Guide */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mx-auto">
          <span>Jump: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">↑</kbd> (Press 2x for Double Jump!)</span>
          <span>Duck: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">↓</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">S</kbd> (Evade Birds)</span>
          <span>Pause: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Esc</kbd></span>
        </div>
      </div>

      {/* Start Game Overlay */}
      {!isPlaying && !isGameOver && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-8 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                Jurassic Sprint • Pro Runner 2026
              </div>

              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🦖 DINO RUNNER PRO
                </h1>
                <p className="text-xs text-muted-foreground">
                  Sprint across the prehistoric canyon, double jump over obstacles, collect golden eggs, and duck under flying pterodactyls!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-xs text-left">
                <div><span className="font-bold text-primary">🦘 Double Jump:</span> Mid-air 2nd leap</div>
                <div><span className="font-bold text-amber-500">🥚 Golden Eggs:</span> +50 pts bonus</div>
                <div><span className="font-bold text-cyan-400">🛡️ Shield Orb:</span> 1 free collision</div>
                <div><span className="font-bold text-emerald-400">🦅 Birds:</span> Low & mid altitude</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12"
              >
                START SPRINTING
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
                <h2 className="text-3xl font-black tracking-tight text-gradient">Sprint Concluded!</h2>
                <p className="text-xs text-muted-foreground">Extinction event encountered in the canyon.</p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Eggs Found</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{eggsCollected}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Top Speed</span>
                  <span className="text-xl font-black text-cyan-400 font-mono">{gameSpeed.toFixed(1)}x</span>
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
              Resume Sprint
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
