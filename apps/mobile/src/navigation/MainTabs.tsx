/**
 * MainTabs.tsx — Bottom tab navigator for authenticated users.
 * Each tab hosts its own stack so sub-screens (ChatRoom, UserDetail, etc.)
 * sit inside the correct tab and keep the tab bar visible.
 *
 * Tabs: Home | Nearby | Chat | Activities | Profile
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeStack       from './HomeStack';
import NearbyStack     from './NearbyStack';
import ChatStack       from './ChatStack';
import ActivitiesStack from './ActivitiesStack';
import ProfileStack    from './ProfileStack';
import { colors }      from '../theme/colors';

const Tab = createBottomTabNavigator();

const icons: Record<string, string> = {
  HomeTab:       '🏠',
  NearbyTab:     '📍',
  ChatTab:       '💬',
  ActivitiesTab: '⚡',
  ProfileTab:    '👤',
};

const labels: Record<string, string> = {
  HomeTab:       'Home',
  NearbyTab:     'Nearby',
  ChatTab:       'Chat',
  ActivitiesTab: 'Activities',
  ProfileTab:    'Profile',
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon:              () => <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>,
        tabBarLabel:             labels[route.name],
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle:             { backgroundColor: colors.surface, borderTopColor: colors.border },
        headerShown:             false,
      })}
    >
      <Tab.Screen name="HomeTab"       component={HomeStack} />
      <Tab.Screen name="NearbyTab"     component={NearbyStack} />
      <Tab.Screen name="ChatTab"       component={ChatStack} />
      <Tab.Screen name="ActivitiesTab" component={ActivitiesStack} />
      <Tab.Screen name="ProfileTab"    component={ProfileStack} />
    </Tab.Navigator>
  );
}
