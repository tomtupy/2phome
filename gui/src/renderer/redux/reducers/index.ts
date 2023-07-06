import { combineReducers } from "@reduxjs/toolkit";
import { liveEarthView } from '../reducers/liveEarthViewSlice';
import { drywellView } from "./drywellViewSlice";
import { sensorData } from "./sensorDataSlice";
import { weatherData } from "./weatherSlice";

const reducer = combineReducers({
  liveEarthView: liveEarthView.reducer,
  drywellView: drywellView.reducer,
  weatherData: weatherData.reducer,
  sensorData: sensorData.reducer
});

export default reducer;