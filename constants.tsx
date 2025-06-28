import type { Game } from './types';
import ReflexGame from './games/ReflexGame';
import QuizGame from './games/QuizGame';
import MinesweeperGame from './games/MinesweeperGame';
import CombinationGame from './games/CombinationGame';
import InfiniteRunnerGame from './games/InfiniteRunnerGame';
import BreakoutGame from './games/BreakoutGame';
import ShooterGame from './games/ShooterGame';
import CleaningGame from './games/CleaningGame';
import TurnBasedDuelGame from './games/TurnBasedDuelGame';
import InteractiveStoryGame from './games/InteractiveStoryGame';
import TetrisGame from './games/TetrisGame';
import SnakeGame from './games/SnakeGame';
import MemoryMatchGame from './games/MemoryMatchGame';
import PongGame from './games/PongGame';
import SpaceInvadersGame from './games/SpaceInvadersGame';
import SimonSaysGame from './games/SimonSaysGame';
import WhackAMoleGame from './games/WhackAMoleGame';
import Game2048 from './games/Game2048';
import FlappyBirdGame from './games/FlappyBirdGame';
import ColorSwitchGame from './games/ColorSwitchGame';
import { FastForwardIcon, BrainIcon, BombIcon, PuzzleIcon, RunnerIcon, BlockIcon, TargetIcon, BroomIcon, SwordIcon, CompassIcon, TetrisIcon } from './components/icons';

export const GAMES: Game[] = [
  {
    id: 1,
    title: 'Reflex Game',
    description: 'Click the target before it disappears.',
    icon: <FastForwardIcon />,
    component: ReflexGame,
  },
  {
    id: 2,
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge.',
    icon: <BrainIcon />,
    component: QuizGame,
  },
  {
    id: 3,
    title: 'Galactic Minesweeper',
    description: 'Avoid the explosive asteroids.',
    icon: <BombIcon />,
    component: MinesweeperGame,
  },
  {
    id: 4,
    title: 'Fruit Match',
    description: 'Match 3 identical fruits.',
    icon: <PuzzleIcon />,
    component: CombinationGame,
  },
  {
    id: 5,
    title: 'Fugitive Chicken',
    description: 'Run and avoid the obstacles.',
    icon: <RunnerIcon />,
    component: InfiniteRunnerGame,
  },
  {
    id: 6,
    title: 'Block Breaker',
    description: 'Destroy the blocks with a ball and paddle.',
    icon: <BlockIcon />,
    component: BreakoutGame,
  },
  {
    id: 7,
    title: 'Zombie Shooter',
    description: 'Shoot the zombies with precision.',
    icon: <TargetIcon />,
    component: ShooterGame,
  },
  {
    id: 8,
    title: 'Quick Clean',
    description: 'Tidy the room before time runs out.',
    icon: <BroomIcon />,
    component: CleaningGame,
  },
  {
    id: 9,
    title: 'Chicken Duel',
    description: 'A simple turn-based duel.',
    icon: <SwordIcon />,
    component: TurnBasedDuelGame,
  },
  {
    id: 10,
    title: 'The Deserted Island',
    description: 'Make choices to survive.',
    icon: <CompassIcon />,
    component: InteractiveStoryGame,
  },
  {
    id: 11,
    title: 'Tetris',
    description: 'Fit the falling blocks to clear lines.',
    icon: <TetrisIcon />,
    component: TetrisGame,
  },
  {
    id: 12,
    title: 'Snake',
    description: 'Eat food and grow your snake!',
    icon: <span role="img" aria-label="snake">🐍</span>,
    component: SnakeGame,
  },
  {
    id: 13,
    title: 'Memory Match',
    description: 'Flip cards to find matching pairs.',
    icon: <span role="img" aria-label="memory">🧠</span>,
    component: MemoryMatchGame,
  },
  {
    id: 14,
    title: 'Pong',
    description: 'Classic two-player paddle game.',
    icon: <span role="img" aria-label="pong">🏓</span>,
    component: PongGame,
  },
  {
    id: 15,
    title: 'Space Invaders',
    description: 'Shoot the descending aliens.',
    icon: <span role="img" aria-label="space invaders">👾</span>,
    component: SpaceInvadersGame,
  },
  {
    id: 16,
    title: 'Simon Says',
    description: 'Repeat the color/sound sequence.',
    icon: <span role="img" aria-label="simon says">🔊</span>,
    component: SimonSaysGame,
  },
  {
    id: 17,
    title: 'Whack-a-Mole',
    description: 'Click moles as they pop up.',
    icon: <span role="img" aria-label="whack-a-mole">🐹</span>,
    component: WhackAMoleGame,
  },
  {
    id: 18,
    title: '2048',
    description: 'Slide tiles to combine and reach 2048.',
    icon: <span role="img" aria-label="2048">🔢</span>,
    component: Game2048,
  },
  {
    id: 19,
    title: 'Flappy Bird',
    description: 'Tap to keep the bird flying.',
    icon: <span role="img" aria-label="flappy bird">🐦</span>,
    component: FlappyBirdGame,
  },
  {
    id: 20,
    title: 'Color Switch',
    description: 'Guide the ball through color obstacles.',
    icon: <span role="img" aria-label="color switch">🎨</span>,
    component: ColorSwitchGame,
  },
];