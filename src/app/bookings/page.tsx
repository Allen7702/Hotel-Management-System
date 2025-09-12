'use client';

import { useEffect, useState } from 'react';
import { getRooms, getGuests, createBooking, Room, Guest, Booking, getBookings } from '@/services/api';
import { toast } from 'react-toastify';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import BookPage from '@/components/booking/bookings';

const localizer = momentLocalizer(moment);

export default function Bookings() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [form, setForm] = useState({ room_id: '', guest_id: '', check_in: '', check_out: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomData, guestData, bookingData] = await Promise.all([getRooms(), getGuests(), getBookings()]);
        setRooms(roomData);
        setGuests(guestData);
        setBookings(bookingData);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load data: ' + (error as Error).message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const booking = await createBooking({
        room_id: parseInt(form.room_id),
        guest_id: parseInt(form.guest_id),
        check_in: form.check_in,
        check_out: form.check_out,
        // status: 'Active',
        source: 'Direct',
        rate_applied: 100.00,
        property_id: 1,
      });
      setBookings([...bookings, booking]);
      toast.success('Booking created');
      setForm({ room_id: '', guest_id: '', check_in: '', check_out: '' });
    } catch (error) {
      toast.error('Failed to create booking - ' + (error as Error).message);
    }
  };

  const handleCheckInOut = async (bookingId: number, action: 'check-in' | 'check-out') => {
    try {
    //   await checkInOut(bookingId, action);
      toast.success(`Booking ${action} successful`);
      setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: action === 'check-in' ? 'Active' : 'Completed' } : b)));
    } catch (error) {
      toast.error(`Failed to ${action} booking. Error: ${(error as Error).message}`);
    }
  };

  const events = bookings.map((booking) => ({
    title: `Room ${rooms.find((r) => r.id === booking.room_id)?.room_number} - ${guests.find((g) => g.id === booking.guest_id)?.name}`,
    start: new Date(booking.check_in),
    end: new Date(booking.check_out),
    resourceId: booking.room_id,
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <BookPage/>
    // <div className="p-6">
    //   <h1 className="text-2xl font-bold mb-4">Bookings</h1>
    //   <div className="mb-6">
    //     <h2 className="text-xl font-semibold mb-2">New Booking</h2>
    //     <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
    //       <select
    //         value={form.room_id}
    //         onChange={(e) => setForm({ ...form, room_id: e.target.value })}
    //         className="p-2 border rounded"
    //         required
    //       >
    //         <option value="">Select Room</option>
    //         {rooms.filter((r) => r.status === 'Available').map((room) => (
    //           <option key={room.id} value={room.id}>Room {room.room_number}</option>
    //         ))}
    //       </select>
    //       <select
    //         value={form.guest_id}
    //         onChange={(e) => setForm({ ...form, guest_id: e.target.value })}
    //         className="p-2 border rounded"
    //         required
    //       >
    //         <option value="">Select Guest</option>
    //         {guests.map((guest) => (
    //           <option key={guest.id} value={guest.id}>{guest.name}</option>
    //         ))}
    //       </select>
    //       <input
    //         type="date"
    //         value={form.check_in}
    //         onChange={(e) => setForm({ ...form, check_in: e.target.value })}
    //         className="p-2 border rounded"
    //         required
    //       />
    //       <input
    //         type="date"
    //         value={form.check_out}
    //         onChange={(e) => setForm({ ...form, check_out: e.target.value })}
    //         className="p-2 border rounded"
    //         required
    //       />
    //       <button type="submit" className="p-2 bg-blue-500 text-white rounded">
    //         Create Booking
    //       </button>
    //     </form>
    //   </div>
    //   <h2 className="text-xl font-semibold mb-2">Booking Calendar</h2>
    //   <Calendar
    //     localizer={localizer}
    //     events={events}
    //     startAccessor="start"
    //     endAccessor="end"
    //     style={{ height: 500 }}
    //     className="mb-6"
    //   />
    //   <h2 className="text-xl font-semibold mb-2">Current Bookings</h2>
    //   <table className="w-full border-collapse">
    //     <thead>
    //       <tr className="bg-gray-200">
    //         <th className="p-2">Guest</th>
    //         <th className="p-2">Room</th>
    //         <th className="p-2">Check-in</th>
    //         <th className="p-2">Check-out</th>
    //         <th className="p-2">Status</th>
    //         <th className="p-2">Actions</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {bookings.map((booking) => (
    //         <tr key={booking.id} className="border-b">
    //           <td className="p-2">{guests.find((g) => g.id === booking.guest_id)?.name}</td>
    //           <td className="p-2">{rooms.find((r) => r.id === booking.room_id)?.room_number}</td>
    //           <td className="p-2">{booking.check_in}</td>
    //           <td className="p-2">{booking.check_out}</td>
    //           <td className="p-2">{booking.status}</td>
    //           <td className="p-2">
    //             {booking.status === 'Active' && (
    //               <button
    //                 onClick={() => handleCheckInOut(booking.id, 'check-out')}
    //                 className="text-blue-500 mr-2"
    //               >
    //                 Check-out
    //               </button>
    //             )}
    //             {booking.status === 'Completed' && (
    //               <button
    //                 onClick={() => handleCheckInOut(booking.id, 'check-in')}
    //                 className="text-blue-500"
    //               >
    //                 Check-in
    //               </button>
    //             )}
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
}