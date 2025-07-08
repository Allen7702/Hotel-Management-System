'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';
import { User } from '../types';

export default function UserList() {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role === 'Manager' && token) {
      getUsers()
        .then(setUsers)
        .catch((err) => setError(err.message));
    }
  }, [user, token]);

  if (user?.role !== 'Manager') {
    return <p className="text-red-500">Access denied: Manager role required</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Property ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.property_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}