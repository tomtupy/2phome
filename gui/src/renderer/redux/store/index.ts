import {
  getDefaultMiddleware,
  createStore,
  applyMiddleware,
} from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from '../reducers/index'

const middleware = getDefaultMiddleware({
  serializableCheck: false,
})

const configureStore = () => {
  const store = createStore(
    reducer,
    composeWithDevTools(applyMiddleware(...middleware))
  )
  return store;
};

export const store = configureStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;