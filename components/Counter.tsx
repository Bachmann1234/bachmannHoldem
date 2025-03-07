import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { decrement, increment } from '@/app/store/slices/counterSlice';

export default function Counter() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Count: {count}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Decrement" onPress={() => dispatch(decrement())} />
        <Button title="Increment" onPress={() => dispatch(increment())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
  },
});