import React, { useState } from 'react';
import Modal from '../components/Modal';

type Choice = { text: string; nextScene: string; };
type Scene = { text: string; choices: Choice[]; isEnd?: boolean; };
type Story = Record<string, Scene>;

const story: Story = {
  start: {
    text: "You wake up on a white sand beach. The dense jungle is at your back and the endless ocean is before you. What do you do first?",
    choices: [
      { text: "Explore the jungle", nextScene: "jungle_explore" },
      { text: "Search for wreckage on the beach", nextScene: "beach_explore" },
    ],
  },
  beach_explore: {
    text: "You find an empty plastic bottle and a piece of rope. Useful! You now feel thirsty.",
    choices: [
      { text: "Look for water in the jungle", nextScene: "find_water" },
      { text: "Try to build a shelter on the beach", nextScene: "build_shelter" },
    ],
  },
  jungle_explore: {
    text: "The jungle is dark and intimidating. You hear a strange sound. It sounds like a large animal.",
    choices: [
      { text: "Investigate the sound", nextScene: "investigate_sound" },
      { text: "Return to the safety of the beach", nextScene: "start" },
    ],
  },
  find_water: {
    text: "After a long walk, you find a stream of clean, clear water. You drink until you are satisfied. What a relief!",
    choices: [
       { text: "Follow the stream upstream", nextScene: "follow_river_win" },
       { text: "Build a shelter near the water", nextScene: "build_shelter" },
    ],
  },
  investigate_sound: {
    text: "You get closer and find a wild boar! It attacks you before you can react.",
    choices: [],
    isEnd: true,
  },
  build_shelter: {
    text: "You spend hours gathering palm leaves and branches. Your shelter is fragile, but it should protect you from the sun. You feel tired and hungry.",
     choices: [
      { text: "Look for fruit", nextScene: "find_food_lose" },
      { text: "Rest a little", nextScene: "rest_lose" },
    ],
  },
  follow_river_win: {
    text: "Following the river, you spot smoke on the horizon! You run towards it and find a small village. You are saved!",
    choices: [],
    isEnd: true,
  },
  find_food_lose: {
    text: "You find some red berries and eat them greedily. Unfortunately, they were poisonous.",
    choices: [],
    isEnd: true,
  },
  rest_lose: {
    text: "Exhaustion overcomes you. You fall asleep, but a tropical storm destroys your shelter during the night. You do not survive.",
    choices: [],
    isEnd: true,
  }
};

const InteractiveStoryGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [sceneId, setSceneId] = useState('start');
    const [history, setHistory] = useState<string[]>(['start']);
    
    const currentScene = story[sceneId];

    const handleChoice = (nextScene: string) => {
        setHistory(h => [...h, nextScene]);
        setSceneId(nextScene);
    };
    
    const resetGame = () => {
        setHistory(['start']);
        setSceneId('start');
    }

    const rewind = () => {
        console.log("Simulating ad to rewind choice...");
        if(history.length > 1) {
            const newHistory = history.slice(0, -1);
            setHistory(newHistory);
            setSceneId(newHistory[newHistory.length - 1]);
        }
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
             <button onClick={onBack} className="absolute top-4 left-4 bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg">
                &larr; Back
            </button>
            <div className="w-full max-w-3xl">
                <h1 className="text-4xl font-bold text-teal-400 mb-6 text-center">The Deserted Island</h1>
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg min-h-[20rem] flex flex-col justify-between">
                    <p className="text-xl text-slate-300 leading-relaxed whitespace-pre-wrap">{currentScene.text}</p>
                    <div className="mt-6 flex flex-col gap-4">
                        {currentScene.choices.map(choice => (
                            <button key={choice.text} onClick={() => handleChoice(choice.nextScene)}
                                className="w-full bg-slate-700 hover:bg-teal-500 text-white font-semibold py-3 px-5 rounded-lg transition-colors">
                                {choice.text}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
             <Modal isOpen={currentScene.isEnd === true} title="End of Story">
                 <p className="text-slate-300 text-xl mb-4">{currentScene.text}</p>
                 <div className="flex flex-col sm:flex-row gap-4">
                     <button onClick={resetGame} className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg">
                         Play Again
                     </button>
                     <button onClick={rewind} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg">
                         Rewind Choice (Ad)
                     </button>
                 </div>
            </Modal>
        </div>
    );
};

export default InteractiveStoryGame;