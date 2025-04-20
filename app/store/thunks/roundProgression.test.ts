import { configureStore } from '@reduxjs/toolkit';
import { advanceToNextRound, handleShowdown } from './roundProgression';
import tableReducer, { addPlayer, tableSlice } from '../slices/tableSlice';
import deckReducer, { deckSlice } from '../slices/deckSlice';
import { ActionType, GameRound, Player } from '@/app/types/Holdem';
import { RootState } from '@/app/store';
import { Card, Rank, Suit } from '@/app/types/Card';

describe('Round Progression', () => {
  // Helper function to create a player
  const createPlayer = (id: number, stack: number = 1000, folded: boolean = false): Player => ({
    playerId: id,
    playerName: `Player ${id}`,
    hand: [],
    stack,
    isFolded: folded,
    isAllIn: false,
  });

  const createCard = (suit: Suit, rank: Rank): Card => ({ suit, rank });

  const setupStore = (initialState = {}) => {
    return configureStore({
      reducer: {
        table: tableReducer,
        deck: deckReducer,
      },
      preloadedState: initialState,
    });
  };

  describe('advanceToNextRound', () => {
    it('should advance from preflop to flop and deal 3 cards', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const cards = [
        createCard(Suit.HEARTS, Rank.ACE), // Burn card
        createCard(Suit.HEARTS, Rank.KING), // Flop 1
        createCard(Suit.HEARTS, Rank.QUEEN), // Flop 2
        createCard(Suit.HEARTS, Rank.JACK), // Flop 3
        createCard(Suit.HEARTS, Rank.TEN), // Extra card
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          dealer: 1,
          currentRound: GameRound.PREFLOP,
          board: [],
          burnPile: [],
        },
        deck: {
          cardStack: cards,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(advanceToNextRound() as any);

      // Assert
      const state = store.getState() as RootState;

      // Round should be advanced to FLOP
      expect(state.table.currentRound).toBe(GameRound.FLOP);

      // Board should have 3 cards
      expect(state.table.board.length).toBe(3);
      expect(state.table.board[0].suit).toEqual(cards[1].suit);
      expect(state.table.board[0].rank).toBe(Rank.KING);
      expect(state.table.board[1].suit).toEqual(cards[2].suit);
      expect(state.table.board[1].rank).toBe(Rank.QUEEN);
      expect(state.table.board[2].suit).toEqual(cards[3].suit);
      expect(state.table.board[2].rank).toBe(Rank.JACK);

      // Burn pile should have 1 card
      expect(state.table.burnPile.length).toBe(1);
      expect(state.table.burnPile[0].suit).toEqual(cards[0].suit);
      expect(state.table.burnPile[0].rank).toEqual(cards[0].rank);

      // Card stack should have 1 card left
      expect(state.deck.cardStack.length).toBe(1);
    });

    it('should advance from flop to turn and deal 1 card', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const existingBoard = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.HEARTS, Rank.QUEEN),
        createCard(Suit.HEARTS, Rank.JACK),
      ];

      const cards = [
        createCard(Suit.HEARTS, Rank.ACE), // Burn card
        createCard(Suit.HEARTS, Rank.TEN), // Turn card
        createCard(Suit.HEARTS, Rank.NINE), // Extra card
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          dealer: 1,
          currentRound: GameRound.FLOP,
          board: existingBoard,
          burnPile: [],
        },
        deck: {
          cardStack: cards,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(advanceToNextRound() as any);

      // Assert
      const state = store.getState() as RootState;

      // Round should be advanced to TURN
      expect(state.table.currentRound).toBe(GameRound.TURN);

      // Board should have 4 cards (3 existing + 1 new)
      expect(state.table.board.length).toBe(4);
      expect(state.table.board[0].suit).toEqual(existingBoard[0].suit);
      expect(state.table.board[0].rank).toBe(Rank.KING);
      expect(state.table.board[1].suit).toEqual(existingBoard[1].suit);
      expect(state.table.board[1].rank).toBe(Rank.QUEEN);
      expect(state.table.board[2].suit).toEqual(existingBoard[2].suit);
      expect(state.table.board[2].rank).toBe(Rank.JACK);
      expect(state.table.board[3].suit).toEqual(cards[1].suit);
      expect(state.table.board[3].rank).toBe(Rank.TEN);

      // Burn pile should have 1 card
      expect(state.table.burnPile.length).toBe(1);
      expect(state.table.burnPile[0].suit).toEqual(cards[0].suit);
      expect(state.table.burnPile[0].rank).toEqual(cards[0].rank);

      // Card stack should have 1 card left
      expect(state.deck.cardStack.length).toBe(1);
    });

    it('should advance from turn to river and deal 1 card', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const existingBoard = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.HEARTS, Rank.QUEEN),
        createCard(Suit.HEARTS, Rank.JACK),
        createCard(Suit.HEARTS, Rank.TEN),
      ];

      const cards = [
        createCard(Suit.HEARTS, Rank.ACE), // Burn card
        createCard(Suit.HEARTS, Rank.NINE), // River card
        createCard(Suit.HEARTS, Rank.EIGHT), // Extra card
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          dealer: 1,
          currentRound: GameRound.TURN,
          board: existingBoard,
          burnPile: [],
        },
        deck: {
          cardStack: cards,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(advanceToNextRound() as any);

      // Assert
      const state = store.getState() as RootState;

      // Round should be advanced to RIVER
      expect(state.table.currentRound).toBe(GameRound.RIVER);

      // Board should have 5 cards (4 existing + 1 new)
      expect(state.table.board.length).toBe(5);
      expect(state.table.board[0].suit).toEqual(existingBoard[0].suit);
      expect(state.table.board[0].rank).toBe(Rank.KING);
      expect(state.table.board[1].suit).toEqual(existingBoard[1].suit);
      expect(state.table.board[1].rank).toBe(Rank.QUEEN);
      expect(state.table.board[2].suit).toEqual(existingBoard[2].suit);
      expect(state.table.board[2].rank).toBe(Rank.JACK);
      expect(state.table.board[3].suit).toEqual(existingBoard[3].suit);
      expect(state.table.board[3].rank).toBe(Rank.TEN);
      expect(state.table.board[4].suit).toEqual(cards[1].suit);
      expect(state.table.board[4].rank).toBe(Rank.NINE);

      // Burn pile should have 1 card
      expect(state.table.burnPile.length).toBe(1);
      expect(state.table.burnPile[0].suit).toEqual(cards[0].suit);
      expect(state.table.burnPile[0].rank).toEqual(cards[0].rank);

      // Card stack should have 1 card left
      expect(state.deck.cardStack.length).toBe(1);
    });

    it('should advance from river to showdown without dealing cards', () => {
      // Setup
      const players = [createPlayer(1), createPlayer(2), createPlayer(3)];
      const existingBoard = [
        { suit: Suit.HEARTS, rank: Rank.KING },
        { suit: Suit.HEARTS, rank: Rank.QUEEN },
        { suit: Suit.HEARTS, rank: Rank.JACK },
        { suit: Suit.HEARTS, rank: Rank.TEN },
        { suit: Suit.HEARTS, rank: Rank.NINE },
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          dealer: 1,
          currentRound: GameRound.RIVER,
          board: existingBoard,
          burnPile: [],
        },
        deck: {
          cardStack: [],
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(advanceToNextRound() as any);

      // Assert
      const state = store.getState() as RootState;

      // Round should be advanced to SHOWDOWN
      expect(state.table.currentRound).toBe(GameRound.SHOWDOWN);

      // Board should still have 5 cards (unchanged)
      expect(state.table.board.length).toBe(5);
      expect(state.table.board).toEqual(existingBoard);

      // Burn pile should be unchanged
      expect(state.table.burnPile.length).toBe(0);
    });
  });

  describe('handleShowdown', () => {
    it('should award the pot to the only active player', () => {
      // Setup
      const players = [
        createPlayer(1, 1000, false), // Active player
        createPlayer(2, 1000, true), // Folded player
        createPlayer(3, 1000, true), // Folded player
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players,
          currentRound: GameRound.SHOWDOWN,
          mainPot: {
            amount: 300,
            eligiblePlayers: players,
            createdInRound: GameRound.PREFLOP,
          },
          sidePots: [],
          board: [],
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(handleShowdown() as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1 should have won the pot
      expect(updatedPlayers[0].stack).toBe(1300);

      // Action log should contain a new hand action
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.NEW_HAND);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(300);
    });

    it('should determine the winner based on hand strength', () => {
      // Setup - Player 1 has a pair of aces, Player 2 has a pair of kings
      const player1 = {
        ...createPlayer(1),
        hand: [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.FIVE)],
      };

      const player2 = {
        ...createPlayer(2),
        hand: [createCard(Suit.SPADES, Rank.KING), createCard(Suit.CLUBS, Rank.SEVEN)],
      };

      const board = [
        createCard(Suit.CLUBS, Rank.ACE),
        createCard(Suit.CLUBS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.TWO),
        createCard(Suit.HEARTS, Rank.THREE),
        createCard(Suit.SPADES, Rank.FOUR),
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players: [player1, player2],
          currentRound: GameRound.SHOWDOWN,
          mainPot: {
            amount: 200,
            eligiblePlayers: [player1, player2],
            createdInRound: GameRound.PREFLOP,
          },
          sidePots: [],
          board,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(handleShowdown() as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1 should have won with a pair of aces
      expect(updatedPlayers[0].stack).toBe(1200);
      expect(updatedPlayers[1].stack).toBe(1000);

      // Action log should contain a new hand action for player 1
      const lastAction = state.table.actionLog[state.table.actionLog.length - 1];
      expect(lastAction.type).toBe(ActionType.NEW_HAND);
      expect(lastAction.player?.playerId).toBe(1);
      expect(lastAction.amount).toBe(200);
    });

    it('should split the pot on a tie', () => {
      // Setup - Both players have the same five community cards as their best hand
      const player1 = {
        ...createPlayer(1),
        hand: [createCard(Suit.HEARTS, Rank.TWO), createCard(Suit.DIAMONDS, Rank.THREE)],
      };

      const player2 = {
        ...createPlayer(2),
        hand: [createCard(Suit.SPADES, Rank.TWO), createCard(Suit.CLUBS, Rank.THREE)],
      };

      const board = [
        createCard(Suit.CLUBS, Rank.ACE),
        createCard(Suit.DIAMONDS, Rank.ACE),
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.SPADES, Rank.KING),
        createCard(Suit.HEARTS, Rank.QUEEN),
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players: [player1, player2],
          currentRound: GameRound.SHOWDOWN,
          mainPot: {
            amount: 200,
            eligiblePlayers: [player1, player2],
            createdInRound: GameRound.PREFLOP,
          },
          sidePots: [],
          board,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(handleShowdown() as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Both players should have won half the pot
      expect(updatedPlayers[0].stack).toBe(1100);
      expect(updatedPlayers[1].stack).toBe(1100);

      // Action log should contain new hand actions for both players
      const actions = state.table.actionLog;
      expect(actions.length).toBe(2);
      expect(actions[0].type).toBe(ActionType.NEW_HAND);
      expect(actions[0].player?.playerId).toBe(1);
      expect(actions[0].amount).toBe(100);
      expect(actions[1].type).toBe(ActionType.NEW_HAND);
      expect(actions[1].player?.playerId).toBe(2);
      expect(actions[1].amount).toBe(100);
    });

    it('should handle side pots correctly', () => {
      // Setup - Player 1 is all-in, Player 2 and 3 have more chips
      const player1 = {
        ...createPlayer(1),
        hand: [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)],
        isAllIn: true,
      };

      const player2 = {
        ...createPlayer(2),
        hand: [createCard(Suit.SPADES, Rank.KING), createCard(Suit.CLUBS, Rank.KING)],
      };

      const player3 = {
        ...createPlayer(3),
        hand: [createCard(Suit.HEARTS, Rank.QUEEN), createCard(Suit.DIAMONDS, Rank.QUEEN)],
      };

      const board = [
        createCard(Suit.CLUBS, Rank.TWO),
        createCard(Suit.DIAMONDS, Rank.THREE),
        createCard(Suit.HEARTS, Rank.FOUR),
        createCard(Suit.SPADES, Rank.FIVE),
        createCard(Suit.HEARTS, Rank.SIX),
      ];

      const initialState = {
        table: {
          ...tableSlice.getInitialState(),
          players: [player1, player2, player3],
          currentRound: GameRound.SHOWDOWN,
          mainPot: {
            amount: 300, // All players contributed 100 each
            eligiblePlayers: [player1, player2, player3],
            createdInRound: GameRound.PREFLOP,
          },
          sidePots: [
            {
              amount: 200, // Player 2 and 3 contributed 100 each to this side pot
              eligiblePlayers: [player2, player3],
              createdInRound: GameRound.FLOP,
            },
          ],
          board,
        },
      };

      const store = setupStore(initialState);

      // Act
      store.dispatch(handleShowdown() as any);

      // Assert
      const state = store.getState() as RootState;
      const updatedPlayers = state.table.players;

      // Player 1 should win the main pot with a pair of aces
      expect(updatedPlayers[0].stack).toBe(1300);

      // Player 2 should win the side pot with a pair of kings
      expect(updatedPlayers[1].stack).toBe(1200);

      // Player 3 should not win anything
      expect(updatedPlayers[2].stack).toBe(1000);
    });
  });
});
