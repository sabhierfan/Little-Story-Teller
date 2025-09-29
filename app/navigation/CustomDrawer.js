import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { MaterialIcons } from '@expo/vector-icons';
import { fontSize, spacing, borderRadius, iconSize } from '../utils/responsive';

const CustomDrawer = (props) => {
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            if (props.onLogout) {
              props.onLogout();
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Little Storyteller</Text>
        </View>

        <View style={styles.drawerContent}>
          {props.state.routes.map((route, index) => {
            const isFocused = props.state.index === index;
            const icon = getIconForRoute(route.name);
            
            return (
              <TouchableOpacity
                key={route.key}
                style={[
                  styles.drawerItem,
                  isFocused && styles.drawerItemFocused,
                ]}
                onPress={() => props.navigation.navigate(route.name)}
              >
                <MaterialIcons
                  name={icon}
                  size={24}
                  color={isFocused ? '#222' : '#666'}
                />
                <Text
                  style={[
                    styles.drawerItemText,
                    isFocused && styles.drawerItemTextFocused,
                  ]}
                >
                  {props.descriptors[route.key].options.title || route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons name="logout" size={24} color="#c62828" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
};

const getIconForRoute = (routeName) => {
  switch (routeName) {
    case 'Home':
      return 'home';
    case 'StoryGen':
      return 'book';
    case 'DialogueGen':
      return 'chat';
    case 'MyStories':
      return 'library-books';
    case 'MyDialogues':
      return 'chat-bubble';
    case 'Profile':
      return 'person';
    default:
      return 'help';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.medium,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: spacing.small,
  },
  title: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.large,
    color: '#222',
  },
  drawerContent: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.small,
  },
  drawerItemFocused: {
    backgroundColor: '#FFD93D',
  },
  drawerItemText: {
    fontFamily: 'Poppins',
    fontSize: fontSize.medium,
    color: '#666',
    marginLeft: spacing.medium,
  },
  drawerItemTextFocused: {
    color: '#222',
    fontFamily: 'PoppinsBold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderRadius: borderRadius.medium,
    marginTop: spacing.large,
    backgroundColor: '#FFF9D6',
  },
  logoutText: {
    fontFamily: 'PoppinsBold',
    fontSize: fontSize.medium,
    color: '#c62828',
    marginLeft: spacing.medium,
  },
});

export default CustomDrawer; 