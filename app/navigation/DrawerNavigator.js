import React, { useEffect } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import { BackHandler, Alert } from 'react-native';
import { auth } from '../utils/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import LandingScreen from '../tabs/index';
import StoryGen from '../storygen/StoryCard';
import DialogueGen from '../dialoguegen/DialogueCard';
import MyStories from '../mystories/MyStories';
import MyDialogues from '../mydialogues/MyDialogues';
import Profile from '../profile/Profile';
import TranslateStories from '../translate/TranslateStories';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      Alert.alert(
        'Exit App',
        'Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => BackHandler.exitApp(),
          },
        ],
        { cancelable: false }
      );
      return true;
    });

    return () => backHandler.remove();
  }, [navigation]);

  const handleLogout = async () => {
    try {
      // Clear any local state or data before signing out
      await signOut(auth);
      // The auth state listener in App.js will handle the navigation
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        'Logout Error',
        'There was an error logging out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} onLogout={handleLogout} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: '80%',
        },
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={LandingScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="home-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="StoryGen" 
        component={StoryGen}
        options={{
          title: "Let's Create Story",
          drawerIcon: ({ color }) => (
            <Ionicons name="book-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="DialogueGen" 
        component={DialogueGen}
        options={{
          title: "Let's Create Dialogue",
          drawerIcon: ({ color }) => (
            <Ionicons name="chatbubbles-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="MyStories" 
        component={MyStories}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="library-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="MyDialogues" 
        component={MyDialogues}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={Profile}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="person-outline" size={24} color={color} />
          ),
        }}
      />
      <Drawer.Screen 
        name="TranslateStories" 
        component={TranslateStories}
        options={{
          title: "Translate Stories",
          drawerIcon: ({ color }) => (
            <Ionicons name="language-outline" size={24} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator; 