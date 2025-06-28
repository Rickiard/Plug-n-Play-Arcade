import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';

const GAME_DURATION_S = 45;
const TARGET_LIFESPAN_MS = 1500;
const TARGET_SPAWN_RATE_MS = 600;

type Target = { id: number; top: string; left: string; type: 'zombie' | 'human' };

const ShooterGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [targets, setTargets] = useState<Target[]>([]);

  const spawnTarget = useCallback(() => {
    const isHuman = Math.random() < 0.2; // 20% chance for human
    const newTarget: Target = {
      id: Date.now() + Math.floor(Math.random() * 10000),
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 85 + 5}%`,
      type: isHuman ? 'human' : 'zombie',
    };
    setTargets(current => [...current, newTarget]);
    setTimeout(() => {
      setTargets(current => current.filter(t => t.id !== newTarget.id));
    }, TARGET_LIFESPAN_MS);
  }, []);
  
  const resetGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION_S);
    setTargets([]);
    setGameState('playing');
  }

  useEffect(() => {
    let gameTimer: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      gameTimer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('over');
            clearInterval(gameTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(gameTimer);
  }, [gameState]);

  useEffect(() => {
    let targetSpawner: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      targetSpawner = setInterval(spawnTarget, TARGET_SPAWN_RATE_MS);
    }
    return () => clearInterval(targetSpawner);
  }, [gameState, spawnTarget]);

  const handleTargetClick = (id: number) => {
    if (gameState !== 'playing') return;
    setTargets(current => current.filter(t => t.id !== id));
    const target = targets.find(t => t.id === id);
    if (target?.type === 'zombie') {
      setScore(s => s + 10);
    } else if (target?.type === 'human') {
      setScore(s => Math.max(0, s - 15));
    }
  };
  
  const handlePowerUp = () => {
    console.log("Simulating ad for power-up...");
    setScore(s => s + 50); // Instant score boost
    resetGame();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg">
        &larr; Back
      </button>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-pink-400">Zombie Shooter</h1>
        <p className="text-slate-300">Hit the zombies before they disappear!</p>
      </div>
      <div className="w-full max-w-3xl flex justify-between text-2xl font-bold mb-4 px-4">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>
      <div className="relative w-full max-w-3xl h-96 bg-slate-800 rounded-lg shadow-inner overflow-hidden border-2 border-slate-700">
        {gameState === 'playing' && targets.map(target => (
          <div
            key={target.id}
            className={`absolute text-5xl cursor-pointer transition-transform hover:scale-110 ${target.type === 'human' ? 'text-blue-300' : ''}`}
            style={{ top: target.top, left: target.left }}
            onClick={() => handleTargetClick(target.id)}
            aria-label={target.type === 'human' ? 'Human' : 'Zombie'}
          >
            {target.type === 'human' ? '🧑' : '🧟'}
          </div>
        ))}
        {gameState === 'idle' && (
          <div className="w-full h-full flex items-center justify-center">
            <button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-2xl">
              Start
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={gameState === 'over'} title="Game Over!">
        <p className="text-slate-300 text-xl mb-4">Your final score is: <span className="font-bold text-pink-400">{score}</span></p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={resetGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
            Play Again
          </button>
          <button onClick={handlePowerUp} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
            Super Weapon (Ad)
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ShooterGame;