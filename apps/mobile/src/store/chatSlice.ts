/**
 * chatSlice.ts — Real-time chat messages indexed by channelId.
 * Messages are appended by the WebSocket handler (useChatRoom hook).
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message { id: string; content: string; sender_id: string; sender_name: string; created_at: string; type: string }
interface ChatState { messagesByChannel: Record<string, Message[]>; typingByChannel: Record<string, string[]> }

const chatSlice = createSlice({
  name: 'chat',
  initialState: { messagesByChannel: {}, typingByChannel: {} } as ChatState,
  reducers: {
    appendMessage: (state, action: PayloadAction<{ channelId: string; message: Message }>) => {
      const { channelId, message } = action.payload;
      if (!state.messagesByChannel[channelId]) state.messagesByChannel[channelId] = [];
      const exists = state.messagesByChannel[channelId].find(m => m.id === message.id);
      if (!exists) state.messagesByChannel[channelId].push(message);
    },
    setMessages: (state, action: PayloadAction<{ channelId: string; messages: Message[] }>) => {
      state.messagesByChannel[action.payload.channelId] = action.payload.messages;
    },
    setTyping: (state, action: PayloadAction<{ channelId: string; userId: string; isTyping: boolean }>) => {
      const { channelId, userId, isTyping } = action.payload;
      if (!state.typingByChannel[channelId]) state.typingByChannel[channelId] = [];
      if (isTyping && !state.typingByChannel[channelId].includes(userId)) {
        state.typingByChannel[channelId].push(userId);
      } else {
        state.typingByChannel[channelId] = state.typingByChannel[channelId].filter(id => id !== userId);
      }
    },
  },
});
export const { appendMessage, setMessages, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
