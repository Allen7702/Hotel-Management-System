/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import axios, { AxiosInstance } from 'axios';
import { toast } from 'react-toastify';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false; // Prevent multiple simultaneous refresh attempts

export const setupAxiosInterceptors = (token: string | null, refreshTokenFn: () => Promise<void>) => {
  api.interceptors.request.clear();
  if (token) {
    api.interceptors.request.use(
      (config) => {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && error.config.url !== '/users/refresh-token' && !error.config._retry) {
        if (isRefreshing) {
          // Wait for the ongoing refresh to complete
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (!isRefreshing) {
                clearInterval(interval);
                resolve(null);
              }
            }, 100);
          });
          const newToken = localStorage.getItem('token');
          if (newToken) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            error.config._retry = true;
            return axios(error.config);
          }
        }

        isRefreshing = true;
        error.config._retry = true;

        try {
          await refreshTokenFn();
          const newToken = localStorage.getItem('token');
          if (!newToken) {
            throw new Error('No new token after refresh');
          }
          error.config.headers.Authorization = `Bearer ${newToken}`;
          isRefreshing = false;
          return axios(error.config);
        } catch (refreshError) {
          isRefreshing = false;
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError); // Ensure no code runs after redirect
        }
      }
      return Promise.reject(error);
    }
  );
};

export interface User {
  id: number;
  username: string;
  role: 'Receptionist' | 'Manager' | 'Housekeeping';
  property_id: number;
}

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

export const getUsers = async () => {
  const { data } = await api.get<User[]>('/users');
  return data;
};

export const createUser = async (data: { username: string; email: string; password: string; role: string; property_id: number }) => {
  const { data: response } = await api.post<User>('/users', data);
  return response;
};

export const getRooms = async (params?: { status?: string; floor?: number }) => {
  const { data } = await api.get<Room[]>('/rooms', { params });
  return data;
};

export const createRoom = async (data: { room_number: string; floor: number; room_type_id: number; status: string; features?: object; property_id: number }) => {
  const { data: response } = await api.post<Room>('/rooms', data);
  return response;
};

export const updateRoom = async (id: number, data: { room_number?: string; floor?: number; room_type_id?: number; status?: string; features?: object }) => {
  const { data: response } = await api.put<Room>(`/rooms/${id}`, data);
  return response;
};

export const deleteRoom = async (id: number) => {
  const { data } = await api.delete(`/rooms/${id}`);
  return data;
};

export const getRoomAvailability = async (params: { start_date: string; end_date: string; room_type_id?: number; property_id: number }) => {
  const { data } = await api.get<Room[]>('/rooms/availability', { params });
  return data;
};

export const getBookings = async (params?: { start_date?: string; end_date?: string }) => {
  const { data } = await api.get<Booking[]>('/bookings', { params });
  return data;
};

export const createBooking = async (data: { guest_id: number; room_id: number; check_in: string; check_out: string; source: string; rate_applied: number; property_id: number }) => {
  const { data: response } = await api.post<Booking>('/bookings', data);
  return response;
};

export const checkInBooking = async (id: number) => {
  const { data } = await api.put(`/bookings/${id}/check-in`);
  return data;
};

export const checkOutBooking = async (id: number, payment_method: string) => {
  const { data } = await api.put(`/bookings/${id}/check-out`, { payment_method });
  return data;
};

export const cancelBooking = async (id: number) => {
  const { data } = await api.put(`/bookings/${id}/cancel`);
  return data;
};

export const getGuests = async (params?: { email?: string; loyalty_tier?: string }) => {
  const { data } = await api.get<Guest[]>('/guests', { params });
  return data;
};

export const getGuest = async (id: number) => {
  const { data } = await api.get<Guest>(`/guests/${id}`);
  return data;
};

export const getGuestBookings = async (id: number) => {
  const { data } = await api.get<Booking[]>(`/guests/${id}/bookings`);
  return data;
};

export const createGuest = async (data: { name: string; email: string; phone?: string; address?: string; preferences?: object; loyalty_tier?: string; gdpr_consent?: boolean; property_id: number }) => {
  const { data: response } = await api.post<Guest>('/guests', data);
  return response;
};

export const updateGuest = async (id: number, data: { name?: string; email?: string; phone?: string; address?: string; preferences?: object; loyalty_points?: number; loyalty_tier?: string; gdpr_consent?: boolean }) => {
  const { data: response } = await api.put<Guest>(`/guests/${id}`, data);
  return response;
};

export const deleteGuest = async (id: number) => {
  const { data } = await api.delete(`/guests/${id}`);
  return data;
};

export const getMaintenance = async (params?: { status?: string; priority?: string; room_id?: number }) => {
  const { data } = await api.get<Maintenance[]>('/maintenance', { params });
  return data;
};

export const createMaintenance = async (data: { room_id: number; description: string; priority: string; assignee_id?: number; property_id: number }) => {
  const { data: response } = await api.post<Maintenance>('/maintenance', data);
  return response;
};

export const updateMaintenance = async (id: number, data: { description?: string; status?: string; priority?: string; assignee_id?: number }) => {
  const { data: response } = await api.put<Maintenance>(`/maintenance/${id}`, data);
  return response;
};

export const deleteMaintenanceTicket = async (id: number) => {
  const { data } = await api.delete(`/maintenance/${id}`);
  return data;
};

export const getHousekeepings = async (params?: { status?: string; room_id?: number }) => {
  const { data } = await api.get<Housekeeping[]>('/housekeepings', { params });
  return data;
};

export const createHousekeeping = async (data: { room_id: number; status: string; assignee_id?: number; property_id: number }) => {
  const { data: response } = await api.post<Housekeeping>('/housekeepings', data);
  return response;
};

export const updateHousekeeping = async (id: number, data: { status?: string; assignee_id?: number }) => {
  const { data: response } = await api.put<Housekeeping>(`/housekeepings/${id}`, data);
  return response;
};

export const deleteHousekeeping = async (id: number) => {
  const { data } = await api.delete(`/housekeepings/${id}`);
  return data;
};

export const getNotifications = async (params?: { status?: string; type?: string }) => {
  const { data } = await api.get<Notification[]>('/notifications', { params });
  return data;
};

export const createNotification = async (data: { type: string; recipient: string; message: string; related_entity_id: number; entity_type: string; property_id: number }) => {
  const { data: response } = await api.post<Notification>('/notifications', data);
  return response;
};

export const updateNotification = async (id: number, data: { status?: string }) => {
  const { data: response } = await api.put<Notification>(`/notifications/${id}`, data);
  return response;
};

export const deleteNotification = async (id: number) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export default api;