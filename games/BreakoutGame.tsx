import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '../components/Modal';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_HEIGHT = 20;
const BRICK_GAP = 4;

type Brick = { x: number; y: number; alive: boolean };

const BreakoutGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [lives, setLives] = useState(3);
    const [score, setScore] = useState(0);

    const paddleX = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    const ballPos = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 });
    const ballVel = useRef({ x: 3, y: -3 });
    const bricks = useRef<Brick[]>([]);
    const gameLoopRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Add paddle velocity for smooth movement
    const paddleVel = useRef(0);
    const targetPaddleX = useRef(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);

    const resetLevel = useCallback(() => {
        ballPos.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 60 };
        ballVel.current = { x: 3, y: -3 };
        paddleX.current = GAME_WIDTH / 2 - PADDLE_WIDTH / 2;
    }, []);

    const createBricks = useCallback(() => {
        bricks.current = [];
        const brickWidth = (GAME_WIDTH - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
        for (let r = 0; r < BRICK_ROWS; r++) {
            for (let c = 0; c < BRICK_COLS; c++) {
                bricks.current.push({
                    x: BRICK_GAP + c * (brickWidth + BRICK_GAP),
                    y: BRICK_GAP + r * (BRICK_HEIGHT + BRICK_GAP) + 30,
                    alive: true,
                });
            }
        }
    }, []);

    const resetGame = useCallback((isRevive = false) => {
        createBricks();
        resetLevel();
        if(!isRevive) {
            setScore(0);
            setLives(3);
        }
        setGameState('playing');
    }, [createBricks, resetLevel]);

    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.fillStyle = '#1e293b'; // slate-800
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Update ball
        ballPos.current.x += ballVel.current.x;
        ballPos.current.y += ballVel.current.y;

        // Wall collision
        if (ballPos.current.x - BALL_RADIUS < 0 || ballPos.current.x + BALL_RADIUS > GAME_WIDTH) ballVel.current.x *= -1;
        if (ballPos.current.y - BALL_RADIUS < 0) ballVel.current.y *= -1;

        // Paddle collision
        if (ballPos.current.y + BALL_RADIUS > GAME_HEIGHT - PADDLE_HEIGHT &&
            ballPos.current.x > paddleX.current &&
            ballPos.current.x < paddleX.current + PADDLE_WIDTH) {
            ballVel.current.y *= -1;
        }

        // Brick collision
        const brickWidth = (GAME_WIDTH - BRICK_GAP * (BRICK_COLS + 1)) / BRICK_COLS;
        bricks.current.forEach(brick => {
            if (brick.alive) {
                if (ballPos.current.x > brick.x && ballPos.current.x < brick.x + brickWidth &&
                    ballPos.current.y > brick.y && ballPos.current.y < brick.y + BRICK_HEIGHT) {
                    ballVel.current.y *= -1;
                    brick.alive = false;
                    setScore(s => s + 10);
                }
            }
        });

        // Lose life
        if (ballPos.current.y + BALL_RADIUS > GAME_HEIGHT) {
            setLives(l => l - 1);
            if(lives - 1 <= 0) {
                 setGameState('over');
            } else {
                resetLevel();
            }
        }
        
        // Win condition
        if(bricks.current.every(b => !b.alive)){
             createBricks();
             resetLevel();
             setScore(s => s + 100); // Level bonus
        }

        // Draw everything
        ctx.fillStyle = '#6366F1'; // indigo-400
        ctx.fillRect(paddleX.current, GAME_HEIGHT - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.beginPath();
        ctx.arc(ballPos.current.x, ballPos.current.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#F472B6'; // pink-400
        ctx.fill();
        ctx.closePath();
        bricks.current.forEach((brick, index) => {
            if (brick.alive) {
                ctx.fillStyle = `hsl(${(index * 20) % 360}, 70%, 60%)`;
                ctx.fillRect(brick.x, brick.y, brickWidth, BRICK_HEIGHT);
            }
        });

        // Add simple ball trail effect
        const ballTrail = useRef<{x:number,y:number}[]>([]);
        ballTrail.current.push({x: ballPos.current.x, y: ballPos.current.y});
        if (ballTrail.current.length > 10) ballTrail.current.shift();
        // Draw trail
        for (let i = 0; i < ballTrail.current.length; i++) {
            ctx.globalAlpha = i / ballTrail.current.length * 0.5;
            ctx.beginPath();
            ctx.arc(ballTrail.current[i].x, ballTrail.current[i].y, BALL_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = '#F472B6';
            ctx.fill();
            ctx.closePath();
        }
        ctx.globalAlpha = 1;

        // Smoothly interpolate paddle position
        paddleVel.current += (targetPaddleX.current - paddleX.current) * 0.2;
        paddleVel.current *= 0.7; // friction
        paddleX.current += paddleVel.current;
        if (paddleX.current < 0) paddleX.current = 0;
        if (paddleX.current > GAME_WIDTH - PADDLE_WIDTH) paddleX.current = GAME_WIDTH - PADDLE_WIDTH;

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, lives, createBricks, resetLevel]);

    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
    }, [gameState, gameLoop]);

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        let newX = e.clientX - rect.left - PADDLE_WIDTH / 2;
        if (newX < 0) newX = 0;
        if (newX > GAME_WIDTH - PADDLE_WIDTH) newX = GAME_WIDTH - PADDLE_WIDTH;
        targetPaddleX.current = newX;
    };
    
    const handleRevive = () => {
        console.log("Simulating ad for extra life...");
        setLives(1);
        resetGame(true);
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
            <button onClick={onBack} className="absolute top-4 left-4 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back
            </button>
            <div className="text-center mb-4 w-full max-w-[600px]">
                <h1 className="text-4xl font-bold text-indigo-400">Block Breaker</h1>
                <div className="flex justify-between text-xl font-bold mt-2">
                    <span>Score: {score}</span>
                    <span>Lives: {lives}</span>
                </div>
            </div>
            <div className="relative bg-slate-800 rounded-lg shadow-inner border-2 border-slate-700">
                <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} onMouseMove={handleMouseMove} />
                {gameState === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={() => resetGame(false)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-2xl">
                            Start
                        </button>
                    </div>
                )}
            </div>
            <Modal isOpen={gameState === 'over'} title="Game Over!">
                <p className="text-slate-300 text-xl mb-4">Your final score: <span className="font-bold text-indigo-400">{score}</span></p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={() => resetGame(false)} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                        Play Again
                    </button>
                    <button onClick={handleRevive} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                        Extra Life (Ad)
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default BreakoutGame;