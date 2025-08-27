import { getDecryptedToken } from '@/utils/Token';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;


export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string,
        username: string,
        role: string
    };
}

export interface UserData {
    name: string;
    username: string;
    role: string;
    department: string;
    password: string;
    reporting_manager_id: string;
}


const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});



apiClient.interceptors.request.use(
    (config) => {
        const token = getDecryptedToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Server responded with error status
            const message = error.response.data?.message || error.response.data?.error || `HTTP error! status: ${error.response.status}`;
            throw new Error(message);
        } else if (error.request) {
            // Network error
            throw new Error('Network error - please check your connection');
        } else {
            throw new Error('Request failed');
        }
    }
);


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const loginApi = async (credentials: any) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
};


export const getUserProfile = async () => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
};

export const addUser = async (userData: UserData) => {
    const response = await apiClient.post('/user', userData)
    return response.data
}