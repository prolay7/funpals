import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashSequenceScreen from '../screens/auth/SplashSequenceScreen';
import LandingScreen        from '../screens/auth/LandingScreen';
import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';

const Stack = createStackNavigator();
export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SplashSequence">
      <Stack.Screen name="SplashSequence" component={SplashSequenceScreen} />
      <Stack.Screen name="Landing"        component={LandingScreen} />
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
    </Stack.Navigator>
  );
}
