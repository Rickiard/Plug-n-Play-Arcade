import React, { useState, useEffect, useCallback, useRef } from 'react';
import Modal from '../components/Modal';
import AdBanner from '../components/AdBanner';

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const TETROMINOS = {
  '0': { shape: [[0]], color: 'opacity-0' }, // Empty
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
};
const TETROMINO_KEYS = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];

const createBoard = (): (keyof typeof TETROMINOS)[][] =>
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('0'));

const TetrisGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [board, setBoard] = useState(createBoard());
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS['0'].shape,
        key: '0' as keyof typeof TETROMINOS,
    });
    const [nextPieceKey, setNextPieceKey] = useState<keyof typeof TETROMINOS>('0');
    const [score, setScore] = useState(0);
    const [rows, setRows] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const lastTimeRef = useRef(0);
    const dropTimeRef = useRef(1000);
    const dropAccumulatorRef = useRef(0);
    const gameLoopRef = useRef<number>(0);

    const randomTetromino = useCallback(() => {
        const key = TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)] as keyof typeof TETROMINOS;
        return { shape: TETROMINOS[key].shape, key };
    }, []);

    const resetPlayer = useCallback(() => {
        const next = nextPieceKey === '0' ? randomTetromino() : { shape: TETROMINOS[nextPieceKey].shape, key: nextPieceKey };
        const newNext = randomTetromino();

        setPlayer({
            pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
            tetromino: next.shape,
            key: next.key
        });
        setNextPieceKey(newNext.key);
    }, [nextPieceKey, randomTetromino]);

    const checkCollision = (p: typeof player, b: typeof board): boolean => {
        for (let y = 0; y < p.tetromino.length; y += 1) {
            for (let x = 0; x < p.tetromino[y].length; x += 1) {
                if (p.tetromino[y][x] !== 0) {
                    if (
                        !b[y + p.pos.y] ||
                        !b[y + p.pos.y][x + p.pos.x] ||
                        b[y + p.pos.y][x + p.pos.x] !== '0'
                    ) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    
    const startGame = useCallback(() => {
        setBoard(createBoard());
        setScore(0);
        setRows(0);
        setLevel(1);
        dropTimeRef.current = 1000;
        setGameOver(false);
        setNextPieceKey(TETROMINO_KEYS[Math.floor(Math.random() * TETROMINO_KEYS.length)] as keyof typeof TETROMINOS);
        resetPlayer();
        gameAreaRef.current?.focus();
    }, [resetPlayer]);
    
    useEffect(() => {
      startGame();
    }, [startGame]);

    const movePlayer = (dir: -1 | 1) => {
        const newPlayer = { ...player, pos: { ...player.pos, x: player.pos.x + dir } };
        if (!checkCollision(newPlayer, board)) {
            setPlayer(newPlayer);
        }
    };
    
    const rotate = (matrix: number[][]) => {
        const rotated = matrix.map((_, index) => matrix.map(col => col[index])).reverse();
        return rotated;
    };

    const playerRotate = () => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino);

        // Prevent rotating into walls
        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while(checkCollision(clonedPlayer, board)) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if(offset > clonedPlayer.tetromino[0].length) {
                clonedPlayer.pos.x = pos; // Reset if can't fit
                return;
            }
        }

        setPlayer(clonedPlayer);
    };
    
    const drop = () => {
        const newPlayer = { ...player, pos: { ...player.pos, y: player.pos.y + 1 } };
        if (!checkCollision(newPlayer, board)) {
            setPlayer(newPlayer);
        } else {
            // Lock piece and check for game over
            if (player.pos.y < 1) {
                setGameOver(true);
                return;
            }
            const newBoard = board.map(row => [...row]);
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        newBoard[y + player.pos.y][x + player.pos.x] = player.key;
                    }
                });
            });

            // Check for cleared lines
            let clearedRows = 0;
            for (let y = newBoard.length - 1; y >= 0; y--) {
                if (newBoard[y].every(cell => cell !== '0')) {
                    clearedRows++;
                    newBoard.splice(y, 1);
                    newBoard.unshift(Array(BOARD_WIDTH).fill('0'));
                    y++; // Re-check the same row index
                }
            }
            if(clearedRows > 0) {
              const linePoints = [0, 40, 100, 300, 1200];
              setScore(prev => prev + linePoints[clearedRows] * level);
              setRows(prev => prev + clearedRows);
            }
            
            setBoard(newBoard);
            resetPlayer();
        }
    };
    
    const hardDrop = () => {
      let tempPlayer = {...player};
      while(!checkCollision({...tempPlayer, pos: { ...tempPlayer.pos, y: tempPlayer.pos.y + 1 }}, board)) {
        tempPlayer.pos.y += 1;
      }
      setPlayer(tempPlayer);
    }
    
    useEffect(() => {
        if (rows / 10 >= level) {
            setLevel(prev => prev + 1);
            dropTimeRef.current = 1000 / (level + 1) + 200;
        }
    }, [rows, level]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(gameOver) return;
        if (e.key === 'ArrowLeft') movePlayer(-1);
        else if (e.key === 'ArrowRight') movePlayer(1);
        else if (e.key === 'ArrowDown') drop();
        else if (e.key === 'ArrowUp') playerRotate();
        else if (e.key === ' ') hardDrop();
    };
    
    const update = (time = 0) => {
        const deltaTime = time - lastTimeRef.current;
        lastTimeRef.current = time;
        dropAccumulatorRef.current += deltaTime;

        if(dropAccumulatorRef.current > dropTimeRef.current) {
            drop();
            dropAccumulatorRef.current = 0;
        }
        if(!gameOver) {
            gameLoopRef.current = requestAnimationFrame(update);
        }
    }
    
    useEffect(() => {
        if(!gameOver) {
            gameLoopRef.current = requestAnimationFrame(update);
        }
        return () => {
            if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
        }
    }, [gameOver]);
    
    const renderBoard = () => {
        const displayBoard = board.map(row => [...row]);
        // Prevent out-of-bounds rendering
        player.tetromino.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const boardY = y + player.pos.y;
                    const boardX = x + player.pos.x;
                    if (
                      boardY >= 0 && boardY < BOARD_HEIGHT &&
                      boardX >= 0 && boardX < BOARD_WIDTH
                    ) {
                      displayBoard[boardY][boardX] = player.key;
                    }
                }
            });
        });
        return displayBoard.map((row, y) => (
            row.map((cell, x) => (
                <div key={`${y}-${x}`} className={`w-full h-full ${cell !== '0' ? TETROMINOS[cell].color : 'bg-slate-800'} border-slate-700 border-opacity-50 border-[0.5px]`}></div>
            ))
        ));
    };

    const handleRevive = () => {
        console.log("Simulating ad to clear rows...");
        const newBoard = createBoard();
        // Keep top half of the board
        for (let r = 0; r < BOARD_HEIGHT / 2; r++) {
            newBoard[r + BOARD_HEIGHT / 2] = board[r + BOARD_HEIGHT / 2];
        }
        setBoard(newBoard);
        setGameOver(false);
    };

    useEffect(() => {
        if (gameAreaRef.current) gameAreaRef.current.focus();
    }, [gameOver]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in" onKeyDown={handleKeyDown} tabIndex={0} ref={gameAreaRef} aria-label="Tetris game area" style={{outline: 'none'}}>
            <button onClick={onBack} className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back
            </button>
            <h1 className="text-4xl font-bold text-blue-400 mb-2">Tetris</h1>
            <div className="mb-2 text-white text-center">Arrow keys: Move/Rotate | Space: Hard Drop</div>
            <div className="flex items-start gap-8">
                <div className="grid gap-px bg-slate-700 p-1 rounded-lg shadow-lg" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 25px)`, gridTemplateRows: `repeat(${BOARD_HEIGHT}, 25px)` }}>
                    {renderBoard()}
                </div>
                <div className="w-48 flex flex-col gap-4">
                    <div className="bg-slate-800 p-4 rounded-lg text-center">
                        <h2 className="font-bold text-lg text-blue-300">Score</h2>
                        <p className="text-2xl">{score}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg text-center">
                        <h2 className="font-bold text-lg text-blue-300">Level</h2>
                        <p className="text-2xl">{level}</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg text-center">
                        <h2 className="font-bold text-lg text-blue-300">Next</h2>
                        <div className="flex justify-center items-center h-24">
                           {nextPieceKey !== '0' && <div className="grid gap-px bg-slate-900 p-2 rounded-lg shadow" style={{gridTemplateColumns: `repeat(${TETROMINOS[nextPieceKey].shape[0].length}, 20px)`}}>
                               {TETROMINOS[nextPieceKey].shape.map((row, y) => (
                                   row.map((cell, x) => (
                                        <div key={`${y}-${x}`} className={`w-5 h-5 ${cell !== 0 ? TETROMINOS[nextPieceKey].color : 'opacity-0'}`}></div>
                                   ))
                               ))}
                           </div>}
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={gameOver} title="Game Over">
                <p className="text-slate-300 text-xl mb-4">Your final score: <span className="font-bold text-blue-400">{score}</span></p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={startGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                        Play Again
                    </button>
                    <button onClick={handleRevive} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                       <span className="flex flex-col items-center">
                         Clear Rows (Ad)
                         <AdBanner />
                       </span>
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default TetrisGame;