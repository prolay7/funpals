/**
 * ActivitiesStack.tsx — Stack navigator for the Activities tab.
 * BrowseActivities → ActivityDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivitiesStackParamList } from './types';
import BrowseActivitiesScreen from '../screens/activities/BrowseActivitiesScreen';
import ActivityDetailScreen   from '../screens/activities/ActivityDetailScreen';

const Stack = createStackNavigator<ActivitiesStackParamList>();

export default function ActivitiesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BrowseActivities" component={BrowseActivitiesScreen} />
      <Stack.Screen name="ActivityDetail"   component={ActivityDetailScreen} />
    </Stack.Navigator>
  );
}
