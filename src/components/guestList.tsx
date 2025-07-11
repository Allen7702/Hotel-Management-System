/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getGuests, createGuest, updateGuest, deleteGuest, getGuestBookings } from '../services/api';
import { useForm, SubmitHandler } from 'react-hook-form';

interface Guest {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    preferences?: object;
    loyalty_points: number;
    loyalty_tier: string;
    gdpr_consent: boolean;
    property_id: number;
}

interface GuestFormInputs {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    preferences?: object;
    loyalty_tier?: string;
    gdpr_consent?: boolean;
    property_id: number;
}

export default function GuestList() {
    const { user, token } = useAuth();
    const [guests, setGuests] = useState<Guest[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [selectedGuestId, setSelectedGuestId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<GuestFormInputs>();

    useEffect(() => {
        if (user && ['Receptionist', 'Manager'].includes(user.role) && token) {
            getGuests()
                .then(setGuests)
                .catch((err) => setError(err.message));
        }
    }, [user, token]);

    const onSubmit: SubmitHandler<GuestFormInputs> = async (data) => {
        try {
            const newGuest = await createGuest(data);
            setGuests([...guests, newGuest]);
            setError(null);
            reset();
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleViewBookings = async (id: number) => {
        try {
            const guestBookings = await getGuestBookings(id);
            setBookings(guestBookings);
            setSelectedGuestId(id);
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleUpdateLoyalty = async (id: number, loyalty_tier: string) => {
        try {
            const updatedGuest = await updateGuest(id, { loyalty_tier });
            setGuests(guests.map((g) => (g.id === id ? updatedGuest : g)));
            setError(null);
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteGuest(id);
            setGuests(guests.filter((g) => g.id !== id));
            setBookings([]);
            setSelectedGuestId(null);
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
            <h2 className="text-2xl font-bold mb-4">Guests</h2>
            {error && <p className="text-red-500">{error}</p>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        {...register('name', { required: 'Name is required' })}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        {...register('email', { required: 'Email is required' })}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <input
                        {...register('phone')}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Address</label>
                    <input
                        {...register('address')}
                        className="mt-1 block w-full p-2 border rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Preferences (JSON)</label>
                    <input
                        {...register('preferences')}
                        className="mt-1 block w-full p-2 border rounded"
                        placeholder='{"room_type": "Deluxe"}'
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Loyalty Tier</label>
                    <select
                        {...register('loyalty_tier')}
                        className="mt-1 block w-full p-2 border rounded"
                    >
                        <option value="None">None</option>
                        <option value="Bronze">Bronze</option>
                        <option value="Silver">Silver</option>
                        <option value="Gold">Gold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">GDPR Consent</label>
                    <input
                        type="checkbox"
                        {...register('gdpr_consent')}
                        className="mt-1"
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
                    Create Guest
                </button>
            </form>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Name</th>
                        <th className="border p-2">Email</th>
                        <th className="border p-2">Loyalty Tier</th>
                        <th className="border p-2">Points</th>
                        <th className="border p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {guests.map((g) => (
                        <tr key={g.id} className="border">
                            <td className="p-2">{g.name}</td>
                            <td className="p-2">{g.email}</td>
                            <td className="p-2">{g.loyalty_tier}</td>
                            <td className="p-2">{g.loyalty_points}</td>
                            <td className="p-2">
                                <button
                                    onClick={() => handleViewBookings(g.id)}
                                    className="bg-blue-500 text-white px-2 py-1 rounded mr-2 hover:bg-blue-600"
                                >
                                    View Bookings
                                </button>
                                {g.loyalty_tier !== 'Gold' && (
                                    <button
                                        onClick={() => handleUpdateLoyalty(g.id, g.loyalty_tier === 'None' ? 'Bronze' : g.loyalty_tier === 'Bronze' ? 'Silver' : 'Gold')}
                                        className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                                    >
                                        Upgrade Loyalty
                                    </button>
                                )}
                                {user.role === 'Manager' && (
                                    <button
                                        onClick={() => handleDelete(g.id)}
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
            {selectedGuestId && bookings.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-2">Bookings for Guest ID {selectedGuestId}</h3>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border p-2">Booking ID</th>
                                <th className="border p-2">Room Number</th>
                                <th className="border p-2">Check-in</th>
                                <th className="border p-2">Check-out</th>
                                <th className="border p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((b) => (
                                <tr key={b?.id} className="border">
                                    <td className="p-2">{b.id}</td>
                                    <td className="p-2">{b.room_number}</td>
                                    <td className="p-2">{b.check_in}</td>
                                    <td className="p-2">{b.check_out}</td>
                                    <td className="p-2">{b.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}