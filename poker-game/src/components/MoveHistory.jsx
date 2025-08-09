import React, { useEffect, useRef } from 'react';
import { GAME_PHASES } from '../utils/constants';

const MoveHistory = ({ moves = [] }) => {
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves]);
  const getPhaseColor = (phase) => {
    switch (phase) {
      case GAME_PHASES.PRE_FLOP:
        return 'text-blue-400';
      case GAME_PHASES.FLOP:
        return 'text-green-400';
      case GAME_PHASES.TURN:
        return 'text-yellow-400';
      case GAME_PHASES.RIVER:
        return 'text-orange-400';
      case GAME_PHASES.SHOWDOWN:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPlayerColor = (playerName) => {
    if (playerName === 'Player') return 'text-cyan-300';
    if (playerName === 'Dealer') return 'text-yellow-300';
    return 'text-pink-300';
  };

  const formatPhase = (phase) => {
    return phase.replace('_', '-').toLowerCase();
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full">
      <h3 className="text-lg font-bold text-white mb-3 border-b border-gray-700 pb-2">
        Move History
      </h3>
      
      {moves.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No moves yet...</p>
      ) : (
        <div ref={scrollRef} className="space-y-2 max-h-96 overflow-y-auto scroll-smooth">
          {moves.map((move, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded p-2 text-sm animate-fade-in"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <span className={`font-semibold ${getPlayerColor(move.player)}`}>
                    {move.player === 'Player' ? 'You' : move.player === 'Dealer' ? 'Dealer' : 'AI'}
                  </span>
                  <span className="text-white mx-1">→</span>
                  <span className="text-gray-200">{move.action}</span>
                </div>
                <span className="text-gray-500 text-xs ml-2">
                  {move.timestamp}
                </span>
              </div>
              <div className="mt-1">
                <span className={`text-xs ${getPhaseColor(move.phase)}`}>
                  {formatPhase(move.phase)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {moves.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Total moves: {moves.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default MoveHistory;