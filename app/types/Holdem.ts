import { PlayerState } from '@/app/store/slices/playerSlice';

export enum GameRound {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
}

export interface GameAction {
  player: PlayerState;
  type: ActionType;
  amount?: number;
  timestamp: number;
}

export enum ActionType {
  FOLD = 'FOLD',
  CHECK = 'CHECK',
  CALL = 'CALL',
  BET = 'BET',
  RAISE = 'RAISE',
  ALL_IN = 'ALL_IN',
}
