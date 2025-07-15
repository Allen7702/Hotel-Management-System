'use client';

import { useEffect, useState } from 'react';
import { getNotifications, Notification } from '@/services/api';
import { toast } from 'react-toastify';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load notifications:', error);
        toast.error('Failed to load notifications');
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Type</th>
            <th className="p-2">Recipient</th>
            <th className="p-2">Message</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id} className="border-b">
              <td className="p-2">{n.type}</td>
              <td className="p-2">{n.recipient}</td>
              <td className="p-2">{n.message}</td>
              <td className="p-2">{n.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}