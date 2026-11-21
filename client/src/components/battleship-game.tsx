import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Sparkles, Shield, Anchor, Target, Radio, AlertTriangle,
  Flame, Droplets, CheckCircle2, Shuffle, Trash2, Award, Zap
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

  playSonar() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.08);
      osc.frequency.setValueAtTime(1760, this.ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    } catch {}
  }

  playCannon() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Noise burst + low oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch {}
  }

  playHit() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Impact explosion
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch {}
  }

  playMiss() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Water splash tone
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  playSunk() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Naval distress alarm / horn
      const now = this.ctx.currentTime;
      [320, 240, 180].forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + i * 0.14);

        gain.gain.setValueAtTime(0.12, now + i * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.14);
        osc.stop(now + i * 0.14 + 0.22);
      });
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [440, 554, 659, 880];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch {}
  }

  playDefeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [300, 270, 240, 200];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);
        gain.gain.setValueAtTime(0.15, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.4);
      });
    } catch {}
  }

  playRotate() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.setValueAtTime(750, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {}
  }
}

// --- TYPES & DEFINITIONS ---
export type ShipType = "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
export type Difficulty = "easy" | "medium" | "hard";
export type GamePhase = "PLACEMENT" | "BATTLE" | "GAME_OVER";
export type CellState = "empty" | "ship" | "hit" | "miss";

export interface ShipDef {
  id: ShipType;
  name: string;
  size: number;
  icon: string;
  badge: string;
}

export const FLEET_SHIPS: ShipDef[] = [
  { id: "carrier", name: "Aircraft Carrier", size: 5, icon: "🛫", badge: "CV-01" },
  { id: "battleship", name: "Battleship", size: 4, icon: "🚢", badge: "BB-02" },
  { id: "cruiser", name: "Cruiser", size: 3, icon: "🛳️", badge: "CA-03" },
  { id: "submarine", name: "Submarine", size: 3, icon: "🤿", badge: "SS-04" },
  { id: "destroyer", name: "Destroyer", size: 2, icon: "⚡", badge: "DD-05" },
];

export interface PlacedShip {
  shipId: ShipType;
  r: number;
  c: number;
  horizontal: boolean;
  cells: { r: number; c: number }[];
  hits: number;
  sunk: boolean;
}

export interface CellData {
  r: number;
  c: number;
  state: CellState;
  shipId?: ShipType;
  sunk?: boolean;
}

export interface HallRecord {
  name: string;
  accuracy: number;
  shots: number;
  difficulty: string;
  result: "VICTORY" | "DEFEAT";
  date: string;
}

const ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const COLS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

// Create empty 10x10 grid
function createEmptyGrid(): CellData[][] {
  const grid: CellData[][] = [];
  for (let r = 0; r < 10; r++) {
    const row: CellData[] = [];
    for (let c = 0; c < 10; c++) {
      row.push({ r, c, state: "empty" });
    }
    grid.push(row);
  }
  return grid;
}

// Generate valid random placement for 5 ships
function generateRandomFleet(): { grid: CellData[][]; ships: PlacedShip[] } {
  const grid = createEmptyGrid();
  const ships: PlacedShip[] = [];

  for (const def of FLEET_SHIPS) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 500) {
      attempts++;
      const horizontal = Math.random() < 0.5;
      const r = horizontal ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * (10 - def.size + 1));
      const c = horizontal ? Math.floor(Math.random() * (10 - def.size + 1)) : Math.floor(Math.random() * 10);

      // Check collision
      let valid = true;
      for (let i = 0; i < def.size; i++) {
        const nr = horizontal ? r : r + i;
        const nc = horizontal ? c + i : c;
        if (grid[nr][nc].state === "ship") {
          valid = false;
          break;
        }
      }

      if (valid) {
        const cells: { r: number; c: number }[] = [];
        for (let i = 0; i < def.size; i++) {
          const nr = horizontal ? r : r + i;
          const nc = horizontal ? c + i : c;
          grid[nr][nc].state = "ship";
          grid[nr][nc].shipId = def.id;
          cells.push({ r: nr, c: nc });
        }
        ships.push({
          shipId: def.id,
          r,
          c,
          horizontal,
          cells,
          hits: 0,
          sunk: false,
        });
        placed = true;
      }
    }
  }

  return { grid, ships };
}

// --- HARD AI: Probability Density Heatmap ---
function computeProbabilityHeatmap(
  enemyViewGrid: CellData[][],
  unsunkShips: ShipDef[]
): { r: number; c: number } {
  const heatmap: number[][] = Array(10).fill(0).map(() => Array(10).fill(0));

  // Find all current unsunk hits
  const unsunkHits: { r: number; c: number }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (enemyViewGrid[r][c].state === "hit" && !enemyViewGrid[r][c].sunk) {
        unsunkHits.push({ r, c });
      }
    }
  }

  // Iterate over every unsunk ship and slide across grid
  for (const ship of unsunkShips) {
    const len = ship.size;

    // Horizontal sliding
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c <= 10 - len; c++) {
        let possible = true;
        let hitsCovered = 0;

        for (let i = 0; i < len; i++) {
          const state = enemyViewGrid[r][c + i].state;
          if (state === "miss" || (state === "hit" && enemyViewGrid[r][c + i].sunk)) {
            possible = false;
            break;
          }
          if (state === "hit" && !enemyViewGrid[r][c + i].sunk) {
            hitsCovered++;
          }
        }

        if (possible) {
          const weight = hitsCovered > 0 ? 50 * Math.pow(8, hitsCovered) : 1;
          for (let i = 0; i < len; i++) {
            if (enemyViewGrid[r][c + i].state === "empty" || enemyViewGrid[r][c + i].state === "ship") {
              heatmap[r][c + i] += weight;
            }
          }
        }
      }
    }

    // Vertical sliding
    for (let r = 0; r <= 10 - len; r++) {
      for (let c = 0; c < 10; c++) {
        let possible = true;
        let hitsCovered = 0;

        for (let i = 0; i < len; i++) {
          const state = enemyViewGrid[r + i][c].state;
          if (state === "miss" || (state === "hit" && enemyViewGrid[r + i][c].sunk)) {
            possible = false;
            break;
          }
          if (state === "hit" && !enemyViewGrid[r + i][c].sunk) {
            hitsCovered++;
          }
        }

        if (possible) {
          const weight = hitsCovered > 0 ? 50 * Math.pow(8, hitsCovered) : 1;
          for (let i = 0; i < len; i++) {
            if (enemyViewGrid[r + i][c].state === "empty" || enemyViewGrid[r + i][c].state === "ship") {
              heatmap[r + i][c] += weight;
            }
          }
        }
      }
    }
  }

  // Parity bonus when no unsunk hits are currently active
  if (unsunkHits.length === 0 && unsunkShips.length > 0) {
    const minLen = Math.min(...unsunkShips.map((s) => s.size));
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if ((r + c) % minLen === 0) {
          heatmap[r][c] *= 1.35;
        }
      }
    }
  }

  // Find max cell that has not been shot yet (empty or ship)
  let maxWeight = -1;
  const bestCandidates: { r: number; c: number }[] = [];

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const st = enemyViewGrid[r][c].state;
      if (st === "empty" || st === "ship") {
        const w = heatmap[r][c];
        if (w > maxWeight) {
          maxWeight = w;
          bestCandidates.length = 0;
          bestCandidates.push({ r, c });
        } else if (w === maxWeight) {
          bestCandidates.push({ r, c });
        }
      }
    }
  }

  if (bestCandidates.length > 0) {
    const pick = bestCandidates[Math.floor(Math.random() * bestCandidates.length)];
    return pick;
  }

  // Fallback to random unshot cell
  const unshot: { r: number; c: number }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (enemyViewGrid[r][c].state === "empty" || enemyViewGrid[r][c].state === "ship") {
        unshot.push({ r, c });
      }
    }
  }
  return unshot[Math.floor(Math.random() * unshot.length)] || { r: 0, c: 0 };
}

// --- MEDIUM AI: Hunt & Target Mode ---
function computeMediumAIMove(
  enemyViewGrid: CellData[][]
): { r: number; c: number } {
  // Collect unsunk hits
  const targetHits: { r: number; c: number }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (enemyViewGrid[r][c].state === "hit" && !enemyViewGrid[r][c].sunk) {
        targetHits.push({ r, c });
      }
    }
  }

  // If there are unsunk hits, target adjacent cells
  if (targetHits.length > 0) {
    // If multiple hits, check if in line
    if (targetHits.length >= 2) {
      const isHorizontal = targetHits[0].r === targetHits[1].r;
      const candidates: { r: number; c: number }[] = [];

      if (isHorizontal) {
        const row = targetHits[0].r;
        const cols = targetHits.map((h) => h.c).sort((a, b) => a - b);
        const minC = cols[0];
        const maxC = cols[cols.length - 1];

        if (minC > 0 && (enemyViewGrid[row][minC - 1].state === "empty" || enemyViewGrid[row][minC - 1].state === "ship")) {
          candidates.push({ r: row, c: minC - 1 });
        }
        if (maxC < 9 && (enemyViewGrid[row][maxC + 1].state === "empty" || enemyViewGrid[row][maxC + 1].state === "ship")) {
          candidates.push({ r: row, c: maxC + 1 });
        }
      } else {
        const col = targetHits[0].c;
        const rows = targetHits.map((h) => h.r).sort((a, b) => a - b);
        const minR = rows[0];
        const maxR = rows[rows.length - 1];

        if (minR > 0 && (enemyViewGrid[minR - 1][col].state === "empty" || enemyViewGrid[minR - 1][col].state === "ship")) {
          candidates.push({ r: minR - 1, c: col });
        }
        if (maxR < 9 && (enemyViewGrid[maxR + 1][col].state === "empty" || enemyViewGrid[maxR + 1][col].state === "ship")) {
          candidates.push({ r: maxR + 1, c: col });
        }
      }

      if (candidates.length > 0) {
        return candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    // Try adjacent neighbors of any target hit
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];
    const neighbors: { r: number; c: number }[] = [];
    for (const h of targetHits) {
      for (const d of dirs) {
        const nr = h.r + d.dr;
        const nc = h.c + d.dc;
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
          const st = enemyViewGrid[nr][nc].state;
          if (st === "empty" || st === "ship") {
            neighbors.push({ r: nr, c: nc });
          }
        }
      }
    }
    if (neighbors.length > 0) {
      return neighbors[Math.floor(Math.random() * neighbors.length)];
    }
  }

  // Hunt mode: Checkerboard parity
  const parityUnshot: { r: number; c: number }[] = [];
  const normalUnshot: { r: number; c: number }[] = [];

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const st = enemyViewGrid[r][c].state;
      if (st === "empty" || st === "ship") {
        if ((r + c) % 2 === 0) {
          parityUnshot.push({ r, c });
        } else {
          normalUnshot.push({ r, c });
        }
      }
    }
  }

  if (parityUnshot.length > 0) {
    return parityUnshot[Math.floor(Math.random() * parityUnshot.length)];
  }
  return normalUnshot[Math.floor(Math.random() * normalUnshot.length)] || { r: 0, c: 0 };
}

// --- EASY AI: Pure Random ---
function computeEasyAIMove(
  enemyViewGrid: CellData[][]
): { r: number; c: number } {
  const unshot: { r: number; c: number }[] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const st = enemyViewGrid[r][c].state;
      if (st === "empty" || st === "ship") {
        unshot.push({ r, c });
      }
    }
  }
  return unshot[Math.floor(Math.random() * unshot.length)] || { r: 0, c: 0 };
}

export default function BattleshipGame() {
  // Audio
  const soundRef = useRef<SoundEngine | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game flow states
  const [phase, setPhase] = useState<GamePhase>("PLACEMENT");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [salvoMode, setSalvoMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"radar" | "fleet">("radar"); // mobile tab toggle

  // Placement state
  const [playerGrid, setPlayerGrid] = useState<CellData[][]>(createEmptyGrid);
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>([]);
  const [selectedShipId, setSelectedShipId] = useState<ShipType>("carrier");
  const [isHorizontal, setIsHorizontal] = useState(true);
  const [hoverCoord, setHoverCoord] = useState<{ r: number; c: number } | null>(null);

  // Enemy state
  const [enemyGrid, setEnemyGrid] = useState<CellData[][]>(createEmptyGrid);
  const [enemyShips, setEnemyShips] = useState<PlacedShip[]>([]);

  // Battle status
  const [turn, setTurn] = useState<"PLAYER" | "ENEMY">("PLAYER");
  const [shotsRemaining, setShotsRemaining] = useState(1);
  const [totalPlayerShots, setTotalPlayerShots] = useState(0);
  const [playerHits, setPlayerHits] = useState(0);
  const [totalEnemyShots, setTotalEnemyShots] = useState(0);
  const [enemyHits, setEnemyHits] = useState(0);

  // Sonar Recon power-up (1 use per match)
  const [sonarAvailable, setSonarAvailable] = useState(true);
  const [sonarActive, setSonarActive] = useState(false);
  const [sonarResult, setSonarResult] = useState<string | null>(null);

  // Battle Comm Feed / Log
  const [commLogs, setCommLogs] = useState<string[]>([
    "ADMIRAL ON DECK. Deploy your fleet to battle stations or use Auto-Deploy.",
  ]);

  // Reveal enemy ships on Game Over
  const [revealEnemyFleet, setRevealEnemyFleet] = useState(false);

  // Hall of fame & end debrief
  const [showHallOfFame, setShowHallOfFame] = useState(false);
  const [callsign, setCallsign] = useState("");
  const [savedScore, setSavedScore] = useState(false);
  const [records, setRecords] = useState<HallRecord[]>([]);
  const [gameResult, setGameResult] = useState<"VICTORY" | "DEFEAT">("VICTORY");

  // Initialize Audio
  useEffect(() => {
    soundRef.current = new SoundEngine();
    return () => {
      soundRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.enabled = soundEnabled;
    }
  }, [soundEnabled]);

  // Load records
  useEffect(() => {
    try {
      const saved = localStorage.getItem("battleship_hall_of_fame");
      if (saved) {
        setRecords(JSON.parse(saved));
      } else {
        const defaults: HallRecord[] = [
          { name: "FleetAdmiralNimitz", accuracy: 88, shots: 24, difficulty: "hard", result: "VICTORY", date: "2026-11-20" },
          { name: "CaptainSparrow", accuracy: 76, shots: 31, difficulty: "medium", result: "VICTORY", date: "2026-11-19" },
          { name: "SonarMaster", accuracy: 65, shots: 38, difficulty: "easy", result: "VICTORY", date: "2026-11-18" },
        ];
        setRecords(defaults);
        localStorage.setItem("battleship_hall_of_fame", JSON.stringify(defaults));
      }
    } catch {}
  }, []);

  const addComm = useCallback((msg: string) => {
    setCommLogs((prev) => [msg, ...prev.slice(0, 7)]);
  }, []);

  // Keyboard shortcut for Rotate (R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "r" || e.key === "R") {
        setIsHorizontal((prev) => !prev);
        soundRef.current?.playRotate();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Check valid placement on player grid
  const isValidPlacement = useCallback(
    (shipId: ShipType, r: number, c: number, horiz: boolean, currentShips: PlacedShip[]) => {
      const def = FLEET_SHIPS.find((s) => s.id === shipId);
      if (!def) return false;
      const len = def.size;

      // Bounds
      if (horiz) {
        if (c + len > 10) return false;
      } else {
        if (r + len > 10) return false;
      }

      // Overlap with other placed ships (excluding this ship if re-placing)
      for (const ship of currentShips) {
        if (ship.shipId === shipId) continue;
        for (let i = 0; i < len; i++) {
          const nr = horiz ? r : r + i;
          const nc = horiz ? c + i : c;
          if (ship.cells.some((cell) => cell.r === nr && cell.c === nc)) {
            return false;
          }
        }
      }
      return true;
    },
    []
  );

  // Auto-Deploy Fleet
  const handleAutoDeploy = useCallback(() => {
    const { grid, ships } = generateRandomFleet();
    setPlayerGrid(grid);
    setPlayerShips(ships);
    soundRef.current?.playSonar();
    addComm("FLEET AUTO-DEPLOYED: All 5 naval vessels anchored in tactical formation.");
  }, [addComm]);

  // Clear Fleet
  const handleClearFleet = useCallback(() => {
    setPlayerGrid(createEmptyGrid());
    setPlayerShips([]);
    soundRef.current?.playRotate();
    addComm("FLEET RETRACTED: Dry dock empty. Ready for manual positioning.");
  }, [addComm]);

  // Place single ship via click
  const handlePlacementClick = useCallback(
    (r: number, c: number) => {
      if (phase !== "PLACEMENT") return;

      const def = FLEET_SHIPS.find((s) => s.id === selectedShipId);
      if (!def) return;

      if (!isValidPlacement(selectedShipId, r, c, isHorizontal, playerShips)) {
        soundRef.current?.playMiss();
        return;
      }

      // Remove existing placement of this ship if already present
      const remainingShips = playerShips.filter((s) => s.shipId !== selectedShipId);
      const cells: { r: number; c: number }[] = [];
      for (let i = 0; i < def.size; i++) {
        cells.push({
          r: isHorizontal ? r : r + i,
          c: isHorizontal ? c + i : c,
        });
      }

      const newPlaced: PlacedShip = {
        shipId: selectedShipId,
        r,
        c,
        horizontal: isHorizontal,
        cells,
        hits: 0,
        sunk: false,
      };

      const updatedShips = [...remainingShips, newPlaced];
      setPlayerShips(updatedShips);

      // Rebuild player grid
      const newGrid = createEmptyGrid();
      for (const ship of updatedShips) {
        for (const cell of ship.cells) {
          newGrid[cell.r][cell.c].state = "ship";
          newGrid[cell.r][cell.c].shipId = ship.shipId;
        }
      }
      setPlayerGrid(newGrid);
      soundRef.current?.playSonar();
      addComm(`COMMISSIONED: ${def.name} deployed to [${ROWS[r]}${COLS[c]}].`);

      // Auto-select next unplaced ship if any
      const unplaced = FLEET_SHIPS.find(
        (fs) => !updatedShips.some((us) => us.shipId === fs.id)
      );
      if (unplaced) {
        setSelectedShipId(unplaced.id);
      }
    },
    [phase, selectedShipId, isHorizontal, playerShips, isValidPlacement, addComm]
  );

  // Start Battle
  const handleCommenceBattle = useCallback(() => {
    if (playerShips.length !== 5) {
      addComm("DEPLOYMENT INCOMPLETE: You must place all 5 ships before commencing!");
      return;
    }

    // Generate Enemy Fleet
    const { grid: eGrid, ships: eShips } = generateRandomFleet();
    setEnemyGrid(eGrid);
    setEnemyShips(eShips);

    setPhase("BATTLE");
    setTurn("PLAYER");
    setShotsRemaining(salvoMode ? 5 : 1);
    setTotalPlayerShots(0);
    setPlayerHits(0);
    setTotalEnemyShots(0);
    setEnemyHits(0);
    setSonarAvailable(true);
    setSonarActive(false);
    setSonarResult(null);
    setRevealEnemyFleet(false);
    setSavedScore(false);

    soundRef.current?.playCannon();
    addComm("RED ALERT! ENEMY RADAR LOCKED. Commencing naval bombardment!");
  }, [playerShips, salvoMode, addComm]);

  // Sonar Recon Click on Enemy Radar
  const handleSonarClick = useCallback(
    (centerR: number, centerC: number) => {
      if (!sonarAvailable || !sonarActive || phase !== "BATTLE" || turn !== "PLAYER") return;

      // Scan 3x3 sector
      let detectedSegments = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = centerR + dr;
          const nc = centerC + dc;
          if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
            if (enemyGrid[nr][nc].state === "ship" || enemyGrid[nr][nc].state === "hit") {
              detectedSegments++;
            }
          }
        }
      }

      setSonarAvailable(false);
      setSonarActive(false);
      soundRef.current?.playSonar();

      const sectorName = `${ROWS[Math.max(0, centerR - 1)]}${COLS[Math.max(0, centerC - 1)]} - ${
        ROWS[Math.min(9, centerR + 1)]
      }${COLS[Math.min(9, centerC + 1)]}`;

      if (detectedSegments > 0) {
        const msg = `SONAR PING: Detected ${detectedSegments} vessel hull segments in sector [${sectorName}]!`;
        setSonarResult(msg);
        addComm(msg);
      } else {
        const msg = `SONAR PING: Sector [${sectorName}] is clear water. No vessel contacts.`;
        setSonarResult(msg);
        addComm(msg);
      }
    },
    [sonarAvailable, sonarActive, phase, turn, enemyGrid, addComm]
  );

  // AI Turn Execution
  const executeEnemyTurn = useCallback(() => {
    if (phase !== "BATTLE") return;

    const unsunkPlayerDefs = FLEET_SHIPS.filter((def) => {
      const pShip = playerShips.find((s) => s.shipId === def.id);
      return pShip && !pShip.sunk;
    });

    const shotsCount = salvoMode ? unsunkPlayerDefs.length : 1;
    let shotsTaken = 0;

    let currentGrid = playerGrid.map((r) => r.map((c) => ({ ...c })));
    let currentShips = playerShips.map((s) => ({ ...s, cells: [...s.cells] }));

    const fireNextAIShot = () => {
      if (shotsTaken >= shotsCount) {
        // AI Turn Finished -> Return to Player
        const remainingPlayerUnsunk = currentShips.filter((s) => !s.sunk).length;
        setTurn("PLAYER");
        setShotsRemaining(salvoMode ? remainingPlayerUnsunk : 1);
        return;
      }

      // Pick target based on difficulty
      let target: { r: number; c: number };
      if (difficulty === "hard") {
        target = computeProbabilityHeatmap(currentGrid, unsunkPlayerDefs);
      } else if (difficulty === "medium") {
        target = computeMediumAIMove(currentGrid);
      } else {
        target = computeEasyAIMove(currentGrid);
      }

      const cell = currentGrid[target.r][target.c];
      const isShip = cell.state === "ship";

      setTotalEnemyShots((prev) => prev + 1);

      if (isShip) {
        cell.state = "hit";
        setEnemyHits((prev) => prev + 1);

        // Find ship and update hits
        const hitShip = currentShips.find((s) =>
          s.cells.some((c) => c.r === target.r && c.c === target.c)
        );

        if (hitShip) {
          hitShip.hits += 1;
          soundRef.current?.playHit();

          if (hitShip.hits >= hitShip.cells.length) {
            hitShip.sunk = true;
            // Mark cells as sunk
            for (const sc of hitShip.cells) {
              currentGrid[sc.r][sc.c].sunk = true;
            }
            soundRef.current?.playSunk();
            const def = FLEET_SHIPS.find((s) => s.id === hitShip.shipId);
            addComm(`INCOMING CRITICAL: Enemy torpedo sank our ${def?.name}!`);
          } else {
            addComm(`INCOMING FIRE: Direct hit on our fleet at [${ROWS[target.r]}${COLS[target.c]}]!`);
          }
        }
      } else {
        cell.state = "miss";
        soundRef.current?.playMiss();
        addComm(`ENEMY MISS: Enemy shell splashed harmlessly into [${ROWS[target.r]}${COLS[target.c]}].`);
      }

      setPlayerGrid([...currentGrid]);
      setPlayerShips([...currentShips]);

      // Check Victory/Defeat
      const allPlayerSunk = currentShips.every((s) => s.sunk);
      if (allPlayerSunk) {
        setPhase("GAME_OVER");
        setGameResult("DEFEAT");
        soundRef.current?.playDefeat();
        addComm("FLEET ANNIHILATED: All friendly vessels lost. Mission Failed.");
        return;
      }

      shotsTaken++;
      if (shotsTaken < shotsCount) {
        setTimeout(fireNextAIShot, 400);
      } else {
        setTimeout(() => {
          const remainingPlayerUnsunk = currentShips.filter((s) => !s.sunk).length;
          setTurn("PLAYER");
          setShotsRemaining(salvoMode ? remainingPlayerUnsunk : 1);
        }, 500);
      }
    };

    setTimeout(fireNextAIShot, 500);
  }, [phase, difficulty, salvoMode, playerGrid, playerShips, addComm]);

  // Player Fires at Enemy Radar
  const handleRadarClick = useCallback(
    (r: number, c: number) => {
      if (phase !== "BATTLE" || turn !== "PLAYER") return;
      if (sonarActive) {
        handleSonarClick(r, c);
        return;
      }

      const cell = enemyGrid[r][c];
      if (cell.state === "hit" || cell.state === "miss") {
        return; // already fired
      }

      soundRef.current?.playCannon();
      setTotalPlayerShots((prev) => prev + 1);

      const nextEnemyGrid = enemyGrid.map((row) => row.map((cl) => ({ ...cl })));
      const nextEnemyShips = enemyShips.map((sh) => ({ ...sh, cells: [...sh.cells] }));

      const isShip = cell.state === "ship";

      if (isShip) {
        nextEnemyGrid[r][c].state = "hit";
        setPlayerHits((prev) => prev + 1);
        soundRef.current?.playHit();

        const hitShip = nextEnemyShips.find((s) =>
          s.cells.some((cell) => cell.r === r && cell.c === c)
        );

        if (hitShip) {
          hitShip.hits += 1;
          const def = FLEET_SHIPS.find((s) => s.id === hitShip.shipId);

          if (hitShip.hits >= hitShip.cells.length) {
            hitShip.sunk = true;
            for (const sc of hitShip.cells) {
              nextEnemyGrid[sc.r][sc.c].sunk = true;
            }
            soundRef.current?.playSunk();
            addComm(`CONFIRMED KILL: Enemy ${def?.name} destroyed and sunk at [${ROWS[r]}${COLS[c]}]!`);
          } else {
            addComm(`DIRECT HIT: Enemy vessel struck at [${ROWS[r]}${COLS[c]}]!`);
          }
        }
      } else {
        nextEnemyGrid[r][c].state = "miss";
        soundRef.current?.playMiss();
        addComm(`SPLASH: Shot at [${ROWS[r]}${COLS[c]}] missed into open water.`);
      }

      setEnemyGrid(nextEnemyGrid);
      setEnemyShips(nextEnemyShips);

      // Check player win
      const allEnemySunk = nextEnemyShips.every((s) => s.sunk);
      if (allEnemySunk) {
        setPhase("GAME_OVER");
        setGameResult("VICTORY");
        soundRef.current?.playVictory();
        addComm("GRAND VICTORY: All enemy fleet vessels sunk! Ocean dominance secured!");
        return;
      }

      // Check shots remaining in turn
      const nextShots = shotsRemaining - 1;
      if (nextShots > 0) {
        setShotsRemaining(nextShots);
      } else {
        setShotsRemaining(0);
        setTurn("ENEMY");
        addComm("ENEMY TURN: Hostile acoustic sensors tracking our fleet...");
      }
    },
    [phase, turn, sonarActive, enemyGrid, enemyShips, shotsRemaining, handleSonarClick, addComm]
  );

  // Trigger AI turn after Player turn ends
  useEffect(() => {
    if (phase === "BATTLE" && turn === "ENEMY") {
      executeEnemyTurn();
    }
  }, [phase, turn, executeEnemyTurn]);

  // Save Hall of Fame score
  const handleSaveScore = useCallback(() => {
    if (!callsign.trim() || savedScore) return;
    const accuracy =
      totalPlayerShots > 0 ? Math.round((playerHits / totalPlayerShots) * 100) : 0;

    const newRecord: HallRecord = {
      name: callsign.trim(),
      accuracy,
      shots: totalPlayerShots,
      difficulty,
      result: gameResult,
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => {
        if (a.result !== b.result) return a.result === "VICTORY" ? -1 : 1;
        return b.accuracy - a.accuracy || a.shots - b.shots;
      })
      .slice(0, 10);

    setRecords(updated);
    try {
      localStorage.setItem("battleship_hall_of_fame", JSON.stringify(updated));
    } catch {}
    setSavedScore(true);
    soundRef.current?.playSonar();
  }, [callsign, savedScore, totalPlayerShots, playerHits, difficulty, gameResult, records]);

  // Restart match
  const handleRestart = useCallback(() => {
    setPhase("PLACEMENT");
    setPlayerGrid(createEmptyGrid());
    setPlayerShips([]);
    setSelectedShipId("carrier");
    setIsHorizontal(true);
    setEnemyGrid(createEmptyGrid());
    setEnemyShips([]);
    setTurn("PLAYER");
    setTotalPlayerShots(0);
    setPlayerHits(0);
    setTotalEnemyShots(0);
    setEnemyHits(0);
    setSonarAvailable(true);
    setSonarActive(false);
    setSonarResult(null);
    setRevealEnemyFleet(false);
    setSavedScore(false);
    setCommLogs(["NEW MISSION: Dry dock prepared. Position fleet vessels."]);
    soundRef.current?.playSonar();
  }, []);

  const playerAccuracy =
    totalPlayerShots > 0 ? Math.round((playerHits / totalPlayerShots) * 100) : 0;
  const enemyAccuracy =
    totalEnemyShots > 0 ? Math.round((enemyHits / totalEnemyShots) * 100) : 0;

  // Selected ship definition
  const currentSelectedDef = FLEET_SHIPS.find((s) => s.id === selectedShipId);

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] p-2 sm:p-4 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* --- TV SCOREBOARD & COMMAND HEADER --- */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 sm:p-4 shadow-2xl backdrop-blur-md mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/games">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border-cyan-500/40 font-mono text-xs shadow-md"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                🎮 My Games
              </Button>
            </Link>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-cyan-400 flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse text-cyan-400" />
                WARFARE RADAR v4.2 • ADMIRAL DECK
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>🚢 BATTLESHIP CYBER</span>
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  {difficulty.toUpperCase()} AI
                </span>
                {salvoMode && (
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    SALVO ACTIVE
                  </span>
                )}
              </h1>
            </div>
          </div>

          {/* Action buttons & sound */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="sm"
              className="bg-slate-800 text-slate-300 border-slate-700 hover:text-cyan-400 text-xs px-2.5"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              onClick={() => setShowHallOfFame(true)}
              variant="outline"
              size="sm"
              className="bg-slate-800 text-amber-400 border-amber-500/40 hover:bg-slate-700 text-xs px-3 font-mono"
            >
              <Trophy className="h-3.5 w-3.5 mr-1 text-amber-400" />
              Hall of Fame
            </Button>
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="bg-slate-800 text-cyan-300 border-cyan-500/40 hover:bg-slate-700 text-xs px-3 font-mono"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Restart
            </Button>
          </div>
        </div>

        {/* LED TACTICAL GAUGES */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-center font-mono text-xs">
          <div className="bg-slate-950/70 border border-cyan-900/60 rounded p-1.5">
            <div className="text-[10px] text-slate-400">MISSION PHASE</div>
            <div className="text-sm font-bold text-cyan-400">
              {phase === "PLACEMENT" ? "FLEET PLACEMENT" : phase === "BATTLE" ? (turn === "PLAYER" ? "YOUR TURN" : "ENEMY FIRING") : "COMBAT FINISHED"}
            </div>
          </div>
          <div className="bg-slate-950/70 border border-cyan-900/60 rounded p-1.5">
            <div className="text-[10px] text-slate-400">SALVO SHOTS</div>
            <div className="text-sm font-bold text-amber-300">
              {phase === "BATTLE" ? `${shotsRemaining} Available` : salvoMode ? "SALVO" : "SINGLE SHOT"}
            </div>
          </div>
          <div className="bg-slate-950/70 border border-cyan-900/60 rounded p-1.5">
            <div className="text-[10px] text-slate-400">PLAYER ACCURACY</div>
            <div className="text-sm font-bold text-emerald-400">
              {playerAccuracy}% ({playerHits}/{totalPlayerShots})
            </div>
          </div>
          <div className="bg-slate-950/70 border border-cyan-900/60 rounded p-1.5">
            <div className="text-[10px] text-slate-400">HOSTILE CASUALTIES</div>
            <div className="text-sm font-bold text-rose-400">
              {enemyShips.filter((s) => s.sunk).length} / 5 Sunk
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-slate-950/70 border border-cyan-900/60 rounded p-1.5">
            <div className="text-[10px] text-slate-400">FRIENDLY LOSSES</div>
            <div className="text-sm font-bold text-cyan-300">
              {playerShips.filter((s) => s.sunk).length} / 5 Lost
            </div>
          </div>
        </div>
      </div>

      {/* --- PLACEMENT PHASE CONTROL DOCK --- */}
      {phase === "PLACEMENT" && (
        <div className="w-full max-w-5xl bg-slate-900/80 border border-cyan-500/20 rounded-xl p-4 mb-4 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Ship Selector Dock */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FLEET_SHIPS.map((def) => {
                const placed = playerShips.some((s) => s.shipId === def.id);
                const isSelected = selectedShipId === def.id;
                return (
                  <button
                    key={def.id}
                    onClick={() => {
                      setSelectedShipId(def.id);
                      soundRef.current?.playRotate();
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-lg shadow-cyan-500/20"
                        : placed
                        ? "bg-slate-800/60 border-emerald-500/40 text-emerald-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <span>{def.icon}</span>
                    <span className="font-semibold">{def.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-cyan-300">
                      {def.size}
                    </span>
                    {placed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Placement Actions & Mode Toggles */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => {
                  setIsHorizontal(!isHorizontal);
                  soundRef.current?.playRotate();
                }}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-cyan-500/40 text-cyan-300 hover:bg-slate-700 text-xs font-mono"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Rotate: {isHorizontal ? "HORIZONTAL (R)" : "VERTICAL (R)"}
              </Button>

              <Button
                onClick={handleAutoDeploy}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-emerald-500/40 text-emerald-300 hover:bg-slate-700 text-xs font-mono"
              >
                <Shuffle className="h-3.5 w-3.5 mr-1" />
                Auto-Deploy
              </Button>

              <Button
                onClick={handleClearFleet}
                variant="outline"
                size="sm"
                className="bg-slate-800 border-rose-500/40 text-rose-300 hover:bg-slate-700 text-xs font-mono"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>

              <Button
                onClick={handleCommenceBattle}
                disabled={playerShips.length !== 5}
                size="sm"
                className={`text-xs font-mono font-bold px-4 ${
                  playerShips.length === 5
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30 animate-pulse"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                COMMENCE BATTLE ({playerShips.length}/5)
              </Button>
            </div>
          </div>

          {/* Difficulty & Salvo selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">AI TACTICAL DIFFICULTY:</span>
              {(["easy", "medium", "hard"] as Difficulty[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-2.5 py-1 rounded text-xs uppercase font-bold transition-all ${
                    difficulty === lvl
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-cyan-300">
                <input
                  type="checkbox"
                  checked={salvoMode}
                  onChange={(e) => setSalvoMode(e.target.checked)}
                  className="rounded bg-slate-950 border-cyan-500/40 text-cyan-500 focus:ring-0"
                />
                <span>SALVO COMBAT MODE (Multiple shots per turn)</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* --- IN-BATTLE POWER-UPS & SONAR RECON BAR --- */}
      {phase === "BATTLE" && (
        <div className="w-full max-w-5xl bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3 mb-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                if (sonarAvailable && turn === "PLAYER") {
                  setSonarActive(!sonarActive);
                  soundRef.current?.playSonar();
                }
              }}
              disabled={!sonarAvailable || turn !== "PLAYER"}
              size="sm"
              className={`font-mono text-xs ${
                sonarActive
                  ? "bg-cyan-400 text-slate-950 animate-pulse font-bold"
                  : sonarAvailable
                  ? "bg-slate-800 border border-cyan-500/40 text-cyan-300 hover:bg-slate-700"
                  : "bg-slate-800/40 text-slate-500 border border-slate-800 cursor-not-allowed"
              }`}
            >
              <Radio className="h-3.5 w-3.5 mr-1.5" />
              {sonarActive
                ? "CLICK 3×3 ENEMY SECTOR TO SCAN"
                : sonarAvailable
                ? "DEPLOY SONAR RECON (1 Use)"
                : "SONAR DISCHARGED"}
            </Button>

            {sonarResult && (
              <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded">
                {sonarResult}
              </span>
            )}
          </div>

          {/* Mobile view switchers */}
          <div className="flex md:hidden items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setActiveTab("radar")}
              size="sm"
              className={`flex-1 text-xs font-mono ${
                activeTab === "radar" ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
              }`}
            >
              🎯 Enemy Radar
            </Button>
            <Button
              onClick={() => setActiveTab("fleet")}
              size="sm"
              className={`flex-1 text-xs font-mono ${
                activeTab === "fleet" ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-800 text-slate-300"
              }`}
            >
              🛡️ My Fleet
            </Button>
          </div>
        </div>
      )}

      {/* --- GRIDS DISPLAY AREA --- */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {/* === BOARD 1: MY FLEET GRID (Placement / Defensive View) === */}
        <div
          className={`flex flex-col items-center bg-slate-900/90 border rounded-xl p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all ${
            turn === "ENEMY" && phase === "BATTLE"
              ? "border-rose-500/50 shadow-rose-500/10"
              : "border-cyan-500/30"
          } ${phase === "BATTLE" && activeTab !== "fleet" ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">Friendly Fleet Command</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {playerShips.filter((s) => !s.sunk).length} / 5 Vessels Operational
            </div>
          </div>

          {/* 10x10 Grid with row/col labels */}
          <div className="inline-block bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800 shadow-inner">
            {/* Col headers: 1-10 */}
            <div className="grid grid-cols-11 text-center font-mono text-[10px] sm:text-xs text-slate-400 mb-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7"></div>
              {COLS.map((col) => (
                <div key={col} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-cyan-400">
                  {col}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {playerGrid.map((row, r) => (
              <div key={r} className="grid grid-cols-11 text-center items-center">
                {/* Row header: A-J */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-cyan-400">
                  {ROWS[r]}
                </div>

                {row.map((cell, c) => {
                  // Check hover preview during placement
                  let isHovered = false;
                  let isValidHover = false;
                  if (phase === "PLACEMENT" && hoverCoord && currentSelectedDef) {
                    const len = currentSelectedDef.size;
                    if (isHorizontal) {
                      if (hoverCoord.r === r && c >= hoverCoord.c && c < hoverCoord.c + len) {
                        isHovered = true;
                        isValidHover = isValidPlacement(
                          selectedShipId,
                          hoverCoord.r,
                          hoverCoord.c,
                          true,
                          playerShips
                        );
                      }
                    } else {
                      if (hoverCoord.c === c && r >= hoverCoord.r && r < hoverCoord.r + len) {
                        isHovered = true;
                        isValidHover = isValidPlacement(
                          selectedShipId,
                          hoverCoord.r,
                          hoverCoord.c,
                          false,
                          playerShips
                        );
                      }
                    }
                  }

                  const isShip = cell.state === "ship";
                  const isHit = cell.state === "hit";
                  const isMiss = cell.state === "miss";

                  return (
                    <button
                      key={c}
                      onClick={() => handlePlacementClick(r, c)}
                      onMouseEnter={() => setHoverCoord({ r, c })}
                      onMouseLeave={() => setHoverCoord(null)}
                      disabled={phase !== "PLACEMENT"}
                      className={`w-6 h-6 sm:w-7 sm:h-7 border border-slate-800/80 rounded-sm m-[0.5px] relative flex items-center justify-center transition-all ${
                        isHovered
                          ? isValidHover
                            ? "bg-emerald-500/40 border-emerald-400 shadow-md shadow-emerald-500/20"
                            : "bg-rose-500/40 border-rose-400 shadow-md shadow-rose-500/20"
                          : isHit
                          ? cell.sunk
                            ? "bg-rose-950/90 border-rose-600 shadow-inner"
                            : "bg-amber-950/90 border-amber-500 animate-pulse"
                          : isMiss
                          ? "bg-slate-900 border-slate-700"
                          : isShip
                          ? "bg-gradient-to-br from-cyan-700 to-blue-900 border-cyan-400 shadow-sm"
                          : "bg-slate-950 hover:bg-slate-900/60"
                      }`}
                    >
                      {/* Ship Icon / Graphic Part */}
                      {isShip && !isHit && (
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-300"></div>
                      )}
                      {isHit && (
                        <span className="text-xs sm:text-sm animate-bounce select-none">
                          {cell.sunk ? "💀" : "🔥"}
                        </span>
                      )}
                      {isMiss && (
                        <span className="text-xs text-sky-400 select-none">💧</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Friendly Ships Status List */}
          <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
            {FLEET_SHIPS.map((def) => {
              const pShip = playerShips.find((s) => s.shipId === def.id);
              const isSunk = pShip?.sunk;
              const hits = pShip?.hits || 0;
              return (
                <div
                  key={def.id}
                  className={`flex items-center justify-between p-1 px-2 rounded border ${
                    isSunk
                      ? "bg-rose-950/40 border-rose-800 text-rose-400 line-through"
                      : pShip
                      ? "bg-slate-950 border-cyan-900/60 text-cyan-200"
                      : "bg-slate-950/40 border-slate-800 text-slate-500"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{def.icon}</span>
                    <span className="truncate">{def.name}</span>
                  </span>
                  <span className="font-bold">
                    {isSunk ? "SUNK" : `${hits}/${def.size}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* === BOARD 2: ENEMY RADAR GRID (Targeting View) === */}
        <div
          className={`flex flex-col items-center bg-slate-900/90 border rounded-xl p-3 sm:p-4 shadow-xl backdrop-blur-md transition-all ${
            turn === "PLAYER" && phase === "BATTLE"
              ? "border-emerald-500/50 shadow-emerald-500/10"
              : "border-cyan-500/30"
          } ${phase === "BATTLE" && activeTab !== "radar" ? "hidden md:flex" : "flex"}`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between pb-2 mb-3 border-b border-slate-800 font-mono text-xs">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-400 animate-spin" />
              <span className="font-bold text-white uppercase">Tactical Radar & Fire Control</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {enemyShips.filter((s) => s.sunk).length} / 5 Enemy Ships Sunk
            </div>
          </div>

          {/* 10x10 Enemy Grid */}
          <div className="inline-block bg-slate-950 p-2 sm:p-3 rounded-lg border border-slate-800 shadow-inner relative overflow-hidden">
            {/* Subtle radar scanline sweep effect */}
            {phase === "BATTLE" && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent h-12 w-full animate-radar-sweep" />
            )}

            {/* Col headers: 1-10 */}
            <div className="grid grid-cols-11 text-center font-mono text-[10px] sm:text-xs text-slate-400 mb-1">
              <div className="w-6 h-6 sm:w-7 sm:h-7"></div>
              {COLS.map((col) => (
                <div key={col} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-bold text-rose-400">
                  {col}
                </div>
              ))}
            </div>

            {/* Grid rows */}
            {enemyGrid.map((row, r) => (
              <div key={r} className="grid grid-cols-11 text-center items-center">
                {/* Row header: A-J */}
                <div className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center font-mono font-bold text-[10px] sm:text-xs text-rose-400">
                  {ROWS[r]}
                </div>

                {row.map((cell, c) => {
                  const isHit = cell.state === "hit";
                  const isMiss = cell.state === "miss";
                  const isRevealed = revealEnemyFleet && cell.state === "ship";

                  return (
                    <button
                      key={c}
                      onClick={() => handleRadarClick(r, c)}
                      disabled={phase !== "BATTLE" || turn !== "PLAYER" || isHit || isMiss}
                      className={`w-6 h-6 sm:w-7 sm:h-7 border border-slate-800/80 rounded-sm m-[0.5px] relative flex items-center justify-center transition-all ${
                        isHit
                          ? cell.sunk
                            ? "bg-rose-950/90 border-rose-600 shadow-md shadow-rose-500/30"
                            : "bg-amber-950/90 border-amber-500 animate-pulse shadow-md shadow-amber-500/20"
                          : isMiss
                          ? "bg-slate-900 border-slate-700"
                          : isRevealed
                          ? "bg-purple-900/40 border-purple-500/60"
                          : phase === "BATTLE" && turn === "PLAYER"
                          ? "bg-slate-950 hover:bg-rose-950/30 hover:border-rose-500/60 cursor-crosshair"
                          : "bg-slate-950"
                      }`}
                    >
                      {isHit && (
                        <span className="text-xs sm:text-sm select-none">
                          {cell.sunk ? "💥" : "🔥"}
                        </span>
                      )}
                      {isMiss && (
                        <span className="text-xs text-sky-400 select-none">💧</span>
                      )}
                      {isRevealed && !isHit && (
                        <span className="text-[10px] text-purple-400 select-none">⚓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Enemy Fleet Recon Status */}
          <div className="w-full mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[10px]">
            {FLEET_SHIPS.map((def) => {
              const eShip = enemyShips.find((s) => s.shipId === def.id);
              const isSunk = eShip?.sunk;
              return (
                <div
                  key={def.id}
                  className={`flex items-center justify-between p-1 px-2 rounded border ${
                    isSunk
                      ? "bg-rose-950/60 border-rose-700 text-rose-300 line-through"
                      : "bg-slate-950 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{def.icon}</span>
                    <span className="truncate">{def.name}</span>
                  </span>
                  <span className="font-bold">
                    {isSunk ? "DESTROYED" : `Size: ${def.size}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- COMM LOG & TACTICAL TELEMETRY FEED --- */}
      <div className="w-full max-w-5xl bg-slate-950 border border-cyan-500/20 rounded-xl p-3 mt-4 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold mb-2 pb-1 border-b border-slate-800">
          <span className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            COMMUNICATION & TELEMETRY LOG
          </span>
          <span className="text-slate-500">REAL-TIME DATA LINK</span>
        </div>
        <div className="space-y-1">
          {commLogs.map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                idx === 0
                  ? "text-cyan-200 font-bold animate-fadeIn"
                  : "text-slate-500 text-[11px]"
              }`}
            >
              <span className="text-cyan-500">›</span>
              <span>{log}</span>
            </div>
          ))}
        </div>
      </div>

      {/* --- GAME OVER / VICTORY DEBRIEF MODAL --- */}
      {phase === "GAME_OVER" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-center relative overflow-hidden">
            <div className="text-4xl mb-2">
              {gameResult === "VICTORY" ? "🏆" : "⚓"}
            </div>
            <h2
              className={`text-2xl font-black font-mono tracking-wider ${
                gameResult === "VICTORY" ? "text-cyan-400" : "text-rose-500"
              }`}
            >
              {gameResult === "VICTORY" ? "NAVAL VICTORY!" : "FLEET DEFEATED!"}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1 mb-4">
              {gameResult === "VICTORY"
                ? "Enemy squadron annihilated. You control the seas!"
                : "All friendly ships sunk. Retreating to safe waters."}
            </p>

            {/* Performance Stats */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-4 text-xs font-mono grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-slate-400">Total Shots:</span>
                <span className="float-right text-cyan-300 font-bold">{totalPlayerShots}</span>
              </div>
              <div>
                <span className="text-slate-400">Accuracy:</span>
                <span className="float-right text-emerald-400 font-bold">{playerAccuracy}%</span>
              </div>
              <div>
                <span className="text-slate-400">Enemy Sunk:</span>
                <span className="float-right text-rose-400 font-bold">
                  {enemyShips.filter((s) => s.sunk).length} / 5
                </span>
              </div>
              <div>
                <span className="text-slate-400">Difficulty:</span>
                <span className="float-right text-amber-300 uppercase font-bold">{difficulty}</span>
              </div>
            </div>

            {/* Callsign Input for Leaderboard */}
            <div className="mb-4">
              <label className="block text-left text-xs font-mono text-slate-400 mb-1">
                ENTER ADMIRAL CALLSIGN:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={16}
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="e.g. Admiral Nimitz"
                  disabled={savedScore}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
                <Button
                  onClick={handleSaveScore}
                  disabled={!callsign.trim() || savedScore}
                  size="sm"
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold px-3"
                >
                  {savedScore ? "Saved!" : "Save"}
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => setRevealEnemyFleet(!revealEnemyFleet)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-800 border-slate-700 text-xs font-mono text-slate-300 hover:text-white"
                >
                  {revealEnemyFleet ? "Hide Enemy Fleet" : "Reveal Enemy Fleet"}
                </Button>
                <Button
                  onClick={() => setShowHallOfFame(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-slate-800 border-amber-500/40 text-xs font-mono text-amber-400 hover:bg-slate-700"
                >
                  <Trophy className="h-3.5 w-3.5 mr-1" />
                  Hall of Fame
                </Button>
              </div>
              <Button
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-mono text-xs font-bold py-2"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                PLAY REMATCH
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- HALL OF FAME MODAL --- */}
      {showHallOfFame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  NAVAL ADMIRALTY HALL OF FAME
                </h3>
              </div>
              <button
                onClick={() => setShowHallOfFame(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No naval records recorded yet.</div>
              ) : (
                records.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-950 p-2.5 rounded border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 font-bold text-slate-500 text-center">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-slate-200">{rec.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          rec.result === "VICTORY"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {rec.result}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 uppercase text-[10px]">
                        {rec.difficulty}
                      </span>
                      <span className="font-bold text-cyan-400">{rec.accuracy}% ACC</span>
                      <span className="text-slate-500 text-[10px]">({rec.shots} shots)</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 text-right">
              <Button
                onClick={() => setShowHallOfFame(false)}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold font-mono text-xs px-4"
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
