import React, { useState } from 'react';
import { PLAYER_ACTIONS } from '../utils/constants';

const GameControls = ({ 
  gameState, 
  onAction, 
  disabled = false,
  currentBet = 0,
  playerChips = 0,
  minRaise = 0
}) => {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);

  // Update raise amount when minRaise changes
  React.useEffect(() => {
    setRaiseAmount(minRaise);
  }, [minRaise]);

  const handleRaise = () => {
    const amount = parseInt(raiseAmount);
    const totalChips = playerChips + (gameState?.player?.currentBet || 0);
    if (amount >= minRaise && amount <= totalChips) {
      onAction(PLAYER_ACTIONS.RAISE, amount);
      setRaiseAmount(minRaise);
    }
  };

  const playerCurrentBet = gameState?.player?.currentBet || 0;
  const totalAvailable = playerChips + playerCurrentBet;
  
  const canCheck = currentBet === 0 || playerCurrentBet === currentBet;
  const callAmount = currentBet - playerCurrentBet;
  const canCall = callAmount > 0 && callAmount <= playerChips;
  const canRaise = playerChips > callAmount;

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onAction(PLAYER_ACTIONS.FOLD)}
            disabled={disabled}
            className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fold
          </button>

          {canCheck ? (
            <button
              onClick={() => onAction(PLAYER_ACTIONS.CHECK)}
              disabled={disabled}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Check
            </button>
          ) : canCall ? (
            <button
              onClick={() => onAction(PLAYER_ACTIONS.CALL, callAmount)}
              disabled={disabled}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Call ${callAmount}
            </button>
          ) : null}

          {canRaise && (
            <button
              onClick={() => onAction(PLAYER_ACTIONS.ALL_IN, playerChips)}
              disabled={disabled}
              className="btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
            >
              All In ${playerChips}
            </button>
          )}
        </div>

        {canRaise && (
          <div className="flex gap-2 items-center justify-center">
            <input
              type="range"
              min={minRaise}
              max={totalAvailable}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(e.target.value)}
              disabled={disabled}
              className="w-32"
            />
            <input
              type="number"
              min={minRaise}
              max={totalAvailable}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(e.target.value)}
              disabled={disabled}
              className="w-20 px-2 py-1 bg-gray-700 text-white rounded"
            />
            <button
              onClick={handleRaise}
              disabled={disabled || raiseAmount < minRaise || raiseAmount > totalAvailable}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Raise to ${raiseAmount}
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-sm text-gray-400">
        <p>Your Chips: ${playerChips}</p>
        {currentBet > 0 && <p>Current Bet: ${currentBet}</p>}
        {gameState?.pot > 0 && <p>Pot: ${gameState.pot}</p>}
      </div>
    </div>
  );
};

export default GameControls;