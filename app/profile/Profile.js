import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, SafeAreaView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { auth } from '../utils/firebase';
import { signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { getStories, getDialogues } from '../utils/firestoreUtils';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [stats, setStats] = useState({ stories: 0, dialogues: 0 });
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    loadStats();

    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    try {
      const stories = await getStories();
      const dialogues = await getDialogues();
      setStats({
        stories: stories.length,
        dialogues: dialogues.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      Alert.alert('Success', 'Password updated successfully');
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DecorativeBackground>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD93D" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </DecorativeBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <MaterialIcons name="person" size={iconSize.xxxlarge} color="#666" />
              </View>
            </View>
            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.stories}</Text>
              <Text style={styles.statLabel}>Stories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.dialogues}</Text>
              <Text style={styles.statLabel}>Dialogues</Text>
            </View>
          </View>

          <View style={styles.settingsContainer}>
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setShowPasswordChange(!showPasswordChange)}
            >
              <MaterialIcons name="lock" size={iconSize.medium} color="#222" />
              <Text style={styles.settingText}>Change Password</Text>
              <MaterialIcons name="chevron-right" size={iconSize.medium} color="#222" />
            </TouchableOpacity>
          </View>

          {showPasswordChange && (
            <View style={styles.passwordChangeContainer}>
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity 
                style={styles.updatePasswordButton}
                onPress={handlePasswordChange}
              >
                <Text style={styles.updatePasswordButtonText}>Update Password</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
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
    ...responsiveStyles.container,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  avatarContainer: {
    marginBottom: spacing.medium,
  },
  avatar: {
    width: iconSize.xxxlarge,
    height: iconSize.xxxlarge,
    borderRadius: iconSize.xxxlarge / 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileName: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.xlarge,
    color: '#222',
    marginBottom: spacing.tiny,
  },
  profileEmail: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.large,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.xlarge,
    color: '#222',
    marginBottom: spacing.tiny,
  },
  statLabel: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#666',
  },
  settingsContainer: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.medium,
    padding: spacing.small,
    marginBottom: spacing.large,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    flex: 1,
    marginLeft: spacing.small,
  },
  passwordChangeContainer: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    marginBottom: spacing.large,
  },
  input: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#222',
    backgroundColor: '#f5f5f5',
    borderRadius: borderRadius.small,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  updatePasswordButton: {
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingVertical: spacing.medium,
    paddingHorizontal: spacing.large,
    alignItems: 'center',
  },
  updatePasswordButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#222',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: borderRadius.medium,
    padding: spacing.medium,
    alignItems: 'center',
  },
  logoutText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#FFF',
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
});

export default Profile; 