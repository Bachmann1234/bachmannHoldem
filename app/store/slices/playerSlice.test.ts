import playerReducer, { playerSlice } from './playerSlice';
import { Card, Rank, Suit } from '../../types/Card';

describe('playerSlice', () => {
  const { addCardToHand, clearHand, addToStack, removeFromStack } = playerSlice.actions;

  describe('initial state', () => {
    it('should have empty hand and zero stack', () => {
      const initialState = playerReducer(undefined, { type: 'unknown' });
      expect(initialState.hand).toHaveLength(0);
      expect(initialState.stack).toBe(0);
    });
  });

  describe('reducers', () => {
    it('should add card to hand', () => {
      const initialState = { playerName: 'Player', hand: [], stack: 0 };
      const cardToAdd: Card = { suit: Suit.HEARTS, rank: Rank.ACE };
      const newState = playerReducer(initialState, addCardToHand(cardToAdd));
      expect(newState.hand).toHaveLength(1);
      expect(newState.hand[0]).toEqual(cardToAdd);
    });

    it('should clear hand', () => {
      const initialState = {
        playerName: 'Player',
        hand: [{ suit: Suit.HEARTS, rank: Rank.ACE }],
        stack: 0,
      };
      const newState = playerReducer(initialState, clearHand());
      expect(newState.hand).toHaveLength(0);
    });

    it('should add to stack', () => {
      const initialState = { playerName: 'Player', hand: [], stack: 100 };
      const newState = playerReducer(initialState, addToStack(50));
      expect(newState.stack).toBe(150);
    });

    it('should remove from stack', () => {
      const initialState = { playerName: 'Player', hand: [], stack: 100 };
      const newState = playerReducer(initialState, removeFromStack(30));
      expect(newState.stack).toBe(70);
    });

    it('should set player name', () => {
      const initialState = { playerName: 'Player', hand: [], stack: 0 };
      const newState = playerReducer(initialState, playerSlice.actions.setName('Alice'));
      expect(newState.playerName).toBe('Alice');
      // Verify other properties remain unchanged
      expect(newState.hand).toEqual([]);
      expect(newState.stack).toBe(0);
    });
  });
});
