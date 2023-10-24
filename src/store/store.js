import {configureStore} from '@reduxjs/toolkit';
import {offLineSliceReducer} from './slice';

const store = configureStore({
  reducer: {
    UserCurrentStatus: offLineSliceReducer,
  },
});

export default store;
