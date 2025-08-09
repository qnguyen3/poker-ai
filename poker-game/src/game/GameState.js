import Deck from './Deck';
import HandEvaluator from './HandEvaluator';
import { 
  GAME_PHASES, 
  PLAYER_ACTIONS, 
  INITIAL_CHIPS,
  SMALL_BLIND,
  BIG_BLIND,
  MIN_RAISE
} from '../utils/constants';

class GameState {
  constructor() {
    this.deck = new Deck();
    this.reset();
  }

  reset() {
    this.deck.reset();
    this.phase = GAME_PHASES.WAITING;
    this.pot = 0;
    this.lastPot = 0;
    this.currentBet = 0;
    this.dealerPosition = 0;
    this.currentPlayerIndex = 0;
    this.communityCards = [];
    this.winner = null;
    this.winnerHand = null;
    this.roundActions = [];
    this.moveHistory = [];
    
    this.player = {
      name: 'Player',
      chips: INITIAL_CHIPS,
      hand: [],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isActive: false,
      lastAction: null
    };
    
    this.opponent = {
      name: 'AI Opponent',
      chips: INITIAL_CHIPS,
      hand: [],
      currentBet: 0,
      hasFolded: false,
      isAllIn: false,
      isActive: false,
      lastAction: null
    };
  }

  startNewHand() {
    this.deck.returnAllCards();
    this.deck.reset();
    
    this.phase = GAME_PHASES.PRE_FLOP;
    this.pot = 0;
    this.currentBet = 0;
    this.communityCards = [];
    this.winner = null;
    this.winnerHand = null;
    this.roundActions = [];
    this.moveHistory = [];
    
    this.dealerPosition = 1 - this.dealerPosition;
    
    this.player.hand = [];
    this.player.currentBet = 0;
    this.player.hasFolded = false;
    this.player.isAllIn = false;
    this.player.lastAction = null;
    
    this.opponent.hand = [];
    this.opponent.currentBet = 0;
    this.opponent.hasFolded = false;
    this.opponent.isAllIn = false;
    this.opponent.lastAction = null;
    
    this.postBlinds();
    this.dealHoleCards();
    
    this.currentPlayerIndex = this.dealerPosition;
    this.updateActivePlayer();
  }

  postBlinds() {
    const smallBlindPlayer = this.dealerPosition === 0 ? this.player : this.opponent;
    const bigBlindPlayer = this.dealerPosition === 0 ? this.opponent : this.player;
    
    const smallBlindAmount = Math.min(SMALL_BLIND, smallBlindPlayer.chips);
    const bigBlindAmount = Math.min(BIG_BLIND, bigBlindPlayer.chips);
    
    smallBlindPlayer.chips -= smallBlindAmount;
    smallBlindPlayer.currentBet = smallBlindAmount;
    this.pot += smallBlindAmount;
    
    bigBlindPlayer.chips -= bigBlindAmount;
    bigBlindPlayer.currentBet = bigBlindAmount;
    this.pot += bigBlindAmount;
    
    this.currentBet = BIG_BLIND;
    
    // Add blinds to move history
    this.moveHistory.push({
      player: smallBlindPlayer.name,
      action: `Posted small blind $${smallBlindAmount}`,
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    this.moveHistory.push({
      player: bigBlindPlayer.name,
      action: `Posted big blind $${bigBlindAmount}`,
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  dealHoleCards() {
    this.player.hand = this.deck.dealCards(2);
    this.player.hand.forEach(card => card.reveal());
    
    this.opponent.hand = this.deck.dealCards(2);
  }

  dealFlop() {
    this.phase = GAME_PHASES.FLOP;
    this.communityCards = this.deck.dealCards(3);
    this.communityCards.forEach(card => card.reveal());
    
    // Add phase transition to move history
    this.moveHistory.push({
      player: 'Dealer',
      action: 'Dealt the Flop',
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    this.resetBettingRound();
  }

  dealTurn() {
    this.phase = GAME_PHASES.TURN;
    const turnCard = this.deck.dealCard();
    turnCard.reveal();
    this.communityCards.push(turnCard);
    
    // Add phase transition to move history
    this.moveHistory.push({
      player: 'Dealer',
      action: 'Dealt the Turn',
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    this.resetBettingRound();
  }

  dealRiver() {
    this.phase = GAME_PHASES.RIVER;
    const riverCard = this.deck.dealCard();
    riverCard.reveal();
    this.communityCards.push(riverCard);
    
    // Add phase transition to move history
    this.moveHistory.push({
      player: 'Dealer',
      action: 'Dealt the River',
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    this.resetBettingRound();
  }

  resetBettingRound() {
    this.currentBet = 0;
    this.player.currentBet = 0;
    this.opponent.currentBet = 0;
    this.roundActions = [];
    this.currentPlayerIndex = 1 - this.dealerPosition;
    this.updateActivePlayer();
  }

  updateActivePlayer() {
    this.player.isActive = this.currentPlayerIndex === 0 && !this.player.hasFolded && !this.player.isAllIn;
    this.opponent.isActive = this.currentPlayerIndex === 1 && !this.opponent.hasFolded && !this.opponent.isAllIn;
  }

  handlePlayerAction(action, amount = 0) {
    const currentPlayer = this.currentPlayerIndex === 0 ? this.player : this.opponent;
    
    if (currentPlayer.hasFolded || currentPlayer.isAllIn) {
      return false;
    }
    
    switch (action) {
      case PLAYER_ACTIONS.FOLD:
        currentPlayer.hasFolded = true;
        currentPlayer.lastAction = 'Fold';
        this.checkForWinner();
        break;
        
      case PLAYER_ACTIONS.CHECK:
        if (this.currentBet === currentPlayer.currentBet) {
          currentPlayer.lastAction = 'Check';
        } else {
          return false;
        }
        break;
        
      case PLAYER_ACTIONS.CALL:
        const callAmount = Math.min(this.currentBet - currentPlayer.currentBet, currentPlayer.chips);
        currentPlayer.chips -= callAmount;
        currentPlayer.currentBet += callAmount;
        this.pot += callAmount;
        currentPlayer.lastAction = `Call $${callAmount}`;
        
        if (currentPlayer.chips === 0) {
          currentPlayer.isAllIn = true;
        }
        break;
        
      case PLAYER_ACTIONS.RAISE:
        if (amount < MIN_RAISE || amount > currentPlayer.chips) {
          return false;
        }
        
        const raiseAmount = amount - currentPlayer.currentBet;
        currentPlayer.chips -= raiseAmount;
        currentPlayer.currentBet = amount;
        this.pot += raiseAmount;
        this.currentBet = amount;
        currentPlayer.lastAction = `Raise to $${amount}`;
        
        if (currentPlayer.chips === 0) {
          currentPlayer.isAllIn = true;
        }
        break;
        
      case PLAYER_ACTIONS.ALL_IN:
        const allInAmount = currentPlayer.chips;
        currentPlayer.currentBet += allInAmount;
        this.pot += allInAmount;
        currentPlayer.chips = 0;
        currentPlayer.isAllIn = true;
        currentPlayer.lastAction = `All in $${allInAmount}`;
        
        if (currentPlayer.currentBet > this.currentBet) {
          this.currentBet = currentPlayer.currentBet;
        }
        break;
        
      default:
        return false;
    }
    
    this.roundActions.push({ player: currentPlayer.name, action });
    
    // Add to move history with timestamp and phase
    this.moveHistory.push({
      player: currentPlayer.name,
      action: currentPlayer.lastAction,
      phase: this.phase,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (!this.checkForWinner()) {
      this.nextPlayer();
    }
    
    return true;
  }

  nextPlayer() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    this.updateActivePlayer();
    
    if (this.isBettingRoundComplete()) {
      this.progressToNextPhase();
    }
  }

  isBettingRoundComplete() {
    if (this.player.hasFolded || this.opponent.hasFolded) {
      return true;
    }
    
    const playersActed = this.roundActions.length >= 2;
    const betsEqual = this.player.currentBet === this.opponent.currentBet;
    const bothChecked = this.roundActions.length >= 2 && 
                        this.roundActions.every(a => a.action === PLAYER_ACTIONS.CHECK);
    
    return playersActed && (betsEqual || bothChecked);
  }

  progressToNextPhase() {
    switch (this.phase) {
      case GAME_PHASES.PRE_FLOP:
        this.dealFlop();
        break;
      case GAME_PHASES.FLOP:
        this.dealTurn();
        break;
      case GAME_PHASES.TURN:
        this.dealRiver();
        break;
      case GAME_PHASES.RIVER:
        this.showdown();
        break;
    }
  }

  checkForWinner() {
    if (this.player.hasFolded) {
      this.winner = 'opponent';
      this.phase = GAME_PHASES.SHOWDOWN;
      this.lastPot = this.pot;
      this.opponent.chips += this.pot;
      this.winnerHand = { name: 'Player folded', cards: [] };
      this.pot = 0;
      return true;
    }
    
    if (this.opponent.hasFolded) {
      this.winner = 'player';
      this.phase = GAME_PHASES.SHOWDOWN;
      this.lastPot = this.pot;
      this.player.chips += this.pot;
      this.winnerHand = { name: 'Opponent folded', cards: [] };
      this.pot = 0;
      return true;
    }
    
    return false;
  }

  showdown() {
    this.phase = GAME_PHASES.SHOWDOWN;
    
    this.opponent.hand.forEach(card => card.reveal());
    
    const allCards = [...this.communityCards];
    const playerCards = [...this.player.hand, ...allCards];
    const opponentCards = [...this.opponent.hand, ...allCards];
    
    const playerEval = HandEvaluator.evaluateHand(playerCards);
    const opponentEval = HandEvaluator.evaluateHand(opponentCards);
    const result = HandEvaluator.comparePlayerHands(playerCards, opponentCards);
    
    this.winner = result.winner;
    
    if (result.winner === 'player') {
      this.winnerHand = playerEval;
    } else if (result.winner === 'opponent') {
      this.winnerHand = opponentEval;
    } else {
      this.winnerHand = playerEval;
    }
    
    this.lastPot = this.pot;
    
    if (result.winner === 'player') {
      this.player.chips += this.pot;
    } else if (result.winner === 'opponent') {
      this.opponent.chips += this.pot;
    } else {
      const halfPot = Math.floor(this.pot / 2);
      this.player.chips += halfPot;
      this.opponent.chips += this.pot - halfPot;
    }
    
    this.pot = 0;
  }

  isGameOver() {
    return this.player.chips === 0 || this.opponent.chips === 0;
  }

  getState() {
    return {
      phase: this.phase,
      pot: this.pot,
      lastPot: this.lastPot || 0,
      currentBet: this.currentBet,
      dealerPosition: this.dealerPosition,
      communityCards: this.communityCards,
      player: { 
        ...this.player,
        hand: this.player.hand || []
      },
      opponent: { 
        ...this.opponent,
        hand: this.opponent.hand || []
      },
      winner: this.winner,
      winnerHand: this.winnerHand,
      moveHistory: this.moveHistory || [],
      isPlayerTurn: this.currentPlayerIndex === 0,
      isGameOver: this.isGameOver()
    };
  }
}

export default GameState;