import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  Trophy, RotateCcw, Volume2, VolumeX, ArrowLeft,
  Bot, Users, Dices, Undo2, Award, Sparkles, CheckCircle2, Shield
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

  playDiceRoll() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Clattering wooden dice rattle
      for (let i = 0; i < 4; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(180 + Math.random() * 220, this.ctx.currentTime + i * 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.05 + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + i * 0.05);
        osc.stop(this.ctx.currentTime + i * 0.05 + 0.06);
      }
    } catch {}
  }

  playCheckerMove() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Wood-on-felt solid clack
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {}
  }

  playHitBlot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      // Sharp knock sound for hitting a blot
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  playBearOff() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4 to C6 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
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

// --- DATA STRUCTURES ---
// Player 1 = White (Ivory/Gold), moves from Point 24 -> 1. Borne off at Point 0.
// Player 2 = Black (Obsidian/Silver), moves from Point 1 -> 24. Borne off at Point 25.
type Player = 1 | 2;

interface PointData {
  pointIndex: number; // 1 to 24
  player: Player | null;
  count: number;
}

interface MoveStep {
  from: number; // 1-24 or 'bar' (-1 for P1 bar, -2 for P2 bar)
  to: number;   // 1-24 or 'off' (0 for P1 off, 25 for P2 off)
  dieUsed: number;
  hit: boolean;
}

interface LeaderboardRecord {
  id: string;
  name: string;
  wins: number;
  matchType: string;
  date: string;
}

// Initial Standard Backgammon Layout (Qısa Nərd)
const createInitialPoints = (): PointData[] => {
  const points: PointData[] = Array.from({ length: 24 }, (_, i) => ({
    pointIndex: i + 1,
    player: null,
    count: 0,
  }));

  // Standard Setup:
  // Point 24: 2 White (P1)
  // Point 13: 5 White (P1)
  // Point 8: 3 White (P1)
  // Point 6: 5 White (P1)
  //
  // Point 1: 2 Black (P2)
  // Point 12: 5 Black (P2)
  // Point 17: 3 Black (P2)
  // Point 19: 5 Black (P2)
  const setP = (pt: number, player: Player, count: number) => {
    points[pt - 1] = { pointIndex: pt, player, count };
  };

  setP(24, 1, 2);
  setP(13, 1, 5);
  setP(8, 1, 3);
  setP(6, 1, 5);

  setP(1, 2, 2);
  setP(12, 2, 5);
  setP(17, 2, 3);
  setP(19, 2, 5);

  return points;
};

// Initial Long Nards Layout (Uzun Nərd: all 15 checkers start at the head)
const createLongNardsInitialPoints = (): PointData[] => {
  const points: PointData[] = Array.from({ length: 24 }, (_, i) => ({
    pointIndex: i + 1,
    player: null,
    count: 0,
  }));

  points[23] = { pointIndex: 24, player: 1, count: 15 };
  points[11] = { pointIndex: 12, player: 2, count: 15 };

  return points;
};

export default function BackgammonGame() {
  const [variant, setVariant] = useState<"standard" | "long">("standard");
  const [gameMode, setGameMode] = useState<"ai" | "pvp">("ai");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const [points, setPoints] = useState<PointData[]>(createInitialPoints);
  const [barP1, setBarP1] = useState<number>(0); // White on bar
  const [barP2, setBarP2] = useState<number>(0); // Black on bar
  const [offP1, setOffP1] = useState<number>(0); // White borne off
  const [offP2, setOffP2] = useState<number>(0); // Black borne off

  const [turn, setTurn] = useState<Player>(1);
  const [dice, setDice] = useState<number[]>([]);
  const [movesRemaining, setMovesRemaining] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [hasRolled, setHasRolled] = useState<boolean>(false);
  const [selectedOrigin, setSelectedOrigin] = useState<number | "bar" | null>(null);
  const [turnHistory, setTurnHistory] = useState<MoveStep[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [winType, setWinType] = useState<"single" | "gammon" | "backgammon">("single");
  const [doublingCube, setDoublingCube] = useState<number>(1);
  const [matchScore, setMatchScore] = useState({ p1: 0, p2: 0 });

  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [showRecords, setShowRecords] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>("");
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);

  // Load Saved Records
  useEffect(() => {
    const saved = localStorage.getItem("backgammon_cyber_records");
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch {}
    } else {
      const defaults: LeaderboardRecord[] = [
        { id: "1", name: "GrandmasterNard", wins: 18, matchType: "Standard", date: "2026-11-20" },
        { id: "2", name: "BakuDiceKing", wins: 12, matchType: "Long Nards", date: "2026-11-19" },
        { id: "3", name: "TavlaPro", wins: 8, matchType: "Standard", date: "2026-11-18" },
      ];
      setRecords(defaults);
      localStorage.setItem("backgammon_cyber_records", JSON.stringify(defaults));
    }
  }, []);

  // Check if player is ready to Bear Off (all 15 checkers in home board or off)
  const canBearOff = useCallback(
    (player: Player, currentPoints: PointData[], currentBar: number): boolean => {
      if (currentBar > 0) return false;
      let outsideHome = 0;

      currentPoints.forEach(p => {
        if (p.player === player) {
          if (player === 1 && p.pointIndex > 6) outsideHome += p.count;
          if (player === 2 && p.pointIndex < 19) outsideHome += p.count;
        }
      });

      return outsideHome === 0;
    },
    []
  );

  // Compute legal destination points for a chosen checker given remaining moves
  const getLegalDestinations = useCallback(
    (
      origin: number | "bar",
      player: Player,
      availableDice: number[],
      currentPoints: PointData[],
      currentBar: number
    ): { to: number; die: number; hit: boolean }[] => {
      const legal: { to: number; die: number; hit: boolean }[] = [];
      const opp: Player = player === 1 ? 2 : 1;
      const uniqueDice = Array.from(new Set(availableDice));

      // If checker on bar, MUST move from bar first!
      if (currentBar > 0 && origin !== "bar") {
        return [];
      }

      uniqueDice.forEach(die => {
        if (origin === "bar") {
          // Re-enter from bar
          const targetPt = player === 1 ? 25 - die : die;
          const targetPoint = currentPoints[targetPt - 1];

          // Cannot land if 2+ opponent checkers
          if (targetPoint.player === opp && targetPoint.count >= 2) return;

          const isHit = targetPoint.player === opp && targetPoint.count === 1;
          legal.push({ to: targetPt, die, hit: isHit });
        } else {
          // Moving from a normal point
          const fromPt = origin as number;
          const targetPt = player === 1 ? fromPt - die : fromPt + die;

          // Check Normal Movement on board
          if (targetPt >= 1 && targetPt <= 24) {
            const targetPoint = currentPoints[targetPt - 1];
            if (targetPoint.player === opp && targetPoint.count >= 2) {
              return; // Blocked by prime
            }
            const isHit = targetPoint.player === opp && targetPoint.count === 1;
            legal.push({ to: targetPt, die, hit: isHit });
          } else {
            // Bearing Off Attempt (targetPt <= 0 for P1, targetPt >= 25 for P2)
            if (canBearOff(player, currentPoints, currentBar)) {
              if (player === 1 && targetPt <= 0) {
                // Exact bear off or furthest back checker if die is larger
                if (fromPt === die) {
                  legal.push({ to: 0, die, hit: false });
                } else if (fromPt < die) {
                  // Check if any checker is behind fromPt in home board (points > fromPt up to 6)
                  let hasCheckerBehind = false;
                  for (let p = fromPt + 1; p <= 6; p++) {
                    if (currentPoints[p - 1].player === 1 && currentPoints[p - 1].count > 0) {
                      hasCheckerBehind = true;
                      break;
                    }
                  }
                  if (!hasCheckerBehind) {
                    legal.push({ to: 0, die, hit: false });
                  }
                }
              } else if (player === 2 && targetPt >= 25) {
                const distanceToHomeEdge = 25 - fromPt;
                if (distanceToHomeEdge === die) {
                  legal.push({ to: 25, die, hit: false });
                } else if (distanceToHomeEdge < die) {
                  let hasCheckerBehind = false;
                  for (let p = 19; p < fromPt; p++) {
                    if (currentPoints[p - 1].player === 2 && currentPoints[p - 1].count > 0) {
                      hasCheckerBehind = true;
                      break;
                    }
                  }
                  if (!hasCheckerBehind) {
                    legal.push({ to: 25, die, hit: false });
                  }
                }
              }
            }
          }
        }
      });

      return legal;
    },
    [canBearOff]
  );

  // Check if player has ANY legal moves with current dice
  const hasAnyLegalMoves = useCallback(
    (player: Player, availableDice: number[], currentPoints: PointData[], currentBar: number): boolean => {
      if (availableDice.length === 0) return false;

      if (currentBar > 0) {
        const barMoves = getLegalDestinations("bar", player, availableDice, currentPoints, currentBar);
        return barMoves.length > 0;
      }

      for (let i = 0; i < 24; i++) {
        const pt = currentPoints[i];
        if (pt.player === player && pt.count > 0) {
          const moves = getLegalDestinations(pt.pointIndex, player, availableDice, currentPoints, currentBar);
          if (moves.length > 0) return true;
        }
      }

      return false;
    },
    [getLegalDestinations]
  );

  // Roll Dice
  const rollDice = useCallback(() => {
    if (isRolling || hasRolled || winner !== null) return;
    setIsRolling(true);
    sounds.playDiceRoll();

    setTimeout(() => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const newDice = [d1, d2];
      const moves = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];

      setDice(newDice);
      setMovesRemaining(moves);
      setHasRolled(true);
      setIsRolling(false);
      setTurnHistory([]);
      setSelectedOrigin(null);

      // Auto check if no legal moves exist
      const barCount = turn === 1 ? barP1 : barP2;
      const canMove = hasAnyLegalMoves(turn, moves, points, barCount);
      if (!canMove) {
        setTimeout(() => {
          // Pass turn
          setTurn(prev => (prev === 1 ? 2 : 1));
          setHasRolled(false);
          setMovesRemaining([]);
        }, 1200);
      }
    }, 450);
  }, [isRolling, hasRolled, winner, turn, barP1, barP2, hasAnyLegalMoves, points]);

  // Execute a Single Move Step
  const executeMove = useCallback(
    (from: number | "bar", to: number, dieUsed: number, hit: boolean) => {
      const newPoints = points.map(p => ({ ...p }));
      let newBarP1 = barP1;
      let newBarP2 = barP2;
      let newOffP1 = offP1;
      let newOffP2 = offP2;

      // 1. Remove from origin
      if (from === "bar") {
        if (turn === 1) newBarP1--;
        else newBarP2--;
      } else {
        const originPt = newPoints[from - 1];
        originPt.count--;
        if (originPt.count === 0) originPt.player = null;
      }

      // 2. Add to destination
      if (to === 0) {
        // P1 Bear off
        newOffP1++;
        sounds.playBearOff();
      } else if (to === 25) {
        // P2 Bear off
        newOffP2++;
        sounds.playBearOff();
      } else {
        const targetPt = newPoints[to - 1];
        if (hit) {
          // Enemy blot sent to bar!
          sounds.playHitBlot();
          if (turn === 1) newBarP2++;
          else newBarP1++;
          targetPt.player = turn;
          targetPt.count = 1;
        } else {
          sounds.playCheckerMove();
          targetPt.player = turn;
          targetPt.count++;
        }
      }

      // 3. Consume die from movesRemaining
      const newMoves = [...movesRemaining];
      const dieIdx = newMoves.indexOf(dieUsed);
      if (dieIdx >= 0) newMoves.splice(dieIdx, 1);

      // 4. Update Turn History for Undo
      setTurnHistory(prev => [...prev, { from, to, dieUsed, hit }]);
      setPoints(newPoints);
      setBarP1(newBarP1);
      setBarP2(newBarP2);
      setOffP1(newOffP1);
      setOffP2(newOffP2);
      setMovesRemaining(newMoves);
      setSelectedOrigin(null);

      // 5. Check Victory
      if (newOffP1 >= 15) {
        sounds.playVictory();
        setWinner(1);
        const isGammon = newOffP2 === 0;
        const isBackgammon = isGammon && (newBarP2 > 0 || newPoints.slice(0, 6).some(p => p.player === 2));
        const type = isBackgammon ? "backgammon" : isGammon ? "gammon" : "single";
        setWinType(type);
        const pts = (type === "backgammon" ? 3 : type === "gammon" ? 2 : 1) * doublingCube;
        setMatchScore(s => ({ ...s, p1: s.p1 + pts }));
        return;
      }
      if (newOffP2 >= 15) {
        sounds.playVictory();
        setWinner(2);
        const isGammon = newOffP1 === 0;
        const isBackgammon = isGammon && (newBarP1 > 0 || newPoints.slice(18).some(p => p.player === 1));
        const type = isBackgammon ? "backgammon" : isGammon ? "gammon" : "single";
        setWinType(type);
        const pts = (type === "backgammon" ? 3 : type === "gammon" ? 2 : 1) * doublingCube;
        setMatchScore(s => ({ ...s, p2: s.p2 + pts }));
        return;
      }

      // 6. Check if turn should end (no moves remaining or no legal moves available)
      const currentBar = turn === 1 ? newBarP1 : newBarP2;
      const canMoveMore = hasAnyLegalMoves(turn, newMoves, newPoints, currentBar);

      if (newMoves.length === 0 || !canMoveMore) {
        setTimeout(() => {
          setTurn(prev => (prev === 1 ? 2 : 1));
          setHasRolled(false);
          setMovesRemaining([]);
          setTurnHistory([]);
        }, 500);
      }
    },
    [points, barP1, barP2, offP1, offP2, turn, movesRemaining, doublingCube, hasAnyLegalMoves]
  );

  // Undo Last Move in current turn
  const undoLastMove = () => {
    if (turnHistory.length === 0 || winner !== null) return;
    const last = turnHistory[turnHistory.length - 1];

    const newPoints = points.map(p => ({ ...p }));
    let newBarP1 = barP1;
    let newBarP2 = barP2;
    let newOffP1 = offP1;
    let newOffP2 = offP2;

    // Revert destination
    if (last.to === 0) newOffP1--;
    else if (last.to === 25) newOffP2--;
    else {
      const destPt = newPoints[last.to - 1];
      if (last.hit) {
        // Restore hit blot
        destPt.player = turn === 1 ? 2 : 1;
        destPt.count = 1;
        if (turn === 1) newBarP2--;
        else newBarP1--;
      } else {
        destPt.count--;
        if (destPt.count === 0) destPt.player = null;
      }
    }

    // Revert origin
    if (last.from === "bar") {
      if (turn === 1) newBarP1++;
      else newBarP2++;
    } else {
      const origPt = newPoints[last.from - 1];
      origPt.player = turn;
      origPt.count++;
    }

    setPoints(newPoints);
    setBarP1(newBarP1);
    setBarP2(newBarP2);
    setOffP1(newOffP1);
    setOffP2(newOffP2);
    setMovesRemaining(prev => [...prev, last.dieUsed]);
    setTurnHistory(prev => prev.slice(0, -1));
    setSelectedOrigin(null);
  };

  // AI Turn Execution (Cyber Heuristic AI for Player 2)
  useEffect(() => {
    if (gameMode !== "ai" || turn !== 2 || winner !== null) return;

    if (!hasRolled && !isRolling) {
      // Trigger AI Dice Roll
      const rollTimer = setTimeout(() => {
        rollDice();
      }, 700);
      return () => clearTimeout(rollTimer);
    }

    if (hasRolled && movesRemaining.length > 0) {
      const moveTimer = setTimeout(() => {
        // Collect all possible moves for AI
        const allLegalMoves: { from: number | "bar"; to: number; dieUsed: number; hit: boolean; score: number }[] = [];

        if (barP2 > 0) {
          const dests = getLegalDestinations("bar", 2, movesRemaining, points, barP2);
          dests.forEach(d => {
            allLegalMoves.push({
              from: "bar",
              to: d.to,
              dieUsed: d.die,
              hit: d.hit,
              score: d.hit ? 80 : 20,
            });
          });
        } else {
          for (let p = 1; p <= 24; p++) {
            if (points[p - 1].player === 2 && points[p - 1].count > 0) {
              const dests = getLegalDestinations(p, 2, movesRemaining, points, barP2);
              dests.forEach(d => {
                let moveScore = 10;
                if (d.to === 25) moveScore += 100; // Bear off highest priority
                if (d.hit) moveScore += 90; // Hitting enemy blot high priority
                // Making a point / building barrier
                if (d.to >= 1 && d.to <= 24 && points[d.to - 1].player === 2) {
                  moveScore += 35;
                }
                // Escaping back checkers
                if (p <= 6) moveScore += 25;
                allLegalMoves.push({
                  from: p,
                  to: d.to,
                  dieUsed: d.die,
                  hit: d.hit,
                  score: moveScore,
                });
              });
            }
          }
        }

        if (allLegalMoves.length > 0) {
          // Sort by highest heuristic score
          allLegalMoves.sort((a, b) => b.score - a.score);
          const chosen = allLegalMoves[0];
          executeMove(chosen.from, chosen.to, chosen.dieUsed, chosen.hit);
        }
      }, 650);

      return () => clearTimeout(moveTimer);
    }
  }, [
    turn,
    gameMode,
    hasRolled,
    isRolling,
    movesRemaining,
    winner,
    rollDice,
    barP2,
    points,
    getLegalDestinations,
    executeMove,
  ]);

  // Restart Match
  const restartMatch = () => {
    setPoints(variant === "standard" ? createInitialPoints() : createLongNardsInitialPoints());
    setBarP1(0);
    setBarP2(0);
    setOffP1(0);
    setOffP2(0);
    setTurn(1);
    setDice([]);
    setMovesRemaining([]);
    setHasRolled(false);
    setSelectedOrigin(null);
    setTurnHistory([]);
    setWinner(null);
    setDoublingCube(1);
  };

  // Switch Variant
  const handleVariantChange = (newVar: "standard" | "long") => {
    setVariant(newVar);
    setPoints(newVar === "standard" ? createInitialPoints() : createLongNardsInitialPoints());
    setBarP1(0);
    setBarP2(0);
    setOffP1(0);
    setOffP2(0);
    setTurn(1);
    setDice([]);
    setMovesRemaining([]);
    setHasRolled(false);
    setSelectedOrigin(null);
    setTurnHistory([]);
    setWinner(null);
  };

  // Keyboard Event Isolation: WASD in input does not trigger anything
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.code === "Space") {
        if (!hasRolled && !isRolling && winner === null && (gameMode === "pvp" || turn === 1)) {
          rollDice();
        }
      }
      if (e.code === "KeyZ" && (e.ctrlKey || e.metaKey)) {
        undoLastMove();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasRolled, isRolling, winner, gameMode, turn, rollDice]);

  // Save Record to Hall of Fame
  const saveRecord = () => {
    const trimmed = playerName.trim() || "Nard Master";
    const newRecord: LeaderboardRecord = {
      id: Date.now().toString(),
      name: trimmed,
      wins: matchScore.p1,
      matchType: variant === "standard" ? "Standard (Qısa)" : "Long (Uzun)",
      date: new Date().toISOString().split("T")[0],
    };

    const updated = [newRecord, ...records]
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10);

    setRecords(updated);
    localStorage.setItem("backgammon_cyber_records", JSON.stringify(updated));
    setShowRecords(true);
  };

  // Legal destinations for currently selected checker
  const activeLegalDests = selectedOrigin !== null
    ? getLegalDestinations(
        selectedOrigin,
        turn,
        movesRemaining,
        points,
        turn === 1 ? barP1 : barP2
      )
    : [];

  return (
    <div className="flex flex-col items-center justify-center min-h-[92vh] bg-slate-950 text-slate-100 p-2 sm:p-4 select-none">
      {/* Top Arcade Navigation & TV Scoreboard */}
      <div className="w-full max-w-[820px] flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between bg-slate-900/90 border border-amber-600/30 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.15)]">
          {/* Back to All Games button */}
          <Link to="/games">
            <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-950/50 gap-1.5 font-mono text-xs sm:text-sm">
              <ArrowLeft className="w-4 h-4" />
              🎮 My Games
            </Button>
          </Link>

          {/* Title Banner */}
          <div className="text-center">
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold block">
              GRANDMASTER TAVLA • CYBER AI
            </span>
            <h1 className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
              BACKGAMMON PRO (NƏRD)
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
              className="h-8 w-8 border-amber-500/40 text-amber-400 hover:bg-amber-950/60"
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
              onClick={restartMatch}
              className="h-8 w-8 border-slate-700 text-slate-300 hover:bg-slate-800"
              title="Restart Board"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mode & Variant Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/70 border border-slate-800 rounded-lg p-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">RULES:</span>
            <button
              onClick={() => handleVariantChange("standard")}
              className={`px-2.5 py-1 rounded transition-all text-xs ${
                variant === "standard"
                  ? "bg-amber-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(217,119,6,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Standard (Qısa Nərd)
            </button>
            <button
              onClick={() => handleVariantChange("long")}
              className={`px-2.5 py-1 rounded transition-all text-xs ${
                variant === "long"
                  ? "bg-amber-600 text-slate-950 font-bold shadow-[0_0_10px_rgba(217,119,6,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Long Nards (Uzun Nərd)
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setGameMode("ai"); restartMatch(); }}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                gameMode === "ai" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold" : "text-slate-400"
              }`}
            >
              <Bot className="w-3.5 h-3.5 inline mr-1" />
              vs AI
            </button>
            <button
              onClick={() => { setGameMode("pvp"); restartMatch(); }}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                gameMode === "pvp" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold" : "text-slate-400"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              Pass & Play
            </button>
          </div>
        </div>

        {/* Turn, Score & Dice Status Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 border border-slate-800 rounded-lg p-2 text-center font-mono">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-amber-300">WHITE (IVORY)</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              Off: {offP1}/15 • Score: {matchScore.p1}
            </span>
          </div>

          {/* Turn & Dice Action Controls */}
          <div className="flex flex-col items-center justify-center gap-1">
            {winner === null ? (
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full animate-ping ${turn === 1 ? "bg-amber-400" : "bg-slate-400"}`} />
                <span className="text-xs font-bold text-slate-200">
                  {turn === 1 ? "White's Turn" : gameMode === "ai" ? "🤖 AI Thinking..." : "Black's Turn"}
                </span>

                {/* Dice Display */}
                {dice.length > 0 && (
                  <div className="flex gap-1 ml-2">
                    {dice.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-950 border border-amber-500/60 rounded text-amber-400 font-bold text-xs">
                        {d}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-400">
                🏆 {winner === 1 ? "White Dominates!" : "Black Dominates!"} ({winType.toUpperCase()})
              </span>
            )}

            {/* Roll Dice & Undo Buttons */}
            {winner === null && (
              <div className="flex items-center gap-2 mt-1">
                {!hasRolled && (gameMode === "pvp" || turn === 1) && (
                  <Button
                    size="sm"
                    onClick={rollDice}
                    disabled={isRolling}
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold px-3 py-1 h-7 text-xs font-mono shadow-[0_0_15px_rgba(217,119,6,0.3)]"
                  >
                    <Dices className="w-3.5 h-3.5 mr-1" />
                    Roll Dice (Space)
                  </Button>
                )}
                {turnHistory.length > 0 && (gameMode === "pvp" || turn === 1) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={undoLastMove}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 h-7 text-xs font-mono px-2"
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1" />
                    Undo
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] text-slate-400">BLACK (OBSIDIAN)</span>
            <span className="text-xs sm:text-sm font-bold text-slate-200">
              Off: {offP2}/15 • Score: {matchScore.p2}
            </span>
          </div>
        </div>
      </div>

      {/* Main Luxury Wooden Backgammon Board */}
      <div className="relative w-full max-w-[820px] bg-gradient-to-br from-amber-950 via-yellow-950 to-amber-950 border-8 border-amber-900 rounded-3xl p-3 sm:p-5 shadow-[0_0_50px_rgba(120,53,15,0.4)]">
        {/* Top Half of Board: Points 13-18 (Left) & Points 19-24 (Right) */}
        <div
          className="grid gap-1 h-44 sm:h-52 bg-[#1a120b] border-2 border-amber-900/60 rounded-t-xl p-2 relative"
          style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
        >
          {/* Points 13 to 18 */}
          {[13, 14, 15, 16, 17, 18].map(ptNum => {
            const pt = points[ptNum - 1];
            const isSelected = selectedOrigin === ptNum;
            const legalDest = activeLegalDests.find(d => d.to === ptNum);

            return (
              <div
                key={ptNum}
                onClick={() => {
                  if (legalDest && selectedOrigin !== null) {
                    executeMove(selectedOrigin, legalDest.to, legalDest.die, legalDest.hit);
                  } else if (pt.player === turn && pt.count > 0 && hasRolled) {
                    setSelectedOrigin(ptNum);
                  }
                }}
                className={`relative flex flex-col items-center justify-start cursor-pointer transition-all ${
                  legalDest ? "ring-2 ring-emerald-400 rounded-b-lg bg-emerald-950/30" : ""
                } ${isSelected ? "ring-2 ring-amber-400 rounded-b-lg" : ""}`}
              >
                {/* Triangular Point Felt */}
                <div
                  className={`w-full h-full clip-triangle-down transition-colors ${
                    ptNum % 2 === 0 ? "bg-[#8b2500]/70" : "bg-[#d2b48c]/40"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  }}
                />

                {/* Checkers Stack on Point */}
                <div className="absolute top-1 flex flex-col -space-y-3 items-center">
                  {Array.from({ length: Math.min(5, pt.count) }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center font-bold text-xs border-2 transition-transform hover:scale-105 ${
                        pt.player === 1
                          ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-100 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-gradient-to-br from-slate-700 to-slate-950 border-slate-500 text-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                      }`}
                    >
                      {cIdx === Math.min(5, pt.count) - 1 && pt.count > 5 && (
                        <span>+{pt.count - 4}</span>
                      )}
                    </div>
                  ))}
                </div>

                <span className="absolute bottom-1 text-[9px] text-slate-500 font-mono">
                  {ptNum}
                </span>
              </div>
            );
          })}

          {/* Central Bar Partition */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950 border-x-2 border-amber-800 rounded px-1">
            <span className="text-[9px] text-amber-500 font-mono tracking-widest uppercase rotate-90">
              BAR
            </span>
            {barP1 > 0 && (
              <div
                onClick={() => {
                  if (turn === 1 && hasRolled) setSelectedOrigin("bar");
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-200 to-yellow-500 border-2 border-amber-100 text-slate-950 font-bold text-xs flex items-center justify-center cursor-pointer my-1 shadow-lg ring-2 ring-rose-500 animate-pulse"
                title="White Checker on Bar! Must re-enter."
              >
                {barP1}
              </div>
            )}
          </div>

          {/* Points 19 to 24 */}
          {[19, 20, 21, 22, 23, 24].map(ptNum => {
            const pt = points[ptNum - 1];
            const isSelected = selectedOrigin === ptNum;
            const legalDest = activeLegalDests.find(d => d.to === ptNum);

            return (
              <div
                key={ptNum}
                onClick={() => {
                  if (legalDest && selectedOrigin !== null) {
                    executeMove(selectedOrigin, legalDest.to, legalDest.die, legalDest.hit);
                  } else if (pt.player === turn && pt.count > 0 && hasRolled) {
                    setSelectedOrigin(ptNum);
                  }
                }}
                className={`relative flex flex-col items-center justify-start cursor-pointer transition-all ${
                  legalDest ? "ring-2 ring-emerald-400 rounded-b-lg bg-emerald-950/30" : ""
                } ${isSelected ? "ring-2 ring-amber-400 rounded-b-lg" : ""}`}
              >
                <div
                  className={`w-full h-full clip-triangle-down transition-colors ${
                    ptNum % 2 === 0 ? "bg-[#8b2500]/70" : "bg-[#d2b48c]/40"
                  }`}
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  }}
                />

                <div className="absolute top-1 flex flex-col -space-y-3 items-center">
                  {Array.from({ length: Math.min(5, pt.count) }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center font-bold text-xs border-2 transition-transform hover:scale-105 ${
                        pt.player === 1
                          ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-100 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-gradient-to-br from-slate-700 to-slate-950 border-slate-500 text-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                      }`}
                    >
                      {cIdx === Math.min(5, pt.count) - 1 && pt.count > 5 && (
                        <span>+{pt.count - 4}</span>
                      )}
                    </div>
                  ))}
                </div>

                <span className="absolute bottom-1 text-[9px] text-slate-500 font-mono">
                  {ptNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Central Divider Ridge with Bear-Off Trays */}
        <div className="h-6 sm:h-8 flex items-center justify-between px-3 bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 my-1 rounded border border-amber-800 text-[10px] font-mono text-amber-400/80">
          <span>WHITE HOME BOARD (PTS 1-6)</span>
          {activeLegalDests.some(d => d.to === 0 || d.to === 25) && (
            <button
              onClick={() => {
                const bearMove = activeLegalDests.find(d => d.to === 0 || d.to === 25);
                if (bearMove && selectedOrigin !== null) {
                  executeMove(selectedOrigin, bearMove.to, bearMove.die, false);
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-0.5 rounded shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-bounce"
            >
              BEAR OFF CHECKER ➔
            </button>
          )}
          <span>BLACK HOME BOARD (PTS 19-24)</span>
        </div>

        {/* Bottom Half of Board: Points 12-7 (Left) & Points 6-1 (Right) */}
        <div
          className="grid gap-1 h-44 sm:h-52 bg-[#1a120b] border-2 border-amber-900/60 rounded-b-xl p-2 relative"
          style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}
        >
          {/* Points 12 to 7 */}
          {[12, 11, 10, 9, 8, 7].map(ptNum => {
            const pt = points[ptNum - 1];
            const isSelected = selectedOrigin === ptNum;
            const legalDest = activeLegalDests.find(d => d.to === ptNum);

            return (
              <div
                key={ptNum}
                onClick={() => {
                  if (legalDest && selectedOrigin !== null) {
                    executeMove(selectedOrigin, legalDest.to, legalDest.die, legalDest.hit);
                  } else if (pt.player === turn && pt.count > 0 && hasRolled) {
                    setSelectedOrigin(ptNum);
                  }
                }}
                className={`relative flex flex-col items-center justify-end cursor-pointer transition-all ${
                  legalDest ? "ring-2 ring-emerald-400 rounded-t-lg bg-emerald-950/30" : ""
                } ${isSelected ? "ring-2 ring-amber-400 rounded-t-lg" : ""}`}
              >
                <span className="absolute top-1 text-[9px] text-slate-500 font-mono">
                  {ptNum}
                </span>

                <div
                  className={`w-full h-full clip-triangle-up transition-colors ${
                    ptNum % 2 !== 0 ? "bg-[#8b2500]/70" : "bg-[#d2b48c]/40"
                  }`}
                  style={{
                    clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                  }}
                />

                <div className="absolute bottom-1 flex flex-col-reverse -space-y-3 -space-y-reverse items-center">
                  {Array.from({ length: Math.min(5, pt.count) }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center font-bold text-xs border-2 transition-transform hover:scale-105 ${
                        pt.player === 1
                          ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-100 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-gradient-to-br from-slate-700 to-slate-950 border-slate-500 text-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                      }`}
                    >
                      {cIdx === Math.min(5, pt.count) - 1 && pt.count > 5 && (
                        <span>+{pt.count - 4}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Central Bar Partition Bottom */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-t from-amber-900 to-amber-950 border-x-2 border-amber-800 rounded px-1">
            {barP2 > 0 && (
              <div
                onClick={() => {
                  if (turn === 2 && hasRolled) setSelectedOrigin("bar");
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-950 border-2 border-slate-400 text-slate-100 font-bold text-xs flex items-center justify-center cursor-pointer my-1 shadow-lg ring-2 ring-rose-500 animate-pulse"
                title="Black Checker on Bar! Must re-enter."
              >
                {barP2}
              </div>
            )}
            <span className="text-[9px] text-amber-500 font-mono tracking-widest uppercase rotate-90">
              BAR
            </span>
          </div>

          {/* Points 6 to 1 */}
          {[6, 5, 4, 3, 2, 1].map(ptNum => {
            const pt = points[ptNum - 1];
            const isSelected = selectedOrigin === ptNum;
            const legalDest = activeLegalDests.find(d => d.to === ptNum);

            return (
              <div
                key={ptNum}
                onClick={() => {
                  if (legalDest && selectedOrigin !== null) {
                    executeMove(selectedOrigin, legalDest.to, legalDest.die, legalDest.hit);
                  } else if (pt.player === turn && pt.count > 0 && hasRolled) {
                    setSelectedOrigin(ptNum);
                  }
                }}
                className={`relative flex flex-col items-center justify-end cursor-pointer transition-all ${
                  legalDest ? "ring-2 ring-emerald-400 rounded-t-lg bg-emerald-950/30" : ""
                } ${isSelected ? "ring-2 ring-amber-400 rounded-t-lg" : ""}`}
              >
                <span className="absolute top-1 text-[9px] text-slate-500 font-mono">
                  {ptNum}
                </span>

                <div
                  className={`w-full h-full clip-triangle-up transition-colors ${
                    ptNum % 2 !== 0 ? "bg-[#8b2500]/70" : "bg-[#d2b48c]/40"
                  }`}
                  style={{
                    clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
                  }}
                />

                <div className="absolute bottom-1 flex flex-col-reverse -space-y-3 -space-y-reverse items-center">
                  {Array.from({ length: Math.min(5, pt.count) }).map((_, cIdx) => (
                    <div
                      key={cIdx}
                      className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-md flex items-center justify-center font-bold text-xs border-2 transition-transform hover:scale-105 ${
                        pt.player === 1
                          ? "bg-gradient-to-br from-amber-200 to-yellow-500 border-amber-100 text-slate-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                          : "bg-gradient-to-br from-slate-700 to-slate-950 border-slate-500 text-slate-100 shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                      }`}
                    >
                      {cIdx === Math.min(5, pt.count) - 1 && pt.count > 5 && (
                        <span>+{pt.count - 4}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Victory Celebration Modal Overlay */}
        {winner !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 text-center rounded-3xl animate-fade-in">
            <div className="bg-amber-950/50 border-2 border-amber-500/60 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(217,119,6,0.3)]">
              <span className="text-amber-400 font-mono text-xs uppercase tracking-widest font-bold block mb-1">
                MATCH CONCLUDED • {winType.toUpperCase()} VICTORY
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-wider mb-2">
                {winner === 1 ? "WHITE CLAIMS VICTORY!" : "BLACK CLAIMS VICTORY!"}
              </h2>
              <p className="text-xs text-slate-300 font-mono mb-4">
                {winType === "backgammon"
                  ? "Backgammon achieved! Triple points awarded."
                  : winType === "gammon"
                  ? "Gammon achieved! Double points awarded."
                  : "Standard bear-off victory."}
              </p>

              {/* Hall of Fame Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter champion callsign..."
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  maxLength={16}
                  className="bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono outline-none flex-1"
                />
                <Button
                  onClick={saveRecord}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 font-mono text-xs"
                >
                  Save Record
                </Button>
              </div>

              <div className="flex gap-2 justify-center">
                <Button
                  onClick={restartMatch}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold px-5 py-2 font-mono"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Play Next Match
                </Button>
                <Link to="/games">
                  <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 font-mono">
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
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(217,119,6,0.2)] font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Trophy className="w-5 h-5" />
                <span>BACKGAMMON HALL OF FAME</span>
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
                      <span className="text-slate-400">{rec.matchType}</span>
                      <span className="font-bold text-amber-400">{rec.wins} pts</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 text-right">
              <Button
                onClick={() => setShowRecords(false)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold font-mono text-xs px-5"
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
