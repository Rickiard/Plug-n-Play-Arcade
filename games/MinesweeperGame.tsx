import React, { useState, useEffect } from 'react';
import type { MinesweeperCell } from '../types';

const DIFFICULTIES = {
  Easy: { size: 8, mines: 10 },
  Normal: { size: 12, mines: 25 },
  Hard: { size: 16, mines: 45 },
};

const createSolvableBoard = (firstRow: number, firstCol: number, boardSize: number, mineCount: number) => {
  let newBoard: MinesweeperCell[][];
  do {
    newBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null).map(() => ({
      isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0
    })));
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * boardSize);
      const col = Math.floor(Math.random() * boardSize);
      if (!newBoard[row][col].isMine && !(row === firstRow && col === firstCol)) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (newBoard[r][c].isMine) continue;
        let adjacentMines = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue;
            const newR = r + i;
            const newC = c + j;
            if (newR >= 0 && newR < boardSize && newC >= 0 && newC < boardSize && newBoard[newR][newC].isMine) {
              adjacentMines++;
            }
          }
        }
        newBoard[r][c].adjacentMines = adjacentMines;
      }
    }
  } while (newBoard[firstRow][firstCol].adjacentMines !== 0);
  return newBoard;
};

const MinesweeperGame: React.FC = () => {
    const [boardSize, setBoardSize] = useState(DIFFICULTIES.Normal.size);
    const [board, setBoard] = useState<MinesweeperCell[][]>([]);
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const [firstClick, setFirstClick] = useState(true);

    useEffect(() => {
      setBoardSize(DIFFICULTIES.Normal.size);
      resetGame();
    }, []);

    const resetGame = () => {
        setFirstClick(true);
        const emptyBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null).map(() => ({
            isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0
        })));
        setBoard(emptyBoard);
        setGameState('playing');
    }

    const revealCell = (r: number, c: number, currentBoard: MinesweeperCell[][]) => {
        if (r < 0 || r >= boardSize || c < 0 || c >= boardSize || currentBoard[r][c].isRevealed || currentBoard[r][c].isFlagged) {
            return;
        }

        currentBoard[r][c].isRevealed = true;

        if (currentBoard[r][c].adjacentMines === 0 && !currentBoard[r][c].isMine) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (i === 0 && j === 0) continue;
                    revealCell(r + i, c + j, currentBoard);
                }
            }
        }
    };
    
    const checkWinCondition = (currentBoard: MinesweeperCell[][]) => {
        for (let r = 0; r < boardSize; r++) {
            for (let c = 0; c < boardSize; c++) {
                if (!currentBoard[r][c].isMine && !currentBoard[r][c].isRevealed) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleCellClick = (r: number, c: number) => {
        if (gameState !== 'playing') return;
        let currentBoard = board;
        if (firstClick) {
            currentBoard = createSolvableBoard(r, c, boardSize, DIFFICULTIES.Normal.mines);
            setFirstClick(false);
        }
        if (currentBoard[r][c].isFlagged) return;
        if (currentBoard[r][c].isMine) {
            setGameState('lost');
            // Reveal all mines
            const newBoard = currentBoard.map(row => row.map(cell => ({ ...cell, isRevealed: cell.isMine ? true : cell.isRevealed })));
            setBoard(newBoard);
            return;
        }
        const newBoard = currentBoard.map(row => [...row]);
        revealCell(r, c, newBoard);
        if (checkWinCondition(newBoard)) {
            setGameState('won');
        }
        setBoard(newBoard);
    };

    const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        if (gameState !== 'playing' || board[r][c].isRevealed) return;
        
        const newBoard = board.map(row => [...row]);
        newBoard[r][c].isFlagged = !newBoard[r][c].isFlagged;
        setBoard(newBoard);
    };

    return (
        <div>
            <h1>Minesweeper</h1>
            <div>
                {board.map((row, rIndex) => (
                    <div key={rIndex} style={{ display: 'flex' }}>
                        {row.map((cell, cIndex) => {
                            const cellStyle = {
                                width: 30,
                                height: 30,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid black',
                                backgroundColor: cell.isRevealed ? (cell.isMine ? 'red' : 'lightgray') : 'darkgray',
                                cursor: gameState === 'playing' ? 'pointer' : 'default'
                            };
                            return (
                                <div
                                    key={cIndex}
                                    style={cellStyle}
                                    onClick={() => handleCellClick(rIndex, cIndex)}
                                    onContextMenu={(e) => handleRightClick(e, rIndex, cIndex)}
                                >
                                    {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 ? cell.adjacentMines : null}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
            {gameState === 'lost' && <div>Game Over! You clicked on a mine.</div>}
            {gameState === 'won' && <div>Congratulations! You cleared the minefield.</div>}
        </div>
    );
};

export default MinesweeperGame;