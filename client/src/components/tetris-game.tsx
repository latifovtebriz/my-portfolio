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
  RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
  RotateCw, User, List, Volume2, VolumeX, Pause, Play, Sparkles,
  Flame, Zap, Award, Gamepad2, CheckCircle2, ChevronDown
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

  playMove() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(360, now + 0.03);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {}
  }

  playRotate() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  playDrop() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  playHardDrop() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.14);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  playLineClear(lines: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (lines >= 4) {
        // TETRIS fanfare!
        const notes = [523.25, 659.25, 783.99, 1046.5];
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
      } else {
        // Normal line clear
        const notes = [440, 554.37, 659.25].slice(0, lines + 1);
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.18, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.2);
        });
      }
    } catch {}
  }

  playGameOver() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.45);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// CONSTANTS & TETROMINOS
// ============================================================================

interface Position {
  x: number;
  y: number;
}

interface PieceConfig {
  name: string;
  shape: number[][];
  color: string;
  glow: string;
}

const TETROMINOS: Record<string, PieceConfig> = {
  I: {
    name: "I-Beam",
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#06b6d4", // Cyan
    glow: "rgba(6, 182, 212, 0.55)"
  },
  O: {
    name: "O-Block",
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#eab308", // Yellow
    glow: "rgba(234, 179, 8, 0.55)"
  },
  T: {
    name: "T-Spike",
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a855f7", // Purple
    glow: "rgba(168, 85, 247, 0.55)"
  },
  S: {
    name: "S-Snake",
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#22c55e", // Green
    glow: "rgba(34, 197, 94, 0.55)"
  },
  Z: {
    name: "Z-Zigzag",
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#ef4444", // Red
    glow: "rgba(239, 68, 68, 0.55)"
  },
  J: {
    name: "J-Hook",
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#3b82f6", // Blue
    glow: "rgba(59, 130, 246, 0.55)"
  },
  L: {
    name: "L-Corner",
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f97316", // Orange
    glow: "rgba(249, 115, 22, 0.55)"
  },
};

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const INITIAL_DROP_TIME = 800; // ms

interface Tetromino {
  type: string;
  shape: number[][];
  color: string;
  glow: string;
  position: Position;
}

interface TetrisGameProps {
  onBack: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TetrisGame({ onBack }: TetrisGameProps) {
  const [board, setBoard] = useState<string[][]>(
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(""))
  );
  const [currentPiece, setCurrentPiece] = useState<Tetromino | null>(null);
  const [nextPiece, setNextPiece] = useState<string>("T");
  const [holdPiece, setHoldPiece] = useState<string | null>(null);
  const [canHold, setCanHold] = useState<boolean>(true);

  const [score, setScore] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [combos, setCombos] = useState<number>(0);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [dropTime, setDropTime] = useState<number>(INITIAL_DROP_TIME);
  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const dropTimeRef = useRef<number>(INITIAL_DROP_TIME);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Top Scores with graceful fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/tetris/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('tetris_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/tetris/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Tetris God 👑", score: 14800, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 9400, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Matrix Stacker 🧩", score: 6200, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Line 🧱", score: 4500, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Retro Pixel 🕹️", score: 2800, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number }) => {
      try {
        const stored = localStorage.getItem('tetris_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('tetris_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'tetris' }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/tetris/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Random generator
  const getRandomType = useCallback((): string => {
    const keys = Object.keys(TETROMINOS);
    return keys[Math.floor(Math.random() * keys.length)];
  }, []);

  // Create piece object
  const createTetromino = useCallback((type: string): Tetromino => {
    const config = TETROMINOS[type];
    return {
      type,
      shape: config.shape,
      color: config.color,
      glow: config.glow,
      position: {
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(config.shape[0].length / 2),
        y: 0
      }
    };
  }, []);

  // Check collision & valid position
  const isValidPosition = useCallback((piece: Tetromino, curBoard: string[][], offset = { x: 0, y: 0 }): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x] !== 0) {
          const newX = piece.position.x + x + offset.x;
          const newY = piece.position.y + y + offset.y;

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false;
          }

          if (newY >= 0 && curBoard[newY][newX] !== "") {
            return false;
          }
        }
      }
    }
    return true;
  }, []);

  // Rotate piece matrix clockwise
  const rotateMatrix = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, index) =>
      matrix.map(row => row[index]).reverse()
    );
  };

  // Lock Piece & Check line clears
  const lockPiece = useCallback(() => {
    if (!currentPiece) return;

    sound.playDrop();

    const newBoard = board.map(row => [...row]);

    // Stamp piece onto board
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const bY = currentPiece.position.y + y;
          const bX = currentPiece.position.x + x;
          if (bY >= 0 && bY < BOARD_HEIGHT && bX >= 0 && bX < BOARD_WIDTH) {
            newBoard[bY][bX] = currentPiece.color;
          }
        }
      }
    }

    // Detect full rows
    const fullRows: number[] = [];
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell !== "")) {
        fullRows.push(y);
      }
    }

    if (fullRows.length > 0) {
      sound.playLineClear(fullRows.length);

      // Scoring: 100 for 1, 300 for 2, 500 for 3, 1200 for 4 (TETRIS!)
      const basePoints = [0, 100, 300, 500, 1200][fullRows.length] || 100;
      const comboMult = combos > 0 ? 1 + (combos * 0.25) : 1;
      const earned = Math.round(basePoints * level * comboMult);

      setScore(s => s + earned);
      setCombos(c => c + 1);

      // Clear rows
      const remainingRows = newBoard.filter((_, idx) => !fullRows.includes(idx));
      const freshEmptyRows = Array(fullRows.length).fill(null).map(() => Array(BOARD_WIDTH).fill(""));
      newBoard.splice(0, newBoard.length, ...freshEmptyRows, ...remainingRows);

      setLinesCleared(prev => {
        const nextLines = prev + fullRows.length;
        const nextLevel = Math.floor(nextLines / 10) + 1;
        if (nextLevel > level) {
          setLevel(nextLevel);
          const nextSpeed = Math.max(90, INITIAL_DROP_TIME - (nextLevel - 1) * 75);
          setDropTime(nextSpeed);
          dropTimeRef.current = nextSpeed;
        }
        return nextLines;
      });
    } else {
      setCombos(0);
    }

    setBoard(newBoard);
    setCanHold(true);

    // Spawn next piece
    const nextType = nextPiece || getRandomType();
    const nextSpawn = createTetromino(nextType);

    // Check Game Over
    if (!isValidPosition(nextSpawn, newBoard)) {
      sound.playGameOver();
      setIsGameOver(true);
      setIsPlaying(false);
      return;
    }

    setCurrentPiece(nextSpawn);
    setNextPiece(getRandomType());
  }, [currentPiece, board, level, combos, nextPiece, getRandomType, createTetromino, isValidPosition]);

  // Movement & Rotation with Wall-Kick support
  const movePiece = useCallback((action: "left" | "right" | "down" | "rotate" | "hardDrop") => {
    if (!currentPiece || !isPlaying || isGameOver || isPaused) return;

    if (action === "left") {
      if (isValidPosition(currentPiece, board, { x: -1, y: 0 })) {
        sound.playMove();
        setCurrentPiece(p => p ? { ...p, position: { ...p.position, x: p.position.x - 1 } } : null);
      }
    } else if (action === "right") {
      if (isValidPosition(currentPiece, board, { x: 1, y: 0 })) {
        sound.playMove();
        setCurrentPiece(p => p ? { ...p, position: { ...p.position, x: p.position.x + 1 } } : null);
      }
    } else if (action === "down") {
      if (isValidPosition(currentPiece, board, { x: 0, y: 1 })) {
        setCurrentPiece(p => p ? { ...p, position: { ...p.position, y: p.position.y + 1 } } : null);
      } else {
        lockPiece();
      }
    } else if (action === "rotate") {
      const rotated = rotateMatrix(currentPiece.shape);
      const testPiece = { ...currentPiece, shape: rotated };

      // Wall-kick offsets: [0, -1, 1, -2, 2]
      const kickOffsets = [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -1 }];
      for (const off of kickOffsets) {
        if (isValidPosition(testPiece, board, off)) {
          sound.playRotate();
          setCurrentPiece({
            ...testPiece,
            position: {
              x: testPiece.position.x + off.x,
              y: testPiece.position.y + off.y
            }
          });
          return;
        }
      }
    } else if (action === "hardDrop") {
      sound.playHardDrop();
      let dropDistance = 0;
      while (isValidPosition(currentPiece, board, { x: 0, y: dropDistance + 1 })) {
        dropDistance++;
      }
      setScore(s => s + dropDistance * 2);

      const droppedPiece = {
        ...currentPiece,
        position: {
          x: currentPiece.position.x,
          y: currentPiece.position.y + dropDistance
        }
      };

      // Lock dropped piece directly
      const newBoard = board.map(row => [...row]);
      for (let y = 0; y < droppedPiece.shape.length; y++) {
        for (let x = 0; x < droppedPiece.shape[y].length; x++) {
          if (droppedPiece.shape[y][x] !== 0) {
            const bY = droppedPiece.position.y + y;
            const bX = droppedPiece.position.x + x;
            if (bY >= 0 && bY < BOARD_HEIGHT && bX >= 0 && bX < BOARD_WIDTH) {
              newBoard[bY][bX] = droppedPiece.color;
            }
          }
        }
      }

      // Check line clears
      const fullRows: number[] = [];
      for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
        if (newBoard[y].every(cell => cell !== "")) {
          fullRows.push(y);
        }
      }

      if (fullRows.length > 0) {
        sound.playLineClear(fullRows.length);
        const basePoints = [0, 100, 300, 500, 1200][fullRows.length] || 100;
        const comboMult = combos > 0 ? 1 + (combos * 0.25) : 1;
        const earned = Math.round(basePoints * level * comboMult);
        setScore(s => s + earned);
        setCombos(c => c + 1);

        const remainingRows = newBoard.filter((_, idx) => !fullRows.includes(idx));
        const freshEmptyRows = Array(fullRows.length).fill(null).map(() => Array(BOARD_WIDTH).fill(""));
        newBoard.splice(0, newBoard.length, ...freshEmptyRows, ...remainingRows);

        setLinesCleared(prev => {
          const nextLines = prev + fullRows.length;
          const nextLevel = Math.floor(nextLines / 10) + 1;
          if (nextLevel > level) {
            setLevel(nextLevel);
            const nextSpeed = Math.max(90, INITIAL_DROP_TIME - (nextLevel - 1) * 75);
            setDropTime(nextSpeed);
            dropTimeRef.current = nextSpeed;
          }
          return nextLines;
        });
      } else {
        setCombos(0);
      }

      setBoard(newBoard);
      setCanHold(true);

      const nextType = nextPiece || getRandomType();
      const nextSpawn = createTetromino(nextType);

      if (!isValidPosition(nextSpawn, newBoard)) {
        sound.playGameOver();
        setIsGameOver(true);
        setIsPlaying(false);
        return;
      }

      setCurrentPiece(nextSpawn);
      setNextPiece(getRandomType());
    }
  }, [currentPiece, isPlaying, isGameOver, isPaused, board, combos, level, nextPiece, isValidPosition, lockPiece, getRandomType, createTetromino]);

  // Hold Piece Feature
  const handleHold = useCallback(() => {
    if (!currentPiece || !canHold || !isPlaying || isGameOver || isPaused) return;

    sound.playMove();
    setCanHold(false);

    if (holdPiece) {
      const swappedPiece = createTetromino(holdPiece);
      setHoldPiece(currentPiece.type);
      setCurrentPiece(swappedPiece);
    } else {
      setHoldPiece(currentPiece.type);
      const nextType = nextPiece || getRandomType();
      setCurrentPiece(createTetromino(nextType));
      setNextPiece(getRandomType());
    }
  }, [currentPiece, canHold, isPlaying, isGameOver, isPaused, holdPiece, nextPiece, createTetromino, getRandomType]);

  // Ghost Piece projection (Where the block will land)
  const getGhostPieceY = useCallback((): number => {
    if (!currentPiece) return 0;
    let dy = 0;
    while (isValidPosition(currentPiece, board, { x: 0, y: dy + 1 })) {
      dy++;
    }
    return currentPiece.position.y + dy;
  }, [currentPiece, board, isValidPosition]);

  // Keyboard Event Listener (With strict input tag safety)
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

      const code = e.code;
      if (["ArrowLeft", "KeyA"].includes(code)) {
        e.preventDefault();
        movePiece("left");
      } else if (["ArrowRight", "KeyD"].includes(code)) {
        e.preventDefault();
        movePiece("right");
      } else if (["ArrowDown", "KeyS"].includes(code)) {
        e.preventDefault();
        movePiece("down");
      } else if (["ArrowUp", "KeyW"].includes(code)) {
        e.preventDefault();
        movePiece("rotate");
      } else if (code === "Space") {
        e.preventDefault();
        movePiece("hardDrop");
      } else if (code === "KeyC") {
        e.preventDefault();
        handleHold();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isGameOver, isPaused, movePiece, handleHold]);

  // Main Drop Loop
  useEffect(() => {
    if (isPlaying && !isGameOver && !isPaused) {
      gameIntervalRef.current = setInterval(() => {
        movePiece("down");
      }, dropTimeRef.current);
    } else {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    }

    return () => {
      if (gameIntervalRef.current) clearInterval(gameIntervalRef.current);
    };
  }, [isPlaying, isGameOver, isPaused, dropTime, movePiece]);

  // Start / Restart match
  const startGame = () => {
    const emptyBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(""));
    const firstType = getRandomType();
    const secondType = getRandomType();

    setBoard(emptyBoard);
    setCurrentPiece(createTetromino(firstType));
    setNextPiece(secondType);
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLevel(1);
    setLinesCleared(0);
    setCombos(0);
    setDropTime(INITIAL_DROP_TIME);
    dropTimeRef.current = INITIAL_DROP_TIME;
    setIsGameOver(false);
    setIsPlaying(true);
    setIsPaused(false);
    setScoreSubmitted(false);
    setPlayerName("");

    sound.playRotate();
  };

  // Render combined grid for display
  const ghostY = getGhostPieceY();
  const displayGrid = board.map(row => [...row]);

  // Add ghost piece outlines
  if (currentPiece && isPlaying && !isGameOver) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const gY = ghostY + y;
          const gX = currentPiece.position.x + x;
          if (gY >= 0 && gY < BOARD_HEIGHT && gX >= 0 && gX < BOARD_WIDTH && displayGrid[gY][gX] === "") {
            displayGrid[gY][gX] = "ghost:" + currentPiece.color;
          }
        }
      }
    }
  }

  // Add current active piece
  if (currentPiece && isPlaying && !isGameOver) {
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const bY = currentPiece.position.y + y;
          const bX = currentPiece.position.x + x;
          if (bY >= 0 && bY < BOARD_HEIGHT && bX >= 0 && bX < BOARD_WIDTH) {
            displayGrid[bY][bX] = currentPiece.color;
          }
        }
      }
    }
  }

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
            <span>LVL {level}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold font-mono">
            <span>LINES: {linesCleared}</span>
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
                  Tetris Arena Hall of Fame
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
            title="Start fresh game"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Tetris Arena */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-slate-950 overflow-hidden relative">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Left Panel: HOLD Slot */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">HOLD</span>
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center p-2 shadow-inner">
              {holdPiece && (
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${TETROMINOS[holdPiece].shape[0].length}, minmax(0, 1fr))`
                  }}
                >
                  {TETROMINOS[holdPiece].shape.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-3.5 h-3.5 rounded-sm"
                        style={{
                          backgroundColor: cell ? TETROMINOS[holdPiece].color : "transparent"
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">Key: <kbd className="font-mono bg-muted px-1 rounded">C</kbd></span>
          </div>

          {/* Center: Main Game Grid */}
          <div
            className="grid bg-slate-900/90 border-2 border-slate-700/80 rounded-2xl p-1 shadow-2xl relative"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
              width: "min(72vw, 42vh, 320px)",
              aspectRatio: "10 / 20"
            }}
          >
            {displayGrid.map((row, r) =>
              row.map((cell, c) => {
                const isGhost = cell.startsWith("ghost:");
                const ghostColor = isGhost ? cell.replace("ghost:", "") : null;

                return (
                  <div
                    key={`${r}-${c}`}
                    className="relative rounded-sm m-[1px] transition-colors"
                    style={{
                      backgroundColor: isGhost
                        ? "transparent"
                        : cell
                        ? cell
                        : "#0a0f1d",
                      border: isGhost
                        ? `1.5px dashed ${ghostColor}`
                        : cell
                        ? `1px solid rgba(255, 255, 255, 0.25)`
                        : "1px solid rgba(255, 255, 255, 0.03)",
                      boxShadow: cell && !isGhost ? `inset 0 0 4px rgba(255, 255, 255, 0.3)` : undefined
                    }}
                  />
                );
              })
            )}
          </div>

          {/* Right Panel: NEXT Piece Preview */}
          <div className="hidden sm:flex flex-col items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">NEXT</span>
            <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex items-center justify-center p-2 shadow-inner">
              {nextPiece && (
                <div
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${TETROMINOS[nextPiece].shape[0].length}, minmax(0, 1fr))`
                  }}
                >
                  {TETROMINOS[nextPiece].shape.map((row, r) =>
                    row.map((cell, c) => (
                      <div
                        key={`${r}-${c}`}
                        className="w-3.5 h-3.5 rounded-sm"
                        style={{
                          backgroundColor: cell ? TETROMINOS[nextPiece].color : "transparent"
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground font-semibold">{TETROMINOS[nextPiece]?.name}</span>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="shrink-0 bg-card/85 border-t border-border/80 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 z-20">
        {/* Mobile On-Screen D-Pad & Action Buttons */}
        <div className="flex sm:hidden items-center justify-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleHold}
            disabled={!isPlaying || isGameOver || isPaused || !canHold}
            className="h-10 px-3 rounded-xl text-xs font-bold"
          >
            HOLD
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => movePiece("left")}
            disabled={!isPlaying || isGameOver || isPaused}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => movePiece("rotate")}
            disabled={!isPlaying || isGameOver || isPaused}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => movePiece("down")}
            disabled={!isPlaying || isGameOver || isPaused}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowDown className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => movePiece("right")}
            disabled={!isPlaying || isGameOver || isPaused}
            className="h-10 w-10 p-0 rounded-xl"
          >
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => movePiece("hardDrop")}
            disabled={!isPlaying || isGameOver || isPaused}
            className="h-10 px-3 rounded-xl text-xs font-bold bg-primary text-primary-foreground"
          >
            DROP
          </Button>
        </div>

        {/* Desktop Helper Keyboard Guide */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mx-auto">
          <span>Move: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">A / D</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">← / →</kbd></span>
          <span>Rotate: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">W</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">↑</kbd></span>
          <span>Soft Drop: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">S</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">↓</kbd></span>
          <span>Hard Drop: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">Space</kbd></span>
          <span>Hold: <kbd className="px-1.5 py-0.5 rounded bg-muted font-bold text-foreground">C</kbd></span>
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
                Cyber Edition • Pro Stacker 2026
              </div>

              <div className="space-y-1.5">
                <h1 className="text-4xl font-black tracking-tight text-gradient">
                  🎮 TETRIS ARENA PRO
                </h1>
                <p className="text-xs text-muted-foreground">
                  Stack tetrominos, project ghost landings, trigger hard drops, and clear 4-line Tetris combos!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-xs text-left">
                <div><span className="font-bold text-primary">⚡ Ghost Piece:</span> Drop trajectory</div>
                <div><span className="font-bold text-amber-500">🧱 Hold Slot:</span> Press C to swap</div>
                <div><span className="font-bold text-emerald-400">💥 Hard Drop:</span> Space for instant lock</div>
                <div><span className="font-bold text-purple-400">🔥 Combos:</span> Scaling score bonus</div>
              </div>

              <Button
                onClick={startGame}
                size="lg"
                className="w-full text-base font-bold rounded-2xl bg-primary text-primary-foreground shadow-lg h-12"
              >
                START STACKING
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
                <h2 className="text-3xl font-black tracking-tight text-gradient">Matrix Saturated!</h2>
                <p className="text-xs text-muted-foreground">The grid has reached critical block capacity.</p>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Final Score</span>
                  <span className="text-xl font-black text-primary font-mono">{score}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Lines Cleared</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{linesCleared}</span>
                </div>
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase font-bold block">Level Reached</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{level}</span>
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
