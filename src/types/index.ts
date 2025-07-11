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
export interface Guest {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  preferences?: object;
  loyalty_points: number;
  loyalty_tier: string;
  gdpr_consent: boolean;
  property_id: number;
}
export interface Maintenance {
  id: number;
  room_id: number;
  room_number: string;
  description: string;
  status: string;
  priority: string;
  assignee_id: number | null;
  assignee_username: string | null;
  property_id: number;
  history: { status: string; timestamp: string }[];
}

export interface Invoice {
  id: number;
  booking_id: number;
  guest_id: number;
  amount: number;
  tax: number;
  receipt: string;
  status: string;
  payment_method: string;
  property_id: number;
}