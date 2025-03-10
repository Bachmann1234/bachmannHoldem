import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import counterReducer from './slices/counterSlice';
import deckReducer from './slices/deckSlice';
import tableReducer from './slices/tableSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    deck: deckReducer,
    table: tableReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action>;
