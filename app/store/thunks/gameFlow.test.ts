import { startNewHand } from '@/app/store/thunks/gameFlow';
import { configureStore } from '@reduxjs/toolkit';
import { Rank, Suit } from '@/app/types/Card';
import tableReducer, {
  addPlayer,
  setBigBlindAmount,
  setSmallBlindAmount,
  tableSlice,
} from '@/app/store/slices/tableSlice';
import deckReducer from '@/app/store/slices/deckSlice';

// Import selectors to check state
import {
  selectPlayers,
  selectDealer,
  selectSmallBlind,
  selectBigBlind,
  selectMainPotAmount,
} from '@/app/store/selectors/tableSelectors';
import { selectCardStack } from '@/app/store/selectors/deckSelectors';
import { RootState } from '@/app/store';

describe('gameFlow thunks', () => {
  // Helper function to create a player
  const createPlayer = (id: number, stack: number = 1000) => ({
    playerId: id,
    playerName: 'Player ' + id,
    stack,
    hand: [],
    folded: false,
    isAllIn: false,
  });

  const setupStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        table: tableReducer,
        deck: deckReducer,
      },
      preloadedState: initialState,
    });
  };

  describe('startNewHand', () => {
    it('should start a new hand with normal blinds', () => {
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];

      const cards = [
        { suit: Suit.SPADES, rank: Rank.ACE },
        { suit: Suit.SPADES, rank: Rank.KING },
        { suit: Suit.SPADES, rank: Rank.QUEEN },
        { suit: Suit.SPADES, rank: Rank.JACK },
        { suit: Suit.SPADES, rank: Rank.TEN },
        { suit: Suit.SPADES, rank: Rank.NINE },
      ];

      const initialState = {
        table: tableSlice.getInitialState(),
        deck: {
          cardStack: cards,
        },
      };

      const store = setupStore(initialState);
      players.forEach((player) => {
        store.dispatch(addPlayer(player));
      });
      store.dispatch(startNewHand() as any);

      // Check state after action is completed
      const state = store.getState() as RootState;

      // Verify hand was reset and set up
      expect(selectDealer(state)).toEqual(players[0].playerId);
      expect(selectSmallBlind(state)).toEqual(players[1].playerId);
      expect(selectBigBlind(state)).toEqual(players[2].playerId);

      // Verify stack changes and pot creation
      const updatedPlayers = selectPlayers(state);
      expect(updatedPlayers[1].stack).toBe(999);
      expect(updatedPlayers[2].stack).toBe(998);
      expect(selectMainPotAmount(state)).toBe(3);

      // Verify cards were dealt
      expect(updatedPlayers[0].hand.length).toBe(2);
      expect(updatedPlayers[1].hand.length).toBe(2);
      expect(updatedPlayers[2].hand.length).toBe(2);

      // Check card stack was reduced
      expect(selectCardStack(state).length).toBe(0); // 6 cards dealt for 3 players
    });

    it('should handle small blind with insufficient stack (all-in)', () => {
      const players = [
        createPlayer(1),
        createPlayer(2, 3), // SB with only 3 chips
        createPlayer(3),
      ];

      const initialState = {
        table: tableSlice.getInitialState(),
        deck: {
          cardStack: Array(6).fill({ suit: Suit.SPADES, rank: Rank.ACE }),
        },
      };

      const store = setupStore(initialState);
      players.forEach((player) => {
        store.dispatch(addPlayer(player));
      });
      store.dispatch(setSmallBlindAmount(5));
      store.dispatch(setBigBlindAmount(10));

      store.dispatch(startNewHand() as any);

      const state = store.getState() as RootState;

      // Verify SB is all-in
      const updatedPlayers = selectPlayers(state);
      expect(updatedPlayers[1].stack).toBe(0);
      expect(updatedPlayers[1].isAllIn).toBe(true);

      // Verify side pot was created
      expect(state.table.sidePots.length).toBe(1);
      expect(state.table.sidePots[0].eligiblePlayers).toContainEqual(
        expect.objectContaining({ playerId: 1 }),
      );
      expect(state.table.sidePots[0].eligiblePlayers).toContainEqual(
        expect.objectContaining({ playerId: 3 }),
      );
    });
  });
});
