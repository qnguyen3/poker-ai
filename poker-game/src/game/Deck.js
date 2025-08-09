import Card from './Card';
import { SUITS, RANKS } from '../utils/constants';

class Deck {
  constructor() {
    this.cards = [];
    this.dealtCards = [];
    this.initialize();
  }

  initialize() {
    this.cards = [];
    this.dealtCards = [];
    
    for (const suit of Object.values(SUITS)) {
      for (const rank of Object.values(RANKS)) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  dealCard() {
    if (this.cards.length === 0) {
      throw new Error('No cards left in deck');
    }
    const card = this.cards.pop();
    this.dealtCards.push(card);
    return card;
  }

  dealCards(count) {
    const cards = [];
    for (let i = 0; i < count; i++) {
      cards.push(this.dealCard());
    }
    return cards;
  }

  reset() {
    this.initialize();
    this.shuffle();
  }

  getCardsRemaining() {
    return this.cards.length;
  }

  returnCard(card) {
    const index = this.dealtCards.indexOf(card);
    if (index > -1) {
      this.dealtCards.splice(index, 1);
      this.cards.push(card);
    }
  }

  returnAllCards() {
    while (this.dealtCards.length > 0) {
      this.cards.push(this.dealtCards.pop());
    }
  }
}

export default Deck;