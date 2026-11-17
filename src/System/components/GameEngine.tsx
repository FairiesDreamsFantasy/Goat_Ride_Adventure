import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from '../../types';
import ScreenReader from './ScreenReader';

const GameEngine: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentSegment: 1,
    score: 0,
    isGameOver: false,
    inventory: ['Hand Held PC', 'Magic Wand', 'Riding Equipment'],
    poodleRiding: true,
    message: "Welcome to 'Riches Of Childhood'! And this is level 1 of your adventure riding a poodle (Abigay).",
    awaitingInput: false,
    enemiesKilled: 0,
    isPaused: false,
    hasAgreedToAntiSpanking: null,
    viewMode: 'POV',
    isExploring: false,
    activeQuestionId: null,
  });

  const handleInput = useCallback((key: string) => {
    if (gameState.awaitingInput) {
      if (key.toLowerCase() === 'y') {
        setGameState(prev => ({ ...prev, message: "Great! You agreed!! You may continue.", awaitingInput: false }));
      } else if (key.toLowerCase() === 'n') {
        setGameState(prev => ({ ...prev, isGameOver: true, message: "Game Over. You don't agree.", awaitingInput: false }));
      } else if (key.toLowerCase() === 'r') {
        // Repeat logic
      }
    }
  }, [gameState.awaitingInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleInput(e.key);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInput]);

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Riches Of Childhood</h1>
      <ScreenReader message={gameState.message} />
      {gameState.isGameOver && (
        <div className="p-4 bg-red-900 border border-red-500 mt-4">
          <h2 className="text-xl">GAME OVER</h2>
          <button onClick={() => window.location.reload()} className="mt-2 p-2 bg-white text-black">Play Again</button>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
