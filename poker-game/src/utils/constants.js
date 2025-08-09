export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};

export const RANKS = {
  TWO: { value: 2, display: '2' },
  THREE: { value: 3, display: '3' },
  FOUR: { value: 4, display: '4' },
  FIVE: { value: 5, display: '5' },
  SIX: { value: 6, display: '6' },
  SEVEN: { value: 7, display: '7' },
  EIGHT: { value: 8, display: '8' },
  NINE: { value: 9, display: '9' },
  TEN: { value: 10, display: '10' },
  JACK: { value: 11, display: 'J' },
  QUEEN: { value: 12, display: 'Q' },
  KING: { value: 13, display: 'K' },
  ACE: { value: 14, display: 'A' }
};

export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

export const HAND_NAMES = {
  [HAND_RANKINGS.HIGH_CARD]: 'High Card',
  [HAND_RANKINGS.PAIR]: 'Pair',
  [HAND_RANKINGS.TWO_PAIR]: 'Two Pair',
  [HAND_RANKINGS.THREE_OF_A_KIND]: 'Three of a Kind',
  [HAND_RANKINGS.STRAIGHT]: 'Straight',
  [HAND_RANKINGS.FLUSH]: 'Flush',
  [HAND_RANKINGS.FULL_HOUSE]: 'Full House',
  [HAND_RANKINGS.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HAND_RANKINGS.STRAIGHT_FLUSH]: 'Straight Flush',
  [HAND_RANKINGS.ROYAL_FLUSH]: 'Royal Flush'
};

export const GAME_PHASES = {
  WAITING: 'WAITING',
  PRE_FLOP: 'PRE_FLOP',
  FLOP: 'FLOP',
  TURN: 'TURN',
  RIVER: 'RIVER',
  SHOWDOWN: 'SHOWDOWN'
};

export const PLAYER_ACTIONS = {
  FOLD: 'FOLD',
  CHECK: 'CHECK',
  CALL: 'CALL',
  RAISE: 'RAISE',
  ALL_IN: 'ALL_IN'
};

export const INITIAL_CHIPS = 1000;
export const SMALL_BLIND = 10;
export const BIG_BLIND = 20;
export const MIN_RAISE = BIG_BLIND;