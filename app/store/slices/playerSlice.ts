import { Card } from '@/app/types/Card';
import { createSlice } from '@reduxjs/toolkit';

export interface PlayerState {
  playerName: string;
  hand: Card[];
  stack: number;
  folded: boolean;
}

const initialState: PlayerState = {
  playerName: 'Player',
  hand: [],
  stack: 0,
  folded: false,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setName: (state, action: { payload: string }) => {
      state.playerName = action.payload;
    },
    addCardToHand: (state, action: { payload: Card }) => {
      state.hand.push(action.payload);
    },
    clearHand: (state) => {
      state.hand = [];
    },
    addToStack: (state, action: { payload: number }) => {
      state.stack += action.payload;
    },
    removeFromStack: (state, action: { payload: number }) => {
      state.stack -= action.payload;
    },
  },
});

export default playerSlice.reducer;
