import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Share2, HelpCircle, BarChart2, Eye,
  CheckCircle2, XCircle, AlertTriangle, Settings2, RefreshCw
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

  playKey() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  playFlip(index: number, status: "correct" | "present" | "absent") {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const baseFreq = status === "correct" ? 523.25 + index * 40 : status === "present" ? 440 + index * 30 : 220;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = status === "correct" ? "sine" : status === "present" ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);

      gain.gain.setValueAtTime(status === "correct" ? 0.14 : 0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
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

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {}
  }
}

const sounds = new SoundEngine();

// --- EXTENSIVE ENGLISH WORD LISTS ---
// 5-letter curated solutions
const WORDS_5 = [
  "REACT", "CLOUD", "CYBER", "ROBOT", "PIXEL", "LOGIC", "SMART", "BRAIN", "POWER", "SPACE",
  "LIGHT", "NIGHT", "DREAM", "FLAME", "LASER", "PRISM", "SPARK", "STORM", "SWIFT", "TIGER",
  "OCEAN", "EARTH", "SOLAR", "LUNAR", "ALPHA", "OMEGA", "VIRAL", "AUDIO", "VIDEO", "RADIO",
  "GHOST", "BLAST", "FROST", "MAGIC", "QUEST", "SHARP", "CLEAN", "BUILD", "STACK", "SHINE",
  "CRANE", "SLATE", "TRACE", "PLANT", "HEART", "PEACE", "FLOAT", "FOCUS", "FORGE", "FRAME",
  "GIANT", "GLOWS", "GRACE", "GUARD", "HONOR", "IMAGE", "INPUT", "IVORY", "JEWEL", "JUDGE",
  "KNACK", "LEARN", "LEMON", "LEVEL", "MANGO", "MATCH", "MEDAL", "MONEY", "MUSIC", "NOBLE",
  "NORTH", "NOVEL", "ORBIT", "PAINT", "PULSE", "RIVER", "SCALE", "SCOPE", "SCORE", "SHAPE",
  "SHARE", "SHIFT", "SHOCK", "SKILL", "SOUND", "SPEED", "SPORT", "STAGE", "STAND", "START",
  "STEEL", "STONE", "STYLE", "SUITE", "SUPER", "SURGE", "TABLE", "THEME", "TOWER", "TRACK",
  "TRAIN", "TRUST", "UNITY", "VALVE", "VAPOR", "VOICE", "WATER", "WHEAT", "WHEEL", "WORLD",
  "YOUTH", "ZEBRA", "ALERT", "ANGEL", "APPLE", "BEACH", "BLACK", "BLOOM", "CANDY", "CHAMP"
];

// 4-letter words
const WORDS_4 = [
  "BYTE", "CODE", "DATA", "NODE", "CHIP", "CORE", "FLOW", "GRID", "HACK", "LOOP",
  "PEEK", "PORT", "RAID", "SCAN", "SYNC", "TECH", "USER", "WAVE", "WIFI", "ZERO",
  "FIRE", "WIND", "GOLD", "IRON", "STAR", "MOON", "DARK", "BLUE", "CYAN", "NEON",
  "FAST", "GAME", "HERO", "ICON", "JUMP", "KING", "LUCK", "MIND", "PLAY", "RANK"
];

// 6-letter words
const WORDS_6 = [
  "CODING", "PYTHON", "VECTOR", "SYSTEM", "DESIGN", "MATRIX", "ENGINE", "SOURCE", "BUFFER",
  "SERVER", "CLIENT", "SIGNAL", "ROUTER", "MEMORY", "PORTAL", "CIPHER", "SHIELD", "BINARY",
  "GALAXY", "PLANET", "ROCKET", "COSMIC", "QUANTUM", "NEURON", "ALGORITHM", "LOGICAL",
  "ARCADE", "WINNER", "LEGEND", "FUTURE", "VISION", "SHADOW", "STRIKE", "CHROME", "VORTEX"
].filter(w => w.length === 6);

type LetterStatus = "correct" | "present" | "absent" | "empty";

interface GuessRow {
  letters: string[];
  statuses: LetterStatus[];
}

interface GameStats {
  played: number;
  won: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // Index 0 = 1 guess, 5 = 6 guesses
}

export default function WordleGame() {
  const [wordLength, setWordLength] = useState<4 | 5 | 6>(5);
  const [gameMode, setGameMode] = useState<"daily" | "unlimited">("daily");
  const [hardMode, setHardMode] = useState<boolean>(false);
  const [colorblind, setColorblind] = useState<boolean>(false);
  const [targetWord, setTargetWord] = useState<string>("");
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [shakeRow, setShakeRow] = useState<boolean>(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [stats, setStats] = useState<GameStats>({
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  });

  const maxAttempts = 6;

  // Load Saved Stats
  useEffect(() => {
    const saved = localStorage.getItem("wordle_cyber_stats");
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Save Stats
  const updateStats = useCallback((won: boolean, attempts: number) => {
    setStats(prev => {
      const newPlayed = prev.played + 1;
      const newWon = won ? prev.won + 1 : prev.won;
      const newCurrentStreak = won ? prev.currentStreak + 1 : 0;
      const newMaxStreak = Math.max(prev.maxStreak, newCurrentStreak);
      const newDist = [...prev.guessDistribution];
      if (won && attempts >= 1 && attempts <= 6) {
        newDist[attempts - 1] += 1;
      }
      const updated: GameStats = {
        played: newPlayed,
        won: newWon,
        currentStreak: newCurrentStreak,
        maxStreak: newMaxStreak,
        guessDistribution: newDist,
      };
      localStorage.setItem("wordle_cyber_stats", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Pick target word
  const selectWord = useCallback((mode: "daily" | "unlimited", length: 4 | 5 | 6) => {
    const list = length === 4 ? WORDS_4 : length === 6 ? WORDS_6 : WORDS_5;
    if (mode === "daily") {
      const startDate = new Date(2026, 0, 1).getTime();
      const now = new Date().getTime();
      const dayIndex = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      const word = list[dayIndex % list.length];
      return word.toUpperCase();
    } else {
      const randIndex = Math.floor(Math.random() * list.length);
      return list[randIndex].toUpperCase();
    }
  }, []);

  // Start / Reset Round
  const startNewGame = useCallback(() => {
    const chosen = selectWord(gameMode, wordLength);
    setTargetWord(chosen);
    setGuesses([]);
    setCurrentGuess("");
    setGameStatus("playing");
    setBannerMessage(null);
    setShakeRow(false);
  }, [selectWord, gameMode, wordLength]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Show Toast Banner
  const showToast = (msg: string) => {
    setBannerMessage(msg);
    setTimeout(() => {
      setBannerMessage(null);
    }, 2500);
  };

  // Evaluate Guess with 2-Pass Duplicate Handling
  const evaluateGuess = (guess: string, solution: string): LetterStatus[] => {
    const result: LetterStatus[] = Array(guess.length).fill("absent");
    const counts: { [key: string]: number } = {};

    // Count frequencies in solution
    for (const ch of solution) {
      counts[ch] = (counts[ch] || 0) + 1;
    }

    // Pass 1: Exact matches (Green)
    for (let i = 0; i < guess.length; i++) {
      if (guess[i] === solution[i]) {
        result[i] = "correct";
        counts[guess[i]]--;
      }
    }

    // Pass 2: Present elsewhere (Yellow)
    for (let i = 0; i < guess.length; i++) {
      if (result[i] === "correct") continue;
      const ch = guess[i];
      if (counts[ch] && counts[ch] > 0) {
        result[i] = "present";
        counts[ch]--;
      } else {
        result[i] = "absent";
      }
    }

    return result;
  };

  // Submit current row
  const submitGuess = useCallback(() => {
    if (gameStatus !== "playing") return;

    if (currentGuess.length !== wordLength) {
      sounds.playInvalid();
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 500);
      showToast("Not enough letters");
      return;
    }

    // Hard Mode validation: check that previous green and yellow hints are reused
    if (hardMode && guesses.length > 0) {
      const lastRow = guesses[guesses.length - 1];
      for (let i = 0; i < wordLength; i++) {
        if (lastRow.statuses[i] === "correct" && currentGuess[i] !== lastRow.letters[i]) {
          sounds.playInvalid();
          setShakeRow(true);
          setTimeout(() => setShakeRow(false), 500);
          showToast(`Position ${i + 1} must be ${lastRow.letters[i]}`);
          return;
        }
      }
    }

    const statuses = evaluateGuess(currentGuess, targetWord);

    // Play flip sounds staggered
    statuses.forEach((st, idx) => {
      setTimeout(() => {
        sounds.playFlip(idx, st);
      }, idx * 180);
    });

    const newGuesses = [
      ...guesses,
      {
        letters: currentGuess.split(""),
        statuses,
      },
    ];
    setGuesses(newGuesses);
    setCurrentGuess("");

    // Check Win
    if (currentGuess === targetWord) {
      setTimeout(() => {
        sounds.playWin();
        setGameStatus("won");
        updateStats(true, newGuesses.length);
        const praise = ["Genius!", "Magnificent!", "Impressive!", "Splendid!", "Great!", "Phew!"];
        showToast(praise[newGuesses.length - 1] || "Well Done!");
        setTimeout(() => setShowStats(true), 1200);
      }, wordLength * 180);
      return;
    }

    // Check Loss
    if (newGuesses.length >= maxAttempts) {
      setTimeout(() => {
        sounds.playInvalid();
        setGameStatus("lost");
        updateStats(false, newGuesses.length);
        showToast(`Target was: ${targetWord}`);
        setTimeout(() => setShowStats(true), 1200);
      }, wordLength * 180);
    }
  }, [currentGuess, wordLength, gameStatus, hardMode, guesses, targetWord, updateStats]);

  // Handle Key Input
  const handleKey = useCallback(
    (key: string) => {
      if (gameStatus !== "playing") return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "BACKSPACE" || key === "DELETE") {
        sounds.playKey();
        setCurrentGuess(prev => prev.slice(0, -1));
      } else if (/^[A-Z]$/.test(key)) {
        if (currentGuess.length < wordLength) {
          sounds.playKey();
          setCurrentGuess(prev => prev + key);
        }
      }
    },
    [gameStatus, currentGuess, wordLength, submitGuess]
  );

  // Keyboard Event Isolation: strictly ignore when typing in input/textarea
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        handleKey("ENTER");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleKey("BACKSPACE");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKey]);

  // Keyboard Key Status Tracker
  const getKeyStatuses = () => {
    const map: { [key: string]: LetterStatus } = {};
    guesses.forEach(row => {
      row.letters.forEach((letter, i) => {
        const st = row.statuses[i];
        if (!map[letter] || map[letter] === "absent") {
          map[letter] = st;
        } else if (map[letter] === "present" && st === "correct") {
          map[letter] = "correct";
        }
      });
    });
    return map;
  };

  const keyStatusMap = getKeyStatuses();

  // Share Result to Clipboard
  const shareResult = () => {
    const title = `Wordle Cyber ${gameMode === "daily" ? "#" + Math.floor((Date.now() - new Date(2026, 0, 1).getTime()) / 86400000) : "Practice"} ${
      gameStatus === "won" ? guesses.length : "X"
    }/${maxAttempts}`;

    const gridEmojis = guesses
      .map(row =>
        row.statuses
          .map(st => (st === "correct" ? (colorblind ? "🟧" : "🟩") : st === "present" ? (colorblind ? "🟦" : "🟨") : "⬛"))
          .join("")
      )
      .join("\n");

    const fullShareText = `${title}\n\n${gridEmojis}\n\nPlayed on Tabriz's Portfolio Arcade`;

    navigator.clipboard.writeText(fullShareText).then(() => {
      showToast("Copied results to clipboard! 📋");
    });
  };

  const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[540px] flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50 gap-1.5 font-mono text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold block">
              LEXICAL CYBER • 6 TRIES
            </span>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
              WORDLE CYBER
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
              onClick={() => setShowStats(true)}
              className="h-8 w-8 border-amber-500/40 text-amber-400 hover:bg-amber-950/60"
              title="Statistics"
            >
              <BarChart2 className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowHelp(true)}
              className="h-8 w-8 border-indigo-500/40 text-indigo-400 hover:bg-indigo-950/60"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Word Length & Mode Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">LETTERS:</span>
            {([4, 5, 6] as const).map(len => (
              <button
                key={len}
                onClick={() => { setWordLength(len); }}
                className={`px-2 py-0.5 rounded transition-all text-xs ${
                  wordLength === len
                    ? "bg-cyan-600 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {len}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setGameMode("daily"); }}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                gameMode === "daily" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold" : "text-slate-400"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => { setGameMode("unlimited"); }}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                gameMode === "unlimited" ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 font-bold" : "text-slate-400"
              }`}
            >
              Practice
            </button>
            {gameMode === "unlimited" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={startNewGame}
                className="h-6 w-6 text-slate-400 hover:text-cyan-400"
                title="New Random Word"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {bannerMessage && (
        <div className="fixed top-16 z-50 animate-bounce bg-slate-900/95 border border-cyan-400/80 text-cyan-300 font-mono text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
          {bannerMessage}
        </div>
      )}

      {/* Main 6xLength Guess Grid */}
      <div className="flex flex-col gap-1.5 sm:gap-2 mb-3">
        {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex];
          const isShaking = isCurrentRow && shakeRow;

          return (
            <div
              key={rowIndex}
              className={`flex justify-center gap-1.5 sm:gap-2 ${isShaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
            >
              {Array.from({ length: wordLength }).map((_, colIndex) => {
                let letter = "";
                let status: LetterStatus = "empty";

                if (guess) {
                  letter = guess.letters[colIndex] || "";
                  status = guess.statuses[colIndex] || "empty";
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || "";
                }

                // Status color styles
                let tileClass = "bg-slate-900/80 border-slate-700/80 text-slate-100";
                if (status === "correct") {
                  tileClass = colorblind
                    ? "bg-orange-500 border-orange-400 text-white shadow-[0_0_12px_rgba(249,115,22,0.6)]"
                    : "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.6)]";
                } else if (status === "present") {
                  tileClass = colorblind
                    ? "bg-sky-500 border-sky-400 text-white shadow-[0_0_12px_rgba(14,165,233,0.6)]"
                    : "bg-amber-500 border-amber-400 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.6)]";
                } else if (status === "absent") {
                  tileClass = "bg-slate-800/90 border-slate-800 text-slate-400";
                } else if (letter) {
                  tileClass = "bg-slate-900 border-cyan-400/70 text-cyan-300 scale-105 shadow-[0_0_10px_rgba(6,182,212,0.3)]";
                }

                return (
                  <div
                    key={colIndex}
                    style={{ transitionDelay: `${colIndex * 60}ms` }}
                    className={`w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 border-2 rounded-xl flex items-center justify-center font-mono font-black text-lg sm:text-2xl uppercase transition-all duration-300 ${tileClass}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* On-Screen Virtual Keyboard */}
      <div className="w-full max-w-[500px] flex flex-col gap-1.5 px-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map(key => {
              const status = keyStatusMap[key];
              let keyBg = "bg-slate-800/90 text-slate-200 border border-slate-700/60 hover:bg-slate-700";

              if (status === "correct") {
                keyBg = colorblind ? "bg-orange-500 text-white border-orange-400" : "bg-emerald-600 text-white border-emerald-500";
              } else if (status === "present") {
                keyBg = colorblind ? "bg-sky-500 text-white border-sky-400" : "bg-amber-500 text-slate-950 font-black border-amber-400";
              } else if (status === "absent") {
                keyBg = "bg-slate-950/90 text-slate-600 border border-slate-900 opacity-60";
              }

              const isWide = key === "ENTER" || key === "BACKSPACE";

              return (
                <button
                  key={key}
                  onClick={() => handleKey(key)}
                  className={`h-11 sm:h-12 rounded-lg font-mono font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center ${
                    isWide ? "px-2.5 sm:px-3 text-[10px] sm:text-xs flex-1 max-w-[65px]" : "flex-1 max-w-[42px]"
                  } ${keyBg}`}
                >
                  {key === "BACKSPACE" ? "⌫" : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Game Over Action Bar */}
      {gameStatus !== "playing" && (
        <div className="mt-3 flex gap-2">
          <Button
            onClick={shareResult}
            className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Result
          </Button>
          <Button
            onClick={startNewGame}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Play Next Word
          </Button>
        </div>
      )}

      {/* Statistics Modal */}
      {showStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm sm:text-base">
                <BarChart2 className="w-5 h-5" />
                <span>STATISTICS & PERFORMANCE</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStats(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-4 gap-2 text-center mb-5">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-xl font-bold text-cyan-400">{stats.played}</span>
                <span className="text-[10px] text-slate-400 block">Played</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-xl font-bold text-emerald-400">
                  {stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0}%
                </span>
                <span className="text-[10px] text-slate-400 block">Win %</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-xl font-bold text-amber-400">{stats.currentStreak}</span>
                <span className="text-[10px] text-slate-400 block">Current</span>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-xl font-bold text-indigo-400">{stats.maxStreak}</span>
                <span className="text-[10px] text-slate-400 block">Max Streak</span>
              </div>
            </div>

            {/* Guess Distribution Bars */}
            <span className="text-xs text-slate-400 font-semibold block mb-2">GUESS DISTRIBUTION</span>
            <div className="space-y-1.5 mb-5">
              {stats.guessDistribution.map((count, idx) => {
                const maxCount = Math.max(1, ...stats.guessDistribution);
                const pct = Math.round((count / maxCount) * 100);
                const isCurrentWinningRow = gameStatus === "won" && guesses.length === idx + 1;

                return (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-400 font-bold">{idx + 1}</span>
                    <div className="flex-1 bg-slate-950 rounded overflow-hidden">
                      <div
                        style={{ width: `${Math.max(7, pct)}%` }}
                        className={`py-0.5 px-2 text-right font-bold text-[10px] rounded transition-all ${
                          isCurrentWinningRow ? "bg-emerald-500 text-slate-950" : "bg-cyan-600/70 text-slate-100"
                        }`}
                      >
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={shareResult}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </Button>
              <Button
                onClick={() => setShowStats(false)}
                variant="outline"
                className="border-slate-700 text-slate-300 font-mono text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-sm w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.2)] font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <HelpCircle className="w-4 h-4" />
                <span>HOW TO PLAY WORDLE CYBER</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </Button>
            </div>

            <p className="text-slate-300">
              Guess the hidden word in 6 tries. Each guess must be a valid English word. Hit Enter to submit.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-emerald-600 rounded flex items-center justify-center font-bold text-white">R</span>
                <span><strong>Green:</strong> In the word and in the correct spot.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-amber-500 rounded flex items-center justify-center font-bold text-slate-950">E</span>
                <span><strong>Yellow:</strong> In the word but in the wrong spot.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-slate-800 rounded flex items-center justify-center font-bold text-slate-400">A</span>
                <span><strong>Gray:</strong> Not in the word in any spot.</span>
              </div>
            </div>

            {/* Colorblind and Hardmode options */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Colorblind Mode (High Contrast):</span>
                <input
                  type="checkbox"
                  checked={colorblind}
                  onChange={e => setColorblind(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-300">Hard Mode (Must reuse clues):</span>
                <input
                  type="checkbox"
                  checked={hardMode}
                  onChange={e => setHardMode(e.target.checked)}
                  className="rounded text-cyan-500 focus:ring-cyan-400"
                />
              </label>
            </div>

            <div className="text-right pt-2">
              <Button
                onClick={() => setShowHelp(false)}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs"
              >
                Got It!
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
