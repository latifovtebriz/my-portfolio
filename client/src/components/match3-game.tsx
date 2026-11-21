import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Hammer, Shuffle, Lightbulb, Star,
  Award, Zap, Flame, CheckCircle2
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

  playSwap() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playInvalid() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  // Ascending musical pitch based on cascade chain length
  playMatch(combo: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];
      const freq = scale[Math.min(combo, scale.length - 1)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  playSpecial() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.05);
        osc.stop(this.ctx.currentTime + idx * 0.05 + 0.15);
      });
    } catch {}
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  playLevelClear() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.09);
        osc.stop(this.ctx.currentTime + idx * 0.09 + 0.3);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

const GRID_SIZE = 8;

export type GemType = "ruby" | "sapphire" | "emerald" | "topaz" | "amethyst" | "amber";
export type SpecialType = "none" | "striped_h" | "striped_v" | "bomb" | "rainbow";

export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  matched?: boolean;
}

interface LevelConfig {
  level: number;
  moves: number;
  targetScore: number;
  description: string;
}

const LEVELS: LevelConfig[] = [
  { level: 1, moves: 25, targetScore: 2000, description: "Warmup: Score 2,000 points in 25 moves" },
  { level: 2, moves: 22, targetScore: 3500, description: "Cyber Surge: Score 3,500 points in 22 moves" },
  { level: 3, moves: 20, targetScore: 5000, description: "Master Cascade: Score 5,000 points in 20 moves" },
  { level: 4, moves: 18, targetScore: 7000, description: "Quantum Matrix: Score 7,000 points in 18 moves" },
];

const GEM_COLORS: Record<GemType, { bg: string; border: string; glow: string; symbol: string }> = {
  ruby: { bg: "from-rose-500 to-red-700", border: "border-rose-400", glow: "rgba(244,63,94,0.6)", symbol: "🔴" },
  sapphire: { bg: "from-sky-500 to-blue-700", border: "border-sky-400", glow: "rgba(14,165,233,0.6)", symbol: "💎" },
  emerald: { bg: "from-emerald-400 to-teal-700", border: "border-emerald-300", glow: "rgba(16,185,129,0.6)", symbol: "🟢" },
  topaz: { bg: "from-amber-400 to-yellow-600", border: "border-amber-300", glow: "rgba(245,158,11,0.6)", symbol: "⭐" },
  amethyst: { bg: "from-purple-500 to-violet-800", border: "border-purple-300", glow: "rgba(168,85,247,0.6)", symbol: "🔮" },
  amber: { bg: "from-orange-400 to-amber-600", border: "border-orange-300", glow: "rgba(249,115,22,0.6)", symbol: "🔶" },
};

const ALL_GEM_TYPES: GemType[] = ["ruby", "sapphire", "emerald", "topaz", "amethyst", "amber"];

interface LeaderboardRecord {
  id: string;
  name: string;
  score: number;
  level: number;
  stars: number;
  date: string;
}

export default function Match3Game() {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [board, setBoard] = useState<Gem[][]>([]);
  const [score, setScore] = useState<number>(0);
  const [movesLeft, setMovesLeft] = useState<number>(25);
  const [comboChain, setComboChain] = useState<number>(0);
  const [selectedPos, setSelectedPos] = useState<{ r: number; c: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [hammerActive, setHammerActive] = useState<boolean>(false);
  const [hintCells, setHintCells] = useState<{ r: number; c: number }[]>([]);
  const [highScore, setHighScore] = useState<number>(0);

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Load High Score and Records
  useEffect(() => {
    const savedBest = localStorage.getItem("match3_cyber_best_score");
    if (savedBest) setHighScore(parseInt(savedBest, 10));

    const savedRecords = localStorage.getItem("match3_cyber_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {}
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "GemCrusher", score: 8900, level: 3, stars: 3, date: "2026-11-20" },
        { id: "2", name: "CascadeQueen", score: 6200, level: 2, stars: 3, date: "2026-11-19" },
        { id: "3", name: "CandyNovice", score: 3400, level: 1, stars: 2, date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("match3_cyber_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Generate a random Gem
  const createRandomGem = (): Gem => {
    const type = ALL_GEM_TYPES[Math.floor(Math.random() * ALL_GEM_TYPES.length)];
    return {
      id: Math.random().toString(36).substring(2, 9),
      type,
      special: "none",
    };
  };

  // Generate Initial Board with NO pre-existing matches
  const initBoard = useCallback(() => {
    const cfg = LEVELS[currentLevel - 1] || LEVELS[0];
    let newGrid: Gem[][] = [];

    let hasMatches = true;
    while (hasMatches) {
      newGrid = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => createRandomGem())
      );

      // Check if grid has initial matches
      let matchFound = false;
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          const type = newGrid[r][c].type;
          // Horizontal check
          if (c <= GRID_SIZE - 3 && newGrid[r][c + 1].type === type && newGrid[r][c + 2].type === type) {
            matchFound = true;
          }
          // Vertical check
          if (r <= GRID_SIZE - 3 && newGrid[r + 1][c].type === type && newGrid[r + 2][c].type === type) {
            matchFound = true;
          }
        }
      }
      hasMatches = matchFound;
    }

    setBoard(newGrid);
    setScore(0);
    setMovesLeft(cfg.moves);
    setComboChain(0);
    setSelectedPos(null);
    setIsProcessing(false);
    setGameStatus("playing");
    setHammerActive(false);
    setHintCells([]);
  }, [currentLevel]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Find all match runs in a board
  const findMatches = (grid: Gem[][]): { matches: Set<string>; specialCreates: Map<string, SpecialType> } => {
    const matchedCoords = new Set<string>();
    const specialCreates = new Map<string, SpecialType>();

    // Horizontal scan
    for (let r = 0; r < GRID_SIZE; r++) {
      let matchLen = 1;
      for (let c = 0; c < GRID_SIZE; c++) {
        const isSame = c < GRID_SIZE - 1 && grid[r][c].type === grid[r][c + 1].type;
        if (isSame) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let k = 0; k < matchLen; k++) {
              matchedCoords.add(`${r},${c - k}`);
            }
            // Special piece creation
            if (matchLen === 4) {
              specialCreates.set(`${r},${c - Math.floor(matchLen / 2)}`, "striped_h");
            } else if (matchLen >= 5) {
              specialCreates.set(`${r},${c - Math.floor(matchLen / 2)}`, "rainbow");
            }
          }
          matchLen = 1;
        }
      }
    }

    // Vertical scan
    for (let c = 0; c < GRID_SIZE; c++) {
      let matchLen = 1;
      for (let r = 0; r < GRID_SIZE; r++) {
        const isSame = r < GRID_SIZE - 1 && grid[r][c].type === grid[r + 1][c].type;
        if (isSame) {
          matchLen++;
        } else {
          if (matchLen >= 3) {
            for (let k = 0; k < matchLen; k++) {
              matchedCoords.add(`${r - k},${c}`);
            }
            if (matchLen === 4) {
              specialCreates.set(`${r - Math.floor(matchLen / 2)},${c}`, "striped_v");
            } else if (matchLen >= 5) {
              specialCreates.set(`${r - Math.floor(matchLen / 2)},${c}`, "rainbow");
            }
          }
          matchLen = 1;
        }
      }
    }

    return { matches: matchedCoords, specialCreates };
  };

  // Process Cascades (Clear -> Fall -> Refill Loop)
  const processCascades = useCallback(
    async (initialGrid: Gem[][], currentCombo: number) => {
      let grid = initialGrid.map(row => row.map(g => ({ ...g })));
      let combo = currentCombo;
      let totalEarnedScore = 0;

      while (true) {
        const { matches, specialCreates } = findMatches(grid);
        if (matches.size === 0) break;

        combo++;
        sounds.playMatch(combo);

        // Calculate score with combo multiplier
        const basePoints = matches.size * 60;
        const multiplier = Math.min(5, 1 + (combo - 1) * 0.5);
        totalEarnedScore += Math.floor(basePoints * multiplier);

        // 1. Mark matched cells and trigger special effects
        const toClear = new Set<string>(matches);

        // Check if any matched cell is a special piece (Bomb / Striped)
        matches.forEach(coord => {
          const [r, c] = coord.split(",").map(Number);
          const sp = grid[r][c].special;
          if (sp === "bomb") {
            sounds.playExplosion();
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
                  toClear.add(`${nr},${nc}`);
                }
              }
            }
          } else if (sp === "striped_h") {
            sounds.playSpecial();
            for (let col = 0; col < GRID_SIZE; col++) toClear.add(`${r},${col}`);
          } else if (sp === "striped_v") {
            sounds.playSpecial();
            for (let row = 0; row < GRID_SIZE; row++) toClear.add(`${row},${c}`);
          }
        });

        // 2. Remove cleared cells and apply gravity
        const newGrid: (Gem | null)[][] = grid.map((row, r) =>
          row.map((gem, c) => (toClear.has(`${r},${c}`) ? null : gem))
        );

        // Place new special pieces created from this match
        specialCreates.forEach((specType, coord) => {
          const [sr, sc] = coord.split(",").map(Number);
          newGrid[sr][sc] = {
            id: Math.random().toString(36).substring(2, 9),
            type: grid[sr][sc]?.type || "ruby",
            special: specType,
          };
        });

        // Apply column gravity
        for (let c = 0; c < GRID_SIZE; c++) {
          let emptyRow = GRID_SIZE - 1;
          for (let r = GRID_SIZE - 1; r >= 0; r--) {
            if (newGrid[r][c] !== null) {
              const gem = newGrid[r][c];
              newGrid[r][c] = null;
              newGrid[emptyRow][c] = gem;
              emptyRow--;
            }
          }
          // Refill top empty cells
          for (let r = emptyRow; r >= 0; r--) {
            newGrid[r][c] = createRandomGem();
          }
        }

        grid = newGrid as Gem[][];
        setBoard(grid.map(row => row.map(g => ({ ...g }))));
        setComboChain(combo);

        // Small delay for visual cascade pacing
        await new Promise(res => setTimeout(res, 220));
      }

      // Update final score
      setScore(s => {
        const finalScore = s + totalEarnedScore;
        const cfg = LEVELS[currentLevel - 1] || LEVELS[0];
        if (finalScore >= cfg.targetScore) {
          sounds.playLevelClear();
          setGameStatus("won");
        }
        return finalScore;
      });

      setIsProcessing(false);
      setComboChain(0);
    },
    [currentLevel]
  );

  // Check if any valid swap exists on board (Deadlock detection)
  const findPossibleMove = useCallback((grid: Gem[][]): { r1: number; c1: number; r2: number; c2: number } | null => {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Try swap right
        if (c < GRID_SIZE - 1) {
          const copy = grid.map(row => row.map(g => ({ ...g })));
          [copy[r][c], copy[r][c + 1]] = [copy[r][c + 1], copy[r][c]];
          if (findMatches(copy).matches.size > 0) return { r1: r, c1: c, r2: r, c2: c + 1 };
        }
        // Try swap down
        if (r < GRID_SIZE - 1) {
          const copy = grid.map(row => row.map(g => ({ ...g })));
          [copy[r][c], copy[r + 1][c]] = [copy[r + 1][c], copy[r][c]];
          if (findMatches(copy).matches.size > 0) return { r1: r, c1: c, r2: r + 1, c2: c };
        }
      }
    }
    return null;
  }, []);

  // Show Hint
  const showHint = () => {
    if (isProcessing || gameStatus !== "playing") return;
    const move = findPossibleMove(board);
    if (move) {
      setHintCells([
        { r: move.r1, c: move.c1 },
        { r: move.r2, c: move.c2 },
      ]);
      sounds.playSpecial();
      setTimeout(() => setHintCells([]), 2000);
    } else {
      // No moves: Reshuffle!
      shuffleBoard();
    }
  };

  // Shuffle Board Power-up
  const shuffleBoard = () => {
    sounds.playSwap();
    let newGrid: Gem[][] = [];
    let hasValid = false;

    while (!hasValid) {
      newGrid = Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => createRandomGem())
      );
      if (findMatches(newGrid).matches.size === 0 && findPossibleMove(newGrid) !== null) {
        hasValid = true;
      }
    }
    setBoard(newGrid);
  };

  // Handle Cell Click / Swap
  const handleCellClick = async (r: number, c: number) => {
    if (isProcessing || gameStatus !== "playing") return;

    // Hammer Power-up: smash single tile
    if (hammerActive) {
      sounds.playExplosion();
      setHammerActive(false);
      const newGrid = board.map(row => row.map(g => ({ ...g })));
      newGrid[r][c] = createRandomGem();
      setIsProcessing(true);
      await processCascades(newGrid, 0);
      return;
    }

    if (!selectedPos) {
      setSelectedPos({ r, c });
      sounds.playSwap();
      return;
    }

    const { r: r1, c: c1 } = selectedPos;
    const r2 = r;
    const c2 = c;

    // If same cell clicked, deselect
    if (r1 === r2 && c1 === c2) {
      setSelectedPos(null);
      return;
    }

    // Check if adjacent (Manhattan distance = 1)
    const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
    if (!isAdjacent) {
      setSelectedPos({ r, c });
      sounds.playSwap();
      return;
    }

    // Attempt Swap
    setIsProcessing(true);
    setSelectedPos(null);
    setHintCells([]);

    const testGrid = board.map(row => row.map(g => ({ ...g })));
    const gem1 = testGrid[r1][c1];
    const gem2 = testGrid[r2][c2];

    // Check Rainbow Gem Special Interaction
    if (gem1.special === "rainbow" || gem2.special === "rainbow") {
      sounds.playSpecial();
      const targetColor = gem1.special === "rainbow" ? gem2.type : gem1.type;
      const matched = new Set<string>();

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (testGrid[row][col].type === targetColor || testGrid[row][col].special === "rainbow") {
            matched.add(`${row},${col}`);
          }
        }
      }

      setMovesLeft(m => {
        const nextMoves = m - 1;
        if (nextMoves <= 0 && score < LEVELS[currentLevel - 1].targetScore) {
          setGameStatus("lost");
        }
        return nextMoves;
      });

      await processCascades(testGrid, 1);
      return;
    }

    // Normal Swap
    [testGrid[r1][c1], testGrid[r2][c2]] = [testGrid[r2][c2], testGrid[r1][c1]];
    const { matches } = findMatches(testGrid);

    if (matches.size > 0) {
      // Valid Move!
      sounds.playSwap();
      setMovesLeft(m => {
        const nextMoves = m - 1;
        if (nextMoves <= 0 && score < LEVELS[currentLevel - 1].targetScore) {
          setGameStatus("lost");
        }
        return nextMoves;
      });

      await processCascades(testGrid, 0);
    } else {
      // Invalid Move: Swap back with buzz
      sounds.playInvalid();
      setIsProcessing(false);
    }
  };

  // Keyboard Event Isolation: WASD in input does not trigger anything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.code === "KeyH") {
        showHint();
      }
      if (e.code === "KeyR") {
        initBoard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHint, initBoard]);

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Gem Crusher";
    const cfg = LEVELS[currentLevel - 1] || LEVELS[0];
    const stars = score >= cfg.targetScore * 1.5 ? 3 : score >= cfg.targetScore ? 2 : 1;

    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      score,
      level: currentLevel,
      stars,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("match3_cyber_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  const levelCfg = LEVELS[currentLevel - 1] || LEVELS[0];
  const progressPct = Math.min(100, Math.round((score / levelCfg.targetScore) * 100));

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[540px] flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-pink-500/30 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(236,72,153,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/50 gap-1.5 font-mono text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 font-semibold block">
              CASCADE COMBOS • SPECIAL GEMS
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">
              MATCH-3 PRO
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
              className="h-8 w-8 border-pink-500/40 text-pink-400 hover:bg-pink-950/60"
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
              onClick={initBoard}
              className="h-8 w-8 border-slate-700 text-slate-300 hover:bg-slate-800"
              title="Restart Level"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Level Map & Power-up Tools Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          {/* Level Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">LEVEL:</span>
            {LEVELS.map(lvl => (
              <button
                key={lvl.level}
                onClick={() => { setCurrentLevel(lvl.level); }}
                className={`px-2 py-0.5 rounded transition-all text-xs ${
                  currentLevel === lvl.level
                    ? "bg-pink-600 text-slate-950 font-bold shadow-[0_0_8px_rgba(236,72,153,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lvl.level}
              </button>
            ))}
          </div>

          {/* Power-Up Booster Buttons */}
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHammerActive(prev => !prev)}
              className={`h-7 px-2 text-[11px] gap-1 font-mono border-rose-500/40 ${
                hammerActive ? "bg-rose-600 text-white animate-pulse" : "text-rose-400 hover:bg-rose-950/60"
              }`}
              title="Smash single gem"
            >
              <Hammer className="w-3.5 h-3.5" />
              Hammer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={showHint}
              className="h-7 px-2 text-[11px] gap-1 font-mono border-amber-500/40 text-amber-400 hover:bg-amber-950/60"
              title="Show valid move (H)"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Hint
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={shuffleBoard}
              className="h-7 px-2 text-[11px] gap-1 font-mono border-cyan-500/40 text-cyan-400 hover:bg-cyan-950/60"
              title="Reshuffle gems"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle
            </Button>
          </div>
        </div>

        {/* Live HUD Dashboard & Progress Bar */}
        <div className="flex flex-col gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 font-mono">
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <span className="text-[10px] text-slate-400 block">SCORE</span>
              <span className="text-sm sm:text-base font-bold text-pink-400">{score}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">TARGET</span>
              <span className="text-sm sm:text-base font-bold text-amber-300">{levelCfg.targetScore}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">MOVES LEFT</span>
              <span className={`text-sm sm:text-base font-bold ${movesLeft <= 5 ? "text-rose-500 animate-pulse" : "text-cyan-400"}`}>
                {movesLeft}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">COMBO</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">
                {comboChain > 0 ? `🔥 ${comboChain}x` : "1x"}
              </span>
            </div>
          </div>

          {/* Goal Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              style={{ width: `${progressPct}%` }}
              className="bg-gradient-to-r from-pink-500 to-rose-400 h-full rounded-full transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Main 8x8 Gem Matrix Frame */}
      <div className="relative w-full max-w-[540px] bg-slate-900/90 border-4 border-pink-900/60 rounded-3xl p-3 sm:p-4 shadow-[0_0_40px_rgba(236,72,153,0.3)]">
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5 aspect-square bg-slate-950 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-inner">
          {board.map((rowArr, r) =>
            rowArr.map((gem, c) => {
              const isSelected = selectedPos?.r === r && selectedPos?.c === c;
              const isHint = hintCells.some(h => h.r === r && h.c === c);
              const colorCfg = GEM_COLORS[gem.type];

              return (
                <button
                  key={gem.id}
                  disabled={isProcessing}
                  onClick={() => handleCellClick(r, c)}
                  className={`aspect-square rounded-xl relative flex items-center justify-center transition-all duration-200 select-none ${
                    gem.special === "rainbow"
                      ? "bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"
                      : `bg-gradient-to-br ${colorCfg.bg} border-2 ${colorCfg.border} shadow-md`
                  } ${
                    isSelected ? "ring-4 ring-white scale-105 z-10 animate-bounce" : ""
                  } ${isHint ? "ring-4 ring-yellow-400 animate-pulse scale-105" : ""} active:scale-95`}
                >
                  {/* Gem Inner Icon / Special Emblem */}
                  {gem.special === "rainbow" ? (
                    <span className="text-base sm:text-xl animate-spin">🌈</span>
                  ) : gem.special === "bomb" ? (
                    <span className="text-base sm:text-xl animate-pulse">💣</span>
                  ) : gem.special === "striped_h" ? (
                    <div className="w-full flex items-center justify-center">
                      <div className="w-full h-1 bg-white/80 absolute shadow-[0_0_8px_white]" />
                      <span className="text-xs sm:text-sm">{colorCfg.symbol}</span>
                    </div>
                  ) : gem.special === "striped_v" ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-full w-1 bg-white/80 absolute shadow-[0_0_8px_white]" />
                      <span className="text-xs sm:text-sm">{colorCfg.symbol}</span>
                    </div>
                  ) : (
                    <span className="text-sm sm:text-lg">{colorCfg.symbol}</span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Victory / Defeat Modal Banner */}
        {gameStatus !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center rounded-3xl animate-fade-in">
            <div className="bg-slate-900 border-2 border-pink-500/60 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_40px_rgba(236,72,153,0.3)]">
              <span className="text-pink-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                {gameStatus === "won" ? "LEVEL SECURED • MISSION COMPLETE" : "MOVES DEPLETED • LEVEL FAILED"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-wider mb-2">
                {gameStatus === "won" ? (
                  <span className="text-emerald-400">🎉 SWEET VICTORY!</span>
                ) : (
                  <span className="text-rose-400">💥 OUT OF MOVES!</span>
                )}
              </h2>

              <div className="flex justify-center gap-1 my-3">
                {Array.from({ length: 3 }).map((_, i) => {
                  const hasStar = gameStatus === "won" && (i === 0 || (i === 1 && score >= levelCfg.targetScore * 1.2) || (i === 2 && score >= levelCfg.targetScore * 1.5));
                  return (
                    <Star
                      key={i}
                      className={`w-7 h-7 ${hasStar ? "text-amber-400 fill-amber-400 animate-bounce" : "text-slate-700"}`}
                    />
                  );
                })}
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 font-mono text-xs">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Final Score:</span>
                  <span className="font-bold text-pink-400">{score}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Target Score:</span>
                  <span className="font-bold text-amber-300">{levelCfg.targetScore}</span>
                </div>
              </div>

              {/* Hall of Fame Input */}
              {gameStatus === "won" && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Enter crusher callsign..."
                    value={playerName}
                    onChange={e => setPlayerName(e.target.value)}
                    maxLength={16}
                    className="bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono outline-none flex-1"
                  />
                  <Button
                    onClick={saveRecord}
                    size="sm"
                    className="bg-pink-600 hover:bg-pink-500 text-slate-950 font-bold px-3 font-mono text-xs"
                  >
                    Save
                  </Button>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={initBoard}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs px-4"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Play Again (R)
                </Button>
                {gameStatus === "won" && currentLevel < LEVELS.length && (
                  <Button
                    onClick={() => {
                      setCurrentLevel(l => l + 1);
                    }}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-slate-950 font-bold font-mono text-xs px-4"
                  >
                    Next Level ➔
                  </Button>
                )}
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
          <div className="bg-slate-900 border border-pink-500/40 rounded-2xl max-w-sm w-full p-5 shadow-[0_0_40px_rgba(236,72,153,0.2)] font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Trophy className="w-4 h-4" />
                <span>MATCH-3 HALL OF FAME</span>
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
                      <span className={`w-4 font-bold ${idx === 0 ? "text-amber-400" : idx === 1 ? "text-slate-300" : idx === 2 ? "text-amber-600" : "text-slate-500"}`}>
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{rec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400">{"⭐".repeat(rec.stars)}</span>
                      <span className="font-bold text-pink-400">{rec.score} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 text-right">
              <Button
                onClick={() => setShowRecords(false)}
                size="sm"
                className="bg-pink-600 hover:bg-pink-500 text-slate-950 font-bold font-mono text-xs px-4"
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
