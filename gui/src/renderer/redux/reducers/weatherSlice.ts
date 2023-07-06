import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OpenMetroResponse } from '../../../renderer/components/WeatherCards/types';
import { DataFetchStatus, SENSOR_DATA_FETCH_INTERVAL_SEC } from '../../../renderer/constants';



export interface WeatherDataState {
  readonly value: number;
  dataFetchStatus: DataFetchStatus;
  weatherData: OpenMetroResponse | null;
  fetchIntervalSec: number;
  lastFetchTimestamp: number;
}

const defaultState: WeatherDataState = {
  value: 0,
  dataFetchStatus: DataFetchStatus.NONE,
  weatherData: null,
  fetchIntervalSec: SENSOR_DATA_FETCH_INTERVAL_SEC,
  lastFetchTimestamp: 0
};

export const weatherData = createSlice({
  name: 'weatherData',
  initialState: defaultState,
  reducers: {
    setScore: (_, { payload }) => payload,
    setWeatherDataFetchStatus: (state, action: PayloadAction<DataFetchStatus>) => {
      state.dataFetchStatus = action.payload
    },
    setWeatherData: (state, action: PayloadAction<OpenMetroResponse>) => { 
      state.weatherData = action.payload
      state.lastFetchTimestamp = Math.floor(Date.now() / 1000)
    },
  },
});
  