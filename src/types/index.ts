export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  property_id: number;
}

export interface Room {
  id: number;
  room_number: string;
  floor: number;
  status: string;
  type: string;
  base_rate: number;
  property_id: number;
}

export interface Booking {
  id: number;
  guest_id: number;
  guest_name: string;
  room_id: number;
  room_number: string;
  check_in: string;
  check_out: string;
  status: string;
  source: string;
  rate_applied: number;
  property_id: number;
}