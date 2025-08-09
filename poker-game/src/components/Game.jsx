import React, { useState, useEffect, useCallback } from 'react';
import PokerTable from './PokerTable';
import GameControls from './GameControls';
import MoveHistory from './MoveHistory';
import GameState from '../game/GameState';
import AIPlayer from '../game/AIPlayer';
import { GAME_PHASES, PLAYER_ACTIONS, BIG_BLIND } from '../utils/constants';

const Game = () => {
  const [game] = useState(() => new GameState());
  const [ai] = useState(() => new AIPlayer('medium'));
  const [gameState, setGameState] = useState(game.getState());
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('Welcome to Texas Hold\'em Poker!');

  const updateGameState = useCallback(() => {
    setGameState(game.getState());
  }, [game]);

  const processAITurns = useCallback(async () => {
    // Keep processing while it's AI's turn
    let iterations = 0;
    const maxIterations = 10; // Safety limit
    
    while (iterations < maxIterations) {
      const currentState = game.getState();
      
      // Check if AI should act
      if (currentState.isPlayerTurn || 
          currentState.phase === GAME_PHASES.SHOWDOWN || 
          currentState.phase === GAME_PHASES.WAITING ||
          currentState.player.hasFolded || 
          currentState.opponent.hasFolded) {
        break;
      }
      
      // AI makes decision
      await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for realism
      const aiDecision = await ai.getDecision(currentState);
      const actionSuccess = game.handlePlayerAction(aiDecision.action, aiDecision.amount);
      
      if (!actionSuccess) {
        console.error('AI action failed');
        break;
      }
      
      updateGameState();
      iterations++;
      
      // Check if the phase changed (betting round completed)
      const newState = game.getState();
      if (newState.phase !== currentState.phase) {
        // Phase changed, AI might need to act first in new round
        // Continue the loop to check
        continue;
      }
      
      // If it's now player's turn, stop
      if (newState.isPlayerTurn) {
        break;
      }
    }
  }, [game, ai, updateGameState]);

  const handlePlayerAction = useCallback(async (action, amount) => {
    if (isProcessing || !gameState.isPlayerTurn) return;
    
    setIsProcessing(true);
    
    try {
      const actionSuccess = game.handlePlayerAction(action, amount);
      
      if (actionSuccess) {
        updateGameState();
        
        // Process any AI turns that need to happen
        await processAITurns();
      }
    } catch (error) {
      console.error('Error in handlePlayerAction:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [game, gameState.isPlayerTurn, isProcessing, updateGameState, processAITurns]);

  const startNewHand = useCallback(async () => {
    if (game.isGameOver()) {
      setMessage(
        game.player.chips === 0 
          ? 'Game Over! AI Wins!' 
          : 'Congratulations! You Win!'
      );
      return;
    }
    
    setIsProcessing(true);
    game.startNewHand();
    updateGameState();
    setMessage('New hand dealt!');
    
    try {
      // If AI needs to act first, process their turns
      await processAITurns();
    } finally {
      setIsProcessing(false);
    }
  }, [game, updateGameState, processAITurns]);

  const resetGame = useCallback(() => {
    game.reset();
    updateGameState();
    setMessage('Game reset. Click "Deal New Hand" to start!');
  }, [game, updateGameState]);

  useEffect(() => {
    if (gameState.phase === GAME_PHASES.SHOWDOWN) {
      const isFold = gameState.winnerHand?.name?.includes('folded');
      if (gameState.winner === 'player') {
        if (isFold) {
          setMessage(`You win! Opponent folded. +$${gameState.lastPot}`);
        } else {
          setMessage(`You win with ${gameState.winnerHand?.name}! +$${gameState.lastPot}`);
        }
      } else if (gameState.winner === 'opponent') {
        if (isFold) {
          setMessage(`AI wins! You folded. -$${gameState.lastPot}`);
        } else {
          setMessage(`AI wins with ${gameState.winnerHand?.name}! -$${gameState.lastPot}`);
        }
      } else {
        setMessage(`It's a tie! Pot split: $${gameState.lastPot}`);
      }
    }
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="bg-gray-800 shadow-lg p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Texas Hold'em Poker</h1>
          <div className="flex gap-4">
            <div className="text-white">
              <span className="text-gray-400">Player: </span>
              <span className="font-bold">${gameState.player.chips}</span>
            </div>
            <div className="text-white">
              <span className="text-gray-400">AI: </span>
              <span className="font-bold">${gameState.opponent.chips}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-7xl flex gap-4">
          <div className="flex-1">
            <div className="bg-gray-800 rounded-lg p-2 mb-4 text-center">
              <p className="text-white text-lg">{message}</p>
              {gameState.phase !== GAME_PHASES.WAITING && (
                <p className="text-gray-400 text-sm mt-1">
                  Phase: {gameState.phase} | Pot: ${gameState.pot}
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <PokerTable gameState={gameState} />
            </div>

            <div className="flex flex-col gap-4">
            {gameState.phase === GAME_PHASES.WAITING || 
             gameState.phase === GAME_PHASES.SHOWDOWN ? (
              <div className="flex justify-center gap-4">
                <button
                  onClick={startNewHand}
                  disabled={gameState.isGameOver}
                  className="btn-primary disabled:opacity-50"
                >
                  Deal New Hand
                </button>
                {gameState.isGameOver && (
                  <button
                    onClick={resetGame}
                    className="btn-secondary"
                  >
                    Reset Game
                  </button>
                )}
              </div>
            ) : (
              <GameControls
                gameState={gameState}
                onAction={handlePlayerAction}
                disabled={!gameState.isPlayerTurn || isProcessing}
                currentBet={gameState.currentBet}
                playerChips={gameState.player.chips}
                minRaise={gameState.currentBet + BIG_BLIND}
              />
            )}

            {gameState.phase === GAME_PHASES.SHOWDOWN && gameState.winnerHand && (
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Showdown Results
                  </h3>
                  {gameState.winnerHand.name?.includes('folded') ? (
                    <p className="text-yellow-400 text-lg mt-2">
                      {gameState.winner === 'player' ? 'You win - Opponent folded' : 'AI wins - You folded'}
                    </p>
                  ) : gameState.winner === 'tie' ? (
                    <p className="text-yellow-400 text-lg mt-2">
                      Split Pot - Both have {gameState.winnerHand.name}
                    </p>
                  ) : (
                    <p className="text-yellow-400 text-lg mt-2">
                      {gameState.winner === 'player' ? 'You win' : 'AI wins'} with {gameState.winnerHand.name}!
                    </p>
                  )}
                </div>
                
                {!gameState.player.hasFolded && !gameState.opponent.hasFolded && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <h4 className="font-bold text-white mb-2">Your Hand</h4>
                      <div className="flex justify-center gap-2">
                        {gameState.player.hand.map((card, idx) => (
                          <div key={idx} className="text-white bg-gray-600 px-2 py-1 rounded">
                            {card.toString()}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-center">
                      <h4 className="font-bold text-white mb-2">AI Hand</h4>
                      <div className="flex justify-center gap-2">
                        {gameState.opponent.hand.map((card, idx) => (
                          <div key={idx} className="text-white bg-gray-600 px-2 py-1 rounded">
                            {card.toString()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
          
          <div className="w-80">
            <MoveHistory moves={gameState.moveHistory} />
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 p-4 text-center text-gray-400">
        <p>♠️ ♥️ ♣️ ♦️ Texas Hold'em Poker - Player vs AI ♦️ ♣️ ♥️ ♠️</p>
      </footer>
    </div>
  );
};

export default Game;