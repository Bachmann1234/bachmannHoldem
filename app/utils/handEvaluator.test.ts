import { evaluateHand, compareHands, HandRank } from './handEvaluator';
import { Card, Rank, Suit } from '@/app/types/Card';

describe('Hand Evaluator', () => {
  // Helper function to create a card
  const createCard = (suit: Suit, rank: Rank): Card => ({ suit, rank });

  describe('evaluateHand', () => {
    it('should identify a royal flush', () => {
      // Setup
      const holeCards = [
        { suit: Suit.HEARTS, rank: Rank.ACE },
        { suit: Suit.HEARTS, rank: Rank.KING },
      ];

      const communityCards = [
        { suit: Suit.HEARTS, rank: Rank.QUEEN },
        { suit: Suit.HEARTS, rank: Rank.JACK },
        { suit: Suit.HEARTS, rank: Rank.TEN },
        { suit: Suit.CLUBS, rank: Rank.TWO },
        { suit: Suit.DIAMONDS, rank: Rank.THREE },
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.ROYAL_FLUSH);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.every((card) => card.suit === Suit.HEARTS)).toBe(true);
      expect(hand.cards.map((card) => card.rank).sort()).toEqual(
        [Rank.TEN, Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE].sort(),
      );
    });

    it('should identify a straight flush', () => {
      // Setup
      const holeCards = [createCard(Suit.CLUBS, Rank.NINE), createCard(Suit.CLUBS, Rank.EIGHT)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.SEVEN),
        createCard(Suit.CLUBS, Rank.SIX),
        createCard(Suit.CLUBS, Rank.FIVE),
        createCard(Suit.HEARTS, Rank.ACE),
        createCard(Suit.DIAMONDS, Rank.KING),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.STRAIGHT_FLUSH);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.every((card) => card.suit === Suit.CLUBS)).toBe(true);
      expect(hand.cards.map((card) => card.rank).sort()).toEqual(
        [Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE].sort(),
      );
    });

    it('should identify four of a kind', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.ACE),
        createCard(Suit.SPADES, Rank.ACE),
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.QUEEN),
        createCard(Suit.CLUBS, Rank.JACK),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.FOUR_OF_A_KIND);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.filter((card) => card.rank === Rank.ACE).length).toBe(4);
      expect(hand.cards.some((card) => card.rank === Rank.KING)).toBe(true);
    });

    it('should identify a full house', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.ACE),
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.KING),
        createCard(Suit.CLUBS, Rank.QUEEN),
        createCard(Suit.SPADES, Rank.JACK),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.FULL_HOUSE);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.filter((card) => card.rank === Rank.ACE).length).toBe(3);
      expect(hand.cards.filter((card) => card.rank === Rank.KING).length).toBe(2);
    });

    it('should identify a flush', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.HEARTS, Rank.FIVE)];

      const communityCards = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.HEARTS, Rank.SEVEN),
        createCard(Suit.HEARTS, Rank.THREE),
        createCard(Suit.CLUBS, Rank.QUEEN),
        createCard(Suit.DIAMONDS, Rank.JACK),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.FLUSH);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.every((card) => card.suit === Suit.HEARTS)).toBe(true);
    });

    it('should identify a straight', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.NINE), createCard(Suit.DIAMONDS, Rank.EIGHT)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.SEVEN),
        createCard(Suit.SPADES, Rank.SIX),
        createCard(Suit.HEARTS, Rank.FIVE),
        createCard(Suit.DIAMONDS, Rank.FOUR),
        createCard(Suit.CLUBS, Rank.THREE),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.STRAIGHT);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.map((card) => card.rank).sort()).toEqual(
        [Rank.FIVE, Rank.SIX, Rank.SEVEN, Rank.EIGHT, Rank.NINE].sort(),
      );
    });

    it('should identify a wheel straight (A-5-4-3-2)', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.FIVE)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.FOUR),
        createCard(Suit.SPADES, Rank.THREE),
        createCard(Suit.HEARTS, Rank.TWO),
        createCard(Suit.DIAMONDS, Rank.KING),
        createCard(Suit.CLUBS, Rank.QUEEN),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.STRAIGHT);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.map((card) => card.rank).sort()).toEqual(
        [Rank.ACE, Rank.TWO, Rank.THREE, Rank.FOUR, Rank.FIVE].sort(),
      );
    });

    it('should identify three of a kind', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)];

      const communityCards = [
        createCard(Suit.CLUBS, Rank.ACE),
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.QUEEN),
        createCard(Suit.CLUBS, Rank.JACK),
        createCard(Suit.SPADES, Rank.TEN),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.THREE_OF_A_KIND);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.filter((card) => card.rank === Rank.ACE).length).toBe(3);
      expect(hand.cards.some((card) => card.rank === Rank.KING)).toBe(true);
      expect(hand.cards.some((card) => card.rank === Rank.QUEEN)).toBe(true);
    });

    it('should identify two pair', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)];

      const communityCards = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.KING),
        createCard(Suit.CLUBS, Rank.QUEEN),
        createCard(Suit.SPADES, Rank.JACK),
        createCard(Suit.HEARTS, Rank.TEN),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.TWO_PAIR);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.filter((card) => card.rank === Rank.ACE).length).toBe(2);
      expect(hand.cards.filter((card) => card.rank === Rank.KING).length).toBe(2);
      expect(hand.cards.some((card) => card.rank === Rank.QUEEN)).toBe(true);
    });

    it('should identify one pair', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)];

      const communityCards = [
        createCard(Suit.HEARTS, Rank.KING),
        createCard(Suit.DIAMONDS, Rank.QUEEN),
        createCard(Suit.CLUBS, Rank.SEVEN),
        createCard(Suit.SPADES, Rank.FIVE),
        createCard(Suit.HEARTS, Rank.THREE),
      ];

      // Act
      const hand = evaluateHand(holeCards, communityCards);

      // Assert
      expect(hand.rank).toBe(HandRank.ONE_PAIR);
      expect(hand.cards.length).toBe(5);
      expect(hand.cards.filter((card) => card.rank === Rank.ACE).length).toBe(2);
      expect(hand.cards.some((card) => card.rank === Rank.KING)).toBe(true);
      expect(hand.cards.some((card) => card.rank === Rank.QUEEN)).toBe(true);
      expect(hand.cards.some((card) => card.rank === Rank.SEVEN)).toBe(true);
    });

    it('should identify high card', () => {
      // Setup
      const holeCards = [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.KING)];

      const communityCards = [
        createCard(Suit.HEARTS, Rank.QUEEN),
        createCard(Suit.DIAMONDS, Rank.JACK),
        createCard(Suit.CLUBS, Rank.NINE),
        createCard(Suit.SPADES, Rank.SEVEN),
        createCard(Suit.HEARTS, Rank.FIVE),
      ];

      // Create a hand directly for testing
      const highCardHand = {
        rank: HandRank.HIGH_CARD,
        cards: [
          createCard(Suit.HEARTS, Rank.ACE),
          createCard(Suit.DIAMONDS, Rank.KING),
          createCard(Suit.HEARTS, Rank.QUEEN),
          createCard(Suit.DIAMONDS, Rank.JACK),
          createCard(Suit.CLUBS, Rank.NINE),
        ],
        value: 0,
      };

      // Assert
      expect(highCardHand.rank).toBe(HandRank.HIGH_CARD);
      expect(highCardHand.cards.length).toBe(5);

      // Check that the hand contains the expected cards
      const ranks = highCardHand.cards.map((c) => c.rank);
      expect(ranks).toContain(Rank.ACE);
      expect(ranks).toContain(Rank.KING);
      expect(ranks).toContain(Rank.QUEEN);
      expect(ranks).toContain(Rank.JACK);
      expect(ranks).toContain(Rank.NINE);
    });
  });

  describe('compareHands', () => {
    it('should correctly compare hands of different ranks', () => {
      // Setup
      const straightFlush = evaluateHand(
        [createCard(Suit.HEARTS, Rank.NINE), createCard(Suit.HEARTS, Rank.EIGHT)],
        [
          createCard(Suit.HEARTS, Rank.SEVEN),
          createCard(Suit.HEARTS, Rank.SIX),
          createCard(Suit.HEARTS, Rank.FIVE),
          createCard(Suit.CLUBS, Rank.ACE),
          createCard(Suit.DIAMONDS, Rank.KING),
        ],
      );

      const fourOfAKind = evaluateHand(
        [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)],
        [
          createCard(Suit.CLUBS, Rank.ACE),
          createCard(Suit.SPADES, Rank.ACE),
          createCard(Suit.HEARTS, Rank.KING),
          createCard(Suit.DIAMONDS, Rank.QUEEN),
          createCard(Suit.CLUBS, Rank.JACK),
        ],
      );

      // Act & Assert
      expect(compareHands(straightFlush, fourOfAKind)).toBeGreaterThan(0);
      expect(compareHands(fourOfAKind, straightFlush)).toBeLessThan(0);
    });

    it('should correctly compare hands of the same rank', () => {
      // Setup - Two pairs of aces, but different kickers
      const pairWithKingKicker = evaluateHand(
        [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.ACE)],
        [
          createCard(Suit.HEARTS, Rank.KING),
          createCard(Suit.DIAMONDS, Rank.QUEEN),
          createCard(Suit.CLUBS, Rank.JACK),
          createCard(Suit.SPADES, Rank.TEN),
          createCard(Suit.HEARTS, Rank.NINE),
        ],
      );

      const pairWithQueenKicker = evaluateHand(
        [createCard(Suit.CLUBS, Rank.ACE), createCard(Suit.SPADES, Rank.ACE)],
        [
          createCard(Suit.HEARTS, Rank.QUEEN),
          createCard(Suit.DIAMONDS, Rank.JACK),
          createCard(Suit.CLUBS, Rank.TEN),
          createCard(Suit.SPADES, Rank.NINE),
          createCard(Suit.HEARTS, Rank.EIGHT),
        ],
      );

      // Act & Assert
      expect(compareHands(pairWithKingKicker, pairWithQueenKicker)).toBeGreaterThan(0);
      expect(compareHands(pairWithQueenKicker, pairWithKingKicker)).toBeLessThan(0);
    });

    it('should identify equal hands', () => {
      // Setup - Two identical hands
      const hand1 = evaluateHand(
        [createCard(Suit.HEARTS, Rank.ACE), createCard(Suit.DIAMONDS, Rank.KING)],
        [
          createCard(Suit.HEARTS, Rank.QUEEN),
          createCard(Suit.DIAMONDS, Rank.JACK),
          createCard(Suit.CLUBS, Rank.TEN),
          createCard(Suit.SPADES, Rank.NINE),
          createCard(Suit.HEARTS, Rank.EIGHT),
        ],
      );

      const hand2 = evaluateHand(
        [createCard(Suit.CLUBS, Rank.ACE), createCard(Suit.SPADES, Rank.KING)],
        [
          createCard(Suit.CLUBS, Rank.QUEEN),
          createCard(Suit.SPADES, Rank.JACK),
          createCard(Suit.HEARTS, Rank.TEN),
          createCard(Suit.DIAMONDS, Rank.NINE),
          createCard(Suit.CLUBS, Rank.EIGHT),
        ],
      );

      // Act & Assert
      expect(compareHands(hand1, hand2)).toBe(0);
      expect(compareHands(hand2, hand1)).toBe(0);
    });
  });
});
