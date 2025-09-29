import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image, Modal, SafeAreaView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { getStories, getTranslatedStories, deleteStory } from '../utils/firestoreUtils';
import { generateImageFromPromptOpenAI, generateImagePromptsFromStory } from '../utils/promptUtils';
import DecorativeBackground from '../../assets/components/DecorativeBackground';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';
import StoryView from '../components/StoryView';
import { Audio } from 'expo-av';
import { getSpeechFromText } from '../utils/elevenLabsTTS';

// --- FunLoader (copied from StoryGen) ---
const FunLoader = () => (
  <View style={styles.funLoaderContainer}>
    <View style={styles.funLoaderCharacters}>
      <Image source={require('../../assets/c1.png')} style={styles.funLoaderChar} />
      <Image source={require('../../assets/c4.png')} style={styles.funLoaderChar} />
      <Image source={require('../../assets/c3.png')} style={styles.funLoaderChar} />
    </View>
    <ActivityIndicator size="large" color="#FFD93D" style={{ marginVertical: 16 }} />
    <Text style={styles.funLoaderText}>Cooking up your magical story...</Text>
    <Text style={styles.funLoaderSubtext}>Get ready for an adventure! 🐻🐭🧙‍♂️</Text>
  </View>
);

// --- Book-like Story View (Step7 logic) ---
const BookStoryView = ({ story, images, onClose, loadingImages }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const paragraphs = story.split(/\n\n+/);
  const totalPages = Math.ceil(paragraphs.length / 2);

  const renderPage = (pageIndex) => {
    const textIndex = pageIndex * 2;
    const imageIndex = pageIndex;
    const hasNextPage = pageIndex < totalPages - 1;
    const hasPrevPage = pageIndex > 0;

    return (
      <View style={styles.pageContainer}>
        <View style={styles.pageContent}>
          <Text style={styles.pageNumber}>Page {pageIndex + 1}</Text>
          <Text style={styles.storyText}>{paragraphs[textIndex]}</Text>
          {images && images[imageIndex] && (
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: images[imageIndex].startsWith('data:image')
                    ? images[imageIndex]
                    : (images[imageIndex].startsWith('/') || images[imageIndex].startsWith('http'))
                      ? images[imageIndex]
                      : `data:image/png;base64,${images[imageIndex]}`
                }}
                style={styles.storyImage}
                resizeMode="contain"
              />
            </View>
          )}
          {paragraphs[textIndex + 1] && (
            <Text style={styles.storyText}>{paragraphs[textIndex + 1]}</Text>
          )}
        </View>
        <View style={styles.pageNavigation}>
          <TouchableOpacity 
            style={[styles.navButton, !hasPrevPage && styles.navButtonDisabled]} 
            onPress={() => setCurrentPage(p => p - 1)}
            disabled={!hasPrevPage}
          >
            <MaterialIcons name="arrow-back-ios" size={24} color={hasPrevPage ? "#111" : "#ccc"} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.navButton, !hasNextPage && styles.navButtonDisabled]} 
            onPress={() => setCurrentPage(p => p + 1)}
            disabled={!hasNextPage}
          >
            <MaterialIcons name="arrow-forward-ios" size={24} color={hasNextPage ? "#111" : "#ccc"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.bookModalContent}>
        <View style={styles.bookHeader}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialIcons name="close" size={24} color="#222" />
          </TouchableOpacity>
        </View>
        {loadingImages ? (
          <View style={styles.funLoaderContainer}>
            <View style={styles.funLoaderCharacters}>
              <View style={[styles.funLoaderChar, { backgroundColor: '#FFD93D' }]} />
              <View style={[styles.funLoaderChar, { backgroundColor: '#FF9F43' }]} />
              <View style={[styles.funLoaderChar, { backgroundColor: '#FF6B6B' }]} />
            </View>
            <Text style={styles.funLoaderText}>Loading your story...</Text>
            <Text style={styles.funLoaderSubtext}>Preparing the pages</Text>
          </View>
        ) : (
          renderPage(currentPage)
        )}
      </View>
    </SafeAreaView>
  );
};

const saveImageToLocal = async (uri, filename) => {
  const localUri = FileSystem.documentDirectory + filename;
  try {
    await FileSystem.downloadAsync(uri, localUri);
    return localUri;
  } catch (e) {
    console.error('Error saving image locally:', e);
    return uri; // fallback to remote uri
  }
};

const getLocalImagePaths = async (storyId) => {
  try {
    const paths = await AsyncStorage.getItem(`story_images_${storyId}`);
    return paths ? JSON.parse(paths) : null;
  } catch (e) {
    return null;
  }
};

const setLocalImagePaths = async (storyId, paths) => {
  try {
    await AsyncStorage.setItem(`story_images_${storyId}`, JSON.stringify(paths));
  } catch (e) {
    // ignore
  }
};

const generateImagesFromPrompts = async (prompts) => {
  if (!prompts || prompts.length === 0) return [];
  
  const images = [];
  for (const prompt of prompts) {
    try {
      const imageUrl = await generateImageFromPromptOpenAI(prompt);
      images.push(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      images.push(null);
    }
  }
  return images;
};

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingStory, setViewingStory] = useState(null); // {story, images, loadingImages}
  const [bookImages, setBookImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [playingStory, setPlayingStory] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const savedStories = await getStories();
      const translatedStories = await getTranslatedStories();
      // Mark translated stories for UI
      const translatedStoriesWithFlag = translatedStories.map(story => ({
        ...story,
        isTranslated: true
      }));
      // Merge and sort by createdAt (descending)
      const allStories = [...savedStories, ...translatedStoriesWithFlag].sort((a, b) => {
        const aTime = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime() / 1000;
        const bTime = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime() / 1000;
        return bTime - aTime;
      });
      setStories(allStories);
    } catch (err) {
      setError('Failed to load stories. Please try again.');
      console.error('Error loading stories:', err);
    } finally {
      setLoading(false);
    }
  };

  // When user taps "View Story"
  const handleViewStory = async (story) => {
    setViewingStory(story);
    try {
      const localPaths = await getLocalImagePaths(story.id);
      if (localPaths && localPaths.length > 0) {
        setBookImages(localPaths);
      } else if (story.images && story.images.length > 0) {
        setBookImages(story.images);
      } else {
        const newImages = await generateImagesFromPrompts(story.imagePrompts);
        setBookImages(newImages);
        await saveImagesLocally(newImages, story.id);
      }
    } catch (error) {
      console.error('Error handling story view:', error);
    }
  };

  const handleRegenerateImages = async () => {
    if (!viewingStory) return;
    
    try {
      const newImages = await generateImagesFromPrompts(viewingStory.imagePrompts);
      setBookImages(newImages);
      await saveImagesLocally(newImages, viewingStory.id);
    } catch (error) {
      console.error('Error regenerating images:', error);
    }
  };

  const handleCloseBook = () => {
    setViewingStory(null);
    setBookImages([]);
    setLoadingImages(false);
  };

  const handleDeleteStory = async (storyId) => {
    try {
      await deleteStory(storyId);
      // Remove the story from local state
      setStories(stories.filter(story => story.id !== storyId));
      // Also delete local images if they exist
      await AsyncStorage.removeItem(`story_images_${storyId}`);
    } catch (error) {
      console.error('Error deleting story:', error);
      setError('Failed to delete story. Please try again.');
    }
  };

  const handlePlayStory = async (item) => {
    setPlayingStory(item);
    setAudioLoading(true);
    try {
      const text = item.isTranslated ? item.translatedStory : item.generatedStory;
      const audioBase64 = await getSpeechFromText(text);
      setAudioUri(audioBase64);
    } catch (error) {
      // Optionally show error to user
      console.error('Error playing story audio:', error);
      setPlayingStory(null);
      setAudioUri(null);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleCloseAudioStory = () => {
    setPlayingStory(null);
    setAudioUri(null);
  };

  const renderStoryItem = ({ item }) => (
    <View style={styles.storyCard}>
      <View style={styles.storyHeader}>
        <Text style={styles.storyTitle}>{item.mainIdea || 'Untitled'}</Text>
        <View style={styles.storyActions}>
          <Text style={styles.storyType}>{item.storyType || (item.language === 'ur' ? 'Urdu' : '')}</Text>
          {item.isTranslated && (
            <View style={styles.translatedBadge}>
              <MaterialIcons name="translate" size={16} color="#388e3c" />
              <Text style={styles.translatedBadgeText}>Translated</Text>
            </View>
          )}
          {!item.isTranslated && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteStory(item.id)}
            >
              <MaterialIcons name="delete" size={20} color="#c62828" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.storyDetails}>
        <Text style={styles.storyText}>Characters: {item.charNames ? item.charNames.join(', ') : ''}</Text>
        <Text style={styles.storyText}>Setting: {item.setting || ''}</Text>
        <Text style={styles.storyText}>Length: {item.storyLength || ''}</Text>
      </View>
      <View style={styles.storyContent}>
        <Text style={styles.storyText} numberOfLines={3}>
          {(item.isTranslated ? item.translatedStory : item.generatedStory).replace(/\*\*/g, '')}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <TouchableOpacity 
          style={styles.viewStoryButton}
          onPress={() => handleViewStory(item)}
        >
          <MaterialIcons name="menu-book" size={20} color="#222" />
          <Text style={styles.viewStoryButtonText}>{item.isTranslated ? 'Read Urdu Story' : 'View Story'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={() => handlePlayStory(item)}
          disabled={audioLoading && playingStory && playingStory.id === item.id}
        >
          {audioLoading && playingStory && playingStory.id === item.id ? (
            <ActivityIndicator size="small" color="#222" />
          ) : (
            <MaterialIcons name="play-circle-fill" size={28} color="#21b7c5" />
          )}
        </TouchableOpacity>
      </View>
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
          <Text style={styles.title}>My Stories</Text>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={loadStories}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : stories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="book" size={64} color="#FFD93D" />
              <Text style={styles.emptyText}>No stories yet</Text>
              <Text style={styles.emptySubtext}>Create your first story!</Text>
            </View>
          ) : (
          <FlatList
              data={stories}
            renderItem={renderStoryItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
          )}
          {viewingStory && (
            <StoryView
              story={viewingStory.generatedStory}
              images={bookImages}
              onClose={() => {
                setViewingStory(null);
                setBookImages([]);
              }}
            />
          )}
          {playingStory && audioUri && (
            <StoryView
              story={playingStory.isTranslated ? playingStory.translatedStory : playingStory.generatedStory}
              images={bookImages}
              onClose={handleCloseAudioStory}
              audioUri={audioUri}
              autoPlay={true}
              onStop={handleCloseAudioStory}
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
  imagesContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.medium,
    marginVertical: spacing.medium,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD93D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  regenerateButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: 14,
    color: '#222',
  },
  viewStoryButton: {
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
  viewStoryButtonText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.small,
    color: '#222',
  },
  bookModalContent: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.medium,
  },
  funLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  funLoaderCharacters: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  funLoaderChar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  funLoaderText: {
    fontFamily: 'Poppins',
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  funLoaderSubtext: {
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#666',
  },
  pageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.medium,
  },
  pageNumber: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#666',
    marginBottom: spacing.small,
  },
  imageWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  pageNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    backgroundColor: '#FFD93D',
    borderRadius: 24,
    padding: 12,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  backBtn: {
    backgroundColor: '#FFD93D',
    borderRadius: 24,
    padding: 12,
    alignItems: 'center',
  },
  backBtnText: {
    fontFamily: 'PoppinsBold',
    fontSize: 16,
    color: '#222',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.small,
  },
  closeButton: {
    padding: spacing.small,
  },
  storyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.small,
  },
  deleteButton: {
    padding: spacing.small,
    borderRadius: borderRadius.round,
    backgroundColor: '#FFEBEE',
  },
  translatedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: borderRadius.small,
    paddingHorizontal: spacing.tiny,
    paddingVertical: spacing.tiny,
    marginLeft: spacing.small,
  },
  translatedBadgeText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.small,
    color: '#388e3c',
  },
  playButton: { marginLeft: 12, backgroundColor: '#fff', borderRadius: 24, padding: 6, elevation: 2 },
});

export default MyStories; 