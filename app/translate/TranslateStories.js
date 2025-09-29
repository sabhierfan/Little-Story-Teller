import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getStories } from '../utils/firestoreUtils';
import { auth } from '../utils/firebase';
import { translateText } from '../utils/translateUtils';
import { saveTranslatedStory } from '../utils/firestoreUtils';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';

const TranslateStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStories();
  }, []);
  
  const loadStories = async () => {
    try {
      setLoading(true);
      const userStories = await getStories();
      setStories(userStories);
    } catch (error) {
      setError('Failed to load stories. Please try again.');
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async (story) => {
    try {
      setTranslating(true);
      setSelectedStory(story.id);
      const translatedContent = await translateText(story.generatedStory, 'Urdu');
      await saveTranslatedStory({
        originalStoryId: story.id,
        originalStory: story.generatedStory,
        translatedStory: translatedContent,
        language: 'ur',
        userId: auth.currentUser.uid,
        createdAt: new Date(),
      });
      setSelectedStory(null);
      setTranslating(false);
      setError('');
    } catch (error) {
      setError('Failed to translate story. Please try again.');
      setTranslating(false);
      setSelectedStory(null);
    }
  };

  const renderStoryItem = ({ item }) => (
    <View style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <Text style={styles.storyTitle}>{item.mainIdea}</Text>
        <Text style={styles.storyType}>{item.storyType}</Text>
      </View>
      <View style={styles.storyDetails}>
        <Text style={styles.storyText}>Characters: {item.charNames?.join(', ')}</Text>
        <Text style={styles.storyText}>Setting: {item.setting}</Text>
        <Text style={styles.storyText}>Length: {item.storyLength}</Text>
      </View>
      <View style={styles.storyContent}>
        <Text style={styles.storyText} numberOfLines={3}>
          {item.generatedStory}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.translateButton}
        onPress={() => handleTranslate(item)}
        disabled={translating && selectedStory === item.id}
      >
        {translating && selectedStory === item.id ? (
          <ActivityIndicator size="small" color="#222" />
        ) : (
          <>
            <MaterialIcons name="translate" size={20} color="#222" />
            <Text style={styles.translateButtonText}>Translate to Urdu</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <DecorativeBackground>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD93D" />
            <Text style={styles.loadingText}>Loading your stories...</Text>
          </View>
        </DecorativeBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DecorativeBackground>
        <View style={styles.container}>
          <Text style={styles.title}>Translate Stories</Text>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadStories}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="translate" size={64} color="#FFD93D" />
              <Text style={styles.emptyText}>No stories available to translate</Text>
          </View>
          ) : (
            <FlatList
              data={stories}
              renderItem={renderStoryItem}
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
  listContainer: {
    paddingBottom: spacing.large,
  },
  storyCard: {
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
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  storyTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.large,
    color: '#222',
    flex: 1,
  },
  storyType: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#666',
    backgroundColor: '#FFF9D6',
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: borderRadius.small,
  },
  storyDetails: {
    marginBottom: spacing.small,
  },
  storyText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#444',
    marginBottom: spacing.tiny,
  },
  storyContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: spacing.small,
  },
  translateButton: {
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
  translateButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.small,
    color: '#222',
    marginLeft: spacing.small,
  },
});

export default TranslateStories; 