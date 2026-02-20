/**
 * ChatStack.tsx — Stack navigator for the Chat tab.
 * ChannelList → ChatRoom
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ChatStackParamList } from './types';
import ChannelListScreen from '../screens/chat/ChannelListScreen';
import ChatRoomScreen    from '../screens/chat/ChatRoomScreen';

const Stack = createStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChannelList" component={ChannelListScreen} />
      <Stack.Screen name="ChatRoom"    component={ChatRoomScreen} />
    </Stack.Navigator>
  );
}
