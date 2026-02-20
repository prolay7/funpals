/**
 * AppNavigator.tsx — Root navigator.
 * Switches between AuthStack (unauthenticated) and MainTabs (authenticated)
 * based on Redux auth state.
 * Toast is rendered outside NavigationContainer so it overlays all screens.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppSelector } from '../store';
import AuthStack from './AuthStack';
import MainTabs  from './MainTabs';
import { Toast } from '../components/common';

export default function AppNavigator() {
  const isAuthenticated = useAppSelector(s => !!s.auth.token);
  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <NavigationContainer>
          {isAuthenticated ? <MainTabs /> : <AuthStack />}
        </NavigationContainer>
        {/* Toast overlays all screens — must be outside NavigationContainer */}
        <Toast />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
