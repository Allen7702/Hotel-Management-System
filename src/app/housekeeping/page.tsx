'use client';

import { useEffect, useState } from 'react';
import { getHousekeepings, createHousekeeping, Housekeeping, getRooms, getUsers, Room, User } from '@/services/api';
import { toast } from 'react-toastify';

export default function HousekeepingPage() {
    const [housekeepings, setHousekeepings] = useState<Housekeeping[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState({ room_id: '', status: 'Pending', assignee_id: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [housekeepingData, roomData, userData] = await Promise.all([getHousekeepings(), getRooms(), getUsers()]);
                setHousekeepings(housekeepingData);
                setRooms(roomData);
                setUsers(userData.filter((u) => u.role === 'Housekeeping'));
                setLoading(false);
            } catch (error) {
                console.error('Failed to load data:', error);
                toast.error('Failed to load data');
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const housekeeping = await createHousekeeping({
                room_id: parseInt(form.room_id),
                status: form.status as 'Pending' | 'In Progress' | 'Completed',
                assignee_id: parseInt(form.assignee_id),
                property_id: 1,
            });
            setHousekeepings([...housekeepings, housekeeping]);
            toast.success('Housekeeping task created');
            setForm({ room_id: '', status: 'Pending', assignee_id: '' });
        } catch (error) {
            console.error('Failed to create housekeeping task:', error);
            toast.error('Failed to create housekeeping task');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Housekeeping</h1>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">New Housekeeping Task</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                        value={form.room_id}
                        onChange={(e) => setForm({ ...form, room_id: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="">Select Room</option>
                        {rooms.map((room) => (
                            <option key={room.id} value={room.id}>Room {room.room_number}</option>
                        ))}
                    </select>
                    <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <select
                        value={form.assignee_id}
                        onChange={(e) => setForm({ ...form, assignee_id: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="">Select Assignee</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                        ))}
                    </select>
                    <button type="submit" className="p-2 bg-blue-500 text-white rounded">
                        Create Task
                    </button>
                </form>
            </div>
            <h2 className="text-xl font-semibold mb-2">Housekeeping Tasks</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Room</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Assignee</th>
                    </tr>
                </thead>
                <tbody>
                    {housekeepings.map((h) => (
                        <tr key={h.id} className="border-b">
                            <td className="p-2">{rooms.find((r) => r.id === h.room_id)?.room_number}</td>
                            <td className="p-2">{h.status}</td>
                            <td className="p-2">{users.find((u) => u.id === h.assignee_id)?.username}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}