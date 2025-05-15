import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import calculatorReducer from './calculatorSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    calculator: calculatorReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false })
});