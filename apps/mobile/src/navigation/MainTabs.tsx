/**
 * MainTabs.tsx — Bottom tab navigator for authenticated users.
 * Tabs: Home | Nearby | Chat | Activities | Profile
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen       from '../screens/home/HomeScreen';
import NearbyScreen     from '../screens/nearby/NearbyScreen';
import ChannelListScreen from '../screens/chat/ChannelListScreen';
import BrowseActivitiesScreen from '../screens/activities/BrowseActivitiesScreen';
import ProfileScreen    from '../screens/profile/ProfileScreen';
import { colors }       from '../theme/colors';

const Tab = createBottomTabNavigator();
const icons: Record<string, string> = { Home: '🏠', Nearby: '📍', Chat: '💬', Activities: '⚡', Profile: '👤' };

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: () => <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>,
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home"       component={HomeScreen} />
      <Tab.Screen name="Nearby"     component={NearbyScreen} />
      <Tab.Screen name="Chat"       component={ChannelListScreen} />
      <Tab.Screen name="Activities" component={BrowseActivitiesScreen} />
      <Tab.Screen name="Profile"    component={ProfileScreen} />
    </Tab.Navigator>
  );
}
