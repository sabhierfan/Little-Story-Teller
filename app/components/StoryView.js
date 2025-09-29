import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { fontSize, spacing, borderRadius, iconSize, responsiveStyles } from '../utils/responsive';

const { width, height } = Dimensions.get('window');

function splitIntoSentences(text) {
  if (!text) return [];
  // Remove asterisks from text
  const cleanText = text.replace(/\*\*/g, '');
  // Simple sentence splitter (handles . ! ?)
  return cleanText.match(/[^.!?\n]+[.!?\n]+|[^.!?\n]+$/g) || [];
}

// Split story into exactly 8 parts
function splitStoryIntoPages(storyText) {
  if (!storyText) return Array(8).fill('');
  
  // Split the story into sentences
  const sentences = splitIntoSentences(storyText);
  const totalSentences = sentences.length;
  const sentencesPerPage = Math.ceil(totalSentences / 8);
  
  // Create 8 pages with equal distribution of sentences
  const pages = [];
  for (let i = 0; i < 8; i++) {
    const start = i * sentencesPerPage;
    const end = Math.min(start + sentencesPerPage, totalSentences);
    const pageSentences = sentences.slice(start, end);
    pages.push(pageSentences.join(' '));
  }
  
  return pages;
}

const StoryView = ({ story, images, onClose, audioUri, autoPlay, onStop }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [audioLoading, setAudioLoading] = useState(false);
  const progressInterval = useRef(null);

  const pages = splitStoryIntoPages(story);

  useEffect(() => {
    if (audioUri && autoPlay) {
      playAudio();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [audioUri]);

  const playAudio = async () => {
    setAudioLoading(true);
    try {
      if (sound) {
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
      const status = await newSound.getStatusAsync();
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      progressInterval.current = setInterval(async () => {
        const s = await newSound.getStatusAsync();
        setPosition(s.positionMillis || 0);
        setIsPlaying(s.isPlaying);
        if (s.didJustFinish) {
          setIsPlaying(false);
          clearInterval(progressInterval.current);
        }
      }, 250);
    } catch (e) {
      // handle error
    } finally {
      setAudioLoading(false);
    }
  };

  const pauseAudio = async () => {
    if (sound && isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else if (sound && !isPlaying) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
      setSound(null);
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    if (onStop) onStop();
    if (onClose) onClose();
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.bookContainer}>
            <View style={styles.bookHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={24} color="#222" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.bookContent}>
              <View style={styles.pageContainer}>
                {pages.map((page, index) => (
                  <View key={index} style={styles.pageContent}>
                    <View style={styles.page}>
                      <Text style={styles.pageText}>{page}</Text>
                      {images && images[index] && (
                        <View style={styles.imageWrapper}>
                          <Image
                            source={{ uri: images[index] }}
                            style={styles.storyImage}
                            resizeMode="cover"
                          />
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
            {/* Audio Controls */}
            {audioUri && (
              <View style={styles.audioControlsContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progress * 100}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.audioButtonsRow}>
                  <TouchableOpacity
                    style={styles.audioBtn}
                    onPress={pauseAudio}
                    disabled={audioLoading}
                  >
                    <MaterialIcons
                      name={isPlaying ? 'pause-circle-filled' : 'play-circle-filled'}
                      size={iconSize.large}
                      color="#FFD93D"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.audioBtn}
                    onPress={stopAudio}
                    disabled={audioLoading}
                  >
                    <MaterialIcons
                      name="stop-circle"
                      size={iconSize.large}
                      color="#FFD93D"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bookContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.medium,
  },
  closeButton: {
    padding: spacing.small,
  },
  bookContent: {
    flex: 1,
  },
  pageContainer: {
    padding: spacing.medium,
  },
  pageContent: {
    marginBottom: spacing.large,
  },
  page: {
    backgroundColor: '#fff',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#444',
    lineHeight: fontSize.medium * 1.5,
    marginBottom: spacing.medium,
  },
  imageWrapper: {
    marginTop: spacing.medium,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.medium,
  },
  audioControlsContainer: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    width: '90%',
    height: 8,
    backgroundColor: '#FFF9D6',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    alignSelf: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFD93D',
    borderRadius: 8,
  },
  audioButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 24,
  },
  audioBtn: {
    marginHorizontal: 12,
  },
});

export default StoryView; 