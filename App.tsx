import React, { useState } from 'react';
import { GAMES } from './constants';
import type { Game } from './types';

const GameCard: React.FC<{ game: Game; onSelect: () => void }> = ({ game, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-slate-800 rounded-lg p-6 flex flex-col items-center text-center cursor-pointer
               transform hover:scale-105 hover:bg-slate-700 transition-all duration-300
               shadow-lg border border-slate-700"
  >
    <div className="mb-4">{game.icon}</div>
    <h3 className="text-xl font-bold mb-2 text-white">{game.title}</h3>
    <p className="text-slate-400 text-sm">{game.description}</p>
  </div>
);

const GameHub: React.FC<{ onSelectGame: (game: Game) => void }> = ({ onSelectGame }) => (
  <div className="p-4 sm:p-6 md:p-8">
    <header className="text-center mb-10">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
        Plug'n Play Arcade
      </h1>
      <p className="mt-2 text-lg text-slate-300">Choose a game below and start the fun!</p>
    </header>
    <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
      {GAMES.map(game => (
        <GameCard key={game.id} game={game} onSelect={() => onSelectGame(game)} />
      ))}
    </main>
    <footer className="text-center mt-12 text-slate-500">
        <p>Developed with React, TailwindCSS, and Gemini.</p>
    </footer>
  </div>
);

const App: React.FC = () => {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const handleSelectGame = (game: Game) => {
    setSelectedGame(game);
  };

  const handleBackToHub = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen w-full">
      {selectedGame ? (
        <selectedGame.component onBack={handleBackToHub} />
      ) : (
        <GameHub onSelectGame={handleSelectGame} />
      )}
    </div>
  );
};

export default App;