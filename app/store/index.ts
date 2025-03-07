import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import deckReducer from './slices/deckSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    deck: deckReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
