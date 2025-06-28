import React, { useState, useEffect, useRef } from 'react';
import Modal from '../components/Modal';

const GAME_TIME_S = 30;
const SNAP_THRESHOLD = 0.5; // 50% of item inside zone to snap
type Item = { id: string; emoji: string; zoneId: string; pos: { x: number; y: number }; placed: boolean; };
type Zone = { id: string; emoji: string; pos: { x: number; y: number; w: number; h: number }; };

const initialItems: Item[] = [
    { id: 'shirt1', emoji: '👕', zoneId: 'wardrobe', pos: { x: 100, y: 300 }, placed: false },
    { id: 'toy1', emoji: '🧸', zoneId: 'toybox', pos: { x: 400, y: 250 }, placed: false },
    { id: 'book1', emoji: '📚', zoneId: 'bookshelf', pos: { x: 200, y: 150 }, placed: false },
    { id: 'pants1', emoji: '👖', zoneId: 'wardrobe', pos: { x: 500, y: 100 }, placed: false },
    { id: 'car1', emoji: '🚗', zoneId: 'toybox', pos: { x: 50, y: 50 }, placed: false },
];

const zones: Zone[] = [
    { id: 'wardrobe', emoji: '🚪', pos: { x: 20, y: 280, w: 100, h: 100 } },
    { id: 'toybox', emoji: '📦', pos: { x: 480, y: 280, w: 100, h: 100 } },
    { id: 'bookshelf', emoji: '📖', pos: { x: 250, y: 20, w: 100, h: 100 } },
];

const CleaningGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [items, setItems] = useState<Item[]>(initialItems);
    const [timeLeft, setTimeLeft] = useState(GAME_TIME_S);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'over' | 'won'>('idle');
    const [highlightZone, setHighlightZone] = useState<string | null>(null);
    const draggingItem = useRef<{ id: string; offset: { x: number, y: number } } | null>(null);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const resetGame = () => {
        setItems(initialItems.map(i => ({...i, placed: false, pos: i.pos})));
        setTimeLeft(GAME_TIME_S);
        setGameState('playing');
    };

    useEffect(() => {
        if (gameState !== 'playing') return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    setGameState('over');
                    clearInterval(timer);
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);
    
    useEffect(() => {
        if(gameState === 'playing' && items.every(i => i.placed)) {
            setGameState('won');
        }
    }, [items, gameState]);
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: string) => {
        const item = items.find(i => i.id === id);
        if (!item || item.placed || gameState !== 'playing') return;
        let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        let clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const rect = (e.target as HTMLDivElement).getBoundingClientRect();
        draggingItem.current = {
            id,
            offset: { x: clientX - rect.left, y: clientY - rect.top },
        };
        setHighlightZone(item.zoneId);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (!draggingItem.current) return;
        let clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        let clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const gameAreaRect = gameAreaRef.current?.getBoundingClientRect();
        if(!gameAreaRect) return;
        const newX = clientX - gameAreaRect.left - draggingItem.current.offset.x;
        const newY = clientY - gameAreaRect.top - draggingItem.current.offset.y;
        setItems(currentItems => currentItems.map(i => 
            i.id === draggingItem.current?.id ? { ...i, pos: { x: newX, y: newY } } : i
        ));
    };

    const handleMouseUp = () => {
        if (!draggingItem.current) return;
        const item = items.find(i => i.id === draggingItem.current!.id);
        const zone = zones.find(z => z.id === item?.zoneId);
        if(item && zone) {
            // Snap logic: check if at least SNAP_THRESHOLD of item is inside zone
            const itemCenter = { x: item.pos.x, y: item.pos.y };
            const inZone =
                itemCenter.x > zone.pos.x + zone.pos.w * (1 - SNAP_THRESHOLD) / 2 &&
                itemCenter.x < zone.pos.x + zone.pos.w * (1 + SNAP_THRESHOLD) / 2 &&
                itemCenter.y > zone.pos.y + zone.pos.h * (1 - SNAP_THRESHOLD) / 2 &&
                itemCenter.y < zone.pos.y + zone.pos.h * (1 + SNAP_THRESHOLD) / 2;
            if (inZone) {
                setItems(current => current.map(i => i.id === item.id ? {...i, placed: true, pos: { x: zone.pos.x + zone.pos.w/2, y: zone.pos.y + zone.pos.h/2 } } : i));
            }
        }
        draggingItem.current = null;
        setHighlightZone(null);
    };
    
    const addTime = () => {
        console.log("Simulating ad for +10 seconds...");
        setTimeLeft(t => t + 10);
        setGameState('playing');
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
            <button onClick={onBack} className="absolute top-4 left-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back
            </button>
            <div className="text-center mb-4">
                <h1 className="text-4xl font-bold text-orange-400">Quick Clean</h1>
                <span className="text-2xl font-bold">Time: {timeLeft}s</span>
            </div>
            <div
                ref={gameAreaRef}
                className="relative w-full max-w-2xl h-96 bg-slate-800 rounded-lg shadow-inner border-2 border-slate-700 overflow-hidden"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
            >
                {zones.map(zone => (
                    <div key={zone.id} className={`absolute flex items-center justify-center text-6xl bg-slate-700/50 rounded-lg transition-all duration-200 ${highlightZone === zone.id ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
                        style={{ left: zone.pos.x, top: zone.pos.y, width: zone.pos.w, height: zone.pos.h }}>
                        {zone.emoji}
                    </div>
                ))}
                {items.map(item => (
                    <div key={item.id} className={`absolute text-5xl transition-all ${item.placed ? 'opacity-0' : 'cursor-grab'} ${highlightZone === item.zoneId && !item.placed ? 'z-10' : ''}`}
                         style={{ left: item.pos.x, top: item.pos.y, transform: `translate(-50%, -50%)` }}
                         onMouseDown={(e) => handleMouseDown(e, item.id)}
                         onTouchStart={(e) => handleMouseDown(e, item.id)}>
                        {item.emoji}
                    </div>
                ))}
                {gameState === 'idle' && (
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-2xl">
                            Start
                        </button>
                    </div>
                )}
            </div>
            <Modal isOpen={gameState === 'over' || gameState === 'won'} title={gameState === 'won' ? 'Room Tidy!' : 'Time\'s Up!'}>
                 <p className="text-slate-300 text-xl mb-4">{gameState === 'won' ? 'You tidied everything in time!' : 'You didn\'t have time to clean up everything.'}</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={resetGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                         Play Again
                     </button>
                     {gameState === 'over' && (
                         <button onClick={addTime} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                             +10 Seconds (Ad)
                         </button>
                     )}
                 </div>
            </Modal>
        </div>
    );
};

export default CleaningGame;