import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DecorativeBackground = ({ children }) => {
  return (
    <View style={styles.background}>
      {/* Character Images */}
      <Image
        source={require('../c1.png')}
        style={[styles.character, styles.pooh]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={require('../c2.png')}
        style={[styles.character, styles.tom]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={require('../c3.png')}
        style={[styles.character, styles.jerry]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={require('../c4.png')}
        style={[styles.character, styles.mickey]}
        resizeMode="contain"
        pointerEvents="none"
      />
      <Image
        source={require('../c5.png')}
        style={[styles.character, styles.penguin]}
        resizeMode="contain"
        pointerEvents="none"
      />
      {/* Main Content Layered Above */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#E6E6FA',
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  character: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.95,
  },
  pooh: {
    left: '-10%',
    bottom: '7%',
    width: '50%',
    aspectRatio: 1,
    transform: [{ rotate: '-20deg' }],
  },
  tom: {
    right: '-20%',
    bottom: '-80%',
    width: '50%',
    aspectRatio: 1,
    transform: [{ scaleX: 1 }],
  },
  jerry: {
    right: '-6%',
    top: '2%',
    width: '45%',
    aspectRatio: 1,
    transform: [{ rotate: '10deg' }],
  },
  mickey: {
    left: '-10%',
    top: '-0%',
    width: '50%',
    aspectRatio: 1,
    transform: [{ rotate: '-30deg' }],
  },
  penguin: {
    left: '60%',
    bottom: '-25%',
    width: '70%',
    aspectRatio: 1,
    transform: [{ rotate: '-5deg' }],
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DecorativeBackground; 