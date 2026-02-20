/**
 * NearbyStack.tsx — Stack navigator for the Nearby tab.
 * Nearby → UserDetail
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NearbyStackParamList } from './types';
import NearbyScreen     from '../screens/nearby/NearbyScreen';
import UserDetailScreen from '../screens/nearby/UserDetailScreen';

const Stack = createStackNavigator<NearbyStackParamList>();

export default function NearbyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Nearby"     component={NearbyScreen} />
      <Stack.Screen name="UserDetail" component={UserDetailScreen} />
    </Stack.Navigator>
  );
}
