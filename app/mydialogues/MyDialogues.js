import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getDialogues } from '../utils/firestoreUtils';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';

const MyDialogues = () => {
  const [dialogues, setDialogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDialogues();
  }, []);

  const loadDialogues = async () => {
    try {
      setLoading(true);
      const savedDialogues = await getDialogues();
      setDialogues(savedDialogues);
    } catch (err) {
      setError('Failed to load dialogues. Please try again.');
      console.error('Error loading dialogues:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderDialogueItem = ({ item }) => (
    <TouchableOpacity style={styles.dialogueCard}>
      <View style={styles.dialogueHeader}>
        <Text style={styles.dialogueTitle}>{item.about}</Text>
        <Text style={styles.dialogueLength}>{item.length}</Text>
      </View>
      <View style={styles.dialogueDetails}>
        <Text style={styles.dialogueText}>Characters: {item.charNames.join(', ')}</Text>
        <Text style={styles.dialogueText}>Creativity: {item.creativity}</Text>
      </View>
      <View style={styles.dialogueContent}>
        <Text style={styles.dialogueText} numberOfLines={3}>
          {item.generatedDialogue.replace(/\*\*/g, '')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <DecorativeBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD93D" />
          <Text style={styles.loadingText}>Loading your dialogues...</Text>
        </View>
      </DecorativeBackground>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          <Text style={styles.title}>My Dialogues</Text>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadDialogues}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : dialogues.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="chat" size={64} color="#FFD93D" />
              <Text style={styles.emptyText}>No dialogues yet</Text>
              <Text style={styles.emptySubtext}>Create your first dialogue!</Text>
            </View>
          ) : (
            <FlatList
              data={dialogues}
              renderItem={renderDialogueItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          )}
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
  title: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xxxlarge,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: spacing.large,
    textAlign: 'center',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Fredoka',
    fontSize: fontSize.xxlarge,
    color: '#222',
    marginTop: spacing.medium,
  },
  emptySubtext: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
    marginTop: spacing.small,
  },
  listContainer: {
    paddingBottom: spacing.large,
  },
  dialogueCard: {
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
  dialogueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  dialogueTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.large,
    color: '#222',
    flex: 1,
  },
  dialogueLength: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#666',
    backgroundColor: '#FFF9D6',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: borderRadius.small,
  },
  dialogueDetails: {
    marginBottom: spacing.small,
  },
  dialogueText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#444',
    marginBottom: spacing.tiny,
  },
  dialogueContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: spacing.small,
  },
  viewDialogueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD93D',
    borderRadius: borderRadius.round,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    marginTop: spacing.medium,
    gap: spacing.small,
  },
  viewDialogueButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.small,
    color: '#222',
  },
  dialogueModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.medium,
  },
  dialogueModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.small,
  },
  closeButton: {
    padding: spacing.small,
  },
  dialogueModalBody: {
    flex: 1,
    padding: spacing.medium,
  },
  dialogueModalTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.xlarge,
    color: '#222',
    marginBottom: spacing.medium,
  },
  dialogueModalText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#444',
    lineHeight: fontSize.medium * 1.5,
  },
});

export default MyDialogues; 