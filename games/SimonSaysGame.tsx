import React, { useState, useEffect } from 'react';

const COLORS = [
  { name: 'red', class: 'bg-red-500', sound: '🔴' },
  { name: 'green', class: 'bg-green-500', sound: '🟢' },
  { name: 'blue', class: 'bg-blue-500', sound: '🔵' },
  { name: 'yellow', class: 'bg-yellow-400', sound: '🟡' },
];

const SOUNDS = [
  new window.Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'), // red
  new window.Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'), // green
  new window.Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'), // blue
  new window.Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b4b3b.mp3'), // yellow
];

function getRandomColor() {
  return Math.floor(Math.random() * COLORS.length);
}

const SimonSaysGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'show' | 'input' | 'over'>('idle');

  useEffect(() => {
    if (gameState === 'show' && showIdx < sequence.length) {
      const timer = setTimeout(() => {
        setShowIdx(i => i + 1);
        if (showIdx >= 0 && showIdx < sequence.length) {
          SOUNDS[sequence[showIdx]]?.play().catch(() => {});
        }
      }, 700);
      return () => clearTimeout(timer);
    } else if (gameState === 'show' && showIdx === sequence.length) {
      setTimeout(() => {
        setGameState('input');
        setShowIdx(-1);
        setUserInput([]); // Clear user input at start of input phase
      }, 500);
    }
  }, [gameState, showIdx, sequence.length]);

  const startGame = () => {
    setSequence([getRandomColor()]);
    setUserInput([]);
    setScore(0);
    setShowIdx(0);
    setGameState('show');
  };

  const handleColorClick = (idx: number) => {
    if (gameState !== 'input' || showIdx !== -1) return;
    SOUNDS[idx]?.play().catch(() => {});
    const nextInput = [...userInput, idx];
    setUserInput(nextInput);
    if (sequence[nextInput.length - 1] !== idx) {
      setTimeout(() => setGameState('over'), 300); // Add delay for feedback
      return;
    }
    if (nextInput.length === sequence.length) {
      setScore(s => s + 1);
      setTimeout(() => {
        setSequence(seq => [...seq, getRandomColor()]);
        setShowIdx(0);
        setGameState('show');
      }, 700);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-yellow-400 mb-2">Simon Says</h1>
      <div className="mb-2 text-white">Score: {score}</div>
      <div className="grid grid-cols-2 gap-6 mb-4">
        {COLORS.map((color, idx) => (
          <button
            key={color.name}
            className={`w-24 h-24 rounded-lg shadow-lg text-4xl font-bold flex items-center justify-center border-4 border-slate-900 transition-all duration-200
              ${color.class} ${showIdx === idx ? 'ring-4 ring-white scale-110' : ''}`}
            onClick={() => handleColorClick(idx)}
            disabled={gameState !== 'input'}
          >
            {color.sound}
          </button>
        ))}
      </div>
      {gameState === 'idle' && (
        <button onClick={startGame} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-yellow-400 font-bold mb-2">Game Over!</div>
          <button onClick={startGame} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
      {gameState === 'show' && <div className="text-white">Watch the sequence...</div>}
      {gameState === 'input' && <div className="text-white">Repeat the sequence!</div>}
    </div>
  );
};

export default SimonSaysGame;
