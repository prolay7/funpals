/**
 * AppNavigator.tsx — Root navigator.
 * Switches between AuthStack (unauthenticated) and MainTabs (authenticated)
 * based on Redux auth state.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAppSelector } from '../store';
import AuthStack from './AuthStack';
import MainTabs  from './MainTabs';

export default function AppNavigator() {
  const isAuthenticated = useAppSelector(s => !!s.auth.token);
  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
