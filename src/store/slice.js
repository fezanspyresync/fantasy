const {createSlice} = require('@reduxjs/toolkit');

const initialState = {status: false};
const OfflineSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    isOnline: (state, action) => {
      console.log('store info', action.payload);
      state.status = action.payload;
    },
  },
});

export const {isOnline} = OfflineSlice.actions;
export const offLineSliceReducer = OfflineSlice.reducer;
