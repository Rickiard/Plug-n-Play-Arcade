import React, { useRef, useEffect, useState } from 'react';

const WIDTH = 500;
const HEIGHT = 300;
const PADDLE_W = 10;
const PADDLE_H = 60;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const BALL_SPEED = 4;
const AI_ERROR_CHANCE = 0.12; // Lower error for smarter AI
const AI_REACTION_DELAY = 3; // Faster reaction

const PongGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [mode, setMode] = useState<'idle' | '1p' | '2p'>('idle');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState({ left: 0, right: 0 });
  const [winner, setWinner] = useState<string | null>(null);
  const leftPaddle = useRef(HEIGHT / 2 - PADDLE_H / 2);
  const rightPaddle = useRef(HEIGHT / 2 - PADDLE_H / 2);
  const ball = useRef({ x: WIDTH / 2, y: HEIGHT / 2, vx: BALL_SPEED, vy: BALL_SPEED });
  const keys = useRef<{ [k: string]: boolean }>({});
  const loopRef = useRef<number | null>(null);
  let aiDelay = 0;
  let aiTargetY = HEIGHT / 2;
  let aiSmooth = 0;

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = () => {
      // Move paddles
      if (keys.current['w']) leftPaddle.current -= PADDLE_SPEED;
      if (keys.current['s']) leftPaddle.current += PADDLE_SPEED;
      if (mode === '2p') {
        if (keys.current['ArrowUp']) rightPaddle.current -= PADDLE_SPEED;
        if (keys.current['ArrowDown']) rightPaddle.current += PADDLE_SPEED;
      } else if (mode === '1p') {
        // Improved AI: predict ball position, add error, and smooth movement
        aiDelay++;
        if (aiDelay > AI_REACTION_DELAY) {
          aiDelay = 0;
          // Predict where the ball will be when it reaches the AI paddle
          const framesToReach = (WIDTH - PADDLE_W - BALL_SIZE - ball.current.x) / Math.abs(ball.current.vx || 1);
          aiTargetY = ball.current.y + (ball.current.vy * framesToReach);
          // Add error
          if (Math.random() < AI_ERROR_CHANCE) {
            aiTargetY += (Math.random() - 0.5) * 80;
          }
        }
        // Smoothly move toward target using lerp
        const aiCenter = rightPaddle.current + PADDLE_H / 2;
        aiSmooth = aiSmooth * 0.7 + aiTargetY * 0.3;
        if (aiSmooth < aiCenter - 8) rightPaddle.current -= PADDLE_SPEED * 0.7;
        else if (aiSmooth > aiCenter + 8) rightPaddle.current += PADDLE_SPEED * 0.7;
      }
      leftPaddle.current = Math.max(0, Math.min(HEIGHT - PADDLE_H, leftPaddle.current));
      rightPaddle.current = Math.max(0, Math.min(HEIGHT - PADDLE_H, rightPaddle.current));
      // Move ball
      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;
      // Collisions
      if (ball.current.y < 0 || ball.current.y > HEIGHT - BALL_SIZE) ball.current.vy *= -1;
      // Left paddle
      if (
        ball.current.x < PADDLE_W &&
        ball.current.y + BALL_SIZE > leftPaddle.current &&
        ball.current.y < leftPaddle.current + PADDLE_H
      ) {
        ball.current.vx *= -1;
        ball.current.x = PADDLE_W;
      }
      // Right paddle
      if (
        ball.current.x > WIDTH - PADDLE_W - BALL_SIZE &&
        ball.current.y + BALL_SIZE > rightPaddle.current &&
        ball.current.y < rightPaddle.current + PADDLE_H
      ) {
        ball.current.vx *= -1;
        ball.current.x = WIDTH - PADDLE_W - BALL_SIZE;
      }
      // Score
      if (ball.current.x < 0) {
        setScore(s => ({ ...s, right: s.right + 1 }));
        flashGoal('right');
        resetBall(-1);
      }
      if (ball.current.x > WIDTH - BALL_SIZE) {
        setScore(s => ({ ...s, left: s.left + 1 }));
        flashGoal('left');
        resetBall(1);
      }
      // Draw
      draw();
      loopRef.current = requestAnimationFrame(loop);
    };
    loopRef.current = requestAnimationFrame(loop);
    return () => { if (loopRef.current) cancelAnimationFrame(loopRef.current); };
    // eslint-disable-next-line
  }, [gameState, mode]);

  useEffect(() => {
    if (score.left >= 5) {
      setWinner('Left Player (W/S)');
      setGameState('over');
    } else if (score.right >= 5) {
      setWinner('Right Player (Up/Down)');
      setGameState('over');
    }
  }, [score]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => (keys.current[e.key] = true);
    const up = (e: KeyboardEvent) => (keys.current[e.key] = false);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const resetBall = (dir: 1 | -1) => {
    ball.current = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      vx: BALL_SPEED * dir,
      vy: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1),
    };
  };

  const startGame = (selectedMode: '1p' | '2p') => {
    setScore({ left: 0, right: 0 });
    leftPaddle.current = HEIGHT / 2 - PADDLE_H / 2;
    rightPaddle.current = HEIGHT / 2 - PADDLE_H / 2;
    resetBall(Math.random() > 0.5 ? 1 : -1);
    setWinner(null);
    setMode(selectedMode);
    setGameState('playing');
  };

  // Goal flash effect
  const [goalFlash, setGoalFlash] = useState<'left' | 'right' | null>(null);
  const flashGoal = (side: 'left' | 'right') => {
    setGoalFlash(side);
    setTimeout(() => setGoalFlash(null), 350);
  };

  const draw = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    // Paddles
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(0, leftPaddle.current, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#f472b6';
    ctx.fillRect(WIDTH - PADDLE_W, rightPaddle.current, PADDLE_W, PADDLE_H);
    // Ball
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(ball.current.x, ball.current.y, BALL_SIZE, BALL_SIZE);
    // Center line
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 0);
    ctx.lineTo(WIDTH / 2, HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    // Score
    ctx.font = '32px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(score.left + ' : ' + score.right, WIDTH / 2 - 40, 40);
    // Goal flash effect
    if (goalFlash) {
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = goalFlash === 'left' ? '#3b82f6' : '#f472b6';
      ctx.fillRect(goalFlash === 'left' ? 0 : WIDTH / 2, 0, WIDTH / 2, HEIGHT);
      ctx.restore();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-blue-400 mb-2">Pong</h1>
      <div className="mb-2 text-white">First to 5 wins!<br/>Left: W/S | Right: {mode === '2p' ? 'Up/Down' : 'AI'}</div>
      <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-lg border-2 border-slate-700 bg-slate-800" />
      {mode === 'idle' && (
        <div className="flex gap-4 mt-4">
          <button onClick={() => startGame('1p')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">1 Player</button>
          <button onClick={() => startGame('2p')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">2 Player</button>
        </div>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-blue-400 font-bold mb-2">{winner} Wins!</div>
          <button onClick={() => setMode('idle')} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Back to Menu</button>
        </div>
      )}
    </div>
  );
};

export default PongGame;
