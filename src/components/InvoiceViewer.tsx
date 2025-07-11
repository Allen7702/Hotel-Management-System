'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getBookings } from '../services/api';

interface Invoice {
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
  invoice?: Invoice;
}

export default function InvoiceViewer() {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && ['Receptionist', 'Manager'].includes(user.role) && token) {
      getBookings()
        .then((data) => {
          // Filter bookings with invoices (Completed status)
          const completedBookings = data.filter((b: Booking) => b.status === 'Completed');
          setBookings(completedBookings);
        })
        .catch((err) => setError(err.message));
    }
  }, [user, token]);

  if (!user || !['Receptionist', 'Manager'].includes(user.role)) {
    return <p className="text-red-500">Access denied: Receptionist or Manager role required</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Invoices</h2>
      {error && <p className="text-red-500">{error}</p>}
      {bookings.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Booking ID</th>
              <th className="border p-2">Guest Name</th>
              <th className="border p-2">Room Number</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Tax</th>
              <th className="border p-2">Payment Method</th>
              <th className="border p-2">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border">
                <td className="p-2">{b.id}</td>
                <td className="p-2">{b.guest_name}</td>
                <td className="p-2">{b.room_number}</td>
                <td className="p-2">${b.invoice?.amount.toFixed(2)}</td>
                <td className="p-2">${b.invoice?.tax.toFixed(2)}</td>
                <td className="p-2">{b.invoice?.payment_method}</td>
                <td className="p-2">{b.invoice?.receipt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}