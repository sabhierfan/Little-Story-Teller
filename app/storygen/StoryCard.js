import React from 'react';
import { View, StyleSheet } from 'react-native';

const StoryCard = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFE088',
    borderRadius: 28,
    padding: 24,
    marginVertical: 24,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'stretch',
    minWidth: '80%',
    maxWidth: 420,
    alignSelf: 'center',
  },
});

export default StoryCard; 