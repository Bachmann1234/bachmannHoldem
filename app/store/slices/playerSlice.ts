import { Card } from '@/app/types/Card';
import { createSlice } from '@reduxjs/toolkit';

interface PlayerState {
  hand: Card[];
  stack: number;
}

const initialState: PlayerState = {
  hand: [],
  stack: 0,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
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
