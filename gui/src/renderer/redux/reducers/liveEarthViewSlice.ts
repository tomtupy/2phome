import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment from "moment"
import { DataFetchStatus, IMAGERY_FETCH_INTERVAL_SEC } from 'renderer/constants';


export interface LiveEarthViewState {
  readonly value: number;
  dataFetchStatus: DataFetchStatus;
  imageFiles: string[];
  lastFetchTimestamp: number;
  latestImageTimestamp: number;
  fetchIntervalSec: number;
  currentAnimationIndex: number;
}

const defaultState: LiveEarthViewState = {
  value: 0,
  dataFetchStatus: DataFetchStatus.NONE,
  imageFiles: [],
  latestImageTimestamp: 0,
  lastFetchTimestamp: Math.floor(Date.now() / 1000),
  fetchIntervalSec: IMAGERY_FETCH_INTERVAL_SEC,
  currentAnimationIndex: 0
};

export const liveEarthView = createSlice({
  name: 'liveEarthView',
  initialState: defaultState,
  reducers: {
    setScore: (_, { payload }) => payload,
    setImageryDataFetchStatus: (state, action: PayloadAction<DataFetchStatus>) => {
      state.dataFetchStatus = action.payload
    },
    setImageryData: (state, action: PayloadAction<string[]>) => { 
      state.imageFiles = action.payload
      state.latestImageTimestamp = moment.utc(action.payload.at(-1)!.replace("lev_", ''), 'YYYYDDDHHmm').unix()
      state.lastFetchTimestamp = Math.floor(Date.now() / 1000)
    },
    setAnimationIndex: (state, action: PayloadAction<number>) => { 
      state.currentAnimationIndex = action.payload
    },
  },
});
  
