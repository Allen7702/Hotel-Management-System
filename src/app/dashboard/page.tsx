/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { getRooms, getBookings } from '@/services/api';
import { toast } from 'react-toastify';
import Card from '@/components/Ui/Card';

interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type_id: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Dirty';
  features: Record<string, any>;
  property_id: number;
  last_cleaned: string;
}

interface Booking {
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

export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRooms, setTotalRooms] = useState(0);
  const [occupiedRooms, setOccupiedRooms] = useState(0);
  const [activeBookings, setActiveBookings] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([getRooms(), getBookings({ status: 'Active' })]);
      setRooms(roomsData);
      setBookings(bookingsData);

      setTotalRooms(roomsData.length);
      setOccupiedRooms(roomsData.filter((room) => room.status === 'Occupied').length);
      setActiveBookings(bookingsData.length);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-amber-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-2xl">NH</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 ml-2">Nuru Hotel Dashboard</h1>
      </div>

      {/* Metrics Cards */}
      <Card  label={'Total Clients'} icon={'symbol'} amount={'300'} description={'see what;s inside'} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-600 text-sm">Total Rooms</h3>
          <p className="text-2xl font-bold text-amber-600">{totalRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-600 text-sm">Occupied Rooms</h3>
          <p className="text-2xl font-bold text-amber-600">{occupiedRooms}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
          <h3 className="text-gray-600 text-sm">Active Bookings</h3>
          <p className="text-2xl font-bold text-amber-600">{activeBookings}</p>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Room Status</h2>
        {rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`p-4 border rounded ${room.status === 'Occupied' ? 'bg-red-100' : room.status === 'Available' ? 'bg-green-100' : 'bg-yellow-100'} hover:shadow-md transition-shadow`}
              >
                <p className="font-medium">Room {room.room_number}</p>
                <p className="text-sm text-gray-600">Floor: {room.floor}</p>
                <p className="text-sm">
                  Status: <span className="font-semibold capitalize">{room.status}</span>
                </p>
                <p className="text-xs text-gray-500">
                  Last Cleaned: {new Date(room.last_cleaned).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No rooms available</p>
        )}
      </div>
    </div>
  );
}