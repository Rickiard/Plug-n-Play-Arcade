import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import Modal from '../components/Modal';

const questions: QuizQuestion[] = [
  { question: 'What is the capital of Brazil?', options: ['Rio de Janeiro', 'São Paulo', 'Brasília', 'Salvador'], correctAnswer: 'Brasília' },
  { question: 'How many continents are there?', options: ['5', '6', '7', '8'], correctAnswer: '7' },
  { question: 'What is the largest planet in our solar system?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 'Jupiter' },
  { question: 'Who wrote "Don Quixote"?', options: ['Machado de Assis', 'Miguel de Cervantes', 'William Shakespeare', 'Fernando Pessoa'], correctAnswer: 'Miguel de Cervantes' },
  { question: 'Which element has the chemical symbol "O"?', options: ['Gold', 'Oxygen', 'Osmium', 'Silver'], correctAnswer: 'Oxygen' },
  { question: 'In what year did man first step on the moon?', options: ['1965', '1969', '1972', '1981'], correctAnswer: '1969' },
  { question: 'What is the longest river in the world?', options: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'], correctAnswer: 'Amazon' },
  { question: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'], correctAnswer: 'Leonardo da Vinci' },
];

const QuizGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'over'>('playing');
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rewardUsed, setRewardUsed] = useState(false);

  useEffect(() => {
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
  }, []);

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  const handleAnswer = (answer: string) => {
    if (gameState === 'over') return;
    if (answer === currentQuestion.correctAnswer) {
      setScore(s => s + 10);
    } else {
      setMistakes(m => m + 1);
      if (mistakes + 1 >= 3) {
        setGameState('over');
        setIsModalOpen(true);
        return;
      }
    }
    nextQuestion();
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
    } else {
      setGameState('over');
      setIsModalOpen(true);
    }
  };

  const resetGame = () => {
    setScore(0);
    setMistakes(0);
    setCurrentQuestionIndex(0);
    setShuffledQuestions([...questions].sort(() => Math.random() - 0.5));
    setGameState('playing');
    setIsModalOpen(false);
    setRewardUsed(false);
  };
  
  const useReward = () => {
    console.log("Simulating ad for reward...");
    setMistakes(0);
    setRewardUsed(true);
    setIsModalOpen(false);
    setGameState('playing');
  };

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-center p-4 bg-slate-900 animate-fade-in">
      <button onClick={onBack} className="absolute top-4 left-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
        &larr; Back
      </button>

      {currentQuestion && gameState === 'playing' ? (
        <div className="w-full max-w-2xl text-center">
            <div className="flex justify-between w-full text-lg mb-4">
                <span className="font-bold text-green-400">Score: {score}</span>
                <span className="font-bold text-red-400">Mistakes: {mistakes} / 3</span>
            </div>
            <div className="bg-slate-800 p-8 rounded-lg shadow-lg">
                <p className="text-2xl font-semibold mb-6 text-slate-200">{currentQuestion.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.options.map(option => (
                    <button key={option} onClick={() => handleAnswer(option)} className="bg-slate-700 hover:bg-purple-500 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200">
                        {option}
                    </button>
                    ))}
                </div>
            </div>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-4xl font-bold">Loading Quiz...</h1>
        </div>
      )}
      
      <Modal isOpen={isModalOpen} title={currentQuestionIndex < shuffledQuestions.length - 1 ? "Game Over" : "Quiz Complete!"}>
          <p className="text-slate-300 text-xl mb-4">Your final score is: <span className="font-bold text-purple-400">{score}</span></p>
          <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={resetGame} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Play Again
              </button>
              {!rewardUsed && mistakes >= 3 && (
                  <button onClick={useReward} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                      Continue (Ad)
                  </button>
              )}
          </div>
      </Modal>
    </div>
  );
};

export default QuizGame;