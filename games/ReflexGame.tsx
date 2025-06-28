import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';

interface ReflexGameProps {
  onBack: () => void;
}

const GAME_DURATION_MS = 30000; // 30 seconds
const TARGET_LIFESPAN_MS = 1200; // How long a target stays on screen

const ReflexGame: React.FC<ReflexGameProps> = ({ onBack }) => {
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_MS / 1000);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [reviveUsed, setReviveUsed] = useState(false);

  const moveTarget = useCallback(() => {
    const top = Math.random() * 80 + 10;
    const left = Math.random() * 80 + 10;
    setTargetPos({ top: `${top}%`, left: `${left}%` });
  }, []);

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
    let targetTimer: ReturnType<typeof setInterval>;
    if (gameState === 'playing') {
      moveTarget();
      targetTimer = setInterval(moveTarget, TARGET_LIFESPAN_MS);
    }
    return () => clearInterval(targetTimer);
  }, [gameState, moveTarget]);

  const handleTargetClick = () => {
    if (gameState === 'playing') {
      setScore(s => s + 10);
      moveTarget();
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_DURATION_MS / 1000);
    setGameState('playing');
    setReviveUsed(false);
  };

  const handleRevive = () => {
    // Simulates watching an ad
    console.log("Simulating ad for revive...");
    setGameState('playing');
    setTimeLeft(10); // Give 10 more seconds
    setReviveUsed(true);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        &larr; Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-cyan-400">Reflex Game</h1>
        <p className="text-slate-300">Click the target before it moves!</p>
      </div>
      
      <div className="w-full max-w-3xl flex justify-between text-2xl font-bold mb-4 px-4">
        <span>Score: {score}</span>
        <span>Time: {timeLeft}s</span>
      </div>

      <div className="relative w-full max-w-3xl h-96 bg-slate-800 rounded-lg shadow-inner overflow-hidden border-2 border-slate-700">
        {gameState === 'playing' && (
          <div
            className="absolute w-16 h-16 bg-red-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-in-out shadow-lg hover:scale-110"
            style={{ top: targetPos.top, left: targetPos.left }}
            onClick={handleTargetClick}
          />
        )}
        {gameState === 'idle' && (
            <div className="w-full h-full flex items-center justify-center">
                <button onClick={startGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-transform transform hover:scale-105">
                    Start Game
                </button>
            </div>
        )}
      </div>

      <Modal isOpen={gameState === 'over'} title="Game Over!">
        <p className="text-slate-300 text-xl mb-4">Your final score is: <span className="font-bold text-cyan-400">{score}</span></p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={startGame} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Play Again
          </button>
          {!reviveUsed && (
            <button onClick={handleRevive} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
              Revive (Ad)
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ReflexGame;