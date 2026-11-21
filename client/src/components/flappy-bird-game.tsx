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
  Crown, Shield, ChevronUp
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

  playFlap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playScore() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [587.33, 880]; // D5 -> A5 chime
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.18, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.16);
      });
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
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
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
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.22, now + idx * 0.07);
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
// CONSTANTS & TYPES
// ============================================================================

interface FlappyBirdGameProps {
  onBack: () => void;
}

interface Pipe {
  x: number;
  topHeight: number;
  bottomHeight: number;
  passed: boolean;
}

export interface BirdSkin {
  id: string;
  name: string;
  bodyColor: string;
  wingColor: string;
  beakColor: string;
  glowColor: string;
}

const BIRD_SKINS: BirdSkin[] = [
  { id: "classic", name: "Classic Gold", bodyColor: "#facc15", wingColor: "#eab308", beakColor: "#f97316", glowColor: "rgba(250, 204, 21, 0.45)" },
  { id: "cyber", name: "Cyber Neon", bodyColor: "#06b6d4", wingColor: "#0284c7", beakColor: "#ec4899", glowColor: "rgba(6, 182, 212, 0.55)" },
  { id: "phoenix", name: "Fire Phoenix", bodyColor: "#ef4444", wingColor: "#dc2626", beakColor: "#f59e0b", glowColor: "rgba(239, 68, 68, 0.55)" },
  { id: "emerald", name: "Emerald Glider", bodyColor: "#10b981", wingColor: "#059669", beakColor: "#fbbf24", glowColor: "rgba(16, 185, 129, 0.45)" }
];

const GAME_WIDTH = 480;
const GAME_HEIGHT = 620;
const BIRD_X_POSITION = 80;
const BIRD_WIDTH = 44;
const BIRD_HEIGHT = 32;
const GRAVITY = 0.58;
const JUMP_FORCE = -9.2;
const GAME_SPEED = 3.2;
const PIPE_WIDTH = 74;
const PIPE_GAP = 165;
const PIPE_SPAWN_INTERVAL = 115; // frames

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FlappyBirdGame({ onBack }: FlappyBirdGameProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [activeSkin, setActiveSkin] = useState<BirdSkin>(BIRD_SKINS[0]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [birdY, setBirdY] = useState<number>(GAME_HEIGHT / 2);
  const [birdAngle, setBirdAngle] = useState<number>(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [flapsCount, setFlapsCount] = useState<number>(0);
  const [gameTime, setGameTime] = useState<number>(0);

  const [cloudOffset, setCloudOffset] = useState<number>(0);
  const [cityOffset, setCityOffset] = useState<number>(0);
  const [groundOffset, setGroundOffset] = useState<number>(0);

  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const birdYRef = useRef<number>(GAME_HEIGHT / 2);
  const birdVelocityRef = useRef<number>(0);
  const pipesRef = useRef<Pipe[]>([]);
  const frameCountRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem("flappy_highscore");
    if (saved) setHighScore(parseInt(saved, 10) || 0);
  }, []);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/flappy/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('flappy_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/flappy/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Aviator Ace 🦅", score: 48, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 36, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Sky Glider ✈️", score: 28, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Flap 🐦", score: 19, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Winged Pro 🪶", score: 12, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('flappy_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('flappy_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'flappy' }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/flappy/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Flap jump
  const flap = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    sound.playFlap();
    birdVelocityRef.current = JUMP_FORCE;
    setFlapsCount(f => f + 1);
  }, [isPlaying, isGameOver, isPaused]);

  // End Game
  const endGame = useCallback(() => {
    sound.playHit();
    setIsPlaying(false);
    setIsGameOver(true);
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Main 60fps Game Loop
  const gameLoop = useCallback(() => {
    if (!isPlaying || isGameOver || isPaused) return;

    // Physics
    birdVelocityRef.current += GRAVITY;
    birdYRef.current += birdVelocityRef.current;

    // Bird pitch angle
    const angle = Math.min(Math.max(birdVelocityRef.current * 3.5, -30), 75);
    setBirdAngle(angle);

    // Ceiling & Ground collisions
    if (birdYRef.current < 0) {
      birdYRef.current = 0;
      birdVelocityRef.current = 0;
    }
    if (birdYRef.current + BIRD_HEIGHT >= GAME_HEIGHT - 40) {
      endGame();
      return;
    }

    // Parallax scrolling
    setCloudOffset(c => (c + 0.6) % GAME_WIDTH);
    setCityOffset(ct => (ct + 1.2) % GAME_WIDTH);
    setGroundOffset(g => (g + GAME_SPEED) % 40);

    frameCountRef.current += 1;

    // Move Pipes
    let updatedPipes = pipesRef.current.map(p => ({
      ...p,
      x: p.x - GAME_SPEED
    }));

    // Filter offscreen pipes
    updatedPipes = updatedPipes.filter(p => p.x > -PIPE_WIDTH - 20);

    // Spawn new pipes
    if (frameCountRef.current % PIPE_SPAWN_INTERVAL === 0) {
      const minTop = 60;
      const maxTop = GAME_HEIGHT - 40 - PIPE_GAP - 60;
      const topHeight = Math.floor(minTop + Math.random() * (maxTop - minTop));
      const bottomHeight = GAME_HEIGHT - 40 - topHeight - PIPE_GAP;

      updatedPipes.push({
        x: GAME_WIDTH,
        topHeight,
        bottomHeight,
        passed: false
      });
    }

    // Check Collisions & Score increments
    const birdBox = {
      x: BIRD_X_POSITION + 6,
      y: birdYRef.current + 4,
      width: BIRD_WIDTH - 12,
      height: BIRD_HEIGHT - 8
    };

    for (const pipe of updatedPipes) {
      // Top pipe box
      const topBox = {
        x: pipe.x,
        y: 0,
        width: PIPE_WIDTH,
        height: pipe.topHeight
      };

      // Bottom pipe box
      const bottomBox = {
        x: pipe.x,
        y: GAME_HEIGHT - 40 - pipe.bottomHeight,
        width: PIPE_WIDTH,
        height: pipe.bottomHeight
      };

      // Check collision with top pipe
      if (
        birdBox.x < topBox.x + topBox.width &&
        birdBox.x + birdBox.width > topBox.x &&
        birdBox.y < topBox.y + topBox.height
      ) {
        endGame();
        return;
      }

      // Check collision with bottom pipe
      if (
        birdBox.x < bottomBox.x + bottomBox.width &&
        birdBox.x + birdBox.width > bottomBox.x &&
        birdBox.y + birdBox.height > bottomBox.y
      ) {
        endGame();
        return;
      }

      // Check pipe cleared
      if (!pipe.passed && birdBox.x > pipe.x + PIPE_WIDTH) {
        pipe.passed = true;
        scoreRef.current += 1;
        setScore(scoreRef.current);
        sound.playScore();

        if (scoreRef.current > highScore) {
          setHighScore(scoreRef.current);
          localStorage.setItem("flappy_highscore", scoreRef.current.toString());
        }
      }
    }

    pipesRef.current = updatedPipes;
    setBirdY(birdYRef.current);
    setPipes([...updatedPipes]);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isGameOver, isPaused, endGame, highScore]);

  // Request Animation Frame Driver
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isPlaying, isGameOver, isPaused, gameLoop]);

  // Keyboard Event Listener (With input isolation safety)
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

      if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
        e.preventDefault();
        if (!isPlaying && !isGameOver) {
          startGame();
        } else if (isPlaying) {
          flap();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, isPaused, flap]);

  // Start / Restart game
  const startGame = () => {
    birdYRef.current = GAME_HEIGHT / 2 - 40;
    birdVelocityRef.current = JUMP_FORCE;
    pipesRef.current = [];
    frameCountRef.current = 0;
    scoreRef.current = 0;

    setBirdY(birdYRef.current);
    setBirdAngle(0);
    setPipes([]);
    setScore(0);
    setFlapsCount(1);
    setGameTime(0);

    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    sound.playFlap();
  };

  // Determine Medal tier
  const getMedal = (s: number) => {
    if (s >= 30) return { title: "Platinum Cyber", icon: "👑", color: "text-cyan-400" };
    if (s >= 20) return { title: "Gold Aviator", icon: "🥇", color: "text-amber-400" };
    if (s >= 10) return { title: "Silver Glider", icon: "🥈", color: "text-slate-300" };
    if (s >= 5) return { title: "Bronze Fledgling", icon: "🥉", color: "text-amber-600" };
    return null;
  };

  const medal = getMedal(score);

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

          {/* Bird Skin Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            {BIRD_SKINS.map((skin) => (
              <Button
                key={skin.id}
                variant={activeSkin.id === skin.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveSkin(skin)}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold gap-1.5"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: skin.bodyColor }} />
                <span>{skin.name.split(" ")[0]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Center: Live Score */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1.5">Score:</span>
            <span className="text-lg sm:text-2xl font-black text-primary font-mono">{score}</span>
          </div>

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
                  Flappy Arena Hall of Fame
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
            title="Start fresh flight"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Flappy Arena Screen */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <div
          onClick={isPlaying ? flap : startGame}
          className="relative rounded-2xl overflow-hidden border-2 border-slate-700/80 shadow-2xl cursor-pointer"
          style={{ width: "min(96vw, 480px)", height: GAME_HEIGHT }}
        >
          {/* Cyber Dusk Gradient Sky */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-900" />

          {/* Parallax Clouds */}
          <div className="absolute inset-0" style={{ transform: `translateX(-${cloudOffset}px)` }}>
            {[0, 1].map(i => (
              <div key={i} className="absolute" style={{ left: i * GAME_WIDTH }}>
                <div className="absolute top-8 left-12 w-24 h-8 bg-white/10 rounded-full blur-[1px]" />
                <div className="absolute top-16 left-64 w-32 h-10 bg-white/10 rounded-full blur-[1px]" />
              </div>
            ))}
          </div>

          {/* Parallax City Skyline */}
          <div className="absolute bottom-10 left-0 right-0 h-28" style={{ transform: `translateX(-${cityOffset}px)` }}>
            {[0, 1].map(i => (
              <div key={i} className="absolute bottom-0" style={{ left: i * GAME_WIDTH, width: GAME_WIDTH }}>
                <svg viewBox="0 0 480 80" className="w-full h-20 opacity-20" fill="#64748b">
                  <rect x="10" y="20" width="35" height="60" />
                  <rect x="55" y="10" width="40" height="70" />
                  <rect x="105" y="30" width="30" height="50" />
                  <rect x="145" y="5" width="45" height="75" />
                  <rect x="200" y="25" width="35" height="55" />
                  <rect x="245" y="15" width="50" height="65" />
                  <rect x="305" y="35" width="30" height="45" />
                  <rect x="345" y="10" width="40" height="70" />
                  <rect x="395" y="20" width="35" height="60" />
                  <rect x="440" y="5" width="35" height="75" />
                </svg>
              </div>
            ))}
          </div>

          {/* Pipes */}
          {pipes.map((pipe, idx) => (
            <div key={idx}>
              {/* Top Pipe */}
              <div
                className="absolute bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 border-x-2 border-b-4 border-emerald-900 rounded-b-xl shadow-lg"
                style={{
                  left: pipe.x,
                  top: 0,
                  width: PIPE_WIDTH,
                  height: pipe.topHeight,
                  boxShadow: "inset 4px 0 6px rgba(255, 255, 255, 0.25), inset -4px 0 6px rgba(0, 0, 0, 0.4)"
                }}
              >
                {/* Flared Rim */}
                <div
                  className="absolute bottom-0 -left-1.5 -right-1.5 h-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-700 border-2 border-emerald-950 rounded-b-md shadow-md"
                />
              </div>

              {/* Bottom Pipe */}
              <div
                className="absolute bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700 border-x-2 border-t-4 border-emerald-900 rounded-t-xl shadow-lg"
                style={{
                  left: pipe.x,
                  bottom: 40,
                  width: PIPE_WIDTH,
                  height: pipe.bottomHeight,
                  boxShadow: "inset 4px 0 6px rgba(255, 255, 255, 0.25), inset -4px 0 6px rgba(0, 0, 0, 0.4)"
                }}
              >
                {/* Flared Rim */}
                <div
                  className="absolute top-0 -left-1.5 -right-1.5 h-6 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-700 border-2 border-emerald-950 rounded-t-md shadow-md"
                />
              </div>
            </div>
          ))}

          {/* Flying Flappy Bird (Animated SVG) */}
          <div
            className="absolute transition-transform duration-75 flex items-center justify-center"
            style={{
              left: BIRD_X_POSITION,
              top: birdY,
              width: BIRD_WIDTH,
              height: BIRD_HEIGHT,
              transform: `rotate(${birdAngle}deg)`,
              filter: `drop-shadow(0 0 10px ${activeSkin.glowColor})`
            }}
          >
            <svg width={BIRD_WIDTH} height={BIRD_HEIGHT} viewBox="0 0 44 32" fill="none">
              {/* Bird Body */}
              <ellipse cx="22" cy="16" rx="16" ry="12" fill={activeSkin.bodyColor} />
              {/* Belly */}
              <ellipse cx="20" cy="19" rx="11" ry="7" fill="white" opacity="0.35" />
              {/* Big Anime Eye */}
              <circle cx="30" cy="11" r="5" fill="white" />
              <circle cx="31.5" cy="11" r="2.5" fill="#0f172a" />
              <circle cx="32.5" cy="10" r="1" fill="white" />
              {/* Orange Beak */}
              <path d="M 34 14 L 43 17 L 34 20 Z" fill={activeSkin.beakColor} stroke="#b45309" strokeWidth="1" />
              {/* Flapping Wing */}
              <ellipse
                cx="13"
                cy={birdAngle < 0 ? 12 : 16}
                rx="8"
                ry="5"
                fill={activeSkin.wingColor}
                stroke="rgba(0,0,0,0.15)"
                transform={birdAngle < 0 ? "rotate(-15 13 12)" : "rotate(10 13 16)"}
              />
              {/* Wing highlight */}
              <ellipse cx="14" cy={birdAngle < 0 ? 11 : 15} rx="5" ry="2.5" fill="white" opacity="0.4" />
            </svg>
          </div>

          {/* Scrolling Ground Track */}
          <div
            className="absolute bottom-0 w-full h-10 bg-gradient-to-r from-amber-800 via-stone-800 to-amber-800 border-t-4 border-emerald-500 shadow-2xl"
          >
            <div className="absolute inset-0 flex" style={{ transform: `translateX(-${groundOffset}px)` }}>
              {Array.from({ length: 20 }).map((_, idx) => (
                <div key={idx} className="w-10 h-full border-r border-amber-600/30" />
              ))}
            </div>
          </div>

          {/* Live In-Game Floating Score */}
          {isPlaying && (
            <div className="absolute top-6 left-0 right-0 flex justify-center pointer-events-none">
              <span className="font-mono text-5xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                {score}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="shrink-0 bg-card/85 border-t border-border/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-20">
        {/* Mobile Big Tap/Flap Button */}
        <div className="flex sm:hidden w-full max-w-sm mx-auto">
          <Button
            size="lg"
            onClick={isPlaying ? flap : startGame}
            className="w-full h-14 rounded-2xl text-base font-black bg-primary text-primary-foreground shadow-lg gap-2"
          >
            <ChevronUp className="h-6 w-6 animate-bounce" />
            {isPlaying ? "FLAP WINGS" : "TAP TO FLY"}
          </Button>
        </div>

        {/* Desktop Helper Guide */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mx-auto">
          <span>Flap / Fly: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Click</kbd></span>
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
                Sky Championship • Pro Edition 2026
              </div>

              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🐦 FLAPPY BIRD PRO
                </h1>
                <p className="text-xs text-muted-foreground">
                  Navigate through emerald pipes, earn prestigious flight medals, unlock custom bird skins, and set new altitude records!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-xs text-left">
                <div><span className="font-bold text-amber-600">🥉 Bronze:</span> 5+ pipes</div>
                <div><span className="font-bold text-slate-300">🥈 Silver:</span> 10+ pipes</div>
                <div><span className="font-bold text-amber-400">🥇 Gold:</span> 20+ pipes</div>
                <div><span className="font-bold text-cyan-400">👑 Platinum:</span> 30+ pipes</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12"
              >
                LAUNCH FLIGHT
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
                <h2 className="text-3xl font-black tracking-tight text-gradient">Flight Terminated!</h2>
                <p className="text-xs text-muted-foreground">The bird made contact with an obstacle.</p>

                {medal && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-card border border-border/70 text-xs font-black shadow-sm mt-1">
                    <span>{medal.icon}</span>
                    <span className={medal.color}>{medal.title} Medal Earned!</span>
                  </div>
                )}
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Pipes Cleared</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Total Flaps</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{flapsCount}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">High Score</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{highScore}</span>
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
                  Fly Again
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
              Resume Flight
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
