import { Card } from '@/app/types/Card';

export enum GameRound {
  PREFLOP = 'PREFLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN',
}

export interface GameAction {
  player?: Player;
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
  NEW_HAND = 'NEW_HAND',
}

export interface Pot {
  amount: number;
  eligiblePlayers: Player[];
  createdInRound: GameRound;
}

export interface BettingRound {
  currentBet: number;
  minBet: number;
  lastRaise: number;
}

export type PlayerID = number;
export interface Player {
  playerId: PlayerID;
  playerName: string;
  hand: Card[];
  stack: number;
  isFolded: boolean;
  isAllIn: boolean;
}
export { Card };
