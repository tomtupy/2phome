import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataFetchStatus, SENSOR_DATA_FETCH_INTERVAL_SEC } from 'renderer/constants';


export interface SensorData {
    readonly value: number;
    data: string[];
    lastFetchTimestamp: number;
    latestDataPointTimestamp: number;
  }

export interface SensorDataState {
  readonly value: number;
  dataFetchStatus: DataFetchStatus;
  sensorNames: {};
  sensorData: Record<number, SensorData>;
  fetchIntervalSec: number;
}

const defaultState: SensorDataState = {
  value: 0,
  dataFetchStatus: DataFetchStatus.NONE,
  sensorNames: { 
    1234: 'ground_temp',
    1235: 'roof_temp_far_west',
    1236: 'roof_temp_hum_west',
    1237: 'roof_temp_hum_north',
    1238: 'roof_temp_far_south',
    1239: 'roof_temp_south',
    1240: 'roof_temp_far_north',
  },
  sensorData: {},
  fetchIntervalSec: SENSOR_DATA_FETCH_INTERVAL_SEC
};

export const sensorData = createSlice({
  name: 'sensorData',
  initialState: defaultState,
  reducers: {
    setScore: (_, { payload }) => payload,
    setSensorDataFetchStatus: (state, action: PayloadAction<DataFetchStatus>) => {
      state.dataFetchStatus = action.payload
    },
    setSensorData: (state, action: PayloadAction<string[]>) => { 
      //state.sensorData = action.payload
      //state.latestImageTimestamp = moment.utc(action.payload.at(-1)!.replace("lev_", ''), 'YYYYDDDHHmm').unix()
      //state.lastFetchTimestamp = Math.floor(Date.now() / 1000)
    },
  },
});
  
