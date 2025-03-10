import tableReducer, {
  addPlayer,
  addToPot,
  advanceRound,
  burnCard,
  createSidePot,
  dealToBoard,
  incrementHandNumber,
  logAction,
  removePlayer,
  resetBoard,
  setBigBlind,
  setBigBlindAmount,
  setCurrentBet,
  setCurrentPlayer,
  setDealer,
  setSmallBlind,
  setSmallBlindAmount,
  tableSlice,
} from './tableSlice';
import { Card, Rank, Suit } from '@/app/types/Card';
import { ActionType, GameAction, GameRound, Player } from '@/app/types/Holdem';

describe('tableSlice', () => {
  const samplePlayer: Player = {
    playerId: 1,
    playerName: 'Player 1',
    hand: [],
    stack: 1000,
    folded: false,
  };

  const sampleCard: Card = {
    suit: Suit.HEARTS,
    rank: Rank.ACE,
  };

  describe('initial state', () => {
    it('should return the initial state', () => {
      const initialState = tableReducer(undefined, { type: 'unknown' });
      expect(initialState.board).toEqual([]);
      expect(initialState.burnPile).toEqual([]);
      expect(initialState.handNumber).toBe(0);
      expect(initialState.players).toEqual([]);
    });
  });

  describe('card management reducers', () => {
    it('should handle dealToBoard', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, dealToBoard(sampleCard));
      expect(nextState.board).toHaveLength(1);
      expect(nextState.board[0]).toEqual(sampleCard);
    });

    it('should handle burnCard', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, burnCard(sampleCard));
      expect(nextState.burnPile).toHaveLength(1);
      expect(nextState.burnPile[0]).toEqual(sampleCard);
    });
  });

  describe('player management reducers', () => {
    it('should handle addPlayer', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, addPlayer(samplePlayer));
      expect(nextState.players).toHaveLength(1);
      expect(nextState.players[0]).toEqual(samplePlayer);
    });

    it('should handle removePlayer', () => {
      const initialState = {
        ...tableSlice.getInitialState(),
        players: [samplePlayer],
      };
      const nextState = tableReducer(initialState, removePlayer(samplePlayer.playerName));
      expect(nextState.players).toHaveLength(0);
    });
  });

  describe('position management reducers', () => {
    it('should handle setDealer', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setDealer(samplePlayer));
      expect(nextState.dealer).toEqual(samplePlayer);
    });

    it('should handle setSmallBlind', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setSmallBlind(samplePlayer));
      expect(nextState.smallBlind).toEqual(samplePlayer);
    });

    it('should handle setBigBlind', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setBigBlind(samplePlayer));
      expect(nextState.bigBlind).toEqual(samplePlayer);
    });

    it('should handle setCurrentPlayer', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setCurrentPlayer(samplePlayer));
      expect(nextState.currentPlayer).toEqual(samplePlayer);
    });
  });

  describe('game flow reducers', () => {
    it('should handle incrementHandNumber', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, incrementHandNumber());
      expect(nextState.handNumber).toBe(1);
    });

    it('should handle advanceRound', () => {
      const initialState = {
        ...tableSlice.getInitialState(),
        currentRound: GameRound.PREFLOP,
      };
      const nextState = tableReducer(initialState, advanceRound(GameRound.FLOP));
      expect(nextState.currentRound).toBe(GameRound.FLOP);
    });
  });

  describe('betting reducers', () => {
    it('should handle setCurrentBet', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setCurrentBet(50));
      expect(nextState.currentBet).toBe(50);
    });

    it('should handle addToPot', () => {
      const initialState = {
        ...tableSlice.getInitialState(),
        mainPot: { amount: 50, eligiblePlayers: [] },
      };
      const nextState = tableReducer(initialState, addToPot(50));
      expect(nextState.mainPot.amount).toBe(100);
    });

    it('should handle createSidePot', () => {
      const initialState = tableSlice.getInitialState();
      const sidePot = { amount: 200, eligiblePlayers: [samplePlayer] };
      const nextState = tableReducer(initialState, createSidePot(sidePot));
      expect(nextState.sidePots).toHaveLength(1);
      expect(nextState.sidePots[0]).toEqual(sidePot);
    });

    it('should handle setSmallBlindAmount', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setSmallBlindAmount(5));
      expect(nextState.smallBlindAmount).toBe(5);
    });

    it('should handle setBigBlindAmount', () => {
      const initialState = tableSlice.getInitialState();
      const nextState = tableReducer(initialState, setBigBlindAmount(10));
      expect(nextState.bigBlindAmount).toBe(10);
    });
  });

  describe('action log reducer', () => {
    it('should handle logAction', () => {
      const initialState = tableSlice.getInitialState();
      const action: GameAction = {
        type: ActionType.RAISE,
        player: samplePlayer,
        amount: 100,
        timestamp: Date.now(),
      };
      const nextState = tableReducer(initialState, logAction(action));
      expect(nextState.actionLog).toHaveLength(1);
      expect(nextState.actionLog[0]).toEqual(action);
    });
  });

  describe('board reset', () => {
    it('should handle resetBoard', () => {
      const initialState = {
        ...tableSlice.getInitialState(),
        board: [sampleCard],
        burnPile: [sampleCard],
        currentRound: GameRound.RIVER,
        mainPot: { amount: 500, eligiblePlayers: [] },
        sidePots: [{ amount: 200, eligiblePlayers: [] }],
        minBet: 50,
        lastRaise: 100,
        currentBet: 200,
        bigBlindAmount: 10,
      };
      const nextState = tableReducer(initialState, resetBoard());
      expect(nextState.board).toEqual([]);
      expect(nextState.burnPile).toEqual([]);
      expect(nextState.currentRound).toBe(GameRound.PREFLOP);
      expect(nextState.mainPot.amount).toBe(0);
      expect(nextState.sidePots).toEqual([]);
      expect(nextState.minBet).toBe(initialState.bigBlindAmount);
      expect(nextState.lastRaise).toBe(0);
      expect(nextState.currentBet).toBe(0);
    });
  });
});
