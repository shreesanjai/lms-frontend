import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AppDispatch, rootState } from "../store";
import { initializeAuth, loginFailure, loginStart, loginSuccess, logout, setInitalizing } from "../slices/authSlice";
import {
    cleanupExpiredToken,
    getDecryptedToken,
    getUserDatafromToken,
    isTokenExpired,
    removeStoredToken,
    storeEncyptedToken
} from "@/utils/Token";

import { loginApi, type LoginRequest } from "@/api/api";

export const initializeAuthThunk = createAsyncThunk<void, void, { dispatch: AppDispatch, state: rootState }>('auth/initialize', async (_, { dispatch }) => {

    dispatch(setInitalizing(true));

    try {
        cleanupExpiredToken();

        const storedToken = getDecryptedToken();

        if (storedToken && !isTokenExpired(storedToken)) {
            const userData = getUserDatafromToken(storedToken)

            if (userData)
                dispatch(initializeAuth({
                    user: userData,
                    token: storedToken
                }))

        }
    } catch (error) {
        console.error(error);
        removeStoredToken();

    } finally {
        dispatch(setInitalizing(false))
    }
})

export const loginThunk = createAsyncThunk<void, LoginRequest, { dispatch: AppDispatch, state: rootState }>('auth/login', async (credentials, { dispatch, rejectWithValue }) => {

    dispatch(loginStart());

    try {
        const resp = await loginApi(credentials);

        storeEncyptedToken(resp.token)


        dispatch(loginSuccess({
            user: resp.user,
            token: resp.token
        }))

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        dispatch(loginFailure(errorMessage))
        rejectWithValue(errorMessage)
    }

})

export const logoutThunk = createAsyncThunk<void, void, { dispatch: AppDispatch, state: rootState }>('auth/logout', async (_, { dispatch }) => {
    try {
        removeStoredToken();
        dispatch(logout());

    } catch (error) {
        console.error('Error during logout:', error);
    }
})

