import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Login from '../auth/login';
import Signup from '../auth/signup';
import LandingScreen from '../tabs/index';
import StoryGen from '../storygen/index';
import DialogueGen from '../dialoguegen/DialogueCard';
import MyStories from '../mystories/MyStories';
import MyDialogues from '../mydialogues/MyDialogues';
import Profile from '../profile/Profile';
import TranslateStories from '../translate/TranslateStories';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#E6E6FA',
          width: 280,
        },
        drawerLabelStyle: {
          fontFamily: 'Poppins',
          fontSize: 16,
          color: '#222',
        },
        drawerActiveBackgroundColor: '#FFD93D',
        drawerActiveTintColor: '#222',
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

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation; 