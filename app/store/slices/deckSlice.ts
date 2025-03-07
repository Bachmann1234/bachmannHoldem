import {createSlice} from "@reduxjs/toolkit";

export enum Suit {
    HEARTS = 'HEARTS',
    DIAMONDS = 'DIAMONDS',
    CLUBS = 'CLUBS',
    SPADES = 'SPADES'
}

export enum Rank {
    ACE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
    SIX = 6,
    SEVEN = 7,
    EIGHT = 8,
    NINE = 9,
    TEN = 10,
    JACK = 11,
    QUEEN = 12,
    KING = 13
}

export interface Card {
    suit: Suit;
    rank: Rank;
}

interface DeckState {
    cardStack: Card[];
}

const initialState: DeckState = {
    cardStack: shuffleDeck(generateDeck())
}

export const deckSlice = createSlice({
    name: 'deck',
    initialState,
    reducers: {
        shuffle: (state: DeckState) => {
            state.cardStack = shuffleDeck(state.cardStack);
        },
        drawCard: (state: DeckState) => {
            state.cardStack.shift();
        },
        addCard: (state: DeckState, action: {payload: Card}) => {
            state.cardStack.push(action.payload);
        }
    }
});

function shuffleDeck(cardsStack: Card[]) : Card[] {
    return cardsStack.sort(() => Math.random() - 0.5);
}

function generateDeck() : Card[] {
    const suits: Suit[] = Object.values(Suit);
    const ranks: Rank[] = Object.values(Rank).filter(value => typeof value === 'number') as Rank[];
    return suits.flatMap(suit => ranks.map(rank => ({suit, rank})));
}
