import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataFetchStatus, SENSOR_DATA_FETCH_INTERVAL_SEC } from 'renderer/constants';


export interface SensorDataState {
  readonly value: number;
  dataFetchStatus: DataFetchStatus;
  sensorNames: {};
  data: Record<number, SensorDataEntry>;
  fetchIntervalSec: number;
  lastFetchTimestamp: number;
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
  data: {},
  fetchIntervalSec: SENSOR_DATA_FETCH_INTERVAL_SEC,
  lastFetchTimestamp: 0
};

export const sensorData = createSlice({
  name: 'sensorData',
  initialState: defaultState,
  reducers: {
    setScore: (_, { payload }) => payload,
    setSensorDataFetchStatus: (state, action: PayloadAction<DataFetchStatus>) => {
      state.dataFetchStatus = action.payload
    },
    setSensorData: (state, action: PayloadAction<SensorDataEntry[]>) => {
      state.data = action.payload.reduce((acc, item) => (acc[item.sensor_id] = item, acc), {} as Record<number, SensorDataEntry>);
      state.lastFetchTimestamp = Math.floor(Date.now() / 1000)
    },
  },
});
