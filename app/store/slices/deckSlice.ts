import { createSlice } from '@reduxjs/toolkit';
import { Card, Rank, Suit } from '../../types/Card';

export interface DeckState {
  cardStack: Card[];
}

const initialState: DeckState = {
  cardStack: shuffleDeck(generateDeck()),
};

export const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    drawCard: (state: DeckState) => {
      state.cardStack.shift();
    },
    resetDeck: (state: DeckState) => {
      state.cardStack = shuffleDeck(generateDeck());
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

export const { drawCard, resetDeck } = deckSlice.actions;
export default deckSlice.reducer;
