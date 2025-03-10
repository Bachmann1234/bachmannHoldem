import { Card } from '@/app/types/Card';
import { GameAction, GameRound, Player, Pot } from '@/app/types/Holdem';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TableState {
  smallBlind: Player | null;
  bigBlind: Player | null;
  dealer: Player | null;
  currentPlayer: Player | null;
  handNumber: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  players: Player[];
  mainPot: Pot;
  sidePots: Pot[];
  board: Card[];
  burnPile: Card[];
  currentRound: GameRound;
  minBet: number;
  lastRaise: number;
  currentBet: number;
  actionLog: GameAction[];
}

const initialState: TableState = {
  smallBlind: null,
  bigBlind: null,
  dealer: null,
  currentPlayer: null,
  handNumber: 0,
  smallBlindAmount: 1,
  bigBlindAmount: 2,
  players: [],
  mainPot: {
    amount: 0,
    eligiblePlayers: [],
  },
  sidePots: [],
  board: [],
  burnPile: [],
  currentRound: GameRound.PREFLOP,
  minBet: 0,
  lastRaise: 0,
  currentBet: 0,
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
    removePlayer: (state, action: PayloadAction<string>) => {
      state.players = state.players.filter((player) => player.playerName !== action.payload);
    },

    // Position management
    setDealer: (state, action: PayloadAction<Player>) => {
      state.dealer = action.payload;
    },
    setSmallBlind: (state, action: PayloadAction<Player>) => {
      state.smallBlind = action.payload;
    },
    setBigBlind: (state, action: PayloadAction<Player>) => {
      state.bigBlind = action.payload;
    },
    setCurrentPlayer: (state, action: PayloadAction<Player>) => {
      state.currentPlayer = action.payload;
    },

    // Game flow
    incrementHandNumber: (state) => {
      state.handNumber += 1;
    },
    advanceRound: (state, action: PayloadAction<GameRound>) => {
      state.currentRound = action.payload;
    },

    // Betting
    setCurrentBet: (state, action: PayloadAction<number>) => {
      state.currentBet = action.payload;
    },
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

    resetBoard: (state) => {
      state.board = [];
      state.burnPile = [];
      state.currentRound = GameRound.PREFLOP;
      state.mainPot.amount = 0;
      state.sidePots = [];
      state.minBet = state.bigBlindAmount;
      state.lastRaise = 0;
      state.currentBet = 0;
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
  setCurrentBet,
  addToPot,
  createSidePot,
  setSmallBlindAmount,
  setBigBlindAmount,
  logAction,
  resetBoard,
} = tableSlice.actions;

export default tableSlice.reducer;
