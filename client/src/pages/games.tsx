import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Gamepad2 } from "lucide-react";
import { Link } from "wouter";
import MemoryCardGame from "../components/memory-card-game";
import SnakeGame from "../components/snake-game";
import TetrisGame from "../components/tetris-game";
import PuzzleGame from "../components/puzzle-game";
import DinoGame from "../components/dino-game";
import FlappyBirdGame from "../components/flappy-bird-game";
import HeadBallGame from "../components/head-ball-game";
import ReactionTimeGame from "../components/reaction-time-game";
import TicTacToeGame from "../components/tic-tac-toe-game";
import SudokuGame from "../components/sudoku-game";
import CheckersGame from "../components/checkers-game";
import TankGame from "../components/tank-game";
import Game2048 from "../components/game-2048";
import NonogramGame from "../components/nonogram-game";
import BrickBreakerGame from "../components/brick-breaker-game";
import SpaceDefenderGame from "../components/space-defender-game";
import StackTowerGame from "../components/stack-tower-game";
import ConnectFourGame from "../components/connect-four-game";
import MinesweeperGame from "../components/minesweeper-game";
import WordleGame from "../components/wordle-game";
import PacmanGame from "../components/pacman-game";
import BackgammonGame from "../components/backgammon-game";
import Match3Game from "../components/match3-game";
import FruitNinjaGame from "../components/fruit-ninja-game";

export default function Games() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: "memory-card",
      title: "Memory Matrix Pro",
      description: "3D card matching with difficulty tiers, multiple decks, streaks, and matrix scan peek!",
      icon: "🧠",
      component: MemoryCardGame,
    },
    {
      id: "snake-game",
      title: "Snake Game",
      description: "Classic snake game - eat food and grow longer!",
      icon: "🐍",
      component: SnakeGame,
    },
    {
      id: "tetris-game",
      title: "Tetris Arena Pro",
      description: "Modern cyber Tetris with ghost piece trajectory, hold slot, hard drops, and sound effects!",
      icon: "🧱",
      component: TetrisGame,
    },
    {
      id: "puzzle-game",
      title: "Puzzle Game",
      description: "Random shapes and pieces - complete the puzzle!",
      icon: "🧩",
      component: PuzzleGame,
    },
    {
      id: "dino-game",
      title: "Dino Runner Pro",
      description: "Endless prehistoric sprint with double jumps, golden eggs, shield orbs, and skins!",
      icon: "🦖",
      component: DinoGame,
    },
    {
      id: "flappy-bird",
      title: "Flappy Bird Pro",
      description: "Arcade flight with animated vector bird, customizable skins, flight medals, and sound effects!",
      icon: "🐦",
      component: FlappyBirdGame,
    },
    {
      id: "head-ball",
      title: "Head Ball",
      description: "Physics-based 1v1 soccer game with special powers!",
      icon: "⚽",
      component: HeadBallGame,
    },
    {
      id: "reaction-time",
      title: "Reaction Time",
      description: "Test your reflexes! Click as fast as you can when the screen turns green.",
      icon: "⚡",
      component: ReactionTimeGame,
    },
    {
      id: "tic-tac-toe",
      title: "Tic-Tac-Toe AI",
      description: "Can you beat the AI? It utilizes the Minimax algorithm to be unbeatable!",
      icon: "❌",
      component: TicTacToeGame,
    },
    {
      id: "sudoku",
      title: "Sudoku",
      description: "Classic Sudoku puzzle. train your brain with generated puzzles.",
      icon: "🔢",
      component: SudokuGame,
    },
    {
      id: "checkers",
      title: "Checkers",
      description: "Classic strategy game. Play against a smart AI!",
      icon: "🏁",
      component: CheckersGame,
    },
    {
      id: "tank-battle",
      title: "Tank Battle",
      description: "Destroy enemy tanks and survive through levels!",
      icon: "🎖️",
      component: TankGame,
    },
    {
      id: "2048-game",
      title: "2048",
      description: "Join the numbers and get to the 2048 tile!",
      icon: "🎲",
      component: Game2048,
    },
    {
      id: "nonogram-game",
      title: "Nonogram",
      description: "Logic puzzle: fill cells by numbers!",
      icon: "⬛",
      component: NonogramGame,
    },
    {
      id: "brick-breaker",
      title: "Neon Brick Breaker",
      description: "Retro arcade DX-Ball / Arkanoid with multi-ball, laser blaster, explosive TNT, and audio synthesis!",
      icon: "💥",
      component: BrickBreakerGame,
    },
    {
      id: "space-defender",
      title: "Space Defender",
      description: "Arcade Galaga / Space Invaders with plasma starfighter, alien swarms, EMP shockwaves, and Titan Bosses!",
      icon: "🚀",
      component: SpaceDefenderGame,
    },
    {
      id: "stack-tower",
      title: "Stack Tower Pro",
      description: "Isometric 3D block stacking with slicing physics, harmonic combo chords, and sky architecture!",
      icon: "🏗️",
      component: StackTowerGame,
    },
    {
      id: "connect-four",
      title: "Connect 4 Cyber",
      description: "Tactical 4-in-a-row with Minimax AI, alpha-beta pruning, 2-player mode, and token bounce physics!",
      icon: "🔴",
      component: ConnectFourGame,
    },
    {
      id: "minesweeper",
      title: "Minesweeper Pro",
      description: "Classic logic puzzle with first-click safety, flood-fill queues, chording, and LED counters!",
      icon: "💣",
      component: MinesweeperGame,
    },
    {
      id: "wordle",
      title: "Wordle Cyber",
      description: "Guess the hidden English word in 6 tries with color hints, virtual keyboard, daily and practice modes!",
      icon: "🔤",
      component: WordleGame,
    },
    {
      id: "pacman",
      title: "Pac-Man Pro",
      description: "Retro arcade maze navigation with canonical ghost personalities, power pellets, and Web Audio synthesis!",
      icon: "🟡",
      component: PacmanGame,
    },
    {
      id: "backgammon",
      title: "Backgammon Pro",
      description: "Grandmaster Tavla / Nərd with standard and long variants, smart AI, dice animations, and blot hitting!",
      icon: "🎲",
      component: BackgammonGame,
    },
    {
      id: "match-3",
      title: "Match-3 Pro",
      description: "Swap & match shiny gems with cascades, striped lasers, bomb blasts, and rainbow gems!",
      icon: "🍬",
      component: Match3Game,
    },
    {
      id: "fruit-ninja",
      title: "Fruit Ninja Pro",
      description: "Slice flying juicy fruits with glowing blade swipes, avoid bombs, and trigger freeze & frenzy storms!",
      icon: "🍉",
      component: FruitNinjaGame,
    },
  ];

  if (selectedGame) {
    const game = games.find(g => g.id === selectedGame);
    if (game) {
      const GameComponent = game.component;
      return (
        <div className="min-h-screen bg-background">
          <div className="container-custom py-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="outline" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedGame(null)}
                >
                  <Gamepad2 className="h-4 w-4 mr-2" />
                  All Games
                </Button>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{game.title}</h1>
            </div>
            <GameComponent onBack={() => setSelectedGame(null)} />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <Button variant="outline" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-center">My Games</h1>
          <div className="w-16"></div> {/* Spacer for centering */}
        </div>

        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-muted-foreground text-center mb-12">
            Take a break and enjoy some fun games! More games coming soon.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Card
                key={game.id}
                className="cursor-pointer hover:shadow-lg transition-shadow group relative overflow-hidden"
                onClick={() => setSelectedGame(game.id)}
              >
                {game.id === 'head-ball' && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-full shadow-lg shadow-green-500/20 animate-pulse border border-white/20">
                      Online
                    </span>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                    {game.icon}
                  </div>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center mb-4">
                    {game.description}
                  </p>

                  {game.id === 'head-ball' && (
                    <div className="text-center mb-4">
                      <span className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-1 rounded border border-yellow-200 font-medium inline-block animate-pulse">
                        🚧 some improvements are in progress
                      </span>
                    </div>
                  )}



                  <Button className="w-full" variant="outline">
                    Play Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}