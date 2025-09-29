import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import DecorativeBackground from '../../assets/components/DecorativeBackground';

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            >
              <Ionicons name="menu" size={28} color="#222" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.title}>Welcome to Little Storyteller!</Text>
          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('StoryGen')}>
            <Text style={styles.buttonText}>LET'S CREATE</Text>
          </TouchableOpacity>
        </View>
      </DecorativeBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#E6E6FA',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
  },
  menuButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'Fredoka',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFD93D',
    borderRadius: 32,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    color: '#1A1A1A',
    fontFamily: 'PoppinsBold',
    fontSize: 20,
    letterSpacing: 1,
  },
});

export default LandingScreen; 