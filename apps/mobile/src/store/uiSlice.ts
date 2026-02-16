import { createSlice, PayloadAction } from '@reduxjs/toolkit';
interface UIState { loading: boolean; toastMessage: string | null }
const uiSlice = createSlice({
  name: 'ui', initialState: { loading: false, toastMessage: null } as UIState,
  reducers: {
    setLoading: (state, a: PayloadAction<boolean>) => { state.loading = a.payload; },
    showToast:  (state, a: PayloadAction<string>)  => { state.toastMessage = a.payload; },
    clearToast: (state)                             => { state.toastMessage = null; },
  },
});
export const { setLoading, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;
