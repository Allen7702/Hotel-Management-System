'use client';

import { useEffect, useState } from 'react';
import { getMaintenance, createMaintenance, Maintenance, getRooms, getUsers,  User } from '@/services/api';
import { toast } from 'react-toastify';
import { Room } from '@/services/api';

export default function MaintenancePage() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [form, setForm] = useState({ room_id: '', description: '', priority: 'Low', assignee_id: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [maintenanceData, roomData, userData] = await Promise.all([getMaintenance(), getRooms(), getUsers()]);
                setMaintenances(maintenanceData);
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
            const maintenance = await createMaintenance({
                room_id: parseInt(form.room_id),
                description: form.description,
                // status: 'Open',
                priority: form.priority as 'Low' | 'Medium' | 'High',
                assignee_id: parseInt(form.assignee_id),
                property_id: 1,
            });
            setMaintenances([...maintenances, maintenance]);
            toast.success('Maintenance issue created');
            setForm({ room_id: '', description: '', priority: 'Low', assignee_id: '' });
        } catch (error) {
            console.error('Failed to create maintenance issue:', error);
            toast.error('Failed to create maintenance issue');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Maintenance</h1>
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Log New Issue</h2>
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
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Description"
                        className="p-2 border rounded"
                        required
                    />
                    <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="p-2 border rounded"
                        required
                    >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
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
                        Log Issue
                    </button>
                </form>
            </div>
            <h2 className="text-xl font-semibold mb-2">Maintenance Issues</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2">Room</th>
                        <th className="p-2">Description</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Priority</th>
                        <th className="p-2">Assignee</th>
                    </tr>
                </thead>
                <tbody>
                    {maintenances.map((m) => (
                        <tr key={m.id} className="border-b">
                            <td className="p-2">{rooms.find((r) => r.id === m.room_id)?.room_number}</td>
                            <td className="p-2">{m.description}</td>
                            <td className="p-2">{m.status}</td>
                            <td className="p-2">{m.priority}</td>
                            <td className="p-2">{users.find((u) => u.id === m.assignee_id)?.username}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}