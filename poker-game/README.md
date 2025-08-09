# Texas Hold'em Poker Game

A simple Texas Hold'em poker game built with React, Tailwind CSS v3, and Canvas. Play against an AI opponent in this classic card game!

## Features

### ✅ Completed (Phases 1-4)
- **Full Game Engine**: Complete Texas Hold'em rules and gameplay
- **Canvas Rendering**: Visual poker table with card animations
- **AI Opponent**: Intelligent opponent with decision-making logic
- **Betting System**: Full betting rounds (pre-flop, flop, turn, river)
- **Hand Evaluation**: Accurate poker hand ranking and comparison
- **Game State Management**: Proper game flow and state transitions
- **Responsive UI**: Clean interface with Tailwind CSS styling

## How to Play

1. **Start the game**: Click "Deal New Hand" to begin
2. **Betting rounds**: Use the controls to Fold, Check, Call, or Raise
3. **Community cards**: Watch as the Flop, Turn, and River are dealt
4. **Showdown**: Best hand wins the pot!

## Poker Hand Rankings (from highest to lowest)
1. Royal Flush
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. Pair
10. High Card

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Game Controls
- **Fold**: Give up your hand and lose any bets
- **Check**: Pass the action (when no bet is required)
- **Call**: Match the current bet
- **Raise**: Increase the current bet
- **All In**: Bet all your remaining chips

## Technical Stack
- **React**: UI components and state management
- **Vite**: Build tool and development server
- **Tailwind CSS v3**: Styling and responsive design
- **Canvas API**: Card rendering and table visualization
- **JavaScript Classes**: Game logic and AI implementation

## Project Structure
```
src/
├── components/       # React components
│   ├── Game.jsx     # Main game controller
│   ├── PokerTable.jsx # Canvas table rendering
│   └── GameControls.jsx # Player action buttons
├── game/            # Game logic
│   ├── Card.js      # Card class with rendering
│   ├── Deck.js      # Deck management
│   ├── HandEvaluator.js # Hand strength evaluation
│   ├── GameState.js # Game state management
│   └── AIPlayer.js  # AI opponent logic
└── utils/           # Constants and helpers
    └── constants.js # Game constants
```

## Game Rules
- Each player receives 2 hole cards
- 5 community cards are dealt (3 on flop, 1 on turn, 1 on river)
- Best 5-card hand from 7 available cards wins
- Small blind: $10, Big blind: $20
- Starting chips: $1000

Enjoy playing Texas Hold'em Poker!