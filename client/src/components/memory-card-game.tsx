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
  RotateCcw, Trophy, Clock, Target, User, List, Volume2, VolumeX,
  Eye, Sparkles, Flame, Zap, Award, Star, Gamepad2, CheckCircle2,
  Cpu, Database, Shield, Terminal, Rocket, Radio, Orbit, Binary,
  Swords, Ghost, Heart, Layers, Crown, Gem
} from "lucide-react";
import { 
  SiReact, SiJavascript, SiTypescript, SiNodedotjs, SiPython,
  SiDocker, SiKubernetes, SiAmazon, SiMongodb, SiPostgresql,
  SiGit, SiVuedotjs, SiAngular, SiSharp, SiDotnet
} from "react-icons/si";
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

  playFlip() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  playMatch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.2, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.22);
      });
    } catch {}
  }

  playStreak(streakCount: number) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const baseFreq = 587.33; // D5
      const mult = Math.min(streakCount, 5);
      const notes = [baseFreq * 1, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      notes.slice(0, mult + 1).forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);
        gain.gain.setValueAtTime(0.22, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.25);
      });
    } catch {}
  }

  playMismatch() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  playPeek() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
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
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.25, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {}
  }
}

const sound = new SoundEngine();

// ============================================================================
// TYPES & THEMES
// ============================================================================

export type DifficultyLevel = "novice" | "cadet" | "elite" | "grandmaster";
export type DeckTheme = "tech" | "cyber" | "arcade";

interface DifficultyConfig {
  id: DifficultyLevel;
  label: string;
  pairs: number;
  cols: string;
  colCount: number;
  badge: string;
}

const DIFFICULTIES: Record<DifficultyLevel, DifficultyConfig> = {
  novice: { id: "novice", label: "Casual (12)", pairs: 6, cols: "grid-cols-4", colCount: 4, badge: "4x3 Grid" },
  cadet: { id: "cadet", label: "Standard (16)", pairs: 8, cols: "grid-cols-4", colCount: 4, badge: "4x4 Grid" },
  elite: { id: "elite", label: "Challenger (20)", pairs: 10, cols: "grid-cols-4 sm:grid-cols-5", colCount: 5, badge: "5x4 Grid" },
  grandmaster: { id: "grandmaster", label: "Master (30)", pairs: 15, cols: "grid-cols-5 sm:grid-cols-6", colCount: 6, badge: "6x5 Grid" },
};

interface CardTemplate {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
}

const TECH_DECK: CardTemplate[] = [
  { name: "React", icon: SiReact, color: "text-cyan-400", bgGlow: "rgba(6, 182, 212, 0.25)" },
  { name: "TypeScript", icon: SiTypescript, color: "text-blue-500", bgGlow: "rgba(59, 130, 246, 0.25)" },
  { name: "JavaScript", icon: SiJavascript, color: "text-yellow-400", bgGlow: "rgba(250, 204, 21, 0.25)" },
  { name: "Node.js", icon: SiNodedotjs, color: "text-emerald-500", bgGlow: "rgba(16, 185, 129, 0.25)" },
  { name: "Python", icon: SiPython, color: "text-sky-400", bgGlow: "rgba(56, 189, 248, 0.25)" },
  { name: "Docker", icon: SiDocker, color: "text-blue-400", bgGlow: "rgba(96, 165, 250, 0.25)" },
  { name: "Kubernetes", icon: SiKubernetes, color: "text-indigo-400", bgGlow: "rgba(129, 140, 248, 0.25)" },
  { name: "AWS", icon: SiAmazon, color: "text-amber-500", bgGlow: "rgba(245, 158, 11, 0.25)" },
  { name: "MongoDB", icon: SiMongodb, color: "text-green-500", bgGlow: "rgba(34, 197, 94, 0.25)" },
  { name: "PostgreSQL", icon: SiPostgresql, color: "text-cyan-600", bgGlow: "rgba(8, 145, 178, 0.25)" },
  { name: "Git", icon: SiGit, color: "text-rose-500", bgGlow: "rgba(244, 63, 94, 0.25)" },
  { name: "Vue.js", icon: SiVuedotjs, color: "text-emerald-400", bgGlow: "rgba(52, 211, 153, 0.25)" },
  { name: "Angular", icon: SiAngular, color: "text-red-500", bgGlow: "rgba(239, 68, 68, 0.25)" },
  { name: "C#", icon: SiSharp, color: "text-purple-500", bgGlow: "rgba(168, 85, 247, 0.25)" },
  { name: ".NET", icon: SiDotnet, color: "text-violet-500", bgGlow: "rgba(139, 92, 246, 0.25)" }
];

const CYBER_DECK: CardTemplate[] = [
  { name: "Quantum CPU", icon: Cpu, color: "text-cyan-400", bgGlow: "rgba(6, 182, 212, 0.25)" },
  { name: "Neural Database", icon: Database, color: "text-emerald-400", bgGlow: "rgba(16, 185, 129, 0.25)" },
  { name: "Cyber Firewall", icon: Shield, color: "text-blue-500", bgGlow: "rgba(59, 130, 246, 0.25)" },
  { name: "Mainframe CLI", icon: Terminal, color: "text-green-400", bgGlow: "rgba(34, 197, 94, 0.25)" },
  { name: "Orbital Rocket", icon: Rocket, color: "text-orange-500", bgGlow: "rgba(249, 115, 22, 0.25)" },
  { name: "Quantum Radar", icon: Radio, color: "text-amber-400", bgGlow: "rgba(251, 191, 36, 0.25)" },
  { name: "Orbital Core", icon: Orbit, color: "text-violet-400", bgGlow: "rgba(167, 139, 250, 0.25)" },
  { name: "Binary Matrix", icon: Binary, color: "text-lime-400", bgGlow: "rgba(163, 230, 53, 0.25)" },
  { name: "Cyber Spark", icon: Sparkles, color: "text-yellow-300", bgGlow: "rgba(253, 224, 71, 0.25)" },
  { name: "Plasma Shield", icon: Zap, color: "text-indigo-400", bgGlow: "rgba(129, 140, 248, 0.25)" },
  { name: "Plasma Core", icon: Flame, color: "text-red-500", bgGlow: "rgba(239, 68, 68, 0.25)" },
  { name: "Ghost Daemon", icon: Ghost, color: "text-purple-400", bgGlow: "rgba(192, 132, 252, 0.25)" },
  { name: "Power Stack", icon: Layers, color: "text-teal-400", bgGlow: "rgba(45, 212, 191, 0.25)" },
  { name: "Cyber Trophy", icon: Trophy, color: "text-amber-300", bgGlow: "rgba(252, 211, 77, 0.25)" },
  { name: "Target Lock", icon: Target, color: "text-rose-400", bgGlow: "rgba(251, 113, 133, 0.25)" }
];

const ARCADE_DECK: CardTemplate[] = [
  { name: "Arcade Pad", icon: Gamepad2, color: "text-purple-400", bgGlow: "rgba(192, 132, 252, 0.25)" },
  { name: "Grand Crown", icon: Crown, color: "text-yellow-400", bgGlow: "rgba(250, 204, 21, 0.25)" },
  { name: "Championship", icon: Trophy, color: "text-amber-400", bgGlow: "rgba(251, 191, 36, 0.25)" },
  { name: "Star Diamond", icon: Gem, color: "text-cyan-400", bgGlow: "rgba(34, 211, 238, 0.25)" },
  { name: "Dragon Flame", icon: Flame, color: "text-orange-500", bgGlow: "rgba(249, 115, 22, 0.25)" },
  { name: "Lightning Bolt", icon: Zap, color: "text-yellow-300", bgGlow: "rgba(253, 224, 71, 0.25)" },
  { name: "Pixel Heart", icon: Heart, color: "text-rose-500", bgGlow: "rgba(244, 63, 94, 0.25)" },
  { name: "Arcade Star", icon: Star, color: "text-amber-300", bgGlow: "rgba(252, 211, 77, 0.25)" },
  { name: "Duel Swords", icon: Swords, color: "text-blue-400", bgGlow: "rgba(96, 165, 250, 0.25)" },
  { name: "Retro Ghost", icon: Ghost, color: "text-indigo-400", bgGlow: "rgba(129, 140, 248, 0.25)" },
  { name: "Magic Spark", icon: Sparkles, color: "text-pink-400", bgGlow: "rgba(244, 114, 182, 0.25)" },
  { name: "Honor Medal", icon: Award, color: "text-emerald-400", bgGlow: "rgba(52, 211, 153, 0.25)" },
  { name: "Aegis Shield", icon: Shield, color: "text-teal-400", bgGlow: "rgba(45, 212, 191, 0.25)" },
  { name: "Space Shuttle", icon: Rocket, color: "text-red-400", bgGlow: "rgba(248, 113, 113, 0.25)" },
  { name: "Orbital Net", icon: Orbit, color: "text-sky-400", bgGlow: "rgba(56, 189, 248, 0.25)" }
];

interface GameCard {
  id: number;
  templateId: number;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryCardGameProps {
  onBack: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MemoryCardGame({ onBack }: MemoryCardGameProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("cadet");
  const [deckTheme, setDeckTheme] = useState<DeckTheme>("tech");
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [gameTime, setGameTime] = useState<number>(0);

  const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
  const [isGameCompleted, setIsGameCompleted] = useState<boolean>(false);
  const [isPeekActive, setIsPeekActive] = useState<boolean>(false);
  const [peekAvailable, setPeekAvailable] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [playerName, setPlayerName] = useState<string>("");
  const [showScoreSubmit, setShowScoreSubmit] = useState<boolean>(false);
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);

  const lockBoardRef = useRef<boolean>(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    sound.enabled = soundEnabled;
  }, [soundEnabled]);

  // Fetch top scores with graceful local storage fallback
  const { data: topScores = [] } = useQuery<any[]>({
    queryKey: ['/api/games/memory/scores'],
    queryFn: async () => {
      let localList: any[] = [];
      try {
        const stored = localStorage.getItem('memory_scores_local');
        if (stored) localList = JSON.parse(stored);
      } catch {}

      try {
        const response = await fetch('/api/games/memory/scores?limit=10');
        if (response.ok) {
          const apiScores = (await response.json()) as any[];
          const combined = [...localList, ...(Array.isArray(apiScores) ? apiScores : [])];
          const unique = Array.from(new Map(combined.map(item => [item.playerName + '-' + item.score, item])).values());
          return unique.sort((a, b) => b.score - a.score).slice(0, 5);
        }
      } catch {}

      const defaults = [
        { id: 1, playerName: "Cortex Master 🧠", score: 980, timeInSeconds: 28, createdAt: new Date().toISOString() },
        { id: 2, playerName: "Tabriz Latifov ⚡", score: 890, timeInSeconds: 34, createdAt: new Date().toISOString() },
        { id: 3, playerName: "Quantum Mind 🌌", score: 780, timeInSeconds: 42, createdAt: new Date().toISOString() },
        { id: 4, playerName: "Baku Memory 💡", score: 690, timeInSeconds: 51, createdAt: new Date().toISOString() },
        { id: 5, playerName: "Synapse Ace 🏆", score: 550, timeInSeconds: 65, createdAt: new Date().toISOString() },
      ];
      return [...localList, ...defaults].sort((a, b) => b.score - a.score).slice(0, 5);
    }
  });

  const submitScoreMutation = useMutation({
    mutationFn: async (scoreData: { playerName: string; score: number; timeInSeconds: number }) => {
      try {
        const stored = localStorage.getItem('memory_scores_local');
        const list = stored ? JSON.parse(stored) : [];
        list.unshift({ ...scoreData, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem('memory_scores_local', JSON.stringify(list.slice(0, 20)));
      } catch {}

      const response = await fetch('/api/games/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scoreData, gameType: 'memory' }),
      });
      if (!response.ok) throw new Error('Failed to submit score');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/games/memory/scores'] });
      setScoreSubmitted(true);
    },
    onError: () => {
      setScoreSubmitted(true);
    }
  });

  // Pick deck based on active theme
  const getActiveDeck = useCallback((): CardTemplate[] => {
    switch (deckTheme) {
      case "cyber": return CYBER_DECK;
      case "arcade": return ARCADE_DECK;
      default: return TECH_DECK;
    }
  }, [deckTheme]);

  // Initialize Game
  const initializeGame = useCallback(() => {
    const config = DIFFICULTIES[difficulty];
    const deck = getActiveDeck();
    const selectedTemplates = deck.slice(0, config.pairs);

    const gameCards: GameCard[] = [];
    let idCounter = 0;

    selectedTemplates.forEach((template, templateIdx) => {
      // First card of pair
      gameCards.push({
        id: idCounter++,
        templateId: templateIdx,
        name: template.name,
        icon: template.icon,
        color: template.color,
        bgGlow: template.bgGlow,
        isFlipped: false,
        isMatched: false,
      });
      // Second card of pair
      gameCards.push({
        id: idCounter++,
        templateId: templateIdx,
        name: template.name,
        icon: template.icon,
        color: template.color,
        bgGlow: template.bgGlow,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Randomize cards thoroughly
    const shuffled = [...gameCards].sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setStreak(0);
    setMaxStreak(0);
    setGameTime(0);
    setIsGameStarted(false);
    setIsGameCompleted(false);
    setIsPeekActive(false);
    setPeekAvailable(true);
    setShowScoreSubmit(false);
    setScoreSubmitted(false);
    setPlayerName("");
    lockBoardRef.current = false;
  }, [difficulty, getActiveDeck]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameStarted && !isGameCompleted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameStarted, isGameCompleted]);

  // Card click handler
  const handleCardClick = (cardId: number) => {
    if (lockBoardRef.current || isPeekActive) return;

    const clickedCard = cards.find(c => c.id === cardId);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    if (!isGameStarted) {
      setIsGameStarted(true);
    }

    sound.playFlip();

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    setCards(prev => prev.map(c => c.id === cardId ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      lockBoardRef.current = true;
      checkPairMatch(newFlipped);
    }
  };

  // Check matching cards
  const checkPairMatch = (pairIds: number[]) => {
    const [id1, id2] = pairIds;
    const card1 = cards.find(c => c.id === id1);
    const card2 = cards.find(c => c.id === id2);

    if (!card1 || !card2) {
      lockBoardRef.current = false;
      return;
    }

    const isMatch = card1.templateId === card2.templateId;

    if (isMatch) {
      // Successful match
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setMaxStreak(ms => Math.max(ms, nextStreak));

      if (nextStreak > 1) {
        sound.playStreak(nextStreak);
      } else {
        sound.playMatch();
      }

      setTimeout(() => {
        setCards(prev => prev.map(c => 
          pairIds.includes(c.id) ? { ...c, isMatched: true, isFlipped: true } : c
        ));
        setFlippedCards([]);
        lockBoardRef.current = false;

        const nextMatched = matchedPairs + 1;
        setMatchedPairs(nextMatched);

        const totalPairs = DIFFICULTIES[difficulty].pairs;
        if (nextMatched >= totalPairs) {
          // Completed game!
          sound.playVictory();
          setIsGameCompleted(true);
          setShowScoreSubmit(true);
        }
      }, 420);
    } else {
      // Mismatch
      sound.playMismatch();
      setStreak(0);

      setTimeout(() => {
        setCards(prev => prev.map(c => 
          pairIds.includes(c.id) ? { ...c, isFlipped: false } : c
        ));
        setFlippedCards([]);
        lockBoardRef.current = false;
      }, 900);
    }
  };

  // Tactical Peek Hint Power-up
  const triggerMatrixPeek = () => {
    if (!peekAvailable || lockBoardRef.current || isGameCompleted) return;

    sound.playPeek();
    setPeekAvailable(false);
    setIsPeekActive(true);

    // Unveil all unmatched cards
    setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));

    setTimeout(() => {
      setCards(prev => prev.map(c => (c.isMatched ? c : { ...c, isFlipped: false })));
      setIsPeekActive(false);
    }, 1200);
  };

  // Calculate final performance score
  const calculateScore = () => {
    const totalPairs = DIFFICULTIES[difficulty].pairs;
    const base = totalPairs * 100;
    const movePenalty = Math.max(0, (moves - totalPairs) * 15);
    const timePenalty = Math.floor(gameTime * 2);
    const streakBonus = maxStreak * 50;
    return Math.max(100, base - movePenalty - timePenalty + streakBonus);
  };

  // Accuracy calculation
  const getAccuracy = () => {
    if (moves === 0) return 100;
    return Math.min(100, Math.round(((matchedPairs * 2) / (moves * 2)) * 100));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentConfig = DIFFICULTIES[difficulty];

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

          {/* Difficulty Switcher */}
          <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            {(Object.keys(DIFFICULTIES) as DifficultyLevel[]).map((level) => (
              <Button
                key={level}
                variant={difficulty === level ? "default" : "ghost"}
                size="sm"
                onClick={() => setDifficulty(level)}
                disabled={isGameStarted && !isGameCompleted}
                className="h-7 px-2 rounded-lg text-[11px] font-semibold"
              >
                {DIFFICULTIES[level].label.split(" ")[0]}
              </Button>
            ))}
          </div>

          {/* Deck Theme Selector */}
          <div className="hidden md:flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/60">
            <Button
              variant={deckTheme === "tech" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeckTheme("tech")}
              disabled={isGameStarted && !isGameCompleted}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold"
            >
              💻 Tech
            </Button>
            <Button
              variant={deckTheme === "cyber" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeckTheme("cyber")}
              disabled={isGameStarted && !isGameCompleted}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold"
            >
              ⚡ Cyber
            </Button>
            <Button
              variant={deckTheme === "arcade" ? "default" : "ghost"}
              size="sm"
              onClick={() => setDeckTheme("arcade")}
              disabled={isGameStarted && !isGameCompleted}
              className="h-7 px-2 rounded-lg text-[11px] font-semibold"
            >
              🎮 Arcade
            </Button>
          </div>
        </div>

        {/* Center: Live Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-mono">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{formatTime(gameTime)}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold">
            <Target className="h-3.5 w-3.5 text-emerald-500" />
            <span>{matchedPairs}/{currentConfig.pairs}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-muted/60 border border-border/60 text-xs font-bold">
            <span className="text-muted-foreground hidden sm:inline">Moves:</span>
            <span>{moves}</span>
          </div>

          {streak > 1 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-black animate-pulse">
              🔥 {streak}x STREAK
            </span>
          )}
        </div>

        {/* Right: Peek Power-Up, Leaderboard & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Tactical Peek Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={triggerMatrixPeek}
            disabled={!peekAvailable || isPeekActive || isGameCompleted}
            className={`h-8 px-2.5 rounded-xl text-xs font-semibold gap-1.5 border-border/70 ${
              peekAvailable ? "hover:bg-primary hover:text-primary-foreground" : "opacity-50"
            }`}
            title="Scan Matrix: Peek all cards for 1.2s"
          >
            <Eye className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Peek</span>
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
                  Memory Matrix Hall of Fame
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
                        {rec.timeInSeconds !== undefined && (
                          <span className="text-xs text-muted-foreground block font-mono">
                            {formatTime(rec.timeInSeconds)}
                          </span>
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

          {/* Reset / Restart */}
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            className="h-8 px-2.5 rounded-xl text-xs font-semibold"
            title="Start fresh game"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Main Playing Grid Area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950 relative">
        <div className={`w-full max-w-4xl grid gap-2 sm:gap-3.5 mx-auto ${currentConfig.cols}`}>
          {cards.map((card) => {
            const IconComponent = card.icon;
            const isRevealed = card.isFlipped || card.isMatched;

            return (
              <div
                key={card.id}
                className="perspective-1000 aspect-square cursor-pointer"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className={`relative w-full h-full transition-transform duration-500 rounded-2xl transform-style-preserve-3d shadow-md hover:shadow-xl ${
                    isRevealed ? "rotate-y-180" : "hover:scale-[1.03]"
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)"
                  }}
                >
                  {/* Card Back Face (Hidden when flipped) */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/80 flex flex-col items-center justify-center p-2 backface-hidden shadow-inner group hover:border-primary/60 transition-colors"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shadow-sm">
                      ?
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold tracking-wider uppercase">
                      MATRIX
                    </span>
                  </div>

                  {/* Card Front Face (Visible when flipped) */}
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center p-2 backface-hidden shadow-lg ${
                      card.isMatched
                        ? "bg-emerald-950/40 border-emerald-500/80 shadow-emerald-500/20"
                        : "bg-slate-900/95 border-slate-600"
                    }`}
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      boxShadow: card.isMatched ? `0 0 16px ${card.bgGlow}` : undefined
                    }}
                  >
                    <div
                      className="p-2 sm:p-2.5 rounded-xl mb-1 flex items-center justify-center transition-transform"
                      style={{ backgroundColor: card.bgGlow }}
                    >
                      <IconComponent className={`h-6 w-6 sm:h-9 sm:w-9 ${card.color}`} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-center tracking-tight text-foreground truncate max-w-full px-1">
                      {card.name}
                    </span>

                    {card.isMatched && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 absolute top-1.5 right-1.5 animate-in zoom-in" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Victory Debrief Modal */}
      {isGameCompleted && (
        <div className="absolute inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full glass-panel border border-border/80 shadow-2xl rounded-3xl overflow-hidden text-center animate-in zoom-in-95">
            <CardContent className="p-7 space-y-5">
              <div className="space-y-1.5">
                <Trophy className="h-12 w-12 mx-auto text-yellow-500 animate-bounce" />
                <h2 className="text-3xl font-black tracking-tight text-gradient">Matrix Cleared!</h2>
                <p className="text-xs text-muted-foreground">Outstanding cognitive agility and recall precision.</p>

                {/* Rating Stars */}
                <div className="flex items-center justify-center gap-1 pt-1">
                  <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  <Star className={`h-5 w-5 ${getAccuracy() > 60 ? "text-amber-400 fill-amber-400" : "text-muted/40"}`} />
                  <Star className={`h-5 w-5 ${getAccuracy() > 80 && gameTime < 45 ? "text-amber-400 fill-amber-400" : "text-muted/40"}`} />
                </div>
              </div>

              {/* Performance Stats */}
              <div className="grid grid-cols-4 gap-2 p-3.5 rounded-2xl bg-card/80 border border-border/60 text-center">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Score</span>
                  <span className="text-lg font-black text-primary font-mono">{calculateScore()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Time</span>
                  <span className="text-lg font-black text-cyan-400 font-mono">{formatTime(gameTime)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Moves</span>
                  <span className="text-lg font-black text-amber-400 font-mono">{moves}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Accuracy</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{getAccuracy()}%</span>
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
                          score: calculateScore(),
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={initializeGame} className="flex-1 rounded-xl bg-primary text-primary-foreground font-bold text-xs h-10">
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
    </div>
  );
}
