import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Flag, Shovel, Lightbulb, Clock, Bomb, Palette
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

  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  playFlag() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }

  playChord() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const freqs = [523.25, 659.25]; // C5, E5
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.03);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.03 + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.03);
        osc.stop(this.ctx.currentTime + idx * 0.03 + 0.1);
      });
    } catch {}
  }

  playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {}
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.08);
        osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- DATA STRUCTURES ---
interface Cell {
  r: number;
  c: number;
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
  detonated?: boolean;
}

type Difficulty = "easy" | "medium" | "hard" | "custom";
type Theme = "cyber" | "retro" | "matrix" | "synthwave";

interface LeaderboardRecord {
  id: string;
  name: string;
  time: number;
  difficulty: string;
  date: string;
}

const DIFFICULTY_CONFIGS: Record<"easy" | "medium" | "hard", { rows: number; cols: number; mines: number }> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export default function MinesweeperGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [customRows, setCustomRows] = useState<number>(10);
  const [customCols, setCustomCols] = useState<number>(10);
  const [customMines, setCustomMines] = useState<number>(15);

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameStatus, setGameStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [isFacePushed, setIsFacePushed] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [flagsPlaced, setFlagsPlaced] = useState<number>(0);
  const [mobileMode, setMobileMode] = useState<"dig" | "flag">("dig");
  const [theme, setTheme] = useState<Theme>("cyber");
  const [hintAvailable, setHintAvailable] = useState<number>(3);
  const [hintCell, setHintCell] = useState<{ r: number; c: number } | null>(null);

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  const timerIntervalRef = useRef<number | null>(null);

  // Get current dimensions
  const getDims = useCallback(() => {
    if (difficulty === "custom") {
      const rows = Math.max(8, Math.min(24, customRows));
      const cols = Math.max(8, Math.min(30, customCols));
      const maxMines = Math.floor(rows * cols * 0.8);
      const mines = Math.max(1, Math.min(maxMines, customMines));
      return { rows, cols, mines };
    }
    return DIFFICULTY_CONFIGS[difficulty];
  }, [difficulty, customRows, customCols, customMines]);

  // Load High Scores / Records
  useEffect(() => {
    const saved = localStorage.getItem("minesweeper_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {
        setRecords([]);
      }
    } else {
      const defaults: LeaderboardRecord[] = [
        { id: "1", name: "CyberSweeper", time: 14, difficulty: "Easy", date: "2026-11-20" },
        { id: "2", name: "MineBuster", time: 78, difficulty: "Medium", date: "2026-11-19" },
        { id: "3", name: "LogicGrandmaster", time: 195, difficulty: "Hard", date: "2026-11-18" },
      ];
      setRecords(defaults);
      localStorage.setItem("minesweeper_records", JSON.stringify(defaults));
    }
  }, []);

  // Initialize Blank Grid
  const initBoard = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const { rows, cols } = getDims();
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          mine: false,
          revealed: false,
          flagged: false,
          adjacent: 0,
        });
      }
      newGrid.push(row);
    }

    setGrid(newGrid);
    setGameStatus("idle");
    setTimer(0);
    setFlagsPlaced(0);
    setHintAvailable(3);
    setHintCell(null);
  }, [getDims]);

  useEffect(() => {
    initBoard();
  }, [initBoard]);

  // Timer Tick
  useEffect(() => {
    if (gameStatus === "playing") {
      timerIntervalRef.current = window.setInterval(() => {
        setTimer(t => Math.min(999, t + 1));
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStatus]);

  // Generate Mines with 100% First-Click Safe Zone
  const populateMinesFirstClick = (firstR: number, firstC: number, board: Cell[][]) => {
    const { rows, cols, mines } = getDims();

    // Collect all candidate coordinates except firstR, firstC and its 8 neighbors
    const candidates: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isNeighbor = Math.abs(r - firstR) <= 1 && Math.abs(c - firstC) <= 1;
        if (!isNeighbor) {
          candidates.push([r, c]);
        }
      }
    }

    // Shuffle candidates (Fisher-Yates)
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Place mines
    const mineCountToPlace = Math.min(mines, candidates.length);
    for (let i = 0; i < mineCountToPlace; i++) {
      const [mr, mc] = candidates[i];
      board[mr][mc].mine = true;
    }

    // Compute adjacent mine counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (board[r][c].mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
              count++;
            }
          }
        }
        board[r][c].adjacent = count;
      }
    }
  };

  // Iterative Flood Fill to open zero-mines safely without recursion limit
  const floodFill = (startR: number, startC: number, board: Cell[][]) => {
    const { rows, cols } = getDims();
    const queue: [number, number][] = [[startR, startC]];

    while (queue.length > 0) {
      const [r, c] = queue.shift()!;
      const cell = board[r][c];

      if (cell.revealed || cell.flagged) continue;
      cell.revealed = true;

      // If cell has 0 adjacent mines, expand to all 8 neighbors
      if (cell.adjacent === 0 && !cell.mine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = board[nr][nc];
              if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) {
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  };

  // Check Win Condition
  const checkWin = (board: Cell[][]): boolean => {
    const { rows, cols } = getDims();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c];
        if (!cell.mine && !cell.revealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Handle Cell Left Click (Dig)
  const handleCellClick = (r: number, c: number) => {
    if (gameStatus === "won" || gameStatus === "lost") return;

    if (mobileMode === "flag") {
      handleToggleFlag(r, c);
      return;
    }

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    let currentCell = newGrid[r][c];

    if (currentCell.flagged) return;

    // First click initialization
    if (gameStatus === "idle") {
      populateMinesFirstClick(r, c, newGrid);
      setGameStatus("playing");
      currentCell = newGrid[r][c];
    }

    // Chording on already revealed number cell
    if (currentCell.revealed) {
      if (currentCell.adjacent > 0) {
        chordCell(r, c, newGrid);
      }
      return;
    }

    // Detonated Mine!
    if (currentCell.mine) {
      sounds.playExplosion();
      currentCell.detonated = true;
      // Reveal all mines
      const { rows, cols } = getDims();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newGrid[row][col].mine) {
            newGrid[row][col].revealed = true;
          }
        }
      }
      setGrid(newGrid);
      setGameStatus("lost");
      return;
    }

    // Safe Cell Reveal
    sounds.playClick();
    if (currentCell.adjacent === 0) {
      floodFill(r, c, newGrid);
    } else {
      currentCell.revealed = true;
    }

    // Clear hint if resolved
    if (hintCell && hintCell.r === r && hintCell.c === c) {
      setHintCell(null);
    }

    // Check Win
    if (checkWin(newGrid)) {
      sounds.playWin();
      setGameStatus("won");
      // Flag remaining mines
      const { rows, cols } = getDims();
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newGrid[row][col].mine) {
            newGrid[row][col].flagged = true;
          }
        }
      }
      setFlagsPlaced(getDims().mines);
    }

    setGrid(newGrid);
  };

  // Chording: open unflagged neighbors if flagged count matches adjacent count
  const chordCell = (r: number, c: number, board: Cell[][]) => {
    const cell = board[r][c];
    if (!cell.revealed || cell.adjacent === 0) return;

    const { rows, cols } = getDims();
    let flagCount = 0;
    const neighbors: [number, number][] = [];

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          neighbors.push([nr, nc]);
          if (board[nr][nc].flagged) flagCount++;
        }
      }
    }

    if (flagCount === cell.adjacent) {
      sounds.playChord();
      let hitMine = false;

      for (const [nr, nc] of neighbors) {
        const neighbor = board[nr][nc];
        if (!neighbor.revealed && !neighbor.flagged) {
          if (neighbor.mine) {
            neighbor.detonated = true;
            hitMine = true;
          } else if (neighbor.adjacent === 0) {
            floodFill(nr, nc, board);
          } else {
            neighbor.revealed = true;
          }
        }
      }

      if (hitMine) {
        sounds.playExplosion();
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (board[row][col].mine) board[row][col].revealed = true;
          }
        }
        setGrid(board);
        setGameStatus("lost");
        return;
      }

      if (checkWin(board)) {
        sounds.playWin();
        setGameStatus("won");
      }
      setGrid([...board]);
    }
  };

  // Handle Right Click (Toggle Flag)
  const handleToggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameStatus === "won" || gameStatus === "lost") return;

    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const cell = newGrid[r][c];

    if (cell.revealed) return;

    sounds.playFlag();
    cell.flagged = !cell.flagged;
    setFlagsPlaced(prev => (cell.flagged ? prev + 1 : prev - 1));
    setGrid(newGrid);
  };

  // Hint Generator: Reveals one guaranteed safe unopened cell or flags an obvious mine
  const useHint = () => {
    if (hintAvailable <= 0 || gameStatus === "won" || gameStatus === "lost") return;
    const { rows, cols } = getDims();

    if (gameStatus === "idle") {
      // Pick a random corner or center cell as safe starting point
      setHintCell({ r: Math.floor(rows / 2), c: Math.floor(cols / 2) });
      setHintAvailable(h => h - 1);
      return;
    }

    // Find any unopened safe cell
    const safeCells: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].revealed && !grid[r][c].mine && !grid[r][c].flagged) {
          safeCells.push([r, c]);
        }
      }
    }

    if (safeCells.length > 0) {
      const [hr, hc] = safeCells[Math.floor(Math.random() * safeCells.length)];
      setHintCell({ r: hr, c: hc });
      setHintAvailable(h => h - 1);
      sounds.playClick();
    }
  };

  // Keyboard Event Isolation: WASD in input does not trigger anything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.code === "KeyR") {
        initBoard();
      }
      if (e.code === "KeyH") {
        useHint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [initBoard, useHint]);

  // Save Record
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Sweeper Ace";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      time: timer,
      difficulty: difficulty.toUpperCase(),
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => a.time - b.time)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("minesweeper_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  // Number Color Palette
  const getNumberColor = (num: number) => {
    const colors: Record<number, string> = {
      1: "text-blue-400 font-bold",
      2: "text-emerald-400 font-bold",
      3: "text-rose-400 font-bold",
      4: "text-indigo-400 font-bold",
      5: "text-amber-500 font-bold",
      6: "text-cyan-400 font-bold",
      7: "text-fuchsia-400 font-bold",
      8: "text-slate-200 font-extrabold",
    };
    return colors[num] || "text-slate-300";
  };

  // Smiley Icon
  const getSmiley = () => {
    if (isFacePushed) return "😮";
    if (gameStatus === "won") return "😎";
    if (gameStatus === "lost") return "😵";
    return "😊";
  };

  const { mines } = getDims();
  const minesLeft = Math.max(0, mines - flagsPlaced);

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[800px] flex flex-col gap-2 mb-3">
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
              LOGIC ARCADE • FIRST-CLICK SAFE
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              MINESWEEPER PRO
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
              onClick={useHint}
              disabled={hintAvailable <= 0 || gameStatus === "won" || gameStatus === "lost"}
              className="h-8 w-8 border-yellow-500/40 text-yellow-400 hover:bg-yellow-950/60 relative"
              title={`Use Safe Hint (${hintAvailable} left)`}
            >
              <Lightbulb className="w-4 h-4" />
              {hintAvailable > 0 && (
                <span className="absolute -top-1 -right-1 text-[9px] bg-yellow-500 text-slate-950 font-bold px-1 rounded-full">
                  {hintAvailable}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Difficulty & Mode Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">DIFFICULTY:</span>
            {(["easy", "medium", "hard", "custom"] as const).map(diff => (
              <button
                key={diff}
                onClick={() => { setDifficulty(diff); }}
                className={`px-2.5 py-1 rounded-md capitalize transition-all text-xs ${
                  difficulty === diff
                    ? "bg-cyan-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Mobile Dig/Flag Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setMobileMode("dig")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-all ${
                mobileMode === "dig" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold" : "text-slate-400"
              }`}
            >
              <Shovel className="w-3.5 h-3.5" />
              Dig
            </button>
            <button
              onClick={() => setMobileMode("flag")}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-xs transition-all ${
                mobileMode === "flag" ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold" : "text-slate-400"
              }`}
            >
              <Flag className="w-3.5 h-3.5" />
              Flag
            </button>
          </div>
        </div>

        {/* Classic Arcade LED Counters & Smiley Bar */}
        <div className="flex items-center justify-between bg-slate-950 border-2 border-slate-800 rounded-xl px-5 py-3 shadow-inner font-mono">
          {/* Mine LED Counter */}
          <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-rose-900/40 shadow-inner">
            <Bomb className="w-4 h-4 text-rose-500" />
            <span className="text-xl sm:text-2xl font-black text-rose-500 tracking-widest font-mono">
              {String(minesLeft).padStart(3, "0")}
            </span>
          </div>

          {/* Smiley Reset Button */}
          <button
            onClick={initBoard}
            onMouseDown={() => setIsFacePushed(true)}
            onMouseUp={() => setIsFacePushed(false)}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-yellow-300 via-amber-400 to-amber-500 text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] border-2 border-amber-200 active:scale-95 transition-transform"
            title="Reset Board"
          >
            {getSmiley()}
          </button>

          {/* Timer LED Counter */}
          <div className="flex items-center gap-2 bg-black px-3 py-1.5 rounded-lg border border-cyan-900/40 shadow-inner">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-xl sm:text-2xl font-black text-cyan-400 tracking-widest font-mono">
              {String(timer).padStart(3, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Main Minesweeper Grid Board */}
      <div className="relative max-w-full overflow-x-auto bg-slate-900 border-4 border-slate-800 rounded-2xl p-3 sm:p-4 shadow-[0_0_35px_rgba(15,23,42,0.6)]">
        <div
          className="grid gap-1 sm:gap-1.5 mx-auto"
          style={{
            gridTemplateColumns: `repeat(${grid[0]?.length || 9}, minmax(0, 1fr))`,
            width: "fit-content",
          }}
          onMouseDown={() => { if (gameStatus === "playing") setIsFacePushed(true); }}
          onMouseUp={() => setIsFacePushed(false)}
        >
          {grid.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const isHinted = hintCell?.r === r && hintCell?.c === c;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={(e) => handleToggleFlag(r, c, e)}
                  disabled={gameStatus === "won" || gameStatus === "lost"}
                  className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded flex items-center justify-center text-xs sm:text-sm font-black transition-all select-none ${
                    cell.revealed
                      ? cell.detonated
                        ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.8)]"
                        : cell.mine
                        ? "bg-slate-800/90 text-rose-400"
                        : "bg-slate-950/80 border border-slate-800/60"
                      : "bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 hover:border-cyan-400/60 shadow-sm hover:shadow-[0_0_8px_rgba(6,182,212,0.3)] active:translate-y-0.5"
                  } ${isHinted ? "ring-2 ring-yellow-400 animate-pulse bg-yellow-950/40" : ""}`}
                >
                  {cell.revealed ? (
                    cell.mine ? (
                      <Bomb className="w-4 h-4 animate-bounce" />
                    ) : cell.adjacent > 0 ? (
                      <span className={getNumberColor(cell.adjacent)}>{cell.adjacent}</span>
                    ) : null
                  ) : cell.flagged ? (
                    <Flag className="w-3.5 h-3.5 text-rose-400 fill-rose-500 animate-pulse" />
                  ) : isHinted ? (
                    <Lightbulb className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        {/* Game Over / Win Victory Banner Overlay */}
        {(gameStatus === "won" || gameStatus === "lost") && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-center animate-fade-in max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider mb-1">
              {gameStatus === "won" ? (
                <span className="text-emerald-400">🎉 SECTOR SECURED! VICTORY!</span>
              ) : (
                <span className="text-rose-400">💥 DETONATION! SECTOR LOST!</span>
              )}
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-3">
              {gameStatus === "won"
                ? `Cleared ${difficulty.toUpperCase()} field in ${timer} seconds!`
                : "A hidden mine was triggered. First-click safety guarantees fair starts."}
            </p>

            {/* Hall of Fame Input (If Won) */}
            {gameStatus === "won" && (
              <div className="flex gap-2 max-w-sm mx-auto mb-3">
                <input
                  type="text"
                  placeholder="Enter sweeper callsign..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono outline-none flex-1"
                />
                <Button
                  onClick={saveRecord}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs px-3"
                >
                  Save Record
                </Button>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={initBoard}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono px-4"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Play Again (R)
              </Button>
              <Link to="/games">
                <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono">
                  All Games
                </Button>
              </Link>
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
                <span>MINESWEEPER HALL OF FAME</span>
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
                <p className="text-center text-sm text-slate-500 py-6">No records registered yet.</p>
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
                      <span className="text-slate-400">{rec.difficulty}</span>
                      <span className="font-bold text-emerald-400">{rec.time}s</span>
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
