'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
interface LoginFormInputs {
  // email: string;
  username: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    try {
      await login(data.username, data.password);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen w-1/3  bg-gray-100 flex items-center justify-center flex-col">
      <div className="flex items-center justify-center mb-6">
        <div className="w-12 h-12 bg-amber-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-2xl">NH</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 ml-2">Nuru Hotel</h1>
      </div>
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-xl font-medium text-gray-700 mb-4 text-left">Sign in</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your username"
              {...register('username', { required: 'Username is required' })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              {...register('password', { required: 'Password is required' })}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-600 pr-10"
            />
            <span
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <AiFillEye size={20} /> : <AiFillEyeInvisible size={20} />}
            </span>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {/* <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 text-gray-700">Remember me</label>
            </div>
            <a href="/forgot-password" className="text-amber-600 hover:underline">Forgot password?</a>
          </div> */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-amber-600 text-white p-3 rounded hover:bg-amber-700 transition duration-200"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}