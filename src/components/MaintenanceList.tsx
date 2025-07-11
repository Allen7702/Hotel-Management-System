'use client';

   import { useEffect, useState } from 'react';
   import { useAuth } from '../context/AuthContext';
   import { getMaintenanceTickets, createMaintenanceTicket, updateMaintenanceTicket, deleteMaintenanceTicket } from '../services/api';
   import { useForm, SubmitHandler } from 'react-hook-form';

   interface Maintenance {
     id: number;
     room_id: number;
     room_number: string;
     description: string;
     status: string;
     priority: string;
     assignee_id: number | null;
     assignee_username: string | null;
     property_id: number;
     history: { status: string; timestamp: string }[];
   }

   interface MaintenanceFormInputs {
     room_id: number;
     description: string;
     priority: string;
     assignee_id: number | null;
     property_id: number;
   }

   export default function MaintenanceList() {
     const { user, token } = useAuth();
     const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
     const [error, setError] = useState<string | null>(null);
     const { register, handleSubmit, reset, formState: { errors } } = useForm<MaintenanceFormInputs>();

     useEffect(() => {
       if (user && ['Receptionist', 'Manager'].includes(user.role) && token) {
         getMaintenanceTickets()
           .then(setMaintenances)
           .catch((err) => setError(err.message));
       }
     }, [user, token]);

     const onSubmit: SubmitHandler<MaintenanceFormInputs> = async (data) => {
       try {
         const payload = {
           ...data,
           assignee_id: data.assignee_id === null ? undefined : data.assignee_id,
         };
         const newMaintenance = await createMaintenanceTicket(payload);
         setMaintenances([...maintenances, newMaintenance]);
         setError(null);
         reset();
       } catch (err) {
         setError((err as Error).message);
       }
     };

     const handleUpdateStatus = async (id: number, status: string) => {
       try {
         const updatedMaintenance = await updateMaintenanceTicket(id, { status });
         setMaintenances(maintenances.map((m) => (m.id === id ? updatedMaintenance : m)));
         setError(null);
       } catch (err) {
         setError((err as Error).message);
       }
     };

     const handleDelete = async (id: number) => {
       try {
         await deleteMaintenanceTicket(id);
         setMaintenances(maintenances.filter((m) => m.id !== id));
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
         <h2 className="text-2xl font-bold mb-4">Maintenance Tickets</h2>
         {error && <p className="text-red-500">{error}</p>}
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
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
             <label className="block text-sm font-medium">Description</label>
             <textarea
               {...register('description', { required: 'Description is required' })}
               className="mt-1 block w-full p-2 border rounded"
             />
             {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
           </div>
           <div>
             <label className="block text-sm font-medium">Priority</label>
             <select
               {...register('priority', { required: 'Priority is required' })}
               className="mt-1 block w-full p-2 border rounded"
             >
               <option value="">Select Priority</option>
               <option value="Low">Low</option>
               <option value="Medium">Medium</option>
               <option value="High">High</option>
             </select>
             {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
           </div>
           <div>
             <label className="block text-sm font-medium">Assignee ID (Optional)</label>
             <input
               type="number"
               {...register('assignee_id')}
               className="mt-1 block w-full p-2 border rounded"
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
             Create Maintenance Ticket
           </button>
         </form>
         <table className="w-full border-collapse">
           <thead>
             <tr className="bg-gray-100">
               <th className="border p-2">ID</th>
               <th className="border p-2">Room</th>
               <th className="border p-2">Description</th>
               <th className="border p-2">Status</th>
               <th className="border p-2">Priority</th>
               <th className="border p-2">Assignee</th>
               <th className="border p-2">Actions</th>
             </tr>
           </thead>
           <tbody>
             {maintenances.map((m) => (
               <tr key={m.id} className="border">
                 <td className="p-2">{m.id}</td>
                 <td className="p-2">{m.room_number}</td>
                 <td className="p-2">{m.description}</td>
                 <td className="p-2">{m.status}</td>
                 <td className="p-2">{m.priority}</td>
                 <td className="p-2">{m.assignee_username || 'Unassigned'}</td>
                 <td className="p-2">
                   {m.status !== 'Resolved' && (
                     <button
                       onClick={() => handleUpdateStatus(m.id, m.status === 'Open' ? 'In Progress' : 'Resolved')}
                       className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                     >
                       {m.status === 'Open' ? 'Start' : 'Resolve'}
                     </button>
                   )}
                   {user.role === 'Manager' && (
                     <button
                       onClick={() => handleDelete(m.id)}
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