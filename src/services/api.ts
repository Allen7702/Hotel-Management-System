/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const createRoom = async (data: { room_number: string; floor: number; room_type_id: number; status: string; features?: object; property_id: number }) => {
  const response = await api.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id: number, data: { room_number?: string; floor?: number; room_type_id?: number; status?: string; features?: object }) => {
  const response = await api.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id: number) => {
  const response = await api.delete(`/rooms/${id}`);
  return response.data;
};

export const getRoomAvailability = async (params: { start_date: string; end_date: string; room_type_id?: number; property_id: number }) => {
  const response = await api.get('/rooms/availability', { params });
  return response.data;
};

export const getBookings = async (params?: { start_date?: string; end_date?: string }) => {
  const response = await api.get('/bookings', {
    params,
    transformResponse: [
      (data) => {
        const bookings = JSON.parse(data);
        return bookings.map((b: any) => ({
          ...b,
          invoice: b.status === 'Completed' ? { id: b.id, booking_id: b.id, guest_id: b.guest_id, amount: b.rate_applied * 2 * 1.1, tax: b.rate_applied * 2 * 0.1, receipt: `Invoice for booking ${b.id}`, status: 'Paid', payment_method: 'Unknown', property_id: b.property_id } : undefined,
        }));
      },
    ],
  });
  return response.data;
};

export const createBooking = async (data: { guest_id: number; room_id: number; check_in: string; check_out: string; source: string; rate_applied: number; property_id: number }) => {
  const response = await api.post('/bookings', data);
  return response.data;
};

export const checkInBooking = async (id: number) => {
  const response = await api.put(`/bookings/${id}/check-in`);
  return response.data;
};

export const checkOutBooking = async (id: number, payment_method: string) => {
  const response = await api.put(`/bookings/${id}/check-out`, { payment_method });
  return response.data;
};

export const cancelBooking = async (id: number) => {
  const response = await api.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const getGuests = async (params?: { email?: string; loyalty_tier?: string }) => {
  const response = await api.get('/guests', { params });
  return response.data;
};

export const getGuest = async (id: number) => {
  const response = await api.get(`/guests/${id}`);
  return response.data;
};

export const getGuestBookings = async (id: number) => {
  const response = await api.get(`/guests/${id}/bookings`);
  return response.data;
};

export const createGuest = async (data: { name: string; email: string; phone?: string; address?: string; preferences?: object; loyalty_tier?: string; gdpr_consent?: boolean; property_id: number }) => {
  const response = await api.post('/guests', data);
  return response.data;
};

export const updateGuest = async (id: number, data: { name?: string; email?: string; phone?: string; address?: string; preferences?: object; loyalty_points?: number; loyalty_tier?: string; gdpr_consent?: boolean }) => {
  const response = await api.put(`/guests/${id}`, data);
  return response.data;
};

export const deleteGuest = async (id: number) => {
  const response = await api.delete(`/guests/${id}`);
  return response.data;
};

export const getMaintenanceTickets = async (params?: { status?: string; priority?: string; room_id?: number }) => {
  const response = await api.get('/maintenance', { params });
  return response.data;
};

export const createMaintenanceTicket = async (data: { room_id: number; description: string; priority: string; assignee_id?: number; property_id: number }) => {
  const response = await api.post('/maintenance', data);
  return response.data;
};

export const updateMaintenanceTicket = async (id: number, data: { description?: string; status?: string; priority?: string; assignee_id?: number }) => {
  const response = await api.put(`/maintenance/${id}`, data);
  return response.data;
};

export const deleteMaintenanceTicket = async (id: number) => {
  const response = await api.delete(`/maintenance/${id}`);
  return response.data;
};

export const refreshToken = async (refreshToken: string) => {
  const response = await api.post('/users/refresh-token', { refresh_token: refreshToken });
  return response.data;
};

export default api;