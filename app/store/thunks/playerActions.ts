import { AppThunk } from '@/app/store';
import {
  addToPot,
  createSidePot,
  logAction,
  playerAllIn,
  playerFolded,
  removeFromPlayerStack,
  setCurrentPlayer,
} from '@/app/store/slices/tableSlice';
import { ActionType, GameRound, Player, PlayerID } from '@/app/types/Holdem';

/**
 * Helper function to find the next active player
 */
export const getNextActivePlayer = (players: Player[], currentPlayerId: PlayerID): Player => {
  const currentPlayerIndex = players.findIndex((p) => p.playerId === currentPlayerId);
  const activePlayers = players.filter((p) => !p.isFolded && !p.isAllIn && p.stack > 0);

  if (activePlayers.length === 0) {
    // No active players left, return the current player
    return players[currentPlayerIndex];
  }

  // Find the next active player in rotation
  for (let i = 1; i <= players.length; i++) {
    const nextIndex = (currentPlayerIndex + i) % players.length;
    const nextPlayer = players[nextIndex];
    if (!nextPlayer.isFolded && !nextPlayer.isAllIn && nextPlayer.stack > 0) {
      return nextPlayer;
    }
  }

  // Fallback (should not happen if there are active players)
  return players[currentPlayerIndex];
};

/**
 * Player folds their hand
 */
export const playerFold =
  (playerId: PlayerID): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const player = state.table.players.find((p) => p.playerId === playerId);

    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    // Mark player as folded
    dispatch(playerFolded({ playerId, status: true }));

    // Log the action
    dispatch(
      logAction({
        player,
        type: ActionType.FOLD,
        timestamp: Date.now(),
      }),
    );

    // Move to next player
    const nextPlayer = getNextActivePlayer(state.table.players, playerId);
    dispatch(setCurrentPlayer(nextPlayer.playerId));
  };

/**
 * Player checks (only valid if no bets have been made)
 */
export const playerCheck =
  (playerId: PlayerID): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const player = state.table.players.find((p) => p.playerId === playerId);
    const { currentBet } = state.table.bettingRound;

    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    // Check is only valid if there's no current bet
    if (currentBet > 0) {
      console.error('Cannot check when there is a bet');
      return;
    }

    // Log the action
    dispatch(
      logAction({
        player,
        type: ActionType.CHECK,
        timestamp: Date.now(),
      }),
    );

    // Move to next player
    const nextPlayer = getNextActivePlayer(state.table.players, playerId);
    dispatch(setCurrentPlayer(nextPlayer.playerId));
  };

/**
 * Player calls the current bet
 */
export const playerCall =
  (playerId: PlayerID): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const player = state.table.players.find((p) => p.playerId === playerId);
    const { currentBet } = state.table.bettingRound;

    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    // Calculate call amount (might be less if player doesn't have enough chips)
    const callAmount = Math.min(currentBet, player.stack);
    const isAllIn = callAmount === player.stack && callAmount < currentBet;

    // Remove chips from player stack
    dispatch(removeFromPlayerStack({ player, amount: callAmount }));

    // Add to pot
    dispatch(addToPot(callAmount));

    // If player is all-in with less than the full call amount, create a side pot
    if (isAllIn) {
      dispatch(playerAllIn({ playerId, status: true }));
      dispatch(
        createSidePot({
          amount: 0,
          eligiblePlayers: state.table.players.filter(
            (p) => p.playerId !== playerId && !p.isFolded,
          ),
          createdInRound: state.table.currentRound,
        }),
      );
    }

    // Log the action
    dispatch(
      logAction({
        player,
        type: isAllIn ? ActionType.ALL_IN : ActionType.CALL,
        amount: callAmount,
        timestamp: Date.now(),
      }),
    );

    // Move to next player
    const nextPlayer = getNextActivePlayer(state.table.players, playerId);
    dispatch(setCurrentPlayer(nextPlayer.playerId));
  };

/**
 * Player bets (only valid if no bets have been made in the current round)
 */
export const playerBet =
  (playerId: PlayerID, amount: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const player = state.table.players.find((p) => p.playerId === playerId);
    const { currentBet, minBet } = state.table.bettingRound;

    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    // Bet is only valid if there's no current bet
    if (currentBet > 0) {
      console.error('Cannot bet when there is already a bet');
      return;
    }

    // Bet must be at least the minimum bet
    if (amount < minBet) {
      console.error(`Bet must be at least ${minBet}`);
      return;
    }

    // Calculate bet amount (might be less if player doesn't have enough chips)
    const betAmount = Math.min(amount, player.stack);
    const isAllIn = betAmount === player.stack && betAmount < amount;

    // Remove chips from player stack
    dispatch(removeFromPlayerStack({ player, amount: betAmount }));

    // Add to pot
    dispatch(addToPot(betAmount));

    // If player is all-in, mark them as such
    if (isAllIn) {
      dispatch(playerAllIn({ playerId, status: true }));
    }

    // Log the action
    dispatch(
      logAction({
        player,
        type: isAllIn ? ActionType.ALL_IN : ActionType.BET,
        amount: betAmount,
        timestamp: Date.now(),
      }),
    );

    // Move to next player
    const nextPlayer = getNextActivePlayer(state.table.players, playerId);
    dispatch(setCurrentPlayer(nextPlayer.playerId));
  };

/**
 * Player raises (only valid if a bet has already been made)
 */
export const playerRaise =
  (playerId: PlayerID, amount: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const player = state.table.players.find((p) => p.playerId === playerId);
    const { currentBet, minBet, lastRaise } = state.table.bettingRound;

    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }

    // Raise is only valid if there's a current bet
    if (currentBet === 0) {
      console.error('Cannot raise when there is no bet');
      return;
    }

    // Minimum raise is at least the current bet plus the last raise or minimum bet
    const minRaiseAmount = currentBet + Math.max(lastRaise, minBet);

    if (amount < minRaiseAmount) {
      console.error(`Raise must be at least ${minRaiseAmount}`);
      return;
    }

    // Calculate raise amount (might be less if player doesn't have enough chips)
    const raiseAmount = Math.min(amount, player.stack);
    const isAllIn = raiseAmount === player.stack && raiseAmount < amount;

    // Remove chips from player stack
    dispatch(removeFromPlayerStack({ player, amount: raiseAmount }));

    // Add to pot
    dispatch(addToPot(raiseAmount));

    // If player is all-in, mark them as such
    if (isAllIn) {
      dispatch(playerAllIn({ playerId, status: true }));
    }

    // Log the action
    dispatch(
      logAction({
        player,
        type: isAllIn ? ActionType.ALL_IN : ActionType.RAISE,
        amount: raiseAmount,
        timestamp: Date.now(),
      }),
    );

    // Move to next player
    const nextPlayer = getNextActivePlayer(state.table.players, playerId);
    dispatch(setCurrentPlayer(nextPlayer.playerId));
  };
