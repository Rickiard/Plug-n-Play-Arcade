import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '../components/Modal';
import AdBanner from '../components/AdBanner';

const GAME_WIDTH = 600;
const GAME_HEIGHT = 200;
const PLAYER_SIZE = 30;
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const OBSTACLE_WIDTH = 20;
const OBSTACLE_SPEED = 4;
const OBSTACLE_SPAWN_RATE = 120; // Lower is more frequent

const InfiniteRunnerGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
    const [score, setScore] = useState(0);
    const playerY = useRef(GAME_HEIGHT - PLAYER_SIZE);
    const playerVelY = useRef(0);
    const obstacles = useRef<{ x: number; height: number, type: 'cactus' | 'rock' }[]>([]);
    const frameCount = useRef(0);
    const gameLoopRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [screenShake, setScreenShake] = useState(0);

    const resetGame = useCallback((isRevive = false) => {
        playerY.current = GAME_HEIGHT - PLAYER_SIZE;
        playerVelY.current = 0;
        obstacles.current = [];
        if (!isRevive) {
            setScore(0);
        }
        frameCount.current = 0;
        setGameState('playing');
    }, []);
    
    const startGame = () => {
        resetGame(false);
    }
    
    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx || !canvas) return;

        // Clear canvas
        ctx.fillStyle = '#2d3748'; // slate-800
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

        // Draw ground
        ctx.fillStyle = '#4ade80'; // green-400
        ctx.fillRect(0, GAME_HEIGHT - 10, GAME_WIDTH, 10);
        // Draw sky gradient
        const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
        sky.addColorStop(0, '#60a5fa');
        sky.addColorStop(1, '#f0e9f9');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT - 10);

        // Update & draw player
        playerVelY.current += GRAVITY;
        playerY.current += playerVelY.current;
        if (playerY.current > GAME_HEIGHT - PLAYER_SIZE) {
            playerY.current = GAME_HEIGHT - PLAYER_SIZE;
            playerVelY.current = 0;
        }
        // Draw chicken shadow
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.ellipse(50 + PLAYER_SIZE / 2, GAME_HEIGHT - 5, PLAYER_SIZE / 2, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#222';
        ctx.fill();
        ctx.restore();
        // Draw chicken (body, wing, beak, eye)
        ctx.save();
        ctx.translate(50 + PLAYER_SIZE / 2, playerY.current + PLAYER_SIZE / 2);
        // Bobbing effect
        const bob = Math.sin(Date.now() / 120) * 2;
        ctx.translate(0, bob);
        // Body
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.ellipse(0, 0, PLAYER_SIZE / 2, PLAYER_SIZE / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wing
        ctx.fillStyle = '#f59e42';
        ctx.beginPath();
        ctx.ellipse(-7, 5, 8, 5, -0.5, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(10, -5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(11, -5, 2, 0, Math.PI * 2);
        ctx.fill();
        // Beak
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.moveTo(18, 0);
        ctx.lineTo(25, 2);
        ctx.lineTo(18, 5);
        ctx.closePath();
        ctx.fill();
        // Comb
        ctx.fillStyle = '#f87171';
        ctx.beginPath();
        ctx.arc(0, -PLAYER_SIZE / 2 + 6, 4, 0, Math.PI * 2);
        ctx.arc(4, -PLAYER_SIZE / 2 + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Update & draw obstacles
        frameCount.current++;
        if (frameCount.current % OBSTACLE_SPAWN_RATE === 0) {
            const height = Math.random() * 80 + 20;
            const type = Math.random() < 0.5 ? 'cactus' : 'rock';
            obstacles.current.push({ x: GAME_WIDTH, height, type });
        }
        obstacles.current.forEach(obs => {
            obs.x -= OBSTACLE_SPEED;
            if (obs.type === 'cactus') {
                // Draw cactus
                ctx.save();
                ctx.fillStyle = '#10B981';
                ctx.fillRect(obs.x, GAME_HEIGHT - obs.height - 10, 14, obs.height);
                ctx.fillRect(obs.x - 4, GAME_HEIGHT - obs.height / 2 - 10, 8, 10);
                ctx.fillRect(obs.x + 10, GAME_HEIGHT - obs.height / 2 - 10, 8, 10);
                ctx.restore();
            } else {
                // Draw rock
                ctx.save();
                ctx.fillStyle = '#64748b';
                ctx.beginPath();
                ctx.ellipse(obs.x + 10, GAME_HEIGHT - 18, 12, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
        obstacles.current = obstacles.current.filter(obs => obs.x > -OBSTACLE_WIDTH);

        // Collision detection
        let shakeX = 0, shakeY = 0;
        if (screenShake > 0) {
            shakeX = (Math.random() - 0.5) * screenShake;
            shakeY = (Math.random() - 0.5) * screenShake;
            setScreenShake(screenShake - 1);
        }
        for (const obs of obstacles.current) {
            const playerBox = { x: 50, y: playerY.current, width: PLAYER_SIZE, height: PLAYER_SIZE };
            const obsBox = { x: obs.x, y: GAME_HEIGHT - obs.height, width: OBSTACLE_WIDTH, height: obs.height };
            if (playerBox.x < obsBox.x + obsBox.width &&
                playerBox.x + playerBox.width > obsBox.x &&
                playerBox.y < obsBox.y + obsBox.height &&
                playerBox.y + playerBox.height > obsBox.y)
            {
                setScreenShake(10);
                setGameState('over');
            }
        }
        
        // Update score
        setScore(s => s + 1);

        // In canvas drawing, apply shake offset
        ctx.setTransform(1, 0, 0, 1, shakeX, shakeY);

        // Draw clouds
        ctx.save();
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 3; i++) {
            const cloudX = (frameCount.current * (0.5 + i * 0.2)) % GAME_WIDTH;
            ctx.beginPath();
            ctx.arc(GAME_WIDTH - cloudX, 40 + i * 20, 18, 0, Math.PI * 2);
            ctx.arc(GAME_WIDTH - cloudX + 15, 40 + i * 20, 12, 0, Math.PI * 2);
            ctx.arc(GAME_WIDTH - cloudX - 15, 40 + i * 20, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
        ctx.restore();

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, screenShake]);
    
    useEffect(() => {
        if (gameState === 'playing') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);

    const handleJump = useCallback((e: Event) => {
        if (e.type === 'keydown' && (e as KeyboardEvent).key !== ' ') return;
        if (gameState === 'playing' && playerY.current >= GAME_HEIGHT - PLAYER_SIZE - 5) {
            if (playerVelY.current > JUMP_FORCE / 2) {
                playerVelY.current = JUMP_FORCE - 2; // slightly higher jump if timed well
            } else {
                playerVelY.current = JUMP_FORCE;
            }
        }
    }, [gameState]);

    useEffect(() => {
        window.addEventListener('keydown', handleJump);
        window.addEventListener('click', handleJump);
        return () => {
            window.removeEventListener('keydown', handleJump);
            window.removeEventListener('click', handleJump);
        };
    }, [handleJump]);
    
    const handleRevive = () => {
        console.log("Simulating ad for revive...");
        resetGame(true);
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
            <button onClick={onBack} className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                &larr; Back
            </button>
            <div className="text-center mb-4">
                <h1 className="text-4xl font-bold text-yellow-400">Fugitive Chicken</h1>
                <p className="text-slate-300">Click or press Space to jump!</p>
                <span className="text-2xl font-bold">Score: {Math.floor(score / 10)}</span>
            </div>
            <div className="relative bg-slate-800 rounded-lg shadow-inner border-2 border-slate-700" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
                <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} />
                {gameState === 'idle' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-2xl">
                            Start
                        </button>
                    </div>
                )}
            </div>
            <Modal isOpen={gameState === 'over'} title="Game Over!">
                <p className="text-slate-300 text-xl mb-4">Your score was: <span className="font-bold text-yellow-400">{Math.floor(score / 10)}</span></p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={startGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                        Play Again
                    </button>
                    <button onClick={handleRevive} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg">
                        <span className="flex flex-col items-center">
                          Continue (Ad)
                          <AdBanner />
                        </span>
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default InfiniteRunnerGame;