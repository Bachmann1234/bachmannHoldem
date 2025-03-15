import { Card } from '@/app/types/Card';
import { BettingRound, GameAction, GameRound, Player, PlayerID, Pot } from '@/app/types/Holdem';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TableState {
  smallBlind?: PlayerID;
  bigBlind?: PlayerID;
  dealer?: PlayerID;
  currentPlayer?: PlayerID;
  handNumber: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  players: Player[];
  mainPot: Pot;
  sidePots: Pot[];
  board: Card[];
  burnPile: Card[];
  currentRound: GameRound;
  bettingRound: BettingRound;
  actionLog: GameAction[];
}

const initialState: TableState = {
  smallBlind: undefined,
  bigBlind: undefined,
  dealer: undefined,
  currentPlayer: undefined,
  handNumber: 0,
  smallBlindAmount: 1,
  bigBlindAmount: 2,
  players: [],
  mainPot: {
    amount: 0,
    eligiblePlayers: [],
    createdInRound: GameRound.PREFLOP,
  },
  sidePots: [],
  board: [],
  burnPile: [],
  currentRound: GameRound.PREFLOP,
  bettingRound: {
    currentBet: 0,
    minBet: 2,
    lastRaise: 0,
  },
  actionLog: [],
};
export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    dealToBoard: (state, action: PayloadAction<Card>) => {
      state.board.push(action.payload);
    },
    burnCard: (state, action: PayloadAction<Card>) => {
      state.burnPile.push(action.payload);
    },

    // Player management
    addPlayer: (state, action: PayloadAction<Player>) => {
      state.players.push(action.payload);
    },
    removePlayer: (state, action: PayloadAction<number>) => {
      state.players = state.players.filter((player) => player.playerId !== action.payload);
    },
    removeFromPlayerStack: (state, action: PayloadAction<{ player: Player; amount: number }>) => {
      const player = state.players.find((p) => p.playerId === action.payload.player.playerId);
      if (player) {
        player.stack -= action.payload.amount;
      }
    },
    addToPlayerStack: (state, action: PayloadAction<{ player: Player; amount: number }>) => {
      const player = state.players.find((p) => p.playerId === action.payload.player.playerId);
      if (player) {
        player.stack += action.payload.amount;
      }
    },
    dealCardToPlayer: (state, action: PayloadAction<{ player: Player; card: Card }>) => {
      const player = state.players.find((p) => p.playerId === action.payload.player.playerId);
      if (player) {
        player.hand.push(action.payload.card);
      }
    },
    // Position management
    setDealer: (state, action: PayloadAction<PlayerID>) => {
      state.dealer = action.payload;
    },
    setSmallBlind: (state, action: PayloadAction<PlayerID>) => {
      state.smallBlind = action.payload;
    },
    setBigBlind: (state, action: PayloadAction<PlayerID>) => {
      state.bigBlind = action.payload;
    },
    setCurrentPlayer: (state, action: PayloadAction<PlayerID>) => {
      state.currentPlayer = action.payload;
    },
    playerAllIn: (state, action: PayloadAction<{ playerId: PlayerID; status: boolean }>) => {
      const player = state.players.find((p) => p.playerId === action.payload.playerId);
      if (player) {
        player.isAllIn = action.payload.status;
      }
    },
    playerFolded: (state, action: PayloadAction<{ playerId: PlayerID; status: boolean }>) => {
      const player = state.players.find((p) => p.playerId === action.payload.playerId);
      if (player) {
        player.isFolded = action.payload.status;
      }
    },

    // Game flow
    incrementHandNumber: (state) => {
      state.handNumber += 1;
    },
    advanceRound: (state, action: PayloadAction<GameRound>) => {
      state.currentRound = action.payload;
    },

    // Betting
    addToPot: (state, action: PayloadAction<number>) => {
      state.mainPot.amount += action.payload;
    },
    createSidePot: (state, action: PayloadAction<Pot>) => {
      state.sidePots.push(action.payload);
    },

    setSmallBlindAmount: (state, action: PayloadAction<number>) => {
      state.smallBlindAmount = action.payload;
    },

    setBigBlindAmount: (state, action: PayloadAction<number>) => {
      state.bigBlindAmount = action.payload;
    },

    logAction: (state, action: PayloadAction<GameAction>) => {
      state.actionLog.push(action.payload);
    },

    addToSidePot: (state, action: PayloadAction<{ index: number; amount: number }>) => {
      const { index, amount } = action.payload;
      if (state.sidePots[index]) {
        state.sidePots[index].amount += amount;
      }
    },

    resetBoard: (state) => {
      state.board = [];
      state.burnPile = [];
      state.currentRound = GameRound.PREFLOP;
      state.mainPot = {
        amount: 0,
        eligiblePlayers: [],
        createdInRound: GameRound.PREFLOP,
      };
      state.sidePots = [];
      state.bettingRound = {
        currentBet: state.bigBlindAmount,
        minBet: state.bigBlindAmount,
        lastRaise: 0,
      };
      state.players.forEach((player) => {
        player.isFolded = false;
        player.isAllIn = false;
        player.hand = [];
      });
    },
  },
});

export const {
  dealToBoard,
  burnCard,
  addPlayer,
  removePlayer,
  setDealer,
  setSmallBlind,
  setBigBlind,
  setCurrentPlayer,
  incrementHandNumber,
  advanceRound,
  addToPot,
  createSidePot,
  setSmallBlindAmount,
  setBigBlindAmount,
  logAction,
  resetBoard,
  addToPlayerStack,
  removeFromPlayerStack,
  dealCardToPlayer,
  addToSidePot,
  playerAllIn,
  playerFolded,
} = tableSlice.actions;

export default tableSlice.reducer;
