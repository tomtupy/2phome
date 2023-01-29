import { combineReducers } from "@reduxjs/toolkit";
import { liveEarthView } from '../reducers/liveEarthViewSlice';
import { drywellView } from "./drywellViewSlice";

const reducer = combineReducers({
  liveEarthView: liveEarthView.reducer,
  drywellView: drywellView.reducer,
});

export default reducer;