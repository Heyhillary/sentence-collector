import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

import { sendRequest } from '../backend';
import type { RootState, UserStats } from '../types';
import { addLanguageSuccess } from './languages';
import { settingsChanged } from './settings';

export const ACTION_LOGOUT = 'LOGOUT';
export const ACTION_LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const ACTION_NOT_LOGGED_IN = 'NOT_LOGGED_IN';
export const ACTION_USER_INFO_RECEIVED = 'USER_INFO_RECEIVED';

type UserInfo = {
  languages: string[];
  settings: Record<string, unknown>;
  email: string;
  userStats: UserStats;
};

export function afterLogin(): ThunkAction<void, RootState, unknown, AnyAction> {
  return async function (dispatch) {
    dispatch(loginSuccess());
  };
}

export function checkCurrentUser(): ThunkAction<void, RootState, unknown, AnyAction> {
  return async function (dispatch) {
    try {
      const userInfo = await sendRequest<UserInfo>('users/whoami');
      dispatch(userInfoReceived(userInfo));
      dispatch(addLanguageSuccess(userInfo.languages));
      dispatch(settingsChanged(userInfo.settings));
    } catch (error) {
      dispatch(logoutSuccess());
    }
  };
}

export function logout(): ThunkAction<void, RootState, unknown, AnyAction> {
  return async function (dispatch) {
    dispatch(logoutSuccess());
  };
}

export function logoutSuccess() {
  return {
    type: ACTION_LOGOUT,
  };
}

export function loginSuccess() {
  return {
    type: ACTION_LOGIN_SUCCESS,
  };
}

export function userInfoReceived(userInfo: UserInfo) {
  return {
    type: ACTION_USER_INFO_RECEIVED,
    username: userInfo.email,
    userStats: userInfo.userStats,
  };
}
