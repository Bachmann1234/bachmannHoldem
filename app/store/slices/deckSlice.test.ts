import { deckSlice } from './deckSlice';
import { Card, Rank, Suit } from './deckSlice';

describe('deckSlice', () => {
    const { shuffle, drawCard, addCard } = deckSlice.actions;

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
            const newState = deckSlice.reducer(initialState, shuffle());
            expect(newState.cardStack).not.toEqual(originalOrder);
            expect(newState.cardStack.length).toBe(52);
        });

        it('should draw a card', () => {
            const initialState = deckSlice.reducer(undefined, { type: 'unknown' });
            const originalLength = initialState.cardStack.length;
            const newState = deckSlice.reducer(initialState, drawCard());
            expect(newState.cardStack.length).toBe(originalLength - 1);
        });

        it('should add a card', () => {
            const initialState = { cardStack: [] };
            const cardToAdd: Card = { suit: Suit.HEARTS, rank: Rank.ACE };
            const newState = deckSlice.reducer(initialState, addCard(cardToAdd));
            expect(newState.cardStack).toHaveLength(1);
            expect(newState.cardStack[0]).toEqual(cardToAdd);
        });
    });
});