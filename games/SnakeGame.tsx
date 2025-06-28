import React, { useRef, useEffect, useState } from 'react';

const BOARD_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];
const INITIAL_DIR = { x: 1, y: 0 };
const SPEEDS = { Easy: 180, Normal: 120, Hard: 70 };

function getRandomFood(snake: { x: number; y: number }[]): { x: number; y: number } {
  let food: { x: number; y: number };
  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  } while (snake.some(seg => seg.x === food.x && seg.y === food.y));
  return food;
}

const SnakeGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [dir, setDir] = useState(INITIAL_DIR);
  const [food, setFood] = useState(getRandomFood(INITIAL_SNAKE));
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Normal' | 'Hard'>('Normal');
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('snakeHighScore') || 0));
  const moveRef = useRef(dir);
  const lastDir = useRef(INITIAL_DIR);
  moveRef.current = dir;

  // Focus the game area for keyboard accessibility
  const gameAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (gameAreaRef.current) gameAreaRef.current.focus();
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const handle = setInterval(() => {
      setSnake(prev => {
        const next = { x: prev[0].x + moveRef.current.x, y: prev[0].y + moveRef.current.y };
        if (
          next.x < 0 || next.x >= BOARD_SIZE ||
          next.y < 0 || next.y >= BOARD_SIZE ||
          prev.some(seg => seg.x === next.x && seg.y === next.y)
        ) {
          playGameOverSound();
          setGameState('over');
          return prev;
        }
        let newSnake = [next, ...prev];
        if (next.x === food.x && next.y === food.y) {
          playEatSound();
          setFood(getRandomFood(newSnake));
          setScore(s => s + 1);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, SPEEDS[difficulty]);
    return () => clearInterval(handle);
  }, [gameState, food, difficulty]);

  useEffect(() => {
    lastDir.current = dir;
  }, [dir]);

  useEffect(() => {
    // Keyboard controls for snake direction
    const handleKey = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowUp' && lastDir.current.y !== 1) setDir({ x: 0, y: -1 });
      if (e.key === 'ArrowDown' && lastDir.current.y !== -1) setDir({ x: 0, y: 1 });
      if (e.key === 'ArrowLeft' && lastDir.current.x !== 1) setDir({ x: -1, y: 0 });
      if (e.key === 'ArrowRight' && lastDir.current.x !== -1) setDir({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'over' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', String(score));
    }
  }, [gameState, score, highScore]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDir(INITIAL_DIR);
    setFood(getRandomFood(INITIAL_SNAKE));
    setScore(0);
    setGameState('playing');
  };

  const playEatSound = () => {
    const audio = new window.Audio('https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_bass/E3.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };
  const playGameOverSound = () => {
    const audio = new window.Audio('https://cdn.jsdelivr.net/gh/gleitz/midi-js-soundfonts@gh-pages/FluidR3_GM/acoustic_bass/E1.mp3');
    audio.volume = 0.2;
    audio.play().catch(() => {});
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-green-400 mb-2">Snake Game</h1>
      <div className="mb-2 flex gap-2">
        {(['Easy', 'Normal', 'Hard'] as const).map(lvl => (
          <button
            key={lvl}
            onClick={() => setDifficulty(lvl)}
            className={`px-3 py-1 rounded-lg font-bold border-2 text-sm ${difficulty === lvl ? 'bg-green-500 text-white border-green-600' : 'bg-white text-green-500 border-green-300'}`}
            disabled={gameState === 'playing'}
          >
            {lvl}
          </button>
        ))}
      </div>
      <div className="mb-2 text-white">Score: {score} &nbsp;|&nbsp; High Score: {highScore}</div>
      <div
        ref={gameAreaRef}
        tabIndex={0}
        aria-label="Snake game area"
        className="relative bg-slate-800 rounded-lg border-2 border-slate-700 outline-none focus:ring-2 focus:ring-green-400"
        style={{ width: BOARD_SIZE * CELL_SIZE, height: BOARD_SIZE * CELL_SIZE }}
      >
        {/* Snake segments */}
        {snake.map((seg, i) => (
          <div
            key={i}
            className="absolute bg-green-400 rounded"
            style={{
              left: seg.x * CELL_SIZE,
              top: seg.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
              zIndex: 2,
            }}
          />
        ))}
        {/* Food */}
        <div
          className="absolute bg-red-400 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
            zIndex: 1,
          }}
        />
      </div>
      {gameState === 'idle' && (
        <button onClick={startGame} className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-red-400 font-bold mb-2">Game Over!</div>
          <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
      <div className="mt-2 text-slate-400 text-sm">Use arrow keys to control the snake.</div>
    </div>
  );
};

export default SnakeGame;
