import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import { Card } from '../components/ui/Card';
import { Suit, Rank, Card as CardType } from '../app/types/Card';

const suitOptions = [Suit.HEARTS, Suit.DIAMONDS, Suit.CLUBS, Suit.SPADES];
const rankOptions = [
  { label: 'Ace', value: Rank.ACE },
  { label: '2', value: Rank.TWO },
  { label: '3', value: Rank.THREE },
  { label: '4', value: Rank.FOUR },
  { label: '5', value: Rank.FIVE },
  { label: '6', value: Rank.SIX },
  { label: '7', value: Rank.SEVEN },
  { label: '8', value: Rank.EIGHT },
  { label: '9', value: Rank.NINE },
  { label: '10', value: Rank.TEN },
  { label: 'Jack', value: Rank.JACK },
  { label: 'Queen', value: Rank.QUEEN },
  { label: 'King', value: Rank.KING },
];

// Wrapper for Storybook controls
interface CardStoryWrapperProps {
  suit: Suit;
  rank: Rank;
}
const CardStoryWrapper = ({ suit, rank  }: CardStoryWrapperProps) => (
  <Card card={{ suit, rank }} />
);

const meta = {
  title: 'Playing Cards/Card',
  component: CardStoryWrapper,
  decorators: [
    (Story) => (
      <View style={{ flexDirection: 'row', gap: 16, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    suit: {
      control: { type: 'select' },
      options: suitOptions,
      description: 'Suit',
      defaultValue: Suit.HEARTS,
    },
    rank: {
      control: { type: 'select', labels: Object.fromEntries(rankOptions.map(r => [r.value, r.label])) },
      options: rankOptions.map(r => r.value),
      description: 'Rank',
      defaultValue: Rank.ACE,
    },
  },
  parameters: {
    controls: { expanded: true },
  },
} satisfies Meta<typeof CardStoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  args: {
    suit: Suit.HEARTS,
    rank: Rank.ACE,
  },
}; 