'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getRooms, createRoom, updateRoom, deleteRoom, getRoomAvailability } from '../services/api';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Room {
  id: number;
  room_number: string;
  floor: number;
  status: string;
  type: string;
  base_rate: number;
  features?: object;
  property_id: number;
}

interface RoomFormInputs {
  room_number: string;
  floor: number;
  room_type_id: number;
  status: string;
  features?: object;
  property_id: number;
}

interface AvailabilityFormInputs {
  start_date: string;
  end_date: string;
  room_type_id?: number;
  property_id: number;
}

export default function RoomList() {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RoomFormInputs>();
  const { register: registerAvailability, handleSubmit: handleAvailabilitySubmit } = useForm<AvailabilityFormInputs>();

  useEffect(() => {
    if (user && ['Receptionist', 'Manager'].includes(user.role) && token) {
      getRooms()
        .then(setRooms)
        .catch((err) => setError(err.message));
    }
  }, [user, token]);

  const onSubmit: SubmitHandler<RoomFormInputs> = async (data) => {
    try {
      const newRoom = await createRoom(data);
      setRooms([...rooms, newRoom]);
      setError(null);
      reset();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const onAvailabilitySubmit: SubmitHandler<AvailabilityFormInputs> = async (data) => {
    try {
      const available = await getRoomAvailability(data);
      setAvailableRooms(available);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const updatedRoom = await updateRoom(id, { status });
      setRooms(rooms.map((r) => (r.id === id ? updatedRoom : r)));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteRoom(id);
      setRooms(rooms.filter((r) => r.id !== id));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!user || !['Receptionist', 'Manager'].includes(user.role)) {
    return <p className="text-red-500">Access denied: Receptionist or Manager role required</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Rooms</h2>
      {error && <p className="text-red-500">{error}</p>}
      {user.role === 'Manager' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium">Room Number</label>
            <input
              {...register('room_number', { required: 'Room number is required' })}
              className="mt-1 block w-full p-2 border rounded"
            />
            {errors.room_number && <p className="text-red-500 text-sm">{errors.room_number.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Floor</label>
            <input
              type="number"
              {...register('floor', { required: 'Floor is required' })}
              className="mt-1 block w-full p-2 border rounded"
            />
            {errors.floor && <p className="text-red-500 text-sm">{errors.floor.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Room Type ID</label>
            <input
              type="number"
              {...register('room_type_id', { required: 'Room type ID is required' })}
              className="mt-1 block w-full p-2 border rounded"
            />
            {errors.room_type_id && <p className="text-red-500 text-sm">{errors.room_type_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="mt-1 block w-full p-2 border rounded"
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Dirty">Dirty</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium">Features (JSON)</label>
            <input
              {...register('features')}
              className="mt-1 block w-full p-2 border rounded"
              placeholder='{"wifi": true, "view": "sea"}'
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Property ID</label>
            <input
              type="number"
              {...register('property_id', { required: 'Property ID is required' })}
              className="mt-1 block w-full p-2 border rounded"
            />
            {errors.property_id && <p className="text-red-500 text-sm">{errors.property_id.message}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Create Room
          </button>
        </form>
      )}
      <form onSubmit={handleAvailabilitySubmit(onAvailabilitySubmit)} className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium">Start Date</label>
          <input
            type="date"
            {...registerAvailability('start_date', { required: 'Start date is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            {...registerAvailability('end_date', { required: 'End date is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Room Type ID (Optional)</label>
          <input
            type="number"
            {...registerAvailability('room_type_id')}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Property ID</label>
          <input
            type="number"
            {...registerAvailability('property_id', { required: 'Property ID is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Check Availability
        </button>
      </form>
      {availableRooms.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Available Rooms</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Room Number</th>
                <th className="border p-2">Floor</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {availableRooms.map((r) => (
                <tr key={r.id} className="border">
                  <td className="p-2">{r.room_number}</td>
                  <td className="p-2">{r.floor}</td>
                  <td className="p-2">{r.type}</td>
                  <td className="p-2">${r.base_rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Room Number</th>
            <th className="border p-2">Floor</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Features</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border">
              <td className="p-2">{r.room_number}</td>
              <td className="p-2">{r.floor}</td>
              <td className="p-2">{r.type}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">${r.base_rate}</td>
              <td className="p-2">{JSON.stringify(r.features)}</td>
              <td className="p-2">
                {r.status !== 'Occupied' && (
                  <button
                    onClick={() => handleUpdateStatus(r.id, r.status === 'Available' ? 'Maintenance' : 'Available')}
                    className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                  >
                    {r.status === 'Available' ? 'To Maintenance' : 'To Available'}
                  </button>
                )}
                {user.role === 'Manager' && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}