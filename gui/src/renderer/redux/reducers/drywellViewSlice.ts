import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataFetchStatus, IMAGERY_FETCH_INTERVAL_SEC } from 'renderer/constants';


export interface DrywellViewState {
  readonly value: number;
  dataFetchStatus: DataFetchStatus;
  imageFiles: string[];
  lastFetchTimestamp: number;
  latestImageTimestamp: number;
  fetchIntervalSec: number;
  currentAnimationIndex: number;
}

const defaultState: DrywellViewState = {
  value: 0,
  dataFetchStatus: DataFetchStatus.NONE,
  imageFiles: [],
  latestImageTimestamp: 0,
  lastFetchTimestamp: Math.floor(Date.now() / 1000),
  fetchIntervalSec: IMAGERY_FETCH_INTERVAL_SEC,
  currentAnimationIndex: 0
};

export const drywellView = createSlice({
  name: 'drywellView',
  initialState: defaultState,
  reducers: {
    setScore: (_, { payload }) => payload,
    setDrywellImageryFetchStatus: (state, action: PayloadAction<DataFetchStatus>) => {
      state.dataFetchStatus = action.payload
    },
    setDrywellImageryData: (state, action: PayloadAction<string[]>) => { 
      state.imageFiles = action.payload
      state.latestImageTimestamp = parseInt(action.payload.at(-1)!.replace("wellcam_", ''))
      state.lastFetchTimestamp = Math.floor(Date.now() / 1000)
    },
    setAnimationIndex: (state, action: PayloadAction<number>) => { 
      state.currentAnimationIndex = action.payload
    },
  },
});
  
