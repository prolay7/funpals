/**
 * store/index.ts — Redux store with RTK Query API slices.
 */
import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSliceReducer from './authSlice';
import chatSliceReducer from './chatSlice';
import uiSliceReducer   from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    chat: chatSliceReducer,
    ui:   uiSliceReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
