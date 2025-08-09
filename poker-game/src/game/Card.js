import { SUITS, RANKS } from '../utils/constants';

class Card {
  constructor(suit, rank) {
    this.suit = suit;
    this.rank = rank;
    this.value = rank.value;
    this.display = rank.display;
    this.isRevealed = false;
    this.position = { x: 0, y: 0 };
    this.targetPosition = { x: 0, y: 0 };
    this.rotation = 0;
  }

  getColor() {
    return (this.suit === SUITS.HEARTS || this.suit === SUITS.DIAMONDS) ? 'red' : 'black';
  }

  getSuitSymbol() {
    const symbols = {
      [SUITS.HEARTS]: '♥',
      [SUITS.DIAMONDS]: '♦',
      [SUITS.CLUBS]: '♣',
      [SUITS.SPADES]: '♠'
    };
    return symbols[this.suit];
  }

  toString() {
    return `${this.display}${this.getSuitSymbol()}`;
  }

  equals(otherCard) {
    return this.suit === otherCard.suit && this.value === otherCard.value;
  }

  reveal() {
    this.isRevealed = true;
  }

  hide() {
    this.isRevealed = false;
  }

  setPosition(x, y) {
    this.position = { x, y };
    this.targetPosition = { x, y };
  }

  setTargetPosition(x, y) {
    this.targetPosition = { x, y };
  }

  updatePosition(deltaTime) {
    const speed = 0.1;
    this.position.x += (this.targetPosition.x - this.position.x) * speed * deltaTime;
    this.position.y += (this.targetPosition.y - this.position.y) * speed * deltaTime;
  }

  draw(ctx, width = 70, height = 100) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    if (!this.isRevealed) {
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(-width/2 + 10, -height/2 + 10, width - 20, height - 20);
    } else {
      ctx.fillStyle = 'white';
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      ctx.fillStyle = this.getColor();
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(this.display, 0, -height/2 + 25);
      
      ctx.font = '24px Arial';
      ctx.fillText(this.getSuitSymbol(), 0, 5);
      
      ctx.font = 'bold 12px Arial';
      ctx.fillText(this.display, -width/2 + 10, -height/2 + 15);
      ctx.fillText(this.display, width/2 - 10, height/2 - 5);
    }

    ctx.restore();
  }
}

export default Card;