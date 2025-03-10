import { Card } from '@/app/types/Card';

export enum GameRound {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
}

export interface GameAction {
  player: Player;
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

export interface Pot {
  amount: number;
  eligiblePlayers: Player[];
}

export interface Player {
  playerId: number;
  playerName: string;
  hand: Card[];
  stack: number;
  folded: boolean;
}
