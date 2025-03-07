import { createSlice } from '@reduxjs/toolkit';
import { Card, Rank, Suit } from '../../types/Card';

interface DeckState {
  cardStack: Card[];
}

const initialState: DeckState = {
  cardStack: shuffleDeck(generateDeck()),
};

export const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    shuffle: (state: DeckState) => {
      state.cardStack = shuffleDeck(state.cardStack);
    },
    drawCard: (state: DeckState) => {
      state.cardStack.shift();
    },
    addCard: (state: DeckState, action: { payload: Card }) => {
      state.cardStack.push(action.payload);
    },
  },
});

function shuffleDeck(cardsStack: Card[]): Card[] {
  return cardsStack.sort(() => Math.random() - 0.5);
}

function generateDeck(): Card[] {
  const suits: Suit[] = Object.values(Suit);
  const ranks: Rank[] = Object.values(Rank).filter((value) => typeof value === 'number') as Rank[];
  return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
}
