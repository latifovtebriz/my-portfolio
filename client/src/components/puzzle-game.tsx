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
  Sparkles, Award, Star, Flame, MousePointer
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// AUDIO SYNTHESIZER (Pure Web Audio API - Zero External Asset Dependencies)
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
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
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
      // Dual harmonic snap chime
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);
        gain.gain.setValueAtTime(0.22, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.03 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.22);
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
      gain.gain.setValueAtTime(0.28, now);
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
  correctX: number;
  correctY: number;
  isPlaced: boolean;
}

interface PuzzleGameProps {
  onBack: () => void;
}

interface SvgElement {
  type: string;
  props: Record<string, any>;
}

interface SceneData {
  id: string;
  name: string;
  category: string;
  difficulty: string;
  description: string;
  generateScene: (width: number, height: number) => SvgElement[];
}

const ROWS = 5;
const COLS = 4;
const TOTAL_PIECES = ROWS * COLS; // 20
const PIECE_SIZE = 64;
const SCENE_WIDTH = COLS * PIECE_SIZE;  // 256
const SCENE_HEIGHT = ROWS * PIECE_SIZE; // 320

// ============================================================================
// ARTISTIC SCENE GENERATORS (6 Rich Themes)
// ============================================================================

const PUZZLE_SCENES: SceneData[] = [
  {
    id: "forest",
    name: "Emerald Forest",
    category: "Nature",
    difficulty: "Balanced",
    description: "Sunlit trail through a lush pine forest with wild mushrooms and flora",
    generateScene: (w, h) => [
      // Sky
      { type: 'rect', props: { x: 0, y: 0, width: w, height: h * 0.38, fill: '#7dd3fc' } },
      // Sun
      { type: 'circle', props: { cx: w * 0.82, cy: h * 0.14, r: 28, fill: '#fde047', opacity: 0.95 } },
      // Rolling distant hills
      { type: 'path', props: { d: `M 0 ${h * 0.36} Q ${w * 0.35} ${h * 0.22} ${w * 0.7} ${h * 0.34} Q ${w * 0.88} ${h * 0.38} ${w} ${h * 0.28} L ${w} ${h * 0.42} L 0 ${h * 0.42} Z`, fill: '#86efac' } },
      // Meadow Ground
      { type: 'rect', props: { x: 0, y: h * 0.38, width: w, height: h * 0.62, fill: '#15803d' } },
      // Trees
      ...[0.12, 0.3, 0.5, 0.72, 0.9].map((xP, i) => {
        const sc = 0.85 + (i % 3) * 0.15;
        const trY = h * 0.42 + (i % 2) * 28;
        return [
          { type: 'rect', props: { x: w * xP - 4 * sc, y: trY, width: 8 * sc, height: 35 * sc, fill: '#78350f' } },
          { type: 'circle', props: { cx: w * xP, cy: trY - 18 * sc, r: 24 * sc, fill: i % 2 === 0 ? '#166534' : '#14532d' } },
          { type: 'circle', props: { cx: w * xP - 8 * sc, cy: trY - 14 * sc, r: 16 * sc, fill: '#15803d' } },
          { type: 'circle', props: { cx: w * xP + 8 * sc, cy: trY - 14 * sc, r: 16 * sc, fill: '#22c55e' } },
        ];
      }).flat(),
      // Winding golden path
      { type: 'path', props: { d: `M ${w * 0.2} ${h} Q ${w * 0.45} ${h * 0.75} ${w * 0.5} ${h * 0.58} Q ${w * 0.55} ${h * 0.48} ${w * 0.62} ${h * 0.42} L ${w * 0.68} ${h * 0.42} Q ${w * 0.6} ${h * 0.6} ${w * 0.4} ${h} Z`, fill: '#fde68a' } }
    ]
  },
  {
    id: "sunset-city",
    name: "Cyber Sunset",
    category: "Architecture",
    difficulty: "Advanced",
    description: "Vibrant metropolis with glowing towers and neon horizon gradient",
    generateScene: (w, h) => [
      // Evening Sky Gradients
      { type: 'rect', props: { x: 0, y: 0, width: w, height: h * 0.3, fill: '#312e81' } },
      { type: 'rect', props: { x: 0, y: h * 0.3, width: w, height: h * 0.25, fill: '#e11d48' } },
      { type: 'rect', props: { x: 0, y: h * 0.55, width: w, height: h * 0.45, fill: '#fb923c' } },
      // Giant synthwave sun
      { type: 'circle', props: { cx: w * 0.5, cy: h * 0.48, r: 48, fill: '#fde047', opacity: 0.95 } },
      // Skyscraper Silhouettes
      ...Array.from({ length: 9 }).map((_, i) => {
        const bW = w / 8;
        const bH = 50 + ((i * 37) % 110);
        const bX = i * (bW - 2);
        const bY = h - bH;
        return [
          { type: 'rect', props: { x: bX, y: bY, width: bW + 2, height: bH, fill: '#0f172a' } },
          // Lit Windows
          ...Array.from({ length: 5 }).map((__, j) => ({
            type: 'rect',
            props: { x: bX + 4 + (j % 2) * 10, y: bY + 10 + j * 16, width: 6, height: 8, fill: j % 2 === 0 ? '#38bdf8' : '#f43f5e', opacity: 0.85 }
          }))
        ];
      }).flat()
    ]
  },
  {
    id: "space-voyager",
    name: "Galactic Odyssey",
    category: "Sci-Fi",
    difficulty: "Challenging",
    description: "Cosmic starship navigating orbital asteroid rings and nebulas",
    generateScene: (w, h) => [
      // Deep Space Void
      { type: 'rect', props: { x: 0, y: 0, width: w, height: h, fill: '#030712' } },
      // Nebula Swirls
      { type: 'circle', props: { cx: w * 0.25, cy: h * 0.3, r: 80, fill: '#7c3aed', opacity: 0.25 } },
      { type: 'circle', props: { cx: w * 0.75, cy: h * 0.7, r: 90, fill: '#ec4899', opacity: 0.2 } },
      // Twinkling Stars
      ...Array.from({ length: 35 }).map((_, i) => ({
        type: 'circle',
        props: {
          cx: (i * 47) % w,
          cy: (i * 83) % h,
          r: (i % 3) === 0 ? 2.5 : 1.2,
          fill: i % 4 === 0 ? '#67e8f9' : '#f8fafc',
          opacity: 0.85
        }
      })),
      // Ringed Gas Giant Planet
      { type: 'circle', props: { cx: w * 0.8, cy: h * 0.22, r: 36, fill: '#f97316' } },
      { type: 'ellipse', props: { cx: w * 0.8, cy: h * 0.22, rx: 65, ry: 10, fill: 'none', stroke: '#fed7aa', strokeWidth: 3, transform: `rotate(-22 ${w * 0.8} ${h * 0.22})` } },
      // Retro Rocket Ship
      { type: 'path', props: { d: `M ${w * 0.32} ${h * 0.65} L ${w * 0.32 + 24} ${h * 0.65} L ${w * 0.32 + 12} ${h * 0.65 - 45} Z`, fill: '#f8fafc' } },
      { type: 'path', props: { d: `M ${w * 0.32} ${h * 0.65} L ${w * 0.32 - 8} ${h * 0.65 + 14} L ${w * 0.32 + 12} ${h * 0.65} Z`, fill: '#ef4444' } },
      { type: 'path', props: { d: `M ${w * 0.32 + 24} ${h * 0.65} L ${w * 0.32 + 32} ${h * 0.65 + 14} L ${w * 0.32 + 12} ${h * 0.65} Z`, fill: '#ef4444' } },
      { type: 'circle', props: { cx: w * 0.32 + 12, cy: h * 0.65 - 22, r: 6, fill: '#38bdf8' } },
      // Thruster Flame
      { type: 'path', props: { d: `M ${w * 0.32 + 6} ${h * 0.65} L ${w * 0.32 + 18} ${h * 0.65} L ${w * 0.32 + 12} ${h * 0.65 + 24} Z`, fill: '#f59e0b' } }
    ]
  },
  {
    id: "coral-reef",
    name: "Ocean Depths",
    category: "Aquatic",
    difficulty: "Serene",
    description: "Tropical underwater sanctuary filled with playful clownfish and corals",
    generateScene: (w, h) => [
      // Deep Water Gradient
      { type: 'rect', props: { x: 0, y: 0, width: w, height: h * 0.85, fill: '#0284c7' } },
      { type: 'rect', props: { x: 0, y: h * 0.85, width: w, height: h * 0.15, fill: '#f59e0b' } },
      // Coral formations
      ...Array.from({ length: 7 }).map((_, i) => ({
        type: 'path',
        props: {
          d: `M ${i * 42} ${h} Q ${i * 42 - 12} ${h * 0.72} ${i * 42} ${h * 0.58} Q ${i * 42 + 12} ${h * 0.44} ${i * 42} ${h * 0.35}`,
          fill: 'none',
          stroke: i % 2 === 0 ? '#10b981' : '#059669',
          strokeWidth: 7,
          strokeLinecap: 'round'
        }
      })),
      // Bubble streams
      ...Array.from({ length: 18 }).map((_, i) => ({
        type: 'circle',
        props: { cx: (i * 31) % w, cy: (i * 59) % (h * 0.8), r: 2 + (i % 4), fill: '#ffffff', opacity: 0.35 }
      })),
      // Vibrant Fish Trio
      ...['#ef4444', '#facc15', '#a855f7'].map((col, idx) => {
        const fx = w * 0.25 + idx * 70;
        const fy = h * 0.28 + idx * 55;
        return [
          { type: 'ellipse', props: { cx: fx, cy: fy, rx: 24, ry: 14, fill: col } },
          { type: 'path', props: { d: `M ${fx - 18} ${fy} L ${fx - 34} ${fy - 12} L ${fx - 34} ${fy + 12} Z`, fill: col } },
          { type: 'circle', props: { cx: fx + 12, cy: fy - 4, r: 3, fill: '#ffffff' } },
          { type: 'circle', props: { cx: fx + 13, cy: fy - 4, r: 1.5, fill: '#000000' } }
        ];
      }).flat()
    ]
  },
  {
    id: "desert-oasis",
    name: "Golden Mirage",
    category: "Adventure",
    difficulty: "Pleasant",
    description: "Ancient desert dunes with palm oasis and majestic twin pyramids",
    generateScene: (w, h) => [
      // Warm Twilight Sky
      { type: 'rect', props: { x: 0, y: 0, width: w, height: h * 0.5, fill: '#fdba74' } },
      // Crescent Moon
      { type: 'circle', props: { cx: w * 0.2, cy: h * 0.16, r: 24, fill: '#fef08a' } },
      { type: 'circle', props: { cx: w * 0.23, cy: h * 0.15, r: 20, fill: '#fdba74' } },
      // Great Pyramids
      { type: 'path', props: { d: `M ${w * 0.3} ${h * 0.5} L ${w * 0.5} ${h * 0.25} L ${w * 0.7} ${h * 0.5} Z`, fill: '#d97706' } },
      { type: 'path', props: { d: `M ${w * 0.5} ${h * 0.25} L ${w * 0.7} ${h * 0.5} L ${w * 0.6} ${h * 0.5} Z`, fill: '#b45309' } },
      // Rolling Dunes
      { type: 'path', props: { d: `M 0 ${h * 0.5} Q ${w * 0.35} ${h * 0.42} ${w * 0.7} ${h * 0.54} Q ${w * 0.88} ${h * 0.58} ${w} ${h * 0.48} L ${w} ${h} L 0 ${h} Z`, fill: '#f59e0b' } },
      { type: 'path', props: { d: `M 0 ${h * 0.7} Q ${w * 0.4} ${h * 0.62} ${w * 0.75} ${h * 0.76} L ${w} ${h} L 0 ${h} Z`, fill: '#d97706' } },
      // Palm Trees
      { type: 'rect', props: { x: w * 0.8 - 3, y: h * 0.65, width: 6, height: 45, fill: '#78350f' } },
      { type: 'circle', props: { cx: w * 0.8, cy: h * 0.63, r: 18, fill: '#15803d' } }
    ]
  }
];

// ============================================================================
// MAIN PUZZLE COMPONENT
// ============================================================================

export default function PuzzleGame({ onBack }: PuzzleGameProps) {
  const [currentScene, setCurrentScene] = useState<SceneData>(PUZZLE_SCENES[0]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [hand, setHand] = useState<number[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [draggedPieceId, setDraggedPieceId] = useState<number | null>(null);

  // Gameplay state
  const [score, setScore] = useState<number>(0);
  const [placedCount, setPlacedCount] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(4);
  const [showGhostHint, setShowGhostHint] = useState<boolean>(false);
  const [errorSlot, setErrorSlot] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Match Timer & Score Records
  const [gameTime, setGameTime] = useState<number>(0);
  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const queryClient = useQueryClient();

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

  // Game countdown and timer
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

  // Generate / Reset Puzzle
  const generatePuzzle = useCallback((targetScene?: SceneData) => {
    const scene = targetScene || PUZZLE_SCENES[Math.floor(Math.random() * PUZZLE_SCENES.length)];
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
          correctX: c * PIECE_SIZE,
          correctY: r * PIECE_SIZE,
          isPlaced: false,
        });
      }
    }

    setPieces(newPieces);

    // Initial countdown before play begins
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
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
    generatePuzzle();
  }, [generatePuzzle]);

  // Handle Piece Placement (Unified logic for Drag-and-Drop and Click-to-Place)
  const placePieceAtSlot = (pieceId: number, slotIndex: number) => {
    setErrorSlot(null);
    setMoves(m => m + 1);

    // Check if slot is already occupied
    if (pieces[slotIndex]?.isPlaced) return;

    if (pieceId === slotIndex) {
      // ✅ SUCCESSFUL SNAP!
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

      // Update player's hand: Remove placed piece & replenish from unplaced pool
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

  // Click-to-select hand piece
  const handlePieceClick = (id: number) => {
    sound.playPick();
    if (selectedPieceId === id) {
      setSelectedPieceId(null);
    } else {
      setSelectedPieceId(id);
    }
    setErrorSlot(null);
  };

  // Click-to-place on grid slot
  const handleSlotClick = (slotIndex: number) => {
    if (selectedPieceId === null) return;
    placePieceAtSlot(selectedPieceId, slotIndex);
  };

  // Calculate Stars Rating
  const calculateStars = () => {
    if (mistakes <= 1 && gameTime <= 60) return 3;
    if (mistakes <= 4 && gameTime <= 100) return 2;
    return 1;
  };

  const starsEarned = calculateStars();
  const sceneElements = currentScene.generateScene(SCENE_WIDTH, SCENE_HEIGHT);

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

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60">
            <span className="text-xs font-bold text-foreground truncate max-w-[120px] sm:max-w-none">
              {currentScene.name}
            </span>
          </div>

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
            title={showGhostHint ? "Hide visual guide" : "Show visual guide watermark"}
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

          {/* Results Dialog */}
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

          {/* Shuffle / Next Puzzle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => generatePuzzle()}
            className="h-8 w-8 rounded-xl"
            title="Randomize new puzzle scene"
          >
            <Shuffle className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Board Arena */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 overflow-hidden relative bg-slate-950">
        
        {/* Interaction Guide Notice */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card/60 border border-border/50 text-[11px] font-semibold text-muted-foreground mb-3">
          <MousePointer className="h-3 w-3 text-primary animate-pulse" />
          <span><b>Drag & Drop</b> pieces to slots, or <b>Click</b> a piece and click a slot to place!</span>
        </div>

        {/* Puzzle Board Grid Container */}
        <div
          className="relative rounded-2xl p-2.5 bg-card/90 border-2 border-border/80 shadow-2xl backdrop-blur-md overflow-hidden select-none"
          style={{ width: `${SCENE_WIDTH + 20}px`, height: `${SCENE_HEIGHT + 20}px` }}
        >
          {/* Subtle Ghost Watermark Hint (Optional Background Guide) */}
          {showGhostHint && (
            <div className="absolute inset-2.5 pointer-events-none opacity-20 rounded-xl overflow-hidden transition-opacity">
              <svg width={SCENE_WIDTH} height={SCENE_HEIGHT} viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}>
                {sceneElements.map((el, i) => {
                  const Comp = el.type as any;
                  return <Comp key={i} {...el.props} />;
                })}
              </svg>
            </div>
          )}

          {/* 4x5 Grid Slots */}
          <div
            className="grid grid-cols-4 gap-1 w-full h-full relative"
            style={{ width: `${SCENE_WIDTH}px`, height: `${SCENE_HEIGHT}px` }}
          >
            {pieces.map((piece, index) => {
              const row = Math.floor(piece.id / COLS);
              const col = piece.id % COLS;
              const viewBoxX = col * PIECE_SIZE;
              const viewBoxY = row * PIECE_SIZE;

              const isPlaced = piece.isPlaced;
              const isError = errorSlot === index;
              const isHovered = hoveredSlot === index;
              const isSelectedTarget = selectedPieceId === index;

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
                    relative rounded-xl overflow-hidden transition-all duration-200
                    ${isPlaced ? 'border border-transparent shadow-sm' : 'border-2 border-dashed border-border/70 hover:border-primary/60 cursor-pointer'}
                    ${isHovered && !isPlaced ? 'border-primary ring-2 ring-primary/40 bg-primary/10 scale-105 z-10' : ''}
                    ${isError ? 'border-rose-500 bg-rose-500/20 ring-2 ring-rose-500 animate-bounce' : ''}
                  `}
                  style={{ width: `${PIECE_SIZE}px`, height: `${PIECE_SIZE}px` }}
                >
                  {isPlaced ? (
                    /* Placed Piece Content */
                    <div className="w-full h-full overflow-hidden rounded-lg animate-in zoom-in-95 duration-200">
                      <svg width={PIECE_SIZE} height={PIECE_SIZE} viewBox={`${viewBoxX} ${viewBoxY} ${PIECE_SIZE} ${PIECE_SIZE}`}>
                        {sceneElements.map((el, i) => {
                          const Comp = el.type as any;
                          return <Comp key={i} {...el.props} />;
                        })}
                      </svg>
                    </div>
                  ) : (
                    /* Empty Slot Guide */
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-muted-foreground/40 font-mono font-bold">
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

      {/* Hand: Available Puzzle Pieces Tray (Bottom Dock) */}
      <div className="h-[125px] shrink-0 bg-card/85 border-t border-border/80 flex flex-col items-center justify-center px-4 py-2 relative z-20">
        <div className="flex items-center justify-between w-full max-w-md mb-1.5 px-2 text-xs">
          <span className="font-bold text-muted-foreground">Pick or Drag a Piece:</span>
          <span className="text-[11px] text-primary font-bold">
            {TOTAL_PIECES - placedCount} pieces remaining
          </span>
        </div>

        <div className="flex items-center justify-center gap-3.5 sm:gap-5">
          {hand.map((id) => {
            const piece = pieces.find(p => p.id === id);
            if (!piece) return null;

            const row = Math.floor(piece.id / COLS);
            const col = piece.id % COLS;
            const viewBoxX = col * PIECE_SIZE;
            const viewBoxY = row * PIECE_SIZE;
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
                  relative rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none
                  border-2 transition-all duration-200 shadow-md hover:scale-110 hover:-translate-y-1
                  ${isSelected ? 'border-primary ring-4 ring-primary/30 scale-110 -translate-y-1 z-10 shadow-xl' : 'border-card/90'}
                  ${isDragging ? 'opacity-40' : 'opacity-100'}
                `}
                style={{ width: `${PIECE_SIZE}px`, height: `${PIECE_SIZE}px` }}
                title="Click or Drag onto board"
              >
                <svg width={PIECE_SIZE} height={PIECE_SIZE} viewBox={`${viewBoxX} ${viewBoxY} ${PIECE_SIZE} ${PIECE_SIZE}`}>
                  {sceneElements.map((el, i) => {
                    const Comp = el.type as any;
                    return <Comp key={i} {...el.props} />;
                  })}
                </svg>

                {isSelected && (
                  <div className="absolute top-1 right-1 h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-primary-foreground stroke-[3]" />
                  </div>
                )}
              </div>
            );
          })}

          {hand.length === 0 && !isCompleted && placedCount < TOTAL_PIECES && (
            <div className="text-xs text-muted-foreground italic py-3">
              Drawing final pieces...
            </div>
          )}
        </div>
      </div>

      {/* Countdown Preview Overlay */}
      {showPreview && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-7 space-y-4">
              <div className="space-y-1">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">
                  Memorize the Scene
                </span>
                <h2 className="text-2xl font-black">{currentScene.name}</h2>
                <p className="text-xs text-muted-foreground">{currentScene.description}</p>
              </div>

              {/* Full Art Preview */}
              <div className="mx-auto rounded-2xl p-2 bg-card border border-border/70 shadow-lg w-fit">
                <div
                  className="rounded-xl overflow-hidden"
                  style={{ width: `${SCENE_WIDTH * 0.85}px`, height: `${SCENE_HEIGHT * 0.85}px` }}
                >
                  <svg width="100%" height="100%" viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`}>
                    {sceneElements.map((el, i) => {
                      const Comp = el.type as any;
                      return <Comp key={i} {...el.props} />;
                    })}
                  </svg>
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-4xl font-black text-primary font-mono animate-bounce">
                  {countdown}
                </div>
                <p className="text-xs text-muted-foreground font-medium">seconds remaining until start</p>
              </div>

              <Button
                onClick={() => {
                  setShowPreview(false);
                  setIsGameStarted(true);
                  const allIds = pieces.map(p => p.id);
                  const shuffled = [...allIds].sort(() => 0.5 - Math.random());
                  setHand(shuffled.slice(0, 4));
                }}
                className="w-full rounded-2xl font-bold bg-primary text-primary-foreground"
              >
                Skip Preview & Play Now
              </Button>
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
                <h2 className="text-3xl font-black tracking-tight">Puzzle Solved!</h2>
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
                <Button onClick={() => generatePuzzle()} className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10">
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Play Next Puzzle
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
