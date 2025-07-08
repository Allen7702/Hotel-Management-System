'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
 import { createBooking } from '../services/api';
import { useAuth } from '@/context/AuthContext';

interface BookingFormInputs {
  guest_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  source: string;
  rate_applied: number;
  property_id: number;
}

export default function BookingForm() {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<BookingFormInputs>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit: SubmitHandler<BookingFormInputs> = async (data) => {
    try {
      await createBooking(data);
      setSuccess('Booking created successfully');
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setSuccess(null);
    }
  };

  if (!user || !['Receptionist', 'Manager'].includes(user.role)) {
    return <p className="text-red-500">Access denied: Receptionist or Manager role required</p>;
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Booking</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Guest ID</label>
          <input
            type="number"
            {...register('guest_id', { required: 'Guest ID is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.guest_id && <p className="text-red-500 text-sm">{errors.guest_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Room ID</label>
          <input
            type="number"
            {...register('room_id', { required: 'Room ID is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.room_id && <p className="text-red-500 text-sm">{errors.room_id.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Check-in Date</label>
          <input
            type="date"
            {...register('check_in', { required: 'Check-in date is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.check_in && <p className="text-red-500 text-sm">{errors.check_in.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Check-out Date</label>
          <input
            type="date"
            {...register('check_out', { required: 'Check-out date is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.check_out && <p className="text-red-500 text-sm">{errors.check_out.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Source</label>
          <input
            type="text"
            {...register('source', { required: 'Source is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.source && <p className="text-red-500 text-sm">{errors.source.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Rate Applied</label>
          <input
            type="number"
            step="0.01"
            {...register('rate_applied', { required: 'Rate is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.rate_applied && <p className="text-red-500 text-sm">{errors.rate_applied.message}</p>}
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Create Booking
        </button>
      </form>
    </div>
  );
}