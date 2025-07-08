import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const setupAxiosInterceptors = (token: string | null) => {
  api.interceptors.request.clear();
  if (token) {
    api.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (data: { username: string; email: string; password: string; role: string; property_id: number }) => {
  const response = await api.post('/users', data);
  return response.data;
};

export const getRooms = async (params?: { status?: string; floor?: number }) => {
  const response = await api.get('/rooms', { params });
  return response.data;
};

export const createRoom = async (data: { room_number: string; floor: number; room_type_id: number; status: string; property_id: number }) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const getBookings = async (params?: { start_date?: string; end_date?: string }) => {
  const response = await api.get('/bookings', { params });
  return response.data;
};

export const createBooking = async (data: { guest_id: number; room_id: number; check_in: string; check_out: string; source: string; rate_applied: number; property_id: number }) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export default api;