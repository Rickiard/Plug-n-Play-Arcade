import React from 'react';

interface PlaceholderGameProps {
  onBack: () => void;
  title: string;
}

const PlaceholderGame: React.FC<PlaceholderGameProps> = ({ onBack, title }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center h-full animate-fade-in">
      <div className="w-full max-w-4xl text-center">
        <button onClick={onBack} className="absolute top-4 left-4 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          &larr; Back
        </button>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">{title}</h1>
        <p className="text-xl sm:text-2xl text-slate-300">Coming Soon!</p>
        <div className="mt-8 text-6xl animate-pulse">🕹️</div>
      </div>
    </div>
  );
};

export default PlaceholderGame;