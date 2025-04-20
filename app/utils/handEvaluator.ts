import { Card, Rank, Suit } from '@/app/types/Card';

/**
 * Hand rankings in poker, from highest to lowest
 */
export enum HandRank {
  ROYAL_FLUSH = 10,
  STRAIGHT_FLUSH = 9,
  FOUR_OF_A_KIND = 8,
  FULL_HOUSE = 7,
  FLUSH = 6,
  STRAIGHT = 5,
  THREE_OF_A_KIND = 4,
  TWO_PAIR = 3,
  ONE_PAIR = 2,
  HIGH_CARD = 1,
}

/**
 * Represents a poker hand with its rank and cards
 */
export interface Hand {
  rank: HandRank;
  cards: Card[]; // The 5 cards that make up the hand
  value: number; // A numeric value for comparing hands of the same rank
}

/**
 * Evaluates the best 5-card hand from a set of 7 cards (2 hole cards + 5 community cards)
 */
export function evaluateHand(holeCards: Card[], communityCards: Card[]): Hand {
  // Combine hole cards and community cards
  const allCards = [...holeCards, ...communityCards];

  // Generate all possible 5-card combinations
  const combinations = getCombinations(allCards, 5);

  // Evaluate each combination and find the best hand
  let bestHand: Hand = {
    rank: HandRank.HIGH_CARD,
    cards: combinations[0],
    value: 0,
  };

  for (const combo of combinations) {
    const hand = rankHand(combo);
    if (hand.rank > bestHand.rank || (hand.rank === bestHand.rank && hand.value > bestHand.value)) {
      bestHand = hand;
    }
  }

  return bestHand;
}

/**
 * Generates all possible k-sized combinations from an array
 */
function getCombinations<T>(array: T[], k: number): T[][] {
  const result: T[][] = [];

  // Recursive helper function
  function combine(start: number, combo: T[]) {
    if (combo.length === k) {
      result.push([...combo]);
      return;
    }

    for (let i = start; i < array.length; i++) {
      combo.push(array[i]);
      combine(i + 1, combo);
      combo.pop();
    }
  }

  combine(0, []);
  return result;
}

/**
 * Ranks a 5-card hand
 */
function rankHand(cards: Card[]): Hand {
  // Sort cards by rank (high to low)
  const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);

  // Check for each hand rank from highest to lowest
  let hand: Hand;

  // Check for royal flush
  hand = checkRoyalFlush(sortedCards);
  if (hand) return hand;

  // Check for straight flush
  hand = checkStraightFlush(sortedCards);
  if (hand) return hand;

  // Check for four of a kind
  hand = checkFourOfAKind(sortedCards);
  if (hand) return hand;

  // Check for full house
  hand = checkFullHouse(sortedCards);
  if (hand) return hand;

  // Check for flush
  hand = checkFlush(sortedCards);
  if (hand) return hand;

  // Check for straight
  hand = checkStraight(sortedCards);
  if (hand) return hand;

  // Check for three of a kind
  hand = checkThreeOfAKind(sortedCards);
  if (hand) return hand;

  // Check for two pair
  hand = checkTwoPair(sortedCards);
  if (hand) return hand;

  // Check for one pair
  hand = checkOnePair(sortedCards);
  if (hand) return hand;

  // If no other hand, it's a high card
  // Take the 5 highest cards
  const highCards = sortedCards.slice(0, 5);
  return {
    rank: HandRank.HIGH_CARD,
    cards: highCards,
    value: calculateHighCardValue(highCards),
  };
}

/**
 * Checks if a hand is a royal flush
 */
function checkRoyalFlush(cards: Card[]): Hand | null {
  // A royal flush is a straight flush with an ace high
  // First check if all cards are the same suit
  const suits = new Map<Suit, Card[]>();
  for (const card of cards) {
    if (!suits.has(card.suit)) {
      suits.set(card.suit, []);
    }
    suits.get(card.suit)!.push(card);
  }

  // Find a suit with at least 5 cards
  for (const [suit, suitCards] of suits.entries()) {
    if (suitCards.length >= 5) {
      // Check if this suit contains A, K, Q, J, 10
      const hasAce = suitCards.some((card) => card.rank === Rank.ACE);
      const hasKing = suitCards.some((card) => card.rank === Rank.KING);
      const hasQueen = suitCards.some((card) => card.rank === Rank.QUEEN);
      const hasJack = suitCards.some((card) => card.rank === Rank.JACK);
      const hasTen = suitCards.some((card) => card.rank === Rank.TEN);

      if (hasAce && hasKing && hasQueen && hasJack && hasTen) {
        // Create the royal flush hand
        const royalFlushCards = [
          suitCards.find((card) => card.rank === Rank.ACE)!,
          suitCards.find((card) => card.rank === Rank.KING)!,
          suitCards.find((card) => card.rank === Rank.QUEEN)!,
          suitCards.find((card) => card.rank === Rank.JACK)!,
          suitCards.find((card) => card.rank === Rank.TEN)!,
        ];

        return {
          rank: HandRank.ROYAL_FLUSH,
          cards: royalFlushCards,
          value: 0, // No need for a value as all royal flushes are equal
        };
      }
    }
  }

  return null;
}

/**
 * Checks if a hand is a straight flush
 */
function checkStraightFlush(cards: Card[]): Hand | null {
  // A straight flush is both a straight and a flush
  const flush = checkFlush(cards);
  const straight = checkStraight(cards);

  if (flush && straight) {
    // Need to check if the same 5 cards form both the straight and flush
    // For simplicity, we'll just check if all cards are the same suit
    const suit = cards[0].suit;
    if (cards.every((card) => card.suit === suit)) {
      return {
        rank: HandRank.STRAIGHT_FLUSH,
        cards: straight.cards,
        value: straight.value,
      };
    }
  }

  return null;
}

/**
 * Checks if a hand is four of a kind
 */
function checkFourOfAKind(cards: Card[]): Hand | null {
  // Group cards by rank
  const groups = groupCardsByRank(cards);

  // Find a group with 4 cards
  for (const [rank, group] of groups.entries()) {
    if (group.length === 4) {
      // Find the kicker (the highest card not in the four of a kind)
      const kicker = cards.find((card) => card.rank !== rank);

      return {
        rank: HandRank.FOUR_OF_A_KIND,
        cards: [...group, kicker!],
        value: Number(rank) * 100 + kicker!.rank, // Value based on rank of four of a kind and kicker
      };
    }
  }

  return null;
}

/**
 * Checks if a hand is a full house
 */
function checkFullHouse(cards: Card[]): Hand | null {
  // Group cards by rank
  const groups = groupCardsByRank(cards);

  let threeOfAKindRank: number | null = null;
  let pairRank: number | null = null;

  // Find a group with 3 cards and a group with 2 cards
  for (const [rank, group] of groups.entries()) {
    if (group.length === 3) {
      threeOfAKindRank = rank;
    } else if (group.length === 2) {
      pairRank = rank;
    }
  }

  if (threeOfAKindRank !== null && pairRank !== null) {
    // Combine the three of a kind and pair
    const threeOfAKind = cards.filter((card) => card.rank === threeOfAKindRank);
    const pair = cards.filter((card) => card.rank === pairRank);

    return {
      rank: HandRank.FULL_HOUSE,
      cards: [...threeOfAKind, ...pair],
      value: threeOfAKindRank * 100 + pairRank, // Value based on rank of three of a kind and pair
    };
  }

  return null;
}

/**
 * Checks if a hand is a flush
 */
function checkFlush(cards: Card[]): Hand | null {
  // Group cards by suit
  const suits = new Map<Suit, Card[]>();

  for (const card of cards) {
    if (!suits.has(card.suit)) {
      suits.set(card.suit, []);
    }
    suits.get(card.suit)!.push(card);
  }

  // Find a suit with 5 or more cards
  for (const [suit, suitCards] of suits.entries()) {
    if (suitCards.length >= 5) {
      // Take the 5 highest cards of the flush
      const flushCards = suitCards.sort((a, b) => b.rank - a.rank).slice(0, 5);

      return {
        rank: HandRank.FLUSH,
        cards: flushCards,
        value: calculateHighCardValue(flushCards), // Value based on the ranks of the flush cards
      };
    }
  }

  return null;
}

/**
 * Checks if a hand is a straight
 */
function checkStraight(cards: Card[]): Hand | null {
  // Remove duplicate ranks
  const uniqueRanks = Array.from(new Set(cards.map((card) => card.rank)));

  // Sort ranks in descending order
  const sortedRanks = [...uniqueRanks].sort((a, b) => b - a);

  // Special case for A-5-4-3-2 straight (Ace is low)
  if (
    sortedRanks.includes(Rank.ACE) &&
    sortedRanks.includes(Rank.FIVE) &&
    sortedRanks.includes(Rank.FOUR) &&
    sortedRanks.includes(Rank.THREE) &&
    sortedRanks.includes(Rank.TWO)
  ) {
    // Find one card of each required rank
    const straightCards = [
      cards.find((card) => card.rank === Rank.FIVE)!,
      cards.find((card) => card.rank === Rank.FOUR)!,
      cards.find((card) => card.rank === Rank.THREE)!,
      cards.find((card) => card.rank === Rank.TWO)!,
      cards.find((card) => card.rank === Rank.ACE)!,
    ];

    return {
      rank: HandRank.STRAIGHT,
      cards: straightCards,
      value: 5, // Value based on the highest card in the straight (5 in this case)
    };
  }

  // Check for regular straights
  for (let i = 0; i <= sortedRanks.length - 5; i++) {
    if (
      sortedRanks[i] - sortedRanks[i + 4] === 4 &&
      sortedRanks[i] - sortedRanks[i + 1] === 1 &&
      sortedRanks[i + 1] - sortedRanks[i + 2] === 1 &&
      sortedRanks[i + 2] - sortedRanks[i + 3] === 1 &&
      sortedRanks[i + 3] - sortedRanks[i + 4] === 1
    ) {
      // Find one card of each required rank
      const straightCards = [
        cards.find((card) => card.rank === sortedRanks[i])!,
        cards.find((card) => card.rank === sortedRanks[i + 1])!,
        cards.find((card) => card.rank === sortedRanks[i + 2])!,
        cards.find((card) => card.rank === sortedRanks[i + 3])!,
        cards.find((card) => card.rank === sortedRanks[i + 4])!,
      ];

      return {
        rank: HandRank.STRAIGHT,
        cards: straightCards,
        value: sortedRanks[i], // Value based on the highest card in the straight
      };
    }
  }

  return null;
}

/**
 * Checks if a hand is three of a kind
 */
function checkThreeOfAKind(cards: Card[]): Hand | null {
  // Group cards by rank
  const groups = groupCardsByRank(cards);

  // Find a group with 3 cards
  for (const [rank, group] of groups.entries()) {
    if (group.length === 3) {
      // Find the two highest cards not in the three of a kind
      const kickers = cards
        .filter((card) => card.rank !== rank)
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 2);

      return {
        rank: HandRank.THREE_OF_A_KIND,
        cards: [...group, ...kickers],
        value: rank * 10000 + calculateHighCardValue(kickers), // Value based on rank of three of a kind and kickers
      };
    }
  }

  return null;
}

/**
 * Checks if a hand is two pair
 */
function checkTwoPair(cards: Card[]): Hand | null {
  // Group cards by rank
  const groups = groupCardsByRank(cards);

  const pairs: Card[][] = [];

  // Find groups with 2 cards
  for (const [rank, group] of groups.entries()) {
    if (group.length === 2) {
      pairs.push(group);
    }
  }

  if (pairs.length >= 2) {
    // Sort pairs by rank (high to low)
    pairs.sort((a, b) => b[0].rank - a[0].rank);

    // Take the two highest pairs
    const twoPair = [...pairs[0], ...pairs[1]];

    // Find the highest card not in the two pairs
    const kicker = cards
      .filter((card) => card.rank !== pairs[0][0].rank && card.rank !== pairs[1][0].rank)
      .sort((a, b) => b.rank - a.rank)[0];

    return {
      rank: HandRank.TWO_PAIR,
      cards: [...twoPair, kicker],
      value: pairs[0][0].rank * 10000 + pairs[1][0].rank * 100 + kicker.rank, // Value based on ranks of pairs and kicker
    };
  }

  return null;
}

/**
 * Checks if a hand is one pair
 */
function checkOnePair(cards: Card[]): Hand | null {
  // Group cards by rank
  const groups = groupCardsByRank(cards);

  // Find a group with 2 cards
  for (const [rank, group] of groups.entries()) {
    if (group.length === 2) {
      // Find the three highest cards not in the pair
      const kickers = cards
        .filter((card) => card.rank !== rank)
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 3);

      return {
        rank: HandRank.ONE_PAIR,
        cards: [...group, ...kickers],
        value: rank * 1000000 + calculateHighCardValue(kickers), // Value based on rank of pair and kickers
      };
    }
  }

  return null;
}

/**
 * Groups cards by rank
 */
function groupCardsByRank(cards: Card[]): Map<number, Card[]> {
  const groups = new Map<number, Card[]>();

  for (const card of cards) {
    if (!groups.has(card.rank)) {
      groups.set(card.rank, []);
    }
    groups.get(card.rank)!.push(card);
  }

  return groups;
}

/**
 * Calculates a value for high card comparison
 */
function calculateHighCardValue(cards: Card[]): number {
  // Sort cards by rank (high to low)
  const sortedCards = [...cards].sort((a, b) => b.rank - a.rank);

  // Calculate a value where each card position has a different weight
  let value = 0;
  const weights = [10000, 100, 10, 1, 0.1];

  for (let i = 0; i < Math.min(sortedCards.length, 5); i++) {
    value += sortedCards[i].rank * weights[i];
  }

  return value;
}

/**
 * Compares two hands to determine the winner
 * Returns:
 * - positive number if hand1 is better
 * - negative number if hand2 is better
 * - 0 if hands are equal
 */
export function compareHands(hand1: Hand, hand2: Hand): number {
  // Compare hand ranks
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank;
  }

  // If ranks are equal, compare values
  return hand1.value - hand2.value;
}
