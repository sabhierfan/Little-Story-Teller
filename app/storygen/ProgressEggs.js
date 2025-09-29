import React from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EGG_COUNT = 6;
const EGG_SIZE = 32;

const ProgressEggs = ({ step, onStepChange }) => {
  return (
    <View style={styles.row}>
      {[...Array(EGG_COUNT)].map((_, i) => (
        <View key={i} style={styles.eggWrapper}>
          <TouchableOpacity
            onPress={() => onStepChange && onStepChange(i + 1)}
            activeOpacity={onStepChange ? 0.7 : 1}
            disabled={!onStepChange}
            style={{ alignItems: 'center' }}
          >
            <Animated.View style={[styles.egg, i < step ? styles.eggFilled : styles.eggEmpty]}>
              <MaterialCommunityIcons
                name={i < step ? 'egg-easter' : 'egg-outline'}
                size={EGG_SIZE}
                color={i < step ? '#f9a825' : '#f4c27d'}
              />
            </Animated.View>
            <Text style={styles.eggNumber}>{i + 1}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop: 4,
  },
  eggWrapper: {
    marginHorizontal: 4,
    alignItems: 'center',
  },
  egg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  eggFilled: {},
  eggEmpty: {},
  eggNumber: {
    fontSize: 14,
    color: '#bfa14a',
    fontFamily: 'PoppinsBold',
    marginTop: 2,
    textAlign: 'center',
  },
});

export default ProgressEggs; 