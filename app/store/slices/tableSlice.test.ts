import tableReducer, {
  addPlayer,
  addToPlayerStack,
  addToPot,
  advanceRound,
  burnCard,
  createSidePot,
  dealToBoard,
  incrementHandNumber,
  logAction,
  removeFromPlayerStack,
  removePlayer,
  resetBoard,
  setBigBlind,
  setBigBlindAmount,
  setCurrentPlayer,
  setDealer,
  setSmallBlind,
  setSmallBlindAmount,
  tableSlice,
  addToSidePot,
} from './tableSlice';
import { Card, Rank, Suit } from '@/app/types/Card';
import { ActionType, GameAction, GameRound, Player } from '@/app/types/Holdem';

describe('tableSlice', () => {
  const samplePlayer: Player = {
    playerId: 1,
    playerName: 'Player 1',
    hand: [],
    stack: 1000,
    isFolded: false,
    isAllIn: false,
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
      const nextState = tableReducer(initialState, removePlayer(samplePlayer.playerId));
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
    it('should handle addToPot', () => {
      const initialState = {
        ...tableSlice.getInitialState(),
        mainPot: { amount: 50, eligiblePlayers: [], createdInRound: GameRound.PREFLOP },
      };
      const nextState = tableReducer(initialState, addToPot(50));
      expect(nextState.mainPot.amount).toBe(100);
    });

    it('should handle createSidePot', () => {
      const initialState = tableSlice.getInitialState();
      const sidePot = {
        amount: 200,
        eligiblePlayers: [samplePlayer],
        createdInRound: GameRound.PREFLOP,
      };
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
        mainPot: { amount: 500, eligiblePlayers: [], createdInRound: GameRound.PREFLOP },
        sidePots: [{ amount: 200, eligiblePlayers: [], createdInRound: GameRound.RIVER }],
        bigBlindAmount: 10,
        bettingRound: {
          currentBet: 10,
          minBet: 10,
          lastRaise: 0,
        },
      };
      const nextState = tableReducer(initialState, resetBoard());
      expect(nextState.board).toEqual([]);
      expect(nextState.burnPile).toEqual([]);
      expect(nextState.currentRound).toBe(GameRound.PREFLOP);
      expect(nextState.mainPot.amount).toBe(0);
      expect(nextState.sidePots).toEqual([]);
      expect(nextState.bettingRound.minBet).toBe(initialState.bigBlindAmount);
      expect(nextState.bettingRound.lastRaise).toBe(0);
      expect(nextState.bettingRound.currentBet).toBe(initialState.bigBlindAmount);
    });
  });
  it('should handle removeFromPlayerStack', () => {
    const initialState = {
      ...tableSlice.getInitialState(),
      players: [samplePlayer],
    };
    const nextState = tableReducer(
      initialState,
      removeFromPlayerStack({ player: samplePlayer, amount: 100 }),
    );
    expect(nextState.players[0].stack).toBe(900); // 1000 - 100
  });

  it('should handle addToPlayerStack', () => {
    const initialState = {
      ...tableSlice.getInitialState(),
      players: [samplePlayer],
    };
    const nextState = tableReducer(
      initialState,
      addToPlayerStack({ player: samplePlayer, amount: 200 }),
    );
    expect(nextState.players[0].stack).toBe(1200); // 1000 + 200
  });

  it('should not modify stack if player is not found', () => {
    const initialState = {
      ...tableSlice.getInitialState(),
      players: [samplePlayer],
    };
    const unknownPlayer = { ...samplePlayer, playerId: 999 };
    const nextState = tableReducer(
      initialState,
      removeFromPlayerStack({ player: unknownPlayer, amount: 100 }),
    );
    expect(nextState.players[0].stack).toBe(1000); // Unchanged
  });

  it('should handle addToSidePot', () => {
    const sidePot = {
      amount: 200,
      eligiblePlayers: [samplePlayer],
      createdInRound: GameRound.PREFLOP,
    };

    const initialState = {
      ...tableSlice.getInitialState(),
      sidePots: [sidePot],
    };

    const nextState = tableReducer(initialState, addToSidePot({ index: 0, amount: 50 }));

    expect(nextState.sidePots[0].amount).toBe(250); // 200 + 50
  });

  it('should not modify side pot if index is out of bounds', () => {
    const sidePot = {
      amount: 200,
      eligiblePlayers: [samplePlayer],
      createdInRound: GameRound.PREFLOP,
    };

    const initialState = {
      ...tableSlice.getInitialState(),
      sidePots: [sidePot],
    };

    const nextState = tableReducer(initialState, addToSidePot({ index: 1, amount: 50 }));

    expect(nextState.sidePots).toEqual(initialState.sidePots);
  });
});
