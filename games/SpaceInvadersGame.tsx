import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 400;
const HEIGHT = 400;
const PLAYER_W = 40;
const PLAYER_H = 20;
const BULLET_H = 18; // Increased bullet height for better range
const ENEMY_W = 30;
const ENEMY_H = 20;
const ENEMY_ROWS = 3;
const ENEMY_COLS = 7;
const ENEMY_GAP = 10;
const ENEMY_SPEED = 1.2; // Slightly slower base speed
const BULLET_SPEED = 7; // Slightly faster bullets

const ENEMY_SHAPES = [
  [
    '  ooo  ',
    ' ooooo ',
    'ooooooo',
    'o  o  o',
    ' o   o ',
  ],
  [
    '  ooo  ',
    ' ooooo ',
    'ooooooo',
    ' o o o ',
    '  ooo  ',
  ],
  [
    '  ooo  ',
    ' ooooo ',
    'ooooooo',
    ' o   o ',
    ' ooooo ',
  ],
];

const SpaceInvadersGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [score, setScore] = useState(0);
  const playerX = useRef(WIDTH / 2 - PLAYER_W / 2);
  const bullets = useRef<{ x: number; y: number }[]>([]);
  const enemies = useRef<{ x: number; y: number; alive: boolean }[]>([]);
  const enemyDir = useRef(1);
  const keys = useRef<{ [k: string]: boolean }>({});
  const loopRef = useRef<number | null>(null);
  let enemyStep = 0;

  const resetGame = () => {
    playerX.current = WIDTH / 2 - PLAYER_W / 2;
    bullets.current = [];
    enemies.current = [];
    for (let r = 0; r < ENEMY_ROWS; r++) {
      for (let c = 0; c < ENEMY_COLS; c++) {
        enemies.current.push({
          x: 30 + c * (ENEMY_W + ENEMY_GAP),
          y: 30 + r * (ENEMY_H + ENEMY_GAP),
          alive: true,
        });
      }
    }
    enemyDir.current = 1;
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = () => {
      // Move player
      if (keys.current['ArrowLeft']) playerX.current -= 4;
      if (keys.current['ArrowRight']) playerX.current += 4;
      playerX.current = Math.max(0, Math.min(WIDTH - PLAYER_W, playerX.current));
      // Move bullets
      bullets.current = bullets.current.map(b => ({ ...b, y: b.y - BULLET_SPEED })).filter(b => b.y > -BULLET_H);
      // Move enemies with a wave pattern
      enemyStep += 0.04;
      let hitEdge = false;
      let minX = WIDTH, maxX = 0;
      for (let i = 0; i < enemies.current.length; i++) {
        const e = enemies.current[i];
        if (!e.alive) continue;
        e.x += ENEMY_SPEED * enemyDir.current + Math.sin(enemyStep + i) * 0.7;
        e.y += Math.sin(enemyStep + i) * 0.2;
        minX = Math.min(minX, e.x);
        maxX = Math.max(maxX, e.x + ENEMY_W);
      }
      if (minX < 0 || maxX > WIDTH) hitEdge = true;
      if (hitEdge) {
        enemyDir.current *= -1;
        for (const e of enemies.current) if (e.alive) e.y += ENEMY_H;
      }
      // Bullet-enemy collision
      for (const b of bullets.current) {
        for (const e of enemies.current) {
          if (
            e.alive &&
            b.x > e.x && b.x < e.x + ENEMY_W &&
            b.y > e.y && b.y < e.y + ENEMY_H
          ) {
            e.alive = false;
            setScore(s => s + 10);
          }
        }
      }
      // Remove bullets that hit
      bullets.current = bullets.current.filter(b => !enemies.current.some(e => !e.alive && b.x > e.x && b.x < e.x + ENEMY_W && b.y > e.y && b.y < e.y + ENEMY_H));
      // Enemy-player collision
      if (enemies.current.some(e => e.alive && e.y + ENEMY_H > HEIGHT - PLAYER_H - 10)) {
        setGameState('lost');
        draw();
        return;
      }
      // Win
      if (enemies.current.every(e => !e.alive)) {
        setGameState('won');
        draw();
        return;
      }
      // Draw
      draw();
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
    // eslint-disable-next-line
  }, [gameState]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.key] = true;
      if (gameState === 'playing' && e.key === ' ') {
        bullets.current.push({ x: playerX.current + PLAYER_W / 2 - 2, y: HEIGHT - PLAYER_H - 10 });
      }
    };
    const up = (e: KeyboardEvent) => (keys.current[e.key] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [gameState]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Player (draw as a spaceship)
    ctx.save();
    ctx.translate(playerX.current + PLAYER_W / 2, HEIGHT - PLAYER_H - 10 + PLAYER_H / 2);
    ctx.fillStyle = '#a3e635';
    ctx.beginPath();
    ctx.moveTo(-PLAYER_W / 2, PLAYER_H / 2);
    ctx.lineTo(0, -PLAYER_H / 2);
    ctx.lineTo(PLAYER_W / 2, PLAYER_H / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Bullets
    ctx.fillStyle = '#fbbf24';
    for (const b of bullets.current) ctx.fillRect(b.x, b.y, 4, BULLET_H);
    // Enemies (draw pixel art)
    for (let i = 0; i < enemies.current.length; i++) {
      const e = enemies.current[i];
      if (!e.alive) continue;
      const shape = ENEMY_SHAPES[i % ENEMY_SHAPES.length];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (shape[y][x] === 'o') {
            ctx.fillStyle = ['#f472b6', '#38bdf8', '#fbbf24'][i % 3];
            ctx.fillRect(e.x + x * 3, e.y + y * 3, 3, 3);
          }
        }
      }
    }
    // Score
    ctx.font = '20px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 10, 25);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-purple-400 mb-2">Space Invaders</h1>
      <div className="mb-2 text-white">Arrow keys to move, Space to shoot</div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-lg border-2 border-slate-700 bg-slate-800" />
      {gameState === 'idle' && (
        <button onClick={resetGame} className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'won' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-purple-400 font-bold mb-2">You Won!</div>
          <button onClick={resetGame} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
      {gameState === 'lost' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-red-400 font-bold mb-2">Game Over!</div>
          <button onClick={resetGame} className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default SpaceInvadersGame;
