import React from 'react';

export interface Game {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.FC<{ onBack: () => void }>;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface MinesweeperCell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}
