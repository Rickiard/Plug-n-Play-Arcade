import React, { useState, useEffect } from 'react';

const CARD_EMOJIS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🍉', '🍋', '🍑'];
const DIFFICULTIES = {
  Easy: 4,
  Medium: 6,
  Hard: 8,
};

const MemoryMatchGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTIES>('Easy');
  const [cards, setCards] = useState<string[]>(() => shuffle(CARD_EMOJIS.slice(0, DIFFICULTIES[difficulty]).flatMap(e => [e, e])));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [bestMoves, setBestMoves] = useState(() => Number(localStorage.getItem('memoryBestMoves') || 0));
  const [bestTime, setBestTime] = useState(() => Number(localStorage.getItem('memoryBestTime') || 0));
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won'>('idle');
  const [flipSound] = useState(() => new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'));
  const [matchSound] = useState(() => new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'));
  const [mismatchSound] = useState(() => new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  useEffect(() => {
    if (matched.length === cards.length && cards.length > 0) {
      setGameState('won');
    }
  }, [matched, cards]);

  useEffect(() => {
    if (gameState === 'won') {
      if (!bestMoves || moves < bestMoves) {
        setBestMoves(moves);
        localStorage.setItem('memoryBestMoves', String(moves));
      }
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
        localStorage.setItem('memoryBestTime', String(timer));
      }
    }
  }, [gameState, moves, timer, bestMoves, bestTime]);

  const handleFlip = (idx: number) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx) || gameState !== 'playing') return;
    flipSound.currentTime = 0; flipSound.play();
    setFlipped(f => [...f, idx]);
    if (flipped.length === 1) {
      setMoves(m => m + 1);
      const firstIdx = flipped[0];
      if (cards[firstIdx] === cards[idx]) {
        matchSound.currentTime = 0; matchSound.play();
        setMatched(m => [...m, firstIdx, idx]);
        setTimeout(() => setFlipped([]), 700);
      } else {
        mismatchSound.currentTime = 0; mismatchSound.play();
        setTimeout(() => setFlipped([]), 900);
      }
    }
  };

  const startGame = () => {
    const numPairs = DIFFICULTIES[difficulty];
    const selected = CARD_EMOJIS.slice(0, numPairs);
    setCards(shuffle(selected.flatMap(e => [e, e])));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimer(0);
    setGameState('playing');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-pink-400 mb-2">Memory Match</h1>
      <div className="mb-2 text-white">Moves: {moves} | Time: {timer}s | Best: {bestMoves || '-'} moves, {bestTime || '-'}s</div>
      <div className="mb-4 flex gap-2">
        {Object.keys(DIFFICULTIES).map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level as keyof typeof DIFFICULTIES)}
            className={`px-3 py-1 rounded-lg font-bold border-2 text-sm ${difficulty === level ? 'bg-pink-500 text-white border-pink-600' : 'bg-white text-pink-500 border-pink-300'}`}
            disabled={gameState === 'playing'}
          >
            {level}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-3 bg-slate-800 p-4 rounded-lg border-2 border-slate-700">
        {cards.map((emoji, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(idx);
          return (
            <button
              key={idx}
              className={`w-16 h-16 sm:w-20 sm:h-20 text-3xl sm:text-4xl rounded-lg flex items-center justify-center font-bold transition-all duration-200
                ${isFlipped ? 'bg-white text-pink-500 scale-105' : 'bg-pink-400 text-white'}
                ${matched.includes(idx) ? 'opacity-60' : ''}`}
              onClick={() => handleFlip(idx)}
              disabled={isFlipped || gameState !== 'playing'}
            >
              {isFlipped ? emoji : '❓'}
            </button>
          );
        })}
      </div>
      {gameState === 'idle' && (
        <button onClick={startGame} className="mt-4 bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'won' && (
        <div className="mt-4 flex flex-col items-center animate-bounceIn">
          <div className="text-2xl text-pink-400 font-bold mb-2">You Won!</div>
          <div className="mb-2 text-white">Moves: {moves} | Time: {timer}s</div>
          <div className="mb-2 text-pink-300">Best: {bestMoves || '-'} moves, {bestTime || '-'}s</div>
          <button onClick={startGame} className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default MemoryMatchGame;

function shuffle<T>(arr: T[]): T[] {
  return arr.slice().sort(() => Math.random() - 0.5);
}
