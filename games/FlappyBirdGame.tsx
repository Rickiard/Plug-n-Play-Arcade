import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 400;
const HEIGHT = 500;
const BIRD_SIZE = 30;
const GRAVITY = 0.22; // reduced from 0.35 for slower fall
const FLAP = -8; // increased from -7 for stronger flap
const PIPE_W = 50;
const PIPE_GAP = 120;
const PIPE_SPEED = 2.5;

const FlappyBirdGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const birdY = useRef(HEIGHT / 2);
  const birdVel = useRef(0);
  const pipes = useRef<{ x: number; gapY: number; passed?: boolean }[]>([]);
  const loopRef = useRef<number | null>(null);

  const resetGame = () => {
    birdY.current = HEIGHT / 2;
    birdVel.current = 0;
    pipes.current = [
      { x: WIDTH + 100, gapY: Math.random() * (HEIGHT - PIPE_GAP - 80) + 40, passed: false },
      { x: WIDTH + 300, gapY: Math.random() * (HEIGHT - PIPE_GAP - 80) + 40, passed: false },
    ];
    setScore(0);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = () => {
      birdVel.current += GRAVITY;
      birdY.current += birdVel.current;
      // Move pipes
      pipes.current = pipes.current.map(p => ({ ...p, x: p.x - PIPE_SPEED }));
      // Add new pipe
      if (pipes.current[0].x < -PIPE_W) {
        pipes.current.shift();
        pipes.current.push({ x: WIDTH, gapY: Math.random() * (HEIGHT - PIPE_GAP - 80) + 40, passed: false });
      }
      // Score: increment when bird passes a pipe
      pipes.current.forEach((p) => {
        if (!p.passed && p.x + PIPE_W < 60) {
          p.passed = true;
          setScore(s => s + 1);
        }
      });
      // Collision
      const birdBox = { x: 60, y: birdY.current, w: BIRD_SIZE, h: BIRD_SIZE };
      for (const p of pipes.current) {
        if (
          birdBox.x + birdBox.w > p.x && birdBox.x < p.x + PIPE_W &&
          (birdBox.y < p.gapY || birdBox.y + birdBox.h > p.gapY + PIPE_GAP)
        ) {
          setGameState('over');
          return;
        }
      }
      if (birdY.current < 0 || birdY.current > HEIGHT - BIRD_SIZE) {
        setGameState('over');
        return;
      }
      draw();
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
    // eslint-disable-next-line
  }, [gameState]);

  useEffect(() => {
    const flap = () => {
      if (gameState !== 'playing') return;
      birdVel.current = FLAP;
    };
    window.addEventListener('keydown', flap);
    window.addEventListener('mousedown', flap);
    return () => {
      window.removeEventListener('keydown', flap);
      window.removeEventListener('mousedown', flap);
    };
  }, [gameState]);

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, '#60a5fa'); // blue-400
    grad.addColorStop(1, '#f0e9f9'); // light
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Pipes
    for (const p of pipes.current) {
      // Pipe body
      ctx.fillStyle = '#10b981';
      ctx.fillRect(p.x, 0, PIPE_W, p.gapY);
      ctx.fillRect(p.x, p.gapY + PIPE_GAP, PIPE_W, HEIGHT - p.gapY - PIPE_GAP);
      // Pipe caps
      ctx.fillStyle = '#059669';
      ctx.fillRect(p.x - 2, p.gapY - 10, PIPE_W + 4, 12);
      ctx.fillRect(p.x - 2, p.gapY + PIPE_GAP - 2, PIPE_W + 4, 12);
    }
    // Bird (body)
    ctx.save();
    ctx.translate(60 + BIRD_SIZE / 2, birdY.current + BIRD_SIZE / 2);
    ctx.rotate(Math.max(-0.5, Math.min(0.5, birdVel.current / 10)));
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE / 2, BIRD_SIZE / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Bird (wing)
    ctx.fillStyle = '#f59e42';
    ctx.beginPath();
    ctx.ellipse(-6, 4, 7, 4, -0.5, 0, Math.PI * 2);
    ctx.fill();
    // Bird (eye)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(8, -4, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(9, -4, 2, 0, Math.PI * 2);
    ctx.fill();
    // Bird (beak)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(20, 2);
    ctx.lineTo(15, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // Score
    ctx.font = '24px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText('Score: ' + score, 10, 30);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-cyan-400 mb-2">Flappy Bird</h1>
      <div className="mb-2 text-white">Click or press any key to flap!</div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-lg border-2 border-slate-700 bg-slate-800" />
      {gameState === 'idle' && (
        <button onClick={resetGame} className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-cyan-400 font-bold mb-2">Game Over!</div>
          <button onClick={resetGame} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default FlappyBirdGame;
