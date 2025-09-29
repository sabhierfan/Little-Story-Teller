import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';

const COLORS = [
  '#3A86FF', // yellow
  '#2AB7CA', // teal
  '#F66E9E', // pink
  '#F06543', // red
  '#7BE495', // green
  '#3A86FF', // blue
  '#0A1D56', // navy
];

const getColor = (index) => COLORS[index % COLORS.length];

const renderColorfulText = (text, startIndex = 0, style = {}) =>
  text.split('').map((char, i) => (
    <Text key={i} style={[{ color: getColor(startIndex + i) }, style]}>{char}</Text>
  ));

const Header = ({ style }) => (
  <View style={[styles.header, style]}>
    <Image source={require('../main logo.png')} style={styles.logo} resizeMode="contain" />
    <View style={styles.titleContainer}>
      <Text style={styles.title}>
        {renderColorfulText('Little', 0, styles.title)}
      </Text>
      <Text style={styles.title}>
        {renderColorfulText('StoryTeller', 2, styles.title)}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  logo: {
    width: 350,
    height: 350,
    marginBottom: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Fredoka',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginVertical: 0,
  },
});

export default Header; 