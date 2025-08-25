import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer
    },

    devTools: import.meta.env.VITE_NODE_ENV
})

export type rootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch