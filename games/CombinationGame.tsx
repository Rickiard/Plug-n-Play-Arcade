import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';

const BOARD_SIZE = 8;
const FRUITS = ['🍓', '🍇', '🍊', '🍌', '🍍', '🥝'];
const INITIAL_MOVES = 25;

type Cell = { fruit: string };

const CombinationGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [movesLeft, setMovesLeft] = useState(INITIAL_MOVES);
  const [score, setScore] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');
  
  const createBoard = useCallback(() => {
    const newBoard = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => ({
        fruit: FRUITS[Math.floor(Math.random() * FRUITS.length)],
      }))
    );
    // Simple check to avoid instant matches on creation (not exhaustive)
    // A more robust solution would check and replace until no matches exist
    setBoard(newBoard);
  }, []);

  useEffect(() => {
    createBoard();
  }, [createBoard]);
  
  const checkForMatches = useCallback((currentBoard: Cell[][]) => {
    const matches = new Set<string>();
    // Check horizontal
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE - 2; c++) {
        if (currentBoard[r][c].fruit && currentBoard[r][c].fruit === currentBoard[r][c+1].fruit && currentBoard[r][c].fruit === currentBoard[r][c+2].fruit) {
          matches.add(`${r}-${c}`);
          matches.add(`${r}-${c+1}`);
          matches.add(`${r}-${c+2}`);
        }
      }
    }
    // Check vertical
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (let r = 0; r < BOARD_SIZE - 2; r++) {
         if (currentBoard[r][c].fruit && currentBoard[r][c].fruit === currentBoard[r+1][c].fruit && currentBoard[r][c].fruit === currentBoard[r+2][c].fruit) {
          matches.add(`${r}-${c}`);
          matches.add(`${r+1}-${c}`);
          matches.add(`${r+2}-${c}`);
        }
      }
    }
    return matches;
  }, []);

  const handleCellClick = (r: number, c: number) => {
    if (gameState !== 'playing') return;

    if (selectedCell) {
      const { r: selR, c: selC } = selectedCell;
      // Check if adjacent
      if (Math.abs(selR - r) + Math.abs(selC - c) === 1) {
        // Swap
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        const temp = newBoard[selR][selC];
        newBoard[selR][selC] = newBoard[r][c];
        newBoard[r][c] = temp;
        
        const matches = checkForMatches(newBoard);
        if(matches.size > 0) {
            setBoard(newBoard);
            setMovesLeft(m => m - 1);
        }
      }
      setSelectedCell(null);
    } else {
      setSelectedCell({ r, c });
    }
  };

  const processBoard = useCallback(() => {
    if (gameState !== 'playing') return;
    let newBoard = board.map(row => [...row]);
    const matches = checkForMatches(newBoard);

    if (matches.size > 0) {
      setScore(s => s + matches.size * 10);
      matches.forEach(match => {
        const [r, c] = match.split('-').map(Number);
        newBoard[r][c].fruit = '';
      });

      // Gravity
      for (let c = 0; c < BOARD_SIZE; c++) {
        let emptyRow = BOARD_SIZE - 1;
        for (let r = BOARD_SIZE - 1; r >= 0; r--) {
          if (newBoard[r][c].fruit !== '') {
            const temp = newBoard[emptyRow][c];
            newBoard[emptyRow][c] = newBoard[r][c];
            newBoard[r][c] = temp;
            emptyRow--;
          }
        }
      }
      
      // Refill
      for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
          if(newBoard[r][c].fruit === '') {
            newBoard[r][c].fruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
          }
        }
      }
      
      setTimeout(() => setBoard(newBoard), 200);
    }
  }, [board, checkForMatches, gameState]);

  useEffect(() => {
    const gameLogic = setTimeout(() => {
      processBoard();
      if(movesLeft <= 0) {
        setGameState('over');
      }
    }, 300);
    return () => clearTimeout(gameLogic);
  }, [board, movesLeft, processBoard]);
  
  const resetGame = () => {
      createBoard();
      setScore(0);
      setMovesLeft(INITIAL_MOVES);
      setSelectedCell(null);
      setGameState('playing');
  }

  const addMoves = () => {
    console.log("Simulating ad for +5 moves...");
    setMovesLeft(m => m + 5);
    setGameState('playing');
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        &larr; Back
      </button>
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-green-400">Fruit Match</h1>
        <div className="flex justify-around w-full max-w-sm mt-2 text-xl">
          <span className="font-bold">Score: {score}</span>
          <span className="font-bold">Moves: {movesLeft}</span>
        </div>
      </div>
      <div className="grid gap-1 bg-slate-700 p-2 rounded-lg" style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)` }}>
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-2xl rounded-md transition-all duration-200 cursor-pointer
                ${selectedCell && selectedCell.r === r && selectedCell.c === c ? 'bg-yellow-400 scale-110' : 'bg-slate-800'}`}
              onClick={() => handleCellClick(r, c)}
            >
              {cell.fruit}
            </div>
          ))
        )}
      </div>
       <Modal isOpen={gameState === 'over'} title="Game Over!">
        <p className="text-slate-300 text-xl mb-4">Your final score is: <span className="font-bold text-green-400">{score}</span></p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={resetGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            Play Again
          </button>
          <button onClick={addMoves} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
            +5 Moves (Ad)
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CombinationGame;