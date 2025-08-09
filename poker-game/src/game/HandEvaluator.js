import { HAND_RANKINGS, HAND_NAMES, RANKS } from '../utils/constants';

class HandEvaluator {
  static evaluateHand(cards) {
    if (cards.length < 5) {
      throw new Error('Need at least 5 cards to evaluate a hand');
    }

    const allCombinations = this.getCombinations(cards, 5);
    let bestHand = null;
    let bestRank = 0;

    for (const combination of allCombinations) {
      const evaluation = this.evaluateFiveCards(combination);
      if (evaluation.rank > bestRank) {
        bestRank = evaluation.rank;
        bestHand = {
          ...evaluation,
          cards: combination
        };
      } else if (evaluation.rank === bestRank) {
        const comparison = this.compareHands(evaluation, bestHand);
        if (comparison > 0) {
          bestHand = {
            ...evaluation,
            cards: combination
          };
        }
      }
    }

    return bestHand;
  }

  static evaluateFiveCards(cards) {
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    
    const isFlush = this.isFlush(sortedCards);
    const isStraight = this.isStraight(sortedCards);
    const groups = this.groupByRank(sortedCards);
    
    if (isStraight && isFlush) {
      if (sortedCards[0].value === 14 && sortedCards[1].value === 13) {
        return {
          rank: HAND_RANKINGS.ROYAL_FLUSH,
          name: HAND_NAMES[HAND_RANKINGS.ROYAL_FLUSH],
          highCards: sortedCards.map(c => c.value)
        };
      }
      return {
        rank: HAND_RANKINGS.STRAIGHT_FLUSH,
        name: HAND_NAMES[HAND_RANKINGS.STRAIGHT_FLUSH],
        highCards: [sortedCards[0].value]
      };
    }

    const counts = Object.values(groups).map(g => g.length).sort((a, b) => b - a);
    
    if (counts[0] === 4) {
      return {
        rank: HAND_RANKINGS.FOUR_OF_A_KIND,
        name: HAND_NAMES[HAND_RANKINGS.FOUR_OF_A_KIND],
        highCards: this.getHighCards(groups, [4, 1])
      };
    }

    if (counts[0] === 3 && counts[1] === 2) {
      return {
        rank: HAND_RANKINGS.FULL_HOUSE,
        name: HAND_NAMES[HAND_RANKINGS.FULL_HOUSE],
        highCards: this.getHighCards(groups, [3, 2])
      };
    }

    if (isFlush) {
      return {
        rank: HAND_RANKINGS.FLUSH,
        name: HAND_NAMES[HAND_RANKINGS.FLUSH],
        highCards: sortedCards.map(c => c.value)
      };
    }

    if (isStraight) {
      return {
        rank: HAND_RANKINGS.STRAIGHT,
        name: HAND_NAMES[HAND_RANKINGS.STRAIGHT],
        highCards: [sortedCards[0].value]
      };
    }

    if (counts[0] === 3) {
      return {
        rank: HAND_RANKINGS.THREE_OF_A_KIND,
        name: HAND_NAMES[HAND_RANKINGS.THREE_OF_A_KIND],
        highCards: this.getHighCards(groups, [3, 1, 1])
      };
    }

    if (counts[0] === 2 && counts[1] === 2) {
      return {
        rank: HAND_RANKINGS.TWO_PAIR,
        name: HAND_NAMES[HAND_RANKINGS.TWO_PAIR],
        highCards: this.getHighCards(groups, [2, 2, 1])
      };
    }

    if (counts[0] === 2) {
      return {
        rank: HAND_RANKINGS.PAIR,
        name: HAND_NAMES[HAND_RANKINGS.PAIR],
        highCards: this.getHighCards(groups, [2, 1, 1, 1])
      };
    }

    return {
      rank: HAND_RANKINGS.HIGH_CARD,
      name: HAND_NAMES[HAND_RANKINGS.HIGH_CARD],
      highCards: sortedCards.map(c => c.value)
    };
  }

  static isFlush(cards) {
    const suit = cards[0].suit;
    return cards.every(card => card.suit === suit);
  }

  static isStraight(cards) {
    const values = cards.map(c => c.value).sort((a, b) => b - a);
    
    for (let i = 0; i < values.length - 1; i++) {
      if (values[i] - values[i + 1] !== 1) {
        if (values[0] === 14 && values[1] === 5 && values[2] === 4 && 
            values[3] === 3 && values[4] === 2) {
          return true;
        }
        return false;
      }
    }
    return true;
  }

  static groupByRank(cards) {
    const groups = {};
    for (const card of cards) {
      if (!groups[card.value]) {
        groups[card.value] = [];
      }
      groups[card.value].push(card);
    }
    return groups;
  }

  static getHighCards(groups, pattern) {
    const highCards = [];
    const sortedGroups = Object.entries(groups)
      .sort((a, b) => {
        const lengthDiff = b[1].length - a[1].length;
        if (lengthDiff !== 0) return lengthDiff;
        return parseInt(b[0]) - parseInt(a[0]);
      });

    for (const [value, cards] of sortedGroups) {
      const count = cards.length;
      const patternIndex = pattern.indexOf(count);
      if (patternIndex !== -1) {
        highCards.push(parseInt(value));
        pattern[patternIndex] = -1;
      }
    }

    return highCards;
  }

  static compareHands(hand1, hand2) {
    if (hand1.rank !== hand2.rank) {
      return hand1.rank - hand2.rank;
    }

    for (let i = 0; i < hand1.highCards.length; i++) {
      if (hand1.highCards[i] !== hand2.highCards[i]) {
        return hand1.highCards[i] - hand2.highCards[i];
      }
    }

    return 0;
  }

  static getCombinations(arr, size) {
    const result = [];
    
    function combine(start, combo) {
      if (combo.length === size) {
        result.push([...combo]);
        return;
      }
      
      for (let i = start; i < arr.length; i++) {
        combo.push(arr[i]);
        combine(i + 1, combo);
        combo.pop();
      }
    }
    
    combine(0, []);
    return result;
  }

  static comparePlayerHands(playerHand, opponentHand) {
    const playerEval = this.evaluateHand(playerHand);
    const opponentEval = this.evaluateHand(opponentHand);
    
    if (playerEval.rank > opponentEval.rank) {
      return { winner: 'player', hand: playerEval };
    } else if (opponentEval.rank > playerEval.rank) {
      return { winner: 'opponent', hand: opponentEval };
    } else {
      const comparison = this.compareHands(playerEval, opponentEval);
      if (comparison > 0) {
        return { winner: 'player', hand: playerEval };
      } else if (comparison < 0) {
        return { winner: 'opponent', hand: opponentEval };
      } else {
        return { winner: 'tie', hand: playerEval };
      }
    }
  }
}

export default HandEvaluator;