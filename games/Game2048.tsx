import React, { useState, useEffect } from 'react';

const SIZE = 4;
const START_TILES = 2;

function getEmptyCells(board: number[][]) {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!board[r][c]) cells.push({ r, c });
  return cells;
}

function addRandomTile(board: number[][]) {
  const empty = getEmptyCells(board);
  if (empty.length === 0) return board;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = value;
  return newBoard;
}

function move(board: number[][], dir: 'up' | 'down' | 'left' | 'right') {
  let moved = false;
  let score = 0;
  let newBoard = board.map(row => [...row]);
  const merge = (arr: number[]) => {
    let res = arr.filter(x => x);
    for (let i = 0; i < res.length - 1; i++) {
      if (res[i] === res[i + 1]) {
        res[i] *= 2;
        score += res[i];
        res[i + 1] = 0;
      }
    }
    res = res.filter(x => x);
    while (res.length < SIZE) res.push(0);
    return res;
  };
  if (dir === 'left') {
    for (let r = 0; r < SIZE; r++) {
      const row = merge(newBoard[r]);
      if (row.some((v, i) => v !== newBoard[r][i])) moved = true;
      newBoard[r] = row;
    }
  } else if (dir === 'right') {
    for (let r = 0; r < SIZE; r++) {
      const row = merge([...newBoard[r]].reverse()).reverse();
      if (row.some((v, i) => v !== newBoard[r][i])) moved = true;
      newBoard[r] = row;
    }
  } else if (dir === 'up') {
    for (let c = 0; c < SIZE; c++) {
      const col = merge(newBoard.map(row => row[c]));
      for (let r = 0; r < SIZE; r++) {
        if (newBoard[r][c] !== col[r]) moved = true;
        newBoard[r][c] = col[r];
      }
    }
  } else if (dir === 'down') {
    for (let c = 0; c < SIZE; c++) {
      const col = merge(newBoard.map(row => row[c]).reverse()).reverse();
      for (let r = 0; r < SIZE; r++) {
        if (newBoard[r][c] !== col[r]) moved = true;
        newBoard[r][c] = col[r];
      }
    }
  }
  return { newBoard, moved, score };
}

function isGameOver(board: number[][]) {
  if (getEmptyCells(board).length > 0) return false;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return false;
    if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return false;
  }
  return true;
}

const Game2048: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [board, setBoard] = useState<number[][]>(() => {
    let b = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
    for (let i = 0; i < START_TILES; i++) b = addRandomTile(b);
    return b;
  });
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'over'>('idle');
  const [animating, setAnimating] = useState(false);
  const [moveDir, setMoveDir] = useState<'up'|'down'|'left'|'right'|null>(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const handle = (e: KeyboardEvent) => {
      let dir: 'up' | 'down' | 'left' | 'right' | null = null;
      if (e.key === 'ArrowUp') dir = 'up';
      if (e.key === 'ArrowDown') dir = 'down';
      if (e.key === 'ArrowLeft') dir = 'left';
      if (e.key === 'ArrowRight') dir = 'right';
      if (dir && !animating) {
        setMoveDir(dir);
        setAnimating(true);
        setTimeout(() => {
          const { newBoard, moved, score: gained } = move(board, dir);
          if (moved) {
            const withTile = addRandomTile(newBoard);
            setBoard(withTile);
            setScore(s => s + gained);
            if (isGameOver(withTile)) setGameState('over');
          }
          setAnimating(false);
          setMoveDir(null);
        }, 120); // Animation duration
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [board, gameState, animating]);

  const startGame = () => {
    let b = Array(SIZE).fill(0).map(() => Array(SIZE).fill(0));
    for (let i = 0; i < START_TILES; i++) b = addRandomTile(b);
    setBoard(b);
    setScore(0);
    setGameState('playing');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900">
      <button onClick={onBack} className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">&larr; Back</button>
      <h1 className="text-4xl font-bold text-orange-400 mb-2">2048</h1>
      <div className="mb-2 text-white">Score: {score}</div>
      <div className="grid grid-cols-4 gap-2 bg-slate-800 p-4 rounded-lg border-2 border-slate-700">
        {board.flat().map((num, idx) => {
          return (
            <div
              key={idx}
              className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-lg transition-all duration-150
                ${num ? 'bg-orange-400 text-white' : 'bg-slate-700 text-slate-400'}
                ${animating && moveDir ? `animate-move-${moveDir}` : ''}`}
              style={{
                transition: animating ? 'transform 0.12s' : undefined,
              }}
            >
              {num || ''}
            </div>
          );
        })}
      </div>
      {gameState === 'idle' && (
        <button onClick={startGame} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Start</button>
      )}
      {gameState === 'over' && (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-2xl text-orange-400 font-bold mb-2">Game Over!</div>
          <button onClick={startGame} className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg text-2xl">Play Again</button>
        </div>
      )}
      {gameState === 'playing' && (
        <div className="mt-2 text-white">Use arrow keys to move tiles.</div>
      )}
      <style>{`
@keyframes move-left { 0% { transform: translateX(20px); } 100% { transform: translateX(0); } }
@keyframes move-right { 0% { transform: translateX(-20px); } 100% { transform: translateX(0); } }
@keyframes move-up { 0% { transform: translateY(20px); } 100% { transform: translateY(0); } }
@keyframes move-down { 0% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
.animate-move-left { animation: move-left 0.12s; }
.animate-move-right { animation: move-right 0.12s; }
.animate-move-up { animation: move-up 0.12s; }
.animate-move-down { animation: move-down 0.12s; }
`}</style>
    </div>
  );
};

export default Game2048;
