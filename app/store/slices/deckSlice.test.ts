import { deckSlice } from './deckSlice';
import { Rank, Suit } from '../../types/Card';

describe('deckSlice', () => {
  const { resetDeck, drawCard } = deckSlice.actions;

  describe('initial state', () => {
    it('should have 52 cards', () => {
      const initialState = deckSlice.reducer(undefined, { type: 'unknown' });
      expect(initialState.cardStack.length).toBe(52);
    });

    it('should have valid cards', () => {
      const initialState = deckSlice.reducer(undefined, { type: 'unknown' });
      const sampleCard = initialState.cardStack[0];
      expect(Object.values(Suit)).toContain(sampleCard.suit);
      expect(Object.values(Rank)).toContain(sampleCard.rank);
    });
  });

  describe('reducers', () => {
    it('should shuffle cards', () => {
      const initialState = deckSlice.reducer(undefined, { type: 'unknown' });
      const originalOrder = [...initialState.cardStack];
      const newState = deckSlice.reducer(initialState, resetDeck());
      expect(newState.cardStack).not.toEqual(originalOrder);
      expect(newState.cardStack.length).toBe(52);
    });

    it('should draw a card', () => {
      const initialState = deckSlice.reducer(undefined, { type: 'unknown' });
      const originalLength = initialState.cardStack.length;
      const newState = deckSlice.reducer(initialState, drawCard());
      expect(newState.cardStack.length).toBe(originalLength - 1);
    });
  });
});
