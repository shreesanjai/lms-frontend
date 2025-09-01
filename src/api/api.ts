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

interface leaveRequest {
    startDate: Date | undefined;
    endDate: Date | undefined;
    no_of_days: number;
    policy_id: number;
    notes: string
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

export const searchUser = async (searchTerm: string) => {
    const response = await apiClient.get(`/user/search?q=${searchTerm}`)
    return response.data
}

export const getworkingDays = async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/leave-requests/workingDays?startDate=${startDate}&endDate=${endDate}`)
    return response.data
}

export const getPolicyTypes = async () => {
    const response = await apiClient.get(`/policy`)
    return response.data
}

export const createLeaveRequest = async (data: leaveRequest) => {
    const response = await apiClient.post(`/leave-requests`, data)
    return response.data;
}

export const myPendingRequests = async () => {
    const response = await apiClient.get(`/leave-requests/my_pending_requests`)
    return response.data;
}

export const checkFloaterAvailable = async (startDate: string, endDate: string) => {
    const response = await apiClient.get(`/leave-requests/isFloater?startDate=${startDate}&endDate=${endDate}`)
    return response.data
}

export const getMyPeerPendingRequests = async () => {
    const response = await apiClient.get(`/leave-requests/peer_approval`)
    return response.data
}

export const approveRequest = async (id: string) => {
    const response = await apiClient.get(`/leave-requests/approve?id=${id}`)
    return response.data
}
export const rejectRequest = async (id: string) => {
    const response = await apiClient.get(`/leave-requests/reject?id=${id}`)
    return response.data
}
export const cancelRequest = async (id: string) => {
    const response = await apiClient.get(`/leave-requests/cancel?id=${id}`)
    return response.data
}