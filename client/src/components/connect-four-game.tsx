import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft, Bot,
  Users, Sparkles, Brain, Award
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

  playDrop(row: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Frequency depends on row depth (higher pitch at top, deeper at bottom)
      const freq = 440 - row * 35;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.1);
        osc.stop(this.ctx.currentTime + idx * 0.1 + 0.3);
      });
    } catch {}
  }

  playDraw() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [300, 260, 220];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.12);
        osc.stop(this.ctx.currentTime + idx * 0.12 + 0.2);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

const ROWS = 6;
const COLS = 7;
type Player = 1 | 2; // 1 = Red / Cyan (Player 1), 2 = Yellow / Amber (AI or Player 2)
type BoardState = (Player | null)[][]; // board[row][col], row 0 is top, row 5 is bottom

interface LeaderboardRecord {
  id: string;
  name: string;
  wins: number;
  mode: string;
  date: string;
}

// --- MINIMAX AI ENGINE WITH ALPHA-BETA PRUNING ---
function checkWinningMove(board: BoardState, player: Player): [number, number][] | null {
  // Check Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r][c + 1] === player &&
        board[r][c + 2] === player &&
        board[r][c + 3] === player
      ) {
        return [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]];
      }
    }
  }

  // Check Vertical
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c] === player &&
        board[r + 2][c] === player &&
        board[r + 3][c] === player
      ) {
        return [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]];
      }
    }
  }

  // Check Diagonal Positive (\)
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r + 1][c + 1] === player &&
        board[r + 2][c + 2] === player &&
        board[r + 3][c + 3] === player
      ) {
        return [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]];
      }
    }
  }

  // Check Diagonal Negative (/)
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      if (
        board[r][c] === player &&
        board[r - 1][c + 1] === player &&
        board[r - 2][c + 2] === player &&
        board[r - 3][c + 3] === player
      ) {
        return [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]];
      }
    }
  }

  return null;
}

function getAvailableRow(board: BoardState, col: number): number | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return null;
}

function evaluateWindow(window: (Player | null)[], piece: Player): number {
  let score = 0;
  const oppPiece: Player = piece === 1 ? 2 : 1;

  const pieceCount = window.filter(cell => cell === piece).length;
  const emptyCount = window.filter(cell => cell === null).length;
  const oppCount = window.filter(cell => cell === oppPiece).length;

  if (pieceCount === 4) score += 10000;
  else if (pieceCount === 3 && emptyCount === 1) score += 100;
  else if (pieceCount === 2 && emptyCount === 2) score += 10;

  if (oppCount === 3 && emptyCount === 1) score -= 80;

  return score;
}

function scorePosition(board: BoardState, piece: Player): number {
  let score = 0;

  // Center column preference (center column allows most connections)
  const centerCol = Math.floor(COLS / 2);
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][centerCol] === piece) centerCount++;
  }
  score += centerCount * 6;

  // Horizontal score
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  // Vertical score
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]];
      score += evaluateWindow(window, piece);
    }
  }

  // Diagonal \ score
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  // Diagonal / score
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]];
      score += evaluateWindow(window, piece);
    }
  }

  return score;
}

function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): { score: number; column: number } {
  const isTerminalAi = checkWinningMove(board, 2);
  const isTerminalHuman = checkWinningMove(board, 1);

  // Check valid locations
  const validCols: number[] = [];
  for (let c = 0; c < COLS; c++) {
    if (getAvailableRow(board, c) !== null) validCols.push(c);
  }

  if (isTerminalAi) return { score: 1000000, column: -1 };
  if (isTerminalHuman) return { score: -1000000, column: -1 };
  if (validCols.length === 0 || depth === 0) {
    return { score: scorePosition(board, 2), column: -1 };
  }

  // Prioritize center columns for faster alpha-beta cutoff
  validCols.sort((a, b) => Math.abs(a - 3) - Math.abs(b - 3));

  if (isMaximizing) {
    let maxEval = -Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const row = getAvailableRow(board, col)!;
      board[row][col] = 2; // AI move
      const evalResult = minimax(board, depth - 1, alpha, beta, false);
      board[row][col] = null;

      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestCol = col;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, column: bestCol };
  } else {
    let minEval = Infinity;
    let bestCol = validCols[0];

    for (const col of validCols) {
      const row = getAvailableRow(board, col)!;
      board[row][col] = 1; // Human move
      const evalResult = minimax(board, depth - 1, alpha, beta, true);
      board[row][col] = null;

      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestCol = col;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, column: bestCol };
  }
}

export default function ConnectFourGame() {
  const [board, setBoard] = useState<BoardState>(() =>
    Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | "draw" | null>(null);
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<"ai" | "pvp">("ai");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "master">("master");
  const [scores, setScores] = useState({ p1: 0, p2: 0, draws: 0 });
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Load High Score and Records
  useEffect(() => {
    const savedRecords = localStorage.getItem("connect4_records");
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch {
        setRecords([]);
      }
    } else {
      const defaultRecords: LeaderboardRecord[] = [
        { id: "1", name: "GrandMaster", wins: 15, mode: "Master AI", date: "2026-11-20" },
        { id: "2", name: "CyberTactician", wins: 9, mode: "Medium AI", date: "2026-11-19" },
        { id: "3", name: "GridRook", wins: 6, mode: "Master AI", date: "2026-11-18" },
      ];
      setRecords(defaultRecords);
      localStorage.setItem("connect4_records", JSON.stringify(defaultRecords));
    }
  }, []);

  // Drop token into a column
  const dropToken = useCallback(
    (col: number, playerToDrop?: Player) => {
      if (winner !== null || isAiThinking) return false;

      const p = playerToDrop ?? currentPlayer;
      const targetRow = getAvailableRow(board, col);
      if (targetRow === null) return false;

      const newBoard = board.map(row => [...row]);
      newBoard[targetRow][col] = p;
      setBoard(newBoard);
      sounds.playDrop(targetRow);

      // Check win
      const win = checkWinningMove(newBoard, p);
      if (win) {
        setWinner(p);
        setWinningCells(win);
        sounds.playWin();
        setScores(prev => ({
          ...prev,
          p1: p === 1 ? prev.p1 + 1 : prev.p1,
          p2: p === 2 ? prev.p2 + 1 : prev.p2,
        }));
        return true;
      }

      // Check draw
      const isDraw = newBoard.every(row => row.every(cell => cell !== null));
      if (isDraw) {
        setWinner("draw");
        sounds.playDraw();
        setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        return true;
      }

      // Switch turn
      setCurrentPlayer(p === 1 ? 2 : 1);
      return true;
    },
    [board, currentPlayer, winner, isAiThinking]
  );

  // Trigger AI Turn if in AI mode and Player 2's turn
  useEffect(() => {
    if (gameMode !== "ai" || currentPlayer !== 2 || winner !== null) return;

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      let chosenCol = 3; // Center default

      if (difficulty === "easy") {
        // Random available column
        const validCols: number[] = [];
        for (let c = 0; c < COLS; c++) {
          if (getAvailableRow(board, c) !== null) validCols.push(c);
        }
        chosenCol = validCols[Math.floor(Math.random() * validCols.length)];
      } else if (difficulty === "medium") {
        // Depth 3 Minimax
        const res = minimax(board, 3, -Infinity, Infinity, true);
        chosenCol = res.column >= 0 ? res.column : 3;
      } else {
        // Master: Depth 5 Minimax with Alpha-Beta
        const res = minimax(board, 5, -Infinity, Infinity, true);
        chosenCol = res.column >= 0 ? res.column : 3;
      }

      setIsAiThinking(false);
      dropToken(chosenCol, 2);
    }, 450);

    return () => clearTimeout(timer);
  }, [currentPlayer, gameMode, difficulty, winner, board, dropToken]);

  // Restart Round
  const restartRound = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setWinningCells([]);
    setIsAiThinking(false);
  };

  // Keyboard Event Isolation: Allow typing in inputs without dropping tokens
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return; // Allow typing in input fields
      }

      // Number keys 1-7 to drop token
      if (e.key >= "1" && e.key <= "7") {
        const colIdx = parseInt(e.key, 10) - 1;
        dropToken(colIdx);
      }

      if (e.code === "KeyR") {
        restartRound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropToken]);

  // Toggle Sound
  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setSoundMuted(!sounds.enabled);
  };

  // Save Record
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Tactician";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      wins: scores.p1,
      mode: gameMode === "ai" ? `${difficulty.toUpperCase()} AI` : "2-Player",
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("connect4_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[680px] flex flex-col gap-2 mb-3">
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
              MINIMAX AI • 60 FPS
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              CONNECT 4 CYBER
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
              onClick={restartRound}
              className="h-8 w-8 border-indigo-500/40 text-indigo-400 hover:bg-indigo-950/60"
              title="Restart Board (R)"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode & Difficulty Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">MODE:</span>
            <button
              onClick={() => { setGameMode("ai"); restartRound(); }}
              className={`px-2.5 py-1 rounded-md transition-all ${gameMode === "ai" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Bot className="w-3.5 h-3.5 inline mr-1" />
              vs Cyber AI
            </button>
            <button
              onClick={() => { setGameMode("pvp"); restartRound(); }}
              className={`px-2.5 py-1 rounded-md transition-all ${gameMode === "pvp" ? "bg-cyan-600 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              2-Player Local
            </button>
          </div>

          {gameMode === "ai" && (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">AI:</span>
              {(["easy", "medium", "master"] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => { setDifficulty(diff); restartRound(); }}
                  className={`px-2 py-0.5 rounded capitalize text-[11px] ${
                    difficulty === diff
                      ? diff === "master"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold"
                        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Turn Status & Score Meter */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center font-mono">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-cyan-400">PLAYER 1 (CYAN)</span>
            <span className="text-base sm:text-lg font-bold text-cyan-300">{scores.p1} WINS</span>
          </div>

          {/* Dynamic Turn Badge */}
          <div className="flex flex-col items-center justify-center">
            {winner === null ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-700">
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${currentPlayer === 1 ? "bg-cyan-400" : "bg-amber-400"}`} />
                <span className="text-xs font-bold text-slate-200">
                  {isAiThinking ? "🤖 AI Thinking..." : currentPlayer === 1 ? "🔴 Player 1 Turn" : gameMode === "ai" ? "🟡 AI Turn" : "🟡 Player 2 Turn"}
                </span>
              </div>
            ) : winner === "draw" ? (
              <span className="text-xs font-bold text-slate-400">🤝 DRAW MATCH</span>
            ) : (
              <span className={`text-xs font-bold ${winner === 1 ? "text-cyan-400" : "text-amber-400"}`}>
                🏆 {winner === 1 ? "Player 1 Wins!" : gameMode === "ai" ? "Cyber AI Wins!" : "Player 2 Wins!"}
              </span>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-400">{gameMode === "ai" ? "CYBER AI (GOLD)" : "PLAYER 2 (GOLD)"}</span>
            <span className="text-base sm:text-lg font-bold text-amber-300">{scores.p2} WINS</span>
          </div>
        </div>
      </div>

      {/* Main Connect 4 Cyber Grid Frame */}
      <div className="relative w-full max-w-[680px] bg-slate-900 border-4 border-indigo-900/60 rounded-3xl p-3 sm:p-5 shadow-[0_0_40px_rgba(30,58,138,0.35)]">
        {/* Column Drop Indicator Buttons (Desktop & Touch) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-2 px-1">
          {Array(COLS).fill(0).map((_, c) => {
            const rowTarget = getAvailableRow(board, c);
            const isFull = rowTarget === null;
            return (
              <button
                key={c}
                disabled={isFull || winner !== null || isAiThinking}
                onClick={() => dropToken(c)}
                onMouseEnter={() => setHoveredCol(c)}
                onMouseLeave={() => setHoveredCol(null)}
                className={`py-1 rounded-lg text-center text-xs font-mono transition-all flex flex-col items-center justify-center ${
                  isFull
                    ? "opacity-20 cursor-not-allowed"
                    : "hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 cursor-pointer active:scale-95"
                }`}
                title={`Drop in column ${c + 1}`}
              >
                <span className="text-[10px] opacity-60">[{c + 1}]</span>
                <span className="text-sm">▼</span>
              </button>
            );
          })}
        </div>

        {/* 7x6 Matrix Cells */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800 shadow-inner">
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const isWinning = winningCells.some(([wr, wc]) => wr === r && wc === c);
              const isHoverPreview =
                hoveredCol === c &&
                cell === null &&
                winner === null &&
                !isAiThinking &&
                getAvailableRow(board, c) === r;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => dropToken(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className={`aspect-square rounded-full relative flex items-center justify-center cursor-pointer transition-all duration-300 ${
                    cell === null
                      ? "bg-slate-900/90 border border-slate-800 hover:border-slate-700"
                      : ""
                  }`}
                >
                  {/* Token Drop Graphic */}
                  {cell !== null && (
                    <div
                      className={`w-[90%] h-[90%] rounded-full shadow-lg flex items-center justify-center transition-all ${
                        cell === 1
                          ? "bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.6)] border-2 border-cyan-300"
                          : "bg-gradient-to-br from-amber-300 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] border-2 border-amber-200"
                      } ${isWinning ? "animate-bounce scale-105 ring-4 ring-white" : ""}`}
                    >
                      {/* Inner Ring Glow */}
                      <div className="w-1/2 h-1/2 rounded-full border border-white/40" />
                    </div>
                  )}

                  {/* Hover Ghost Token Preview */}
                  {isHoverPreview && (
                    <div
                      className={`w-[85%] h-[85%] rounded-full opacity-35 border-2 border-dashed ${
                        currentPlayer === 1
                          ? "bg-cyan-500/40 border-cyan-400"
                          : "bg-amber-500/40 border-amber-400"
                      }`}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Winner Banner Overlay */}
        {winner !== null && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950/95 border border-cyan-500/40 text-center animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider mb-2">
              {winner === "draw" ? (
                <span className="text-slate-300">GRID STALEMATE • DRAW!</span>
              ) : (
                <span className={winner === 1 ? "text-cyan-400" : "text-amber-400"}>
                  🎉 {winner === 1 ? "PLAYER 1 DOMINATES!" : gameMode === "ai" ? "CYBER AI CLAIMS VICTORY!" : "PLAYER 2 DOMINATES!"}
                </span>
              )}
            </h2>

            {/* Hall of Fame Input */}
            <div className="flex gap-2 max-w-sm mx-auto mb-3">
              <input
                type="text"
                placeholder="Enter champion callsign..."
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
                Save
              </Button>
            </div>

            <div className="flex gap-2 justify-center">
              <Button
                onClick={restartRound}
                size="sm"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold font-mono px-4"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Play Next Round
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
                <span>CONNECT 4 HALL OF FAME</span>
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
                <p className="text-center text-sm text-slate-500 py-6">No champions registered yet.</p>
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
                      <span className="text-slate-400">{rec.mode}</span>
                      <span className="font-bold text-emerald-400">{rec.wins} wins</span>
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
