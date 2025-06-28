import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const MAX_HP = 100;

const TurnBasedDuelGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [playerHP, setPlayerHP] = useState(MAX_HP);
    const [enemyHP, setEnemyHP] = useState(MAX_HP);
    const [playerIsDefending, setPlayerIsDefending] = useState(false);
    const [turn, setTurn] = useState<'player' | 'enemy'>('player');
    const [message, setMessage] = useState('The battle begins!');
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');

    const resetGame = () => {
        setPlayerHP(MAX_HP);
        setEnemyHP(MAX_HP);
        setTurn('player');
        setMessage('New battle!');
        setGameState('playing');
    };
    
    useEffect(() => {
        if(enemyHP <= 0) {
            setGameState('won');
            setMessage('You won!');
        } else if (playerHP <= 0) {
            setGameState('lost');
            setMessage('You were defeated!');
        }
    }, [playerHP, enemyHP]);

    useEffect(() => {
        if (turn === 'enemy' && gameState === 'playing') {
            const enemyActionTimeout = setTimeout(() => {
                const action = Math.random() < 0.7 ? 'attack' : 'defend';
                if (action === 'attack') {
                    const damage = Math.floor(Math.random() * 15) + 5;
                    const finalDamage = playerIsDefending ? Math.floor(damage / 2) : damage;
                    setPlayerHP(hp => Math.max(0, hp - finalDamage));
                    setMessage(`The Fox attacks and deals ${finalDamage} damage!`);
                } else {
                    setMessage('The Fox defends!');
                }
                setPlayerIsDefending(false);
                setTurn('player');
            }, 1500);
            return () => clearTimeout(enemyActionTimeout);
        }
    }, [turn, gameState, playerIsDefending]);

    const handlePlayerAction = (action: 'attack' | 'defend' | 'special') => {
        if (turn !== 'player' || gameState !== 'playing') return;

        if (action === 'attack') {
            const damage = Math.floor(Math.random() * 20) + 10;
            setEnemyHP(hp => Math.max(0, hp - damage));
            setMessage(`You attack and deal ${damage} damage!`);
        } else if(action === 'defend') {
            setPlayerIsDefending(true);
            setMessage('You prepare to defend!');
        } else if(action === 'special') {
             console.log("Simulating ad for special attack...");
             const damage = 40;
             setEnemyHP(hp => Math.max(0, hp - damage));
             setMessage(`Special attack! You deal ${damage} damage!`);
        }
        
        setTurn('enemy');
    };

    const HPBar = ({ hp, max, colorClass }: { hp: number, max: number, colorClass: string }) => (
        <div className="w-full bg-slate-700 rounded-full h-6 relative">
            <div className={`${colorClass} h-6 rounded-full transition-all duration-500`} style={{ width: `${(hp / max) * 100}%` }}></div>
             <span className="absolute w-full text-center top-0 font-bold text-white">{hp} / {max}</span>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
            <button onClick={onBack} className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back
            </button>
            <h1 className="text-4xl font-bold text-red-500 mb-4">Chicken Duel</h1>
            <div className="w-full max-w-2xl space-y-6">
                {/* Enemy */}
                <div>
                    <div className="flex justify-between items-end mb-2">
                         <span className="text-2xl">🦊</span>
                        <h2 className="text-xl font-bold">Crafty Fox</h2>
                    </div>
                    <HPBar hp={enemyHP} max={MAX_HP} colorClass="bg-red-500" />
                </div>
                {/* Player */}
                <div>
                     <div className="flex justify-between items-end mb-2">
                        <h2 className="text-xl font-bold">Knight Chicken</h2>
                        <span className="text-2xl">🐔</span>
                    </div>
                    <HPBar hp={playerHP} max={MAX_HP} colorClass="bg-green-500" />
                </div>
            </div>
            
            <div className="w-full max-w-2xl mt-6 p-4 bg-slate-800 rounded-lg text-center">
                <p className="text-lg italic">{message}</p>
            </div>
            
            <div className="w-full max-w-2xl mt-6 grid grid-cols-2 gap-4">
                <button onClick={() => handlePlayerAction('attack')} disabled={turn !== 'player'} className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Attack
                </button>
                <button onClick={() => handlePlayerAction('defend')} disabled={turn !== 'player'} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                    Defend
                </button>
            </div>

            <Modal isOpen={gameState === 'won' || gameState === 'lost'} title={gameState === 'won' ? 'Victory!' : 'Defeat!'}>
                <p className="text-slate-300 text-xl mb-4">{message}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={resetGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                        Play Again
                    </button>
                    {gameState === 'lost' && (
                        <button onClick={() => {handlePlayerAction('special'); setGameState('playing'); setPlayerHP(20);}} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                           Special Attack (Ad)
                        </button>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default TurnBasedDuelGame;