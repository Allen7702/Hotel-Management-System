/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';
import { getCookie, setCookie } from 'cookies-next';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getCookie('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config.url !== '/users/refresh-token') {
      try {
        const refreshToken = getCookie('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post('http://localhost:5000/api/users/refresh-token', { refresh_token: refreshToken });
        setCookie('access_token', data.access_token);
        setCookie('refresh_token', data.refresh_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return axios(error.config);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        toast.error('Session expired. Please log in again.');
        setCookie('access_token', '');
        setCookie('refresh_token', '');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type_id: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Dirty';
  features: Record<string, any>;
  property_id: number;
  last_cleaned: string;
}

export interface Guest {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  preferences: Record<string, any>;
  loyalty_points: number;
  loyalty_tier: 'None' | 'Bronze' | 'Silver' | 'Gold';
  gdpr_consent: boolean;
  property_id: number;
}

export interface Booking {
  id: number;
  guest_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  source: string;
  rate_applied: number;
  property_id: number;
}

export interface Invoice {
  id: number;
  booking_id: number;
  amount: number;
  tax: number;
  receipt: string;
  status: 'Pending' | 'Paid';
  payment_method: string;
  property_id: number;
}

export interface Maintenance {
  id: number;
  room_id: number;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  assignee_id: number;
  property_id: number;
  history: Record<string, any>;
}

export interface Housekeeping {
  id: number;
  room_id: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignee_id: number;
  property_id: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'Receptionist' | 'Manager' | 'Housekeeping';
  property_id: number;
}

export interface Notification {
  id: number;
  type: 'Email' | 'SMS' | 'Push';
  recipient: string;
  message: string;
  status: 'Pending' | 'Sent' | 'Failed';
  related_entity_id: number;
  entity_type: string;
  property_id: number;
}

export const login = async (username: string, password: string) => {
  const { data } = await api.post('/users/login', { username, password });
  setCookie('access_token', data.access_token);
  setCookie('refresh_token', data.refresh_token);
  return data;
};

export const getRooms = async () => {
  const { data } = await api.get<Room[]>('/rooms');
  return data;
};

export const getGuests = async () => {
  const { data } = await api.get<Guest[]>('/guests');
  return data;
};

export const getBookings = async () => {
  const { data } = await api.get<Booking[]>('/bookings');
  return data;
};

export const createBooking = async (booking: Partial<Booking>) => {
  const { data } = await api.post<Booking>('/bookings', booking);
  return data;
};

export const checkInOut = async (bookingId: number, action: 'check-in' | 'check-out') => {
  const { data } = await api.post(`/bookings/${bookingId}/${action}`);
  return data;
};

export const getInvoices = async () => {
  const { data } = await api.get<Invoice[]>('/invoices');
  return data;
};

export const getMaintenances = async () => {
  const { data } = await api.get<Maintenance[]>('/maintenances');
  return data;
};

export const createMaintenance = async (maintenance: Partial<Maintenance>) => {
  const { data } = await api.post<Maintenance>('/maintenances', maintenance);
  return data;
};

export const getHousekeepings = async () => {
  const { data } = await api.get<Housekeeping[]>('/housekeepings');
  return data;
};

export const createHousekeeping = async (housekeeping: Partial<Housekeeping>) => {
  const { data } = await api.post<Housekeeping>('/housekeepings', housekeeping);
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get<User[]>('/users');
  return data;
};

export const getNotifications = async () => {
  const { data } = await api.get<Notification[]>('/notifications');
  return data;
};

export default api;