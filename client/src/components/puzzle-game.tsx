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
  RotateCcw, Trophy, Shuffle, Check, X, Clock, User, List,
  Volume2, VolumeX, Eye, EyeOff, Gamepad2, CheckCircle2, 
  Sparkles, Award, Star, Upload, Image as ImageIcon, MousePointer
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

  playPick() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(820, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playSnap() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.035);
        gain.gain.setValueAtTime(0.2, now + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.035 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.035);
        osc.stop(now + idx * 0.035 + 0.22);
      });
    } catch {}
  }

  playError() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.2);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    } catch {}
  }

  playHint() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  isPlaced: boolean;
}

interface PuzzleGameProps {
  onBack: () => void;
}

interface ScenePhoto {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  tag: string;
}

const ROWS = 5;
const COLS = 4;
const TOTAL_PIECES = ROWS * COLS; // 20
const PIECE_WIDTH = 70;
const PIECE_HEIGHT = 70;
const BOARD_WIDTH = COLS * PIECE_WIDTH;   // 280px
const BOARD_HEIGHT = ROWS * PIECE_HEIGHT; // 350px

// High-resolution original photography & art collection
const CURATED_SCENES: ScenePhoto[] = [
  {
    id: "yosemite",
    name: "Yosemite Alpine Lake",
    category: "Wilderness",
    tag: "🏔️ Nature",
    description: "Turquoise alpine lake reflection framed by majestic granite peaks",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&h=750&q=85"
  },
  {
    id: "tokyo-cyberpunk",
    name: "Neo Tokyo Cyberpunk",
    category: "Metropolis",
    tag: "🌆 Cyberpunk",
    description: "Vibrant neon-lit skyscrapers reflecting on glistening evening streets",
    imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&h=750&q=85"
  },
  {
    id: "deep-space",
    name: "Cosmic Nebula & Earth",
    category: "Astronomy",
    tag: "🌌 Deep Space",
    description: "Orbital perspective of planet Earth surrounded by stellar constellations",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=750&q=85"
  },
  {
    id: "maldives-beach",
    name: "Tropical Coral Lagoon",
    category: "Paradise",
    tag: "🏝️ Ocean",
    description: "Pristine white sand beach meeting crystal turquoise coral waters",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=750&q=85"
  },
  {
    id: "bengal-tiger",
    name: "Majestic Golden Tiger",
    category: "Wildlife",
    tag: "🐅 Wild Life",
    description: "Intense and regal Bengal tiger portrait in lush jungle foliage",
    imageUrl: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?auto=format&fit=crop&w=600&h=750&q=85"
  },
  {
    id: "santorini-castle",
    name: "Mediterranean Castle",
    category: "Heritage",
    tag: "🏛️ Architecture",
    description: "Historic whitewashed coastal terrace overlooking the deep blue sea",
    imageUrl: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&h=750&q=85"
  }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PuzzleGame({ onBack }: PuzzleGameProps) {
  const [scenes, setScenes] = useState<ScenePhoto[]>(CURATED_SCENES);
  const [currentScene, setCurrentScene] = useState<ScenePhoto>(CURATED_SCENES[0]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [hand, setHand] = useState<number[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);

  // Gameplay State
  const [score, setScore] = useState<number>(0);
  const [placedCount, setPlacedCount] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(4);
  const [showGhostHint, setShowGhostHint] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [errorSlot, setErrorSlot] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer & High Score
  const [gameTime, setGameTime] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentSceneRef = useRef<ScenePhoto>(CURATED_SCENES[0]);
  const scenesRef = useRef<ScenePhoto[]>(CURATED_SCENES);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    scenesRef.current = scenes;
  }, [scenes]);

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/puzzle/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('puzzle_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const res = await fetch('/api/games/puzzle/scores?limit=10');
        if (res.ok) {
          const apiScores = (await res.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Master Puzzler 🧩", score: 320, timeInSeconds: 38, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Genius 💡", score: 290, timeInSeconds: 46, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Eagle Eye 🦅", score: 260, timeInSeconds: 54, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Solver ⚡", score: 230, timeInSeconds: 68, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Speedy Hands ✋", score: 200, timeInSeconds: 82, createdAt: new Date().toISOString() }
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number; timeInSeconds: number }) => {
      try {
        const stored = localStorage.getItem('puzzle_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('puzzle_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const res = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'puzzle' }),
      });
      if (!res.ok) throw new Error('Score save fallback');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/puzzle/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && !isCompleted && !showPreview) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isCompleted, showPreview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate / Reset Puzzle with Target Scene
  const generatePuzzle = useCallback((targetScene?: ScenePhoto) => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }

    const scene = targetScene || currentSceneRef.current;
    currentSceneRef.current = scene;
    setCurrentScene(scene);

    setPlacedCount(0);
    setScore(0);
    setMoves(0);
    setMistakes(0);
    setIsCompleted(false);
    setShowPreview(true);
    setCountdown(4);
    setSelectedPieceId(null);
    setErrorSlot(null);
    setGameTime(0);
    setIsGameStarted(false);
    setScoreSubmitted(false);
    setPlayerName("");

    const newPieces: PuzzlePiece[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const id = r * COLS + c;
        newPieces.push({
          id,
          row: r,
          col: c,
          isPlaced: false,
        });
      }
    }

    setPieces(newPieces);

    // Initial countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) {
            clearInterval(countdownTimerRef.current);
            countdownTimerRef.current = null;
          }
          setShowPreview(false);
          setIsGameStarted(true);

          // Give player initial hand of 4 shuffled pieces
          const allIds = newPieces.map(p => p.id);
          const shuffled = [...allIds].sort(() => 0.5 - Math.random());
          setHand(shuffled.slice(0, 4));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    generatePuzzle(CURATED_SCENES[0]);
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [generatePuzzle]);

  const handleShuffle = useCallback(() => {
    const pool = scenesRef.current.filter(s => s.id !== currentSceneRef.current.id);
    const randomScene = pool[Math.floor(Math.random() * pool.length)] || scenesRef.current[0];
    generatePuzzle(randomScene);
  }, [generatePuzzle]);

  const openThemeModal = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setShowPreview(false);
    setShowThemeModal(true);
  }, []);

  // Handle Custom Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const customScene: ScenePhoto = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, "").slice(0, 20) || "Custom Photo",
          category: "My Upload",
          tag: "📷 Custom Photo",
          description: "Your personalized uploaded jigsaw picture",
          imageUrl: dataUrl
        };
        // Reset file input value so user can upload the same or another file again
        e.target.value = "";

        setScenes(prev => [customScene, ...prev.filter(s => s.id !== customScene.id)]);
        scenesRef.current = [customScene, ...scenesRef.current.filter(s => s.id !== customScene.id)];
        currentSceneRef.current = customScene;
        generatePuzzle(customScene);
        setShowThemeModal(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Unified Piece Placement Logic (Supports both Drag-and-Drop and Click-to-Place)
  const placePieceAtSlot = (pieceId: number, slotIndex: number) => {
    setErrorSlot(null);
    setMoves(m => m + 1);

    if (pieces[slotIndex]?.isPlaced) return;

    if (pieceId === slotIndex) {
      // ✅ SUCCESS!
      sound.playSnap();
      setPieces(prev => prev.map(p => p.id === slotIndex ? { ...p, isPlaced: true } : p));
      setScore(s => s + 15);

      setPlacedCount(prev => {
        const next = prev + 1;
        if (next === TOTAL_PIECES) {
          setIsCompleted(true);
          sound.playVictory();
        }
        return next;
      });

      // Update Hand: remove placed piece and draw next from unplaced pool
      setHand(prevHand => {
        const nextHand = prevHand.filter(id => id !== pieceId);
        const currentPlacedIds = pieces.filter(p => p.isPlaced).map(p => p.id);
        const allPlaced = [...currentPlacedIds, slotIndex];

        const availablePool = pieces
          .filter(p => !allPlaced.includes(p.id) && !nextHand.includes(p.id) && p.id !== pieceId)
          .map(p => p.id);

        if (availablePool.length > 0 && nextHand.length < 4) {
          const nextPieceId = availablePool[Math.floor(Math.random() * availablePool.length)];
          return [...nextHand, nextPieceId];
        }
        return nextHand;
      });

      setSelectedPieceId(null);
      setDraggedPieceId(null);
    } else {
      // ❌ WRONG POSITION
      sound.playError();
      setErrorSlot(slotIndex);
      setMistakes(m => m + 1);
      setScore(s => Math.max(0, s - 5));
      setTimeout(() => setErrorSlot(null), 800);
    }
  };

  const handlePieceClick = (id: number) => {
    sound.playPick();
    setSelectedPieceId(prev => (prev === id ? null : id));
    setErrorSlot(null);
  };

  const handleSlotClick = (slotIndex: number) => {
    if (selectedPieceId === null) return;
    placePieceAtSlot(selectedPieceId, slotIndex);
  };

  const calculateStars = () => {
    if (mistakes <= 1 && gameTime <= 60) return 3;
    if (mistakes <= 4 && gameTime <= 100) return 2;
    return 1;
  };

  const starsEarned = calculateStars();

  return (
    <div className="fixed inset-0 bg-background flex flex-col select-none overflow-hidden">
      {/* Hidden File Input for Custom Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

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

          {/* Theme / Photo Selector Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={openThemeModal}
            className="h-8 px-2.5 rounded-xl text-xs font-bold gap-1.5 border-border/70 max-w-[140px] sm:max-w-none truncate"
            title="Choose different original photo or upload your own"
          >
            <ImageIcon className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="truncate">{currentScene.name}</span>
          </Button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 font-mono text-xs">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatTime(gameTime)}</span>
          </div>
        </div>

        {/* Center: Score & Progress */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground font-semibold mr-1.5">Score:</span>
            <span className="text-base sm:text-xl font-black text-primary font-mono">{score}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
            <span>{placedCount}</span>
            <span className="text-muted-foreground">/</span>
            <span>{TOTAL_PIECES}</span>
          </div>
        </div>

        {/* Right: Actions, Hint & Sound */}
        <div className="flex items-center gap-2">
          {/* Ghost Hint Watermark Button */}
          <Button
            variant={showGhostHint ? "default" : "outline"}
            size="sm"
            onClick={() => {
              sound.playHint();
              setShowGhostHint(!showGhostHint);
            }}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5"
            title={showGhostHint ? "Hide watermark guide" : "Show watermark guide"}
          >
            {showGhostHint ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showGhostHint ? "Hide Hint" : "Hint"}</span>
          </Button>

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

          {/* Records Dialog */}
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
                  Puzzle Champions Leaderboard
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
                        {rec.timeInSeconds && (
                          <span className="text-xs text-muted-foreground block">{formatTime(rec.timeInSeconds)}</span>
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

          {/* Next Random Photo */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleShuffle}
            className="h-8 w-8 rounded-xl"
            title="Randomize new puzzle photo"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden relative bg-slate-950">
        
        {/* Interaction Guide */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/75 border border-border/50 text-[11px] font-semibold text-muted-foreground mb-3">
          <MousePointer className="h-3 w-3 text-primary animate-pulse" />
          <span><b>Drag & Drop</b> photo pieces, or <b>Click</b> a piece and click a slot to place!</span>
        </div>

        {/* Puzzle Board Grid Container */}
        <div
          className="relative rounded-2xl p-2.5 bg-card/90 border-2 border-border/80 shadow-2xl backdrop-blur-md overflow-hidden select-none"
          style={{ width: `${BOARD_WIDTH + 20}px`, height: `${BOARD_HEIGHT + 20}px` }}
        >
          {/* Subtle Watermark Ghost Hint */}
          {showGhostHint && (
            <div
              className="absolute inset-2.5 pointer-events-none rounded-xl opacity-25 transition-opacity"
              style={{
                backgroundImage: `url(${currentScene.imageUrl})`,
                backgroundSize: `${BOARD_WIDTH}px ${BOARD_HEIGHT}px`,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            />
          )}

          {/* 4x5 Grid Slots */}
          <div
            className="grid grid-cols-4 gap-1 w-full h-full relative"
            style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}
          >
            {pieces.map((piece, index) => {
              const row = Math.floor(piece.id / COLS);
              const col = piece.id % COLS;

              const isPlaced = piece.isPlaced;
              const isError = errorSlot === index;
              const isHovered = hoveredSlot === index;

              return (
                <div
                  key={`slot-${index}`}
                  onClick={() => handleSlotClick(index)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    if (!isPlaced) setHoveredSlot(index);
                  }}
                  onDragLeave={() => {
                    if (hoveredSlot === index) setHoveredSlot(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHoveredSlot(null);
                    const droppedIdStr = e.dataTransfer.getData("text/plain");
                    const droppedId = droppedIdStr ? parseInt(droppedIdStr, 10) : draggedPieceId || selectedPieceId;
                    if (droppedId !== null && !isNaN(droppedId)) {
                      placePieceAtSlot(droppedId, index);
                    }
                  }}
                  className={`
                    relative rounded-lg overflow-hidden transition-all duration-200
                    ${isPlaced ? 'shadow-sm border border-black/20' : 'border-2 border-dashed border-border/60 hover:border-primary/60 cursor-pointer bg-slate-900/60'}
                    ${isHovered && !isPlaced ? 'border-primary ring-2 ring-primary/40 bg-primary/20 scale-105 z-10' : ''}
                    ${isError ? 'border-rose-500 bg-rose-500/25 ring-2 ring-rose-500 animate-bounce' : ''}
                  `}
                  style={{ width: `${PIECE_WIDTH}px`, height: `${PIECE_HEIGHT}px` }}
                >
                  {isPlaced ? (
                    /* Seamless High-Definition Photo Slice */
                    <div
                      className="w-full h-full animate-in zoom-in-95 duration-200"
                      style={{
                        backgroundImage: `url(${currentScene.imageUrl})`,
                        backgroundSize: `${BOARD_WIDTH}px ${BOARD_HEIGHT}px`,
                        backgroundPosition: `-${col * PIECE_WIDTH}px -${row * PIECE_HEIGHT}px`,
                        backgroundRepeat: 'no-repeat'
                      }}
                    />
                  ) : (
                    /* Empty Slot Guide */
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground/35 font-mono font-bold">
                      {isError ? (
                        <X className="h-5 w-5 text-rose-500 animate-spin" />
                      ) : (
                        <span>#{index + 1}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Hand: Available Photo Pieces Tray (Bottom Dock) */}
      <div className="h-[130px] shrink-0 bg-card/85 border-t border-border/80 flex flex-col items-center justify-center px-4 py-2 relative z-20">
        <div className="flex items-center justify-between w-full max-w-md mb-1.5 px-2 text-xs">
          <span className="font-bold text-muted-foreground">Pick or Drag a Photo Slice:</span>
          <span className="text-[11px] text-primary font-bold">
            {TOTAL_PIECES - placedCount} slices remaining
          </span>
        </div>

        <div className="flex items-center justify-center gap-3.5 sm:gap-5">
          {hand.map((id) => {
            const piece = pieces.find(p => p.id === id);
            if (!piece) return null;

            const row = Math.floor(piece.id / COLS);
            const col = piece.id % COLS;
            const isSelected = selectedPieceId === id;
            const isDragging = draggedPieceId === id;

            return (
              <div
                key={`hand-piece-${id}`}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", id.toString());
                  e.dataTransfer.effectAllowed = "move";
                  setDraggedPieceId(id);
                  handlePieceClick(id);
                }}
                onDragEnd={() => {
                  setDraggedPieceId(null);
                }}
                onClick={() => handlePieceClick(id)}
                className={`
                  relative rounded-xl overflow-hidden cursor-grab active:cursor-grabbing select-none
                  border-2 transition-all duration-200 shadow-lg hover:scale-110 hover:-translate-y-1
                  ${isSelected ? 'border-primary ring-4 ring-primary/40 scale-110 -translate-y-1 z-10 shadow-2xl' : 'border-card/90'}
                  ${isDragging ? 'opacity-40' : 'opacity-100'}
                `}
                style={{
                  width: `${PIECE_WIDTH}px`,
                  height: `${PIECE_HEIGHT}px`,
                  backgroundImage: `url(${currentScene.imageUrl})`,
                  backgroundSize: `${BOARD_WIDTH}px ${BOARD_HEIGHT}px`,
                  backgroundPosition: `-${col * PIECE_WIDTH}px -${row * PIECE_HEIGHT}px`,
                  backgroundRepeat: 'no-repeat'
                }}
                title="Click or Drag onto board"
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center shadow">
                    <Check className="h-3 w-3 text-primary-foreground stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}

          {hand.length === 0 && !isCompleted && placedCount < TOTAL_PIECES && (
            <div className="text-xs text-muted-foreground italic py-3">
              Drawing final slices...
            </div>
          )}
        </div>
      </div>

      {/* Select Photo / Custom Upload Modal */}
      {showThemeModal && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">Choose Puzzle Photo</h2>
                  <p className="text-xs text-muted-foreground">Select from original high-resolution scenes or upload your own image</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowThemeModal(false)} className="rounded-xl">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Upload Custom Photo Banner (Native Label for Instant 1-Click File Open) */}
              <label
                htmlFor="custom-puzzle-upload"
                className="p-4 rounded-2xl border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-between group block"
              >
                <input
                  id="custom-puzzle-upload"
                  type="file"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">Upload Your Own Photo</span>
                    <span className="text-xs text-muted-foreground">Upload any picture from your device to create an instant custom puzzle</span>
                  </div>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl font-bold text-xs bg-secondary text-secondary-foreground shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Select File
                </div>
              </label>

              {/* Curated Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {scenes.map((scene) => {
                  const isSelected = currentScene.id === scene.id;
                  return (
                    <div
                      key={scene.id}
                      onClick={() => {
                        generatePuzzle(scene);
                        setShowThemeModal(false);
                      }}
                      className={`
                        relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 group
                        ${isSelected ? 'border-primary ring-2 ring-primary/30 shadow-lg' : 'border-border/70 hover:border-primary/50'}
                      `}
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900">
                        <img
                          src={scene.imageUrl}
                          alt={scene.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-2 bg-card/90 backdrop-blur-sm">
                        <span className="text-[10px] text-primary font-bold block">{scene.tag}</span>
                        <span className="text-xs font-bold truncate block">{scene.name}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Countdown Preview Overlay */}
      {showPreview && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-7 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Memorize the Photo
                </span>
                <h2 className="text-2xl font-black">{currentScene.name}</h2>
                <p className="text-xs text-muted-foreground">{currentScene.description}</p>
              </div>

              {/* Real Photo Preview */}
              <div className="mx-auto rounded-2xl p-2 bg-card border border-border/70 shadow-lg w-fit">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ width: `${BOARD_WIDTH * 0.85}px`, height: `${BOARD_HEIGHT * 0.85}px` }}
                >
                  <img
                    src={currentScene.imageUrl}
                    alt={currentScene.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-black text-primary font-mono animate-bounce">
                  {countdown}
                </div>
                <p className="text-xs text-muted-foreground font-medium">seconds remaining until start</p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    setIsGameStarted(true);
                    const allIds = pieces.map(p => p.id);
                    const shuffled = [...allIds].sort(() => 0.5 - Math.random());
                    setHand(shuffled.slice(0, 4));
                  }}
                  className="flex-1 rounded-2xl font-bold bg-primary text-primary-foreground"
                >
                  Start Solving
                </Button>
                <Button
                  variant="outline"
                  onClick={openThemeModal}
                  className="rounded-2xl font-semibold gap-1.5"
                >
                  <ImageIcon className="h-4 w-4" />
                  Change Photo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion & Victory Modal */}
      {isCompleted && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-7 space-y-5">
              <div className="space-y-2">
                <Trophy className="h-14 w-14 mx-auto text-yellow-500 animate-bounce" />
                <h2 className="text-3xl font-black tracking-tight">Puzzle Completed!</h2>
                <div className="flex items-center justify-center gap-1.5 text-yellow-400">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < starsEarned ? "fill-yellow-400" : "fill-transparent stroke-muted-foreground"}`}
                    />
                  ))}
                </div>
              </div>

              {/* Performance Stats Cards */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Time Taken</span>
                  <span className="text-xl font-black text-emerald-500 font-mono">{formatTime(gameTime)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Mistakes</span>
                  <span className="text-xl font-black text-rose-500 font-mono">{mistakes}</span>
                </div>
              </div>

              {/* Record Submission Form */}
              {scoreSubmitted ? (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-xs">Record successfully registered to the Hall of Fame!</span>
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
                          score,
                          timeInSeconds: gameTime
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

              {/* Navigation Options */}
              <div className="flex gap-2">
                <Button onClick={handleShuffle} className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Next Photo
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
    </div>
  );
}
