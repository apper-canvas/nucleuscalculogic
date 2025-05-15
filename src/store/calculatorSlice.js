import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  displayValue: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
  scientificMode: false,
  darkMode: false,
  memoryValue: 0,
  degrees: true,
  shiftMode: false,
  isLoading: false,
  error: null
};

export const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setDisplay: (state, action) => {
      state.displayValue = action.payload;
    },
    setPreviousValue: (state, action) => {
      state.previousValue = action.payload;
    },
    setOperation: (state, action) => {
      state.operation = action.payload;
    },
    setWaitingForOperand: (state, action) => {
      state.waitingForOperand = action.payload;
    },
    setScientificMode: (state, action) => {
      state.scientificMode = action.payload;
    },
    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
    },
    setMemoryValue: (state, action) => {
      state.memoryValue = action.payload;
    },
    setDegrees: (state, action) => {
      state.degrees = action.payload;
    },
    setShiftMode: (state, action) => {
      state.shiftMode = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    }
  },
});

export const {
  setDisplay,
  setPreviousValue,
  setOperation,
  setWaitingForOperand,
  setScientificMode,
  setDarkMode,
  setMemoryValue,
  setDegrees,
  setShiftMode,
  setIsLoading,
  setError,
  resetError
} = calculatorSlice.actions;

export default calculatorSlice.reducer;