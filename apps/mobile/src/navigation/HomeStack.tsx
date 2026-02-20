/**
 * HomeStack.tsx — Stack navigator for the Home tab.
 * Home → Calendar → EventDetail
 *      → OpenPosts
 *      → OpenQuestions
 *      → GlobalShare
 *      → Search
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeStackParamList } from './types';
import HomeScreen          from '../screens/home/HomeScreen';
import CalendarScreen      from '../screens/calendar/CalendarScreen';
import EventDetailScreen   from '../screens/calendar/EventDetailScreen';
import OpenPostsScreen     from '../screens/posts/OpenPostsScreen';
import OpenQuestionsScreen from '../screens/questions/OpenQuestionsScreen';
import GlobalShareScreen   from '../screens/share/GlobalShareScreen';
import SearchScreen        from '../screens/search/SearchScreen';

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"           component={HomeScreen} />
      <Stack.Screen name="Calendar"       component={CalendarScreen} />
      <Stack.Screen name="EventDetail"    component={EventDetailScreen} />
      <Stack.Screen name="OpenPosts"      component={OpenPostsScreen} />
      <Stack.Screen name="OpenQuestions"  component={OpenQuestionsScreen} />
      <Stack.Screen name="GlobalShare"    component={GlobalShareScreen} />
      <Stack.Screen name="Search"         component={SearchScreen} />
    </Stack.Navigator>
  );
}
