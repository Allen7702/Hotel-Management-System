'use client';

import { useEffect, useState } from 'react';
import { getGuests, Guest } from '@/services/api';
import { toast } from 'react-toastify';

export default function Guests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const data = await getGuests();
        setGuests(data);
        setLoading(false);
      } catch (error) {
        toast.error(`Failed to load guests. Error: ${error}`);
        setLoading(false);
      }
    };
    fetchGuests();
  }, []);

  const filteredGuests = guests.filter(
    (guest) => guest.name.toLowerCase().includes(search.toLowerCase()) || guest.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Guest Management</h1>
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
      />
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Loyalty Tier</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGuests.map((guest) => (
            <tr key={guest.id} className="border-b">
              <td className="p-2">{guest.name}</td>
              <td className="p-2">{guest.email}</td>
              <td className="p-2">{guest.loyalty_tier}</td>
              <td className="p-2">
                <button className="text-blue-500 mr-2">View</button>
                <button className="text-yellow-500">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}