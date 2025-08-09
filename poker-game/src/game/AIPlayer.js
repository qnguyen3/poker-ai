import HandEvaluator from './HandEvaluator';
import { PLAYER_ACTIONS, HAND_RANKINGS } from '../utils/constants';

class AIPlayer {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.aggressiveness = difficulty === 'easy' ? 0.2 : difficulty === 'hard' ? 0.6 : 0.4;
    this.bluffFrequency = difficulty === 'easy' ? 0.05 : difficulty === 'hard' ? 0.2 : 0.1;
  }

  makeDecision(gameState) {
    const { opponent, communityCards, currentBet, pot } = gameState;
    const { hand, chips, currentBet: myBet } = opponent;
    
    const allCards = [...hand, ...communityCards];
    const handStrength = this.evaluateHandStrength(allCards);
    const potOdds = this.calculatePotOdds(currentBet - myBet, pot);
    const shouldBluff = Math.random() < this.bluffFrequency;
    
    const callAmount = currentBet - myBet;
    const canCheck = currentBet === myBet;
    const canCall = callAmount > 0 && callAmount <= chips;
    
    if (handStrength >= 0.8 || shouldBluff) {
      if (chips > callAmount * 2) {
        const raiseAmount = Math.min(
          Math.floor(pot * (0.5 + Math.random() * 0.5)),
          chips
        );
        return {
          action: PLAYER_ACTIONS.RAISE,
          amount: currentBet + raiseAmount
        };
      }
    }
    
    if (handStrength >= 0.6) {
      if (canCall && potOdds > 0.3) {
        return {
          action: PLAYER_ACTIONS.CALL,
          amount: callAmount
        };
      }
      if (canCheck) {
        return { action: PLAYER_ACTIONS.CHECK };
      }
    }
    
    if (handStrength >= 0.4) {
      if (canCheck) {
        return { action: PLAYER_ACTIONS.CHECK };
      }
      if (canCall && potOdds > 0.5) {
        return {
          action: PLAYER_ACTIONS.CALL,
          amount: callAmount
        };
      }
    }
    
    if (handStrength >= 0.3 && canCheck) {
      return { action: PLAYER_ACTIONS.CHECK };
    }
    
    if (handStrength < 0.3 && callAmount > pot * 0.3) {
      return { action: PLAYER_ACTIONS.FOLD };
    }
    
    if (canCall && callAmount <= chips * 0.1) {
      return {
        action: PLAYER_ACTIONS.CALL,
        amount: callAmount
      };
    }
    
    return { action: PLAYER_ACTIONS.FOLD };
  }

  evaluateHandStrength(cards) {
    if (cards.length < 2) return 0;
    
    if (cards.length === 2) {
      const [card1, card2] = cards;
      const isPair = card1.value === card2.value;
      const highCard = Math.max(card1.value, card2.value);
      
      if (isPair) {
        return 0.5 + (highCard / 14) * 0.3;
      }
      
      return (highCard / 14) * 0.4;
    }
    
    const evaluation = HandEvaluator.evaluateHand(cards);
    
    const strengthMap = {
      [HAND_RANKINGS.ROYAL_FLUSH]: 1.0,
      [HAND_RANKINGS.STRAIGHT_FLUSH]: 0.95,
      [HAND_RANKINGS.FOUR_OF_A_KIND]: 0.9,
      [HAND_RANKINGS.FULL_HOUSE]: 0.85,
      [HAND_RANKINGS.FLUSH]: 0.75,
      [HAND_RANKINGS.STRAIGHT]: 0.65,
      [HAND_RANKINGS.THREE_OF_A_KIND]: 0.55,
      [HAND_RANKINGS.TWO_PAIR]: 0.45,
      [HAND_RANKINGS.PAIR]: 0.35,
      [HAND_RANKINGS.HIGH_CARD]: 0.2
    };
    
    return strengthMap[evaluation.rank] || 0.2;
  }

  calculatePotOdds(callAmount, pot) {
    if (callAmount === 0) return 1;
    return pot / (pot + callAmount);
  }

  adjustForDifficulty(decision) {
    if (this.difficulty === 'easy') {
      if (Math.random() < 0.3 && decision.action !== PLAYER_ACTIONS.FOLD) {
        return { action: PLAYER_ACTIONS.FOLD };
      }
    } else if (this.difficulty === 'hard') {
      if (Math.random() < this.aggressiveness && decision.action === PLAYER_ACTIONS.CALL) {
        return {
          action: PLAYER_ACTIONS.RAISE,
          amount: decision.amount * 2
        };
      }
    }
    
    return decision;
  }

  getDecision(gameState) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const decision = this.makeDecision(gameState);
        const adjustedDecision = this.adjustForDifficulty(decision);
        resolve(adjustedDecision);
      }, 1000 + Math.random() * 1500);
    });
  }
}

export default AIPlayer;