import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import { auth, getAuth } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';

const Signup = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.replace('MainApp');
    } catch (err) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/main logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Signing up...' : 'SIGN UP'}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    ...responsiveStyles.container,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xxxlarge,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    backgroundColor: '#f5f5f5',
    borderRadius: borderRadius.small,
    padding: spacing.medium,
    marginBottom: spacing.small,
  },
  button: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  buttonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    marginTop: spacing.small,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  retryButton: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
  },
  retryButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.medium,
  },
  loginText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
  },
  loginLink: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#FFD93D',
    marginLeft: spacing.small,
  },
});

export default Signup; 