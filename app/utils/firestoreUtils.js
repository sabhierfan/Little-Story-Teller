import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, serverTimestamp, where } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { auth } from './firebase';

// Save a story to Firestore
export const saveStory = async (storyData) => {
  try {
    const docRef = await addDoc(collection(db, 'stories'), {
      ...storyData,
      createdAt: new Date(),
      type: 'story'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
};

// Save a dialogue to Firestore
export const saveDialogue = async (dialogueData) => {
  try {
    const docRef = await addDoc(collection(db, 'dialogues'), {
      ...dialogueData,
      createdAt: new Date(),
      type: 'dialogue'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving dialogue:', error);
    throw error;
  }
};

// Get all stories
export const getStories = async () => {
  try {
    const q = query(collection(db, 'stories'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stories:', error);
    throw error;
  }
};

// Get all dialogues
export const getDialogues = async () => {
  try {
    const q = query(collection(db, 'dialogues'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting dialogues:', error);
    throw error;
  }
};

// Delete a story from Firestore
export const deleteStory = async (storyId) => {
  try {
    await deleteDoc(doc(db, 'stories', storyId));
    return true;
  } catch (error) {
    console.error('Error deleting story:', error);
    throw error;
  }
};

export const saveTranslatedStory = async (translatedStory) => {
  try {
    const docRef = await addDoc(collection(db, 'translatedStories'), {
      ...translatedStory,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving translated story:', error);
    throw error;
  }
};

export const getTranslatedStories = async () => {
  try {
    const q = query(
      collection(db, 'translatedStories'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting translated stories:', error);
    throw error;
  }
}; 