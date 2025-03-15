import { RootState } from '..';
export const selectPlayers = (state: RootState) => state.table.players;
export const selectDealer = (state: RootState) => state.table.dealer;
export const selectSmallBlind = (state: RootState) => state.table.smallBlind;
export const selectBigBlind = (state: RootState) => state.table.bigBlind;
export const selectMainPotAmount = (state: RootState) => state.table.mainPot.amount;
