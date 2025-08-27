import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
    id: string
    username: string
    name: string
    role: string
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean | null
    isLoading: boolean | null
    error: string | null
}

const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null
        },
        loginSuccess: (state, action: PayloadAction<{ user: User, token: string }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user
            state.token = action.payload.token
            state.error = null
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null
            state.token = null
            state.error = action.payload
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false
            state.isLoading = false
            state.error = null
        },
        initializeAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.isLoading = false
            state.error = null
        },
        setInitalizing: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },
        clearError: (state) => {
            state.error = null
        }
    },
})

export const {
    loginStart,
    loginFailure,
    loginSuccess,
    logout,
    clearError,
    setInitalizing,
    initializeAuth
} = authSlice.actions

export default authSlice.reducer