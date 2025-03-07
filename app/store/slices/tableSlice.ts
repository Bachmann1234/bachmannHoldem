import { PlayerState } from '@/app/store/slices/playerSlice';
import { Card } from '@/app/types/Card';
import { createSlice } from '@reduxjs/toolkit';

interface Pot {
  amount: number;
  eligiblePlayers: PlayerState[];
}

interface TableState {
  smallBlind: PlayerState | null;
  bigBlind: PlayerState | null;
  dealer: PlayerState | null;
  currentPlayer: PlayerState | null;
  handNumber: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
  players: PlayerState[];
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
  reducers: {},
});

export default tableSlice.reducer;
