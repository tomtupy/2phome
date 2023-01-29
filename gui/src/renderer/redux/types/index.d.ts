import { AnyAction, ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { StateType } from 'typesafe-actions'
import { RootState } from '../store';

//export type RootState = StateType<typeof import('../reducers/index').default>;
export type StandardThunk<TReturn = void> = ThunkAction<
  TReturn,
  RootState,
  unknown,
  AnyAction
>;
export type AsyncThunk<TReturn = void> = StandardThunk<Promise<TReturn>>;
export type RootDispatch = ThunkDispatch<RootState, unknown, AnyAction>