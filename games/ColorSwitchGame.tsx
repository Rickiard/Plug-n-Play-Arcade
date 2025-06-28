import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 400;
const HEIGHT = 600;
const BALL_SIZE = 24;
const OBSTACLE_W = 60;
const OBSTACLE_H = 24;
const OBSTACLE_SPEED = 3;
const COLORS = ['#fbbf24', '#f472b6', '#3b82f6', '#10b981'];

function getRandomColorIdx() {
  return Math.floor(Math.random() * COLORS.length);
}

const ColorSwitchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const ballY = useRef(HEIGHT - 80);
  const ballColor = useRef(getRandomColorIdx());
  const obstacles = useRef<{ y: number; color: number }[]>([]);
  const loopRef = useRef<number | null>(null);

  const resetGame = () => {
    ballY.current = HEIGHT - 80;
    ballColor.current = getRandomColorIdx();
    obstacles.current = [
      { y: HEIGHT - 200, color: getRandomColorIdx() },
      { y: HEIGHT - 400, color: getRandomColorIdx() },
      { y: HEIGHT - 600, color: getRandomColorIdx() },
    ];
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = () => {
      // Move obstacles down
      obstacles.current = obstacles.current.map(o => ({ ...o, y: o.y + OBSTACLE_SPEED }));
      // Add new obstacle
      if (obstacles.current[0].y > HEIGHT) {
        obstacles.current.shift();
        obstacles.current.push({ y: -OBSTACLE_H, color: getRandomColorIdx() });
        setScore(s => s + 1);
      }
      // Collision
      for (const o of obstacles.current) {
        if (
          o.y + OBSTACLE_H > ballY.current &&
          o.y < ballY.current + BALL_SIZE &&
          ballColor.current !== o.color
        ) {
          setGameState('over');
          return;
        }
      }
      draw();
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
    // eslint-disable-next-line
  }, [gameState]);

  useEffect(() => {
    const handle = (e: KeyboardEvent | MouseEvent) => {
      if (gameState !== 'playing') return;
      // Change color on click or space
      if ((e as KeyboardEvent).key === ' ' || e.type === 'mousedown') {
        ballColor.current = (ballColor.current + 1) % COLORS.length;
      }
    };
    window.addEventListener('keydown', handle);
    window.addEventListener('mousedown', handle);
    return () => {
      window.removeEventListener('keydown', handle);
      window.removeEventListener('mousedown', handle);
    };
  }, [gameState]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Obstacles
    for (const o of obstacles.current) {
      ctx.fillStyle = COLORS[o.color];
      ctx.fillRect(WIDTH / 2 - OBSTACLE_W / 2, o.y, OBSTACLE_W, OBSTACLE_H);
    }
    // Ball
    ctx.fillStyle = COLORS[ballColor.current];
    ctx.beginPath();
    ctx.arc(WIDTH / 2, ballY.current + BALL_SIZE / 2, BALL_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    // Score
    ctx.font = '24px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 10, 30);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-fuchsia-400 mb-2">Color Switch</h1>
      <div className="mb-2 text-white">Click or press Space to switch color!</div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-lg border-2 border-slate-700 bg-slate-800" />
      {gameState === 'idle' && (
        <button onClick={resetGame} className="mt-4 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-fuchsia-400 font-bold mb-2">Game Over!</div>
          <button onClick={resetGame} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default ColorSwitchGame;
