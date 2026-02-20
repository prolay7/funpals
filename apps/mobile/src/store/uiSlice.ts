import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'success' | 'error' | 'info';

interface UIState {
  loading:      boolean;
  toastMessage: string | null;
  toastType:    ToastType;
}

const uiSlice = createSlice({
  name: 'ui',
  initialState: { loading: false, toastMessage: null, toastType: 'info' } as UIState,
  reducers: {
    setLoading: (state, a: PayloadAction<boolean>) => { state.loading = a.payload; },
    showToast:  (state, a: PayloadAction<{ message: string; type?: ToastType }>) => {
      state.toastMessage = a.payload.message;
      state.toastType    = a.payload.type ?? 'info';
    },
    clearToast: (state) => { state.toastMessage = null; },
  },
});

export const { setLoading, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
