import { combineReducers } from "@reduxjs/toolkit";
import { liveEarthView } from '../reducers/liveEarthViewSlice';
import { drywellView } from "./drywellViewSlice";
import { weatherData } from "./weatherSlice";

const reducer = combineReducers({
  liveEarthView: liveEarthView.reducer,
  drywellView: drywellView.reducer,
  weatherData: weatherData.reducer,
});

export default reducer;