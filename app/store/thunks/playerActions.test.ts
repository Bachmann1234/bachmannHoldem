import { configureStore } from '@reduxjs/toolkit';
import { playerFold, playerCheck, playerCall, playerBet, playerRaise } from './playerActions';
import tableReducer, { addPlayer, setCurrentPlayer, tableSlice } from '../slices/tableSlice';
import deckReducer from '../slices/deckSlice';
import { ActionType, Player } from '@/app/types/Holdem';
import { RootState } from '@/app/store';

describe('Player Actions', () => {
  // Helper function to create a player
  const createPlayer = (id: number, stack: number = 1000): Player => ({
    playerId: id,
    playerName: `Player ${id}`,
    hand: [],
    stack,
    isFolded: false,
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

  describe('playerFold', () => {
    it('should mark a player as folded and move to the next player', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerFold(1) as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1 should be folded
      expect(updatedPlayers[0].isFolded).toBe(true);

      // Current player should be player 2
      expect(state.table.currentPlayer).toBe(2);

      // Action log should contain a fold action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.FOLD);
      expect(lastAction.player?.playerId).toBe(1);
    });
  });

  describe('playerCheck', () => {
    it('should allow a player to check when there is no bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 0,
            minBet: 2,
            lastRaise: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerCheck(1) as any);

      // Assert
      const state = store.getState() as RootState;

      // Current player should be player 2
      expect(state.table.currentPlayer).toBe(2);

      // Action log should contain a check action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.CHECK);
      expect(lastAction.player?.playerId).toBe(1);
    });

    it('should not allow a player to check when there is a bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 10,
            minBet: 2,
            lastRaise: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      store.dispatch(playerCheck(1) as any);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cannot check when there is a bet');

      // State should not have changed
      const state = store.getState() as RootState;
      expect(state.table.currentPlayer).toBe(1);
      expect(state.table.actionLog.length).toBe(0);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('playerCall', () => {
    it('should allow a player to call a bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 10,
            minBet: 2,
            lastRaise: 0,
          },
          mainPot: {
            amount: 0,
            eligiblePlayers: players,
            createdInRound: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerCall(1) as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1's stack should be reduced by 10
      expect(updatedPlayers[0].stack).toBe(990);

      // Pot should have 10 added
      expect(state.table.mainPot.amount).toBe(10);

      // Current player should be player 2
      expect(state.table.currentPlayer).toBe(2);

      // Action log should contain a call action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.CALL);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(10);
    });

    it('should handle all-in when player has less than the bet amount', () => {
      // Setup
      const players = [
        createPlayer(1, 5), // Player 1 has only 5 chips
        createPlayer(2),
        createPlayer(3),
      ];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 10,
            minBet: 2,
            lastRaise: 0,
          },
          mainPot: {
            amount: 0,
            eligiblePlayers: players,
            createdInRound: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerCall(1) as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1 should be all-in with 0 stack
      expect(updatedPlayers[0].stack).toBe(0);
      expect(updatedPlayers[0].isAllIn).toBe(true);

      // Pot should have 5 added
      expect(state.table.mainPot.amount).toBe(5);

      // Side pot should be created
      expect(state.table.sidePots.length).toBe(1);

      // Action log should contain an all-in action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.ALL_IN);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(5);
    });
  });

  describe('playerBet', () => {
    it('should allow a player to bet when there is no current bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 0,
            minBet: 2,
            lastRaise: 0,
          },
          mainPot: {
            amount: 0,
            eligiblePlayers: players,
            createdInRound: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerBet(1, 10) as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1's stack should be reduced by 10
      expect(updatedPlayers[0].stack).toBe(990);

      // Pot should have 10 added
      expect(state.table.mainPot.amount).toBe(10);

      // Current player should be player 2
      expect(state.table.currentPlayer).toBe(2);

      // Action log should contain a bet action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.BET);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(10);
    });

    it('should not allow a bet less than the minimum bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 0,
            minBet: 10,
            lastRaise: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      store.dispatch(playerBet(1, 5) as any);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Bet must be at least 10');

      // State should not have changed
      const state = store.getState() as RootState;
      expect(state.table.currentPlayer).toBe(1);
      expect(state.table.actionLog.length).toBe(0);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should not allow a bet when there is already a bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 5,
            minBet: 2,
            lastRaise: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      store.dispatch(playerBet(1, 10) as any);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cannot bet when there is already a bet');

      // State should not have changed
      const state = store.getState() as RootState;
      expect(state.table.currentPlayer).toBe(1);
      expect(state.table.actionLog.length).toBe(0);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });

  describe('playerRaise', () => {
    it('should allow a player to raise when there is a current bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 10,
            minBet: 2,
            lastRaise: 5,
          },
          mainPot: {
            amount: 0,
            eligiblePlayers: players,
            createdInRound: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Act
      store.dispatch(playerRaise(1, 25) as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1's stack should be reduced by 25
      expect(updatedPlayers[0].stack).toBe(975);

      // Pot should have 25 added
      expect(state.table.mainPot.amount).toBe(25);

      // Current player should be player 2
      expect(state.table.currentPlayer).toBe(2);

      // Action log should contain a raise action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.RAISE);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(25);
    });

    it('should not allow a raise less than the minimum raise', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 10,
            minBet: 2,
            lastRaise: 5,
          },
        },
      };
      const store = setupStore(initialState);

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      store.dispatch(playerRaise(1, 12) as any);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Raise must be at least 15');

      // State should not have changed
      const state = store.getState() as RootState;
      expect(state.table.currentPlayer).toBe(1);
      expect(state.table.actionLog.length).toBe(0);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });

    it('should not allow a raise when there is no current bet', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentPlayer: 1,
          bettingRound: {
            currentBet: 0,
            minBet: 2,
            lastRaise: 0,
          },
        },
      };
      const store = setupStore(initialState);

      // Mock console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      store.dispatch(playerRaise(1, 20) as any);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cannot raise when there is no bet');

      // State should not have changed
      const state = store.getState() as RootState;
      expect(state.table.currentPlayer).toBe(1);
      expect(state.table.actionLog.length).toBe(0);

      // Cleanup
      consoleErrorSpy.mockRestore();
    });
  });
});
