'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';

interface LoginFormInputs {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.email, data.password);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="mt-1 block w-full p-2 border rounded"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
}