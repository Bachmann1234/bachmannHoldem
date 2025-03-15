import { AppThunk } from '@/app/store';
import {
  addToPot,
  addToSidePot,
  createSidePot,
  dealCardToPlayer,
  incrementHandNumber,
  logAction,
  playerAllIn,
  playerFolded,
  removeFromPlayerStack,
  resetBoard,
  setBigBlind,
  setCurrentPlayer,
  setDealer,
  setSmallBlind,
} from '@/app/store/slices/tableSlice';
import { drawCard } from '@/app/store/slices/deckSlice';
import { ActionType, GameRound } from '@/app/types/Holdem';

export const startNewHand = (): AppThunk => (dispatch, getState) => {
  // Reset the board state
  dispatch(resetBoard());
  dispatch(incrementHandNumber());
  dispatch(
    logAction({
      player: undefined,
      type: ActionType.NEW_HAND,
      timestamp: Date.now(),
    }),
  );

  const state = getState();
  const { players } = state.table;
  const activePlayers = players.filter((p) => p.stack > 0);

  if (activePlayers.length < 2) {
    return; // Not enough players to play
  }

  activePlayers.forEach((p) => {
    dispatch(playerAllIn({ playerId: p.playerId, status: false }));
    dispatch(playerFolded({ playerId: p.playerId, status: false }));
  });

  // Determine dealer position
  const dealerIndex = state.table.dealer
    ? activePlayers.findIndex((p) => p.playerId === state.table.dealer)
    : 0;

  const dealer = activePlayers[dealerIndex];
  dispatch(setDealer(dealer.playerId));

  // Set blinds
  const sbIndex = (dealerIndex + 1) % activePlayers.length;
  const smallBlind = activePlayers[sbIndex];
  dispatch(setSmallBlind(smallBlind.playerId));

  const bbIndex = (sbIndex + 1) % activePlayers.length;
  const bigBlind = activePlayers[bbIndex];
  dispatch(setBigBlind(bigBlind.playerId));

  // Post blinds
  const { smallBlindAmount, bigBlindAmount } = state.table;

  // Small blind - handle potential all-in
  const sbAmount = Math.min(smallBlindAmount, smallBlind.stack);
  const sbIsAllIn = sbAmount === smallBlind.stack && sbAmount < smallBlindAmount;

  dispatch(removeFromPlayerStack({ amount: sbAmount, player: smallBlind }));
  dispatch(addToPot(sbAmount));

  // Log appropriate action (all-in or bet)
  dispatch(
    logAction({
      player: smallBlind,
      type: sbIsAllIn ? ActionType.ALL_IN : ActionType.BET,
      amount: sbAmount,
      timestamp: Date.now(),
    }),
  );

  // Create side pot if SB is all-in with less than the required amount
  if (sbIsAllIn) {
    dispatch(
      createSidePot({
        amount: 0,
        eligiblePlayers: activePlayers.filter((p) => p.playerId !== smallBlind.playerId),
        createdInRound: GameRound.PREFLOP,
      }),
    );
  }

  // Big blind - handle potential all-in
  const bbAmount = Math.min(bigBlindAmount, bigBlind.stack);
  const bbIsAllIn = bbAmount === bigBlind.stack && bbAmount < bigBlindAmount;

  dispatch(removeFromPlayerStack({ amount: bbAmount, player: bigBlind }));

  // Big blind - handle potential all-in when SB is already all-in
  if (sbIsAllIn) {
    // When SB is all-in, we need to split the BB's contribution
    dispatch(playerAllIn({ playerId: smallBlind.playerId, status: true }));
    const matchingSbAmount = Math.min(bbAmount, sbAmount);
    const remainingBbAmount = bbAmount - matchingSbAmount;

    // Add the portion matching SB to the main pot
    // Add the remaining to the first side pot
    if (remainingBbAmount > 0) {
      // Update sidePot with BB's extra contribution
      dispatch(addToSidePot({ index: 0, amount: remainingBbAmount }));
    }
  } else {
    // Normal case - BB not affected by SB side pot
    dispatch(addToPot(bbAmount));
  }

  // Log appropriate action (all-in or bet)
  dispatch(
    logAction({
      player: bigBlind,
      type: bbIsAllIn ? ActionType.ALL_IN : ActionType.BET,
      amount: bbAmount,
      timestamp: Date.now(),
    }),
  );

  // Create side pot if BB is all-in with less than the required amount
  if (bbIsAllIn && !sbIsAllIn) {
    dispatch(playerAllIn({ playerId: bigBlind.playerId, status: true }));
    dispatch(
      createSidePot({
        amount: 0,
        eligiblePlayers: activePlayers.filter((p) => p.playerId !== bigBlind.playerId),
        createdInRound: GameRound.PREFLOP,
      }),
    );
  } else if (bbIsAllIn && sbIsAllIn && bbAmount > sbAmount) {
    // If both SB and BB are all-in with different amounts, create another side pot
    dispatch(
      createSidePot({
        amount: 0,
        eligiblePlayers: activePlayers.filter(
          (p) => p.playerId !== bigBlind.playerId && p.playerId !== smallBlind.playerId,
        ),
        createdInRound: GameRound.PREFLOP,
      }),
    );
  }

  // Deal cards to players
  for (let i = 0; i < 2; i++) {
    for (const player of activePlayers) {
      const card = state.deck.cardStack[0];
      dispatch(drawCard());
      dispatch(
        dealCardToPlayer({
          player: player,
          card: card,
        }),
      );
    }
  }

  // Set first player to act (UTG position)
  const utgIndex = (bbIndex + 1) % activePlayers.length;
  dispatch(setCurrentPlayer(activePlayers[utgIndex].playerId));
};
