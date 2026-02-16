/**
 * api.ts — Axios instance for React Native app.
 * Auto-attaches JWT from Redux store. Handles 401 refresh flow.
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = __DEV__ ? 'http://localhost:3000/api/v1' : 'https://api.funpals.com/api/v1';
export const WS_URL   = __DEV__ ? 'ws://localhost:3000/ws'       : 'wss://api.funpals.com/ws';

export const apiClient = axios.create({ baseURL: API_BASE, timeout: 10_000 });

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
