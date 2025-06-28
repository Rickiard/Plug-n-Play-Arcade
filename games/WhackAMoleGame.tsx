import React, { useState, useEffect, useRef } from 'react';

const MOLE_COUNT = 6;
const GAME_TIME = 30; // seconds
const MOLE_SHOW_TIME = 800; // ms

const WhackAMoleGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const moleTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('over');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const showMole = () => {
      setActiveMole(Math.floor(Math.random() * MOLE_COUNT));
      moleTimerRef.current = setTimeout(showMole, MOLE_SHOW_TIME);
    };
    showMole();
    return () => { if (moleTimerRef.current) clearTimeout(moleTimerRef.current); };
  }, [gameState]);

  const handleWhack = (idx: number) => {
    if (gameState === 'playing' && idx === activeMole) {
      setScore(s => s + 1);
      setActiveMole(null);
    }
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setGameState('playing');
    setActiveMole(null);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-red-400 mb-2">Whack-a-Mole</h1>
      <div className="mb-2 text-white">Score: {score} | Time: {timeLeft}s</div>
      <div className="grid grid-cols-3 gap-6 mb-4">
        {Array.from({ length: MOLE_COUNT }).map((_, idx) => (
          <button
            key={idx}
            className={`w-24 h-24 rounded-full shadow-lg text-5xl font-bold flex items-center justify-center border-4 border-slate-900 transition-all duration-100
              ${activeMole === idx ? 'bg-red-400 scale-110' : 'bg-slate-700'}`}
            onClick={() => handleWhack(idx)}
            disabled={gameState !== 'playing'}
          >
            {activeMole === idx ? '🐹' : ''}
          </button>
        ))}
      </div>
      {gameState === 'idle' && (
        <button onClick={startGame} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-red-400 font-bold mb-2">Game Over!</div>
          <button onClick={startGame} className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default WhackAMoleGame;
