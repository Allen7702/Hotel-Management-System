'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRooms } from '../services/api';
import { Room } from '../types';

export default function RoomList() {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token) {
      getRooms({ status: 'Available' })
        .then(setRooms)
        .catch((err) => setError(err.message));
    }
  }, [user, token]);

  if (!user) {
    return <p className="text-red-500">Please log in</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Room Number</th>
            <th className="border p-2">Floor</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Base Rate</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border">
              <td className="p-2">{r.room_number}</td>
              <td className="p-2">{r.floor}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">${r.base_rate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}