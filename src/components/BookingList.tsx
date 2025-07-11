'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings, checkInBooking, cancelBooking } from '../services/api';

interface Booking {
  id: number;
  guest_name: string;
  room_number: string;
  check_in: string;
  check_out: string;
  status: string;
  source: string;
  rate_applied: number;
  property_id: number;
}

export default function BookingList() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && ['Receptionist', 'Manager'].includes(user.role) && token) {
      getBookings()
        .then(setBookings)
        .catch((err) => setError(err.message));
    }
  }, [user, token]);

  const handleCheckIn = async (id: number) => {
    try {
      await checkInBooking(id);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'Active' } : b)));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCheckOut = async (id: number) => {
    try {
      const paymentMethod = prompt('Enter payment method (e.g., Credit Card):');
      if (!paymentMethod) return;
    //   const result = await checkOutBooking(id, paymentMethod);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'Completed' } : b)));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = async (id: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(id);
        setBookings(bookings.map((b) => (b.id === id ? { ...b, status: 'Cancelled' } : b)));
        setError(null);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  if (!user || !['Receptionist', 'Manager'].includes(user.role)) {
    return <p className="text-red-500">Access denied: Receptionist or Manager role required</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Bookings</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Booking ID</th>
            <th className="border p-2">Guest Name</th>
            <th className="border p-2">Room Number</th>
            <th className="border p-2">Check-in</th>
            <th className="border p-2">Check-out</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border">
              <td className="p-2">{b.id}</td>
              <td className="p-2">{b.guest_name}</td>
              <td className="p-2">{b.room_number}</td>
              <td className="p-2">{b.check_in}</td>
              <td className="p-2">{b.check_out}</td>
              <td className="p-2">{b.status}</td>
              <td className="p-2">${b.rate_applied}</td>
              <td className="p-2">
                {b.status === 'Active' && (
                  <>
                    <button
                      onClick={() => handleCheckIn(b.id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      Check-in
                    </button>
                    <button
                      onClick={() => handleCheckOut(b.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                    >
                      Check-out
                    </button>
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}