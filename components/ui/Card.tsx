import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Card as CardType, Suit, Rank } from '../../app/types/Card';

// Tilemap details
const CARD_WIDTH = 64; // px, adjust if needed
const CARD_HEIGHT = 64; // px, adjust if needed
const COLUMNS = 14; // 13 cards + 1 back/blank
const SUIT_ORDER = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];

// Map suit and rank to tilemap position
function getCardPosition(suit: Suit, rank: Rank) {
  const row = SUIT_ORDER.indexOf(suit);
  const col = rank - 1; // ACE is 1, so col 0
  return { x: col * CARD_WIDTH, y: row * CARD_HEIGHT };
}

interface Props {
  card: CardType;
  style?: object;
  debug?: boolean;
}

export const Card: React.FC<Props> = ({ card, style, debug }) => {
  const { x, y } = getCardPosition(card.suit, card.rank);
  if (debug) {
    return (
      <View style={{ position: 'relative' }}>
        {/* Full tilemap for reference */}
        <Image
          source={require('../../assets/cardsLarge_tilemap_packed.png')}
          style={{ width: CARD_WIDTH * COLUMNS, height: CARD_HEIGHT * SUIT_ORDER.length, opacity: 0.5 }}
          resizeMode="center"
        />
        {/* Cropped card overlay */}
        <View
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: 'red',
            backgroundColor: 'rgba(255,255,255,0.7)',
          }}
        >
          <Image
            source={require('../../assets/cardsLarge_tilemap_packed.png')}
            style={[
              {
                width: CARD_WIDTH * COLUMNS,
                height: CARD_HEIGHT * SUIT_ORDER.length,
                position: 'absolute',
                top: -y,
                left: -x,
              },
            ]}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }
  return (
    <View style={[styles.container, style]}> 
      <Image
        source={require('../../assets/cardsLarge_tilemap_packed.png')}
        style={[
          styles.image,
          {
            transform: [
              { translateX: -x },
              { translateY: -y },
            ],
          },
        ]}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  image: {
    width: CARD_WIDTH * COLUMNS,
    height: CARD_HEIGHT * SUIT_ORDER.length,
    position: 'absolute',
    top: 0,
    left: 0,
  },
}); 