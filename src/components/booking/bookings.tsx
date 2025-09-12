import React, { useState, useEffect, FormEvent, FC, useCallback } from 'react';
import { toast } from 'react-toastify'; // Assuming you have react-toastify installed
import { getBookings, getRooms, getGuests, createGuest, createBooking, Booking, Room, Guest } from '../../services/api'; // Assuming your api functions are in './api.ts'

// --- HELPER COMPONENTS ---

// A simple debounce hook to prevent excessive API calls on search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};


// Icon for the close button
const XIcon: FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- FORM COMPONENT ---
interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
  rooms: Room[];
  propertyId: number; // Assuming a property ID is available
}

const BookingForm: FC<BookingFormProps> = ({ isOpen, onClose, onBookingCreated, rooms, propertyId }) => {
  // Form state
  const [guestType, setGuestType] = useState<'new' | 'existing'>('new');
  const [title, setTitle] = useState('Mr.');
  const [guestName, setGuestName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [foundGuests, setFoundGuests] = useState<Guest[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const [selectedFloor, setSelectedFloor] = useState<number | ''>('');
  const [availableRoomsOnFloor, setAvailableRoomsOnFloor] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | ''>('');
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const [rateType, setRateType] = useState<'auto' | 'manual'>('auto');
  const [rate, setRate] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form state
  const resetForm = useCallback(() => {
    setGuestType('new');
    setTitle('Mr.');
    setGuestName('');
    setEmail('');
    setPhone('');
    setSearchTerm('');
    setFoundGuests([]);
    setSelectedGuest(null);
    setSelectedFloor('');
    setAvailableRoomsOnFloor([]);
    setSelectedRoomId('');
    setCheckIn('');
    setCheckOut('');
    setNumberOfGuests(1);
    setSpecialRequests('');
    setRateType('auto');
    setRate(0);
    setIsSubmitting(false);
  }, []);

  // Effect to handle searching for existing guests
  useEffect(() => {
    if (debouncedSearchTerm && guestType === 'existing') {
      setIsSearching(true);
      getGuests({ email: debouncedSearchTerm })
        .then(data => setFoundGuests(data))
        .catch(err => console.error("Failed to search guests", err))
        .finally(() => setIsSearching(false));
    } else {
      setFoundGuests([]);
    }
  }, [debouncedSearchTerm, guestType]);

  // Effect to filter rooms when a floor is selected
  useEffect(() => {
    if (selectedFloor !== '') {
      const filtered = rooms.filter(r => r.floor === selectedFloor && r.status === 'Available');
      setAvailableRoomsOnFloor(filtered);
      setSelectedRoomId(''); // Reset room selection
    } else {
      setAvailableRoomsOnFloor([]);
    }
  }, [selectedFloor, rooms]);
    
  // Effect to auto-calculate rate when room is selected
  useEffect(() => {
      if(rateType === 'auto' && selectedRoomId) {
          // Dummy rate calculation. Replace with your actual logic.
          const room = rooms.find(r => r.id === selectedRoomId);
          if(room) {
              // Example: Rate based on room type ID or features
              setRate(room.room_type_id * 100); 
          }
      }
  }, [selectedRoomId, rateType, rooms]);

  // Handle selecting an existing guest from search results
  const handleSelectGuest = (guest: Guest) => {
    setSelectedGuest(guest);
    setGuestName(guest.name);
    setEmail(guest.email);
    setPhone(guest.phone);
    setSearchTerm(guest.name);
    setFoundGuests([]);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let guestId: number;

    try {
      // Step 1: Get or create the guest
      if (guestType === 'existing' && selectedGuest) {
        guestId = selectedGuest.id;
      } else {
        if (!guestName || !email) {
          toast.error("New guest's name and email are required.");
          setIsSubmitting(false);
          return;
        }
        const newGuest = await createGuest({
          name: `${title} ${guestName}`,
          email,
          phone,
          property_id: propertyId
        });
        guestId = newGuest.id;
      }

      // Step 2: Validate booking details
      if (!selectedRoomId || !checkIn || !checkOut) {
        toast.error("Room, check-in, and check-out dates are required.");
        setIsSubmitting(false);
        return;
      }

      // Step 3: Create the booking
      await createBooking({
        guest_id: guestId,
        room_id: selectedRoomId,
        check_in: checkIn,
        check_out: checkOut,
        source: 'Direct',
        rate_applied: rate,
        property_id: propertyId,
        // You might need to add other fields like number_of_guests to your backend
      });

      toast.success("Booking created successfully!");
      resetForm();
      onBookingCreated(); // Callback to refresh parent component's data
      onClose();

    } catch (error) {
      console.error("Failed to create booking:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800">New Booking</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XIcon /></button>
          </div>

          <form onSubmit={handleSubmit} className="flex-grow p-6 space-y-4 overflow-y-auto">
            {/* Guest Selection */}
            <fieldset className="p-4 border rounded-lg">
              <legend className="text-lg font-medium text-gray-800 px-2">Guest Information</legend>
              <div className="flex items-center gap-4 mb-4">
                <label><input type="radio" name="guestType" value="new" checked={guestType === 'new'} onChange={() => { setGuestType('new'); setSelectedGuest(null); }} className="mr-2" />New Guest</label>
                <label><input type="radio" name="guestType" value="existing" checked={guestType === 'existing'} onChange={() => setGuestType('existing')} className="mr-2" />Existing Guest</label>
              </div>

              {guestType === 'new' ? (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-1/4">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                      <select id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                        <option>Mr.</option><option>Mrs.</option><option>Ms.</option><option>Dr.</option>
                      </select>
                    </div>
                    <div className="w-3/4">
                      <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input type="text" id="guestName" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <label htmlFor="searchGuest" className="block text-sm font-medium text-gray-700">Search Guest by Email</label>
                  <input type="text" id="searchGuest" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="start typing..." className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                  {isSearching && <div className="p-2 text-sm text-gray-500">Searching...</div>}
                  {foundGuests.length > 0 && (
                    <ul className="absolute w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto z-10">
                      {foundGuests.map(guest => (
                        <li key={guest.id} onClick={() => handleSelectGuest(guest)} className="p-2 hover:bg-gray-100 cursor-pointer">{guest.name} - {guest.email}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </fieldset>

            {/* Booking Details */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="text-lg font-medium text-gray-800 px-2">Booking Details</legend>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check-in</label>
                        <input type="date" id="checkIn" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-out</label>
                        <input type="date" id="checkOut" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                        <label htmlFor="floor" className="block text-sm font-medium text-gray-700">Floor</label>
                        <select id="floor" value={selectedFloor} onChange={e => setSelectedFloor(Number(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 rounded-lg">
                            <option value="">Select Floor</option>
                            {[...new Set(rooms.map(r => r.floor))].sort().map(floor => <option key={floor} value={floor}>{floor}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="room" className="block text-sm font-medium text-gray-700">Room</label>
                        <select id="room" value={selectedRoomId} onChange={e => setSelectedRoomId(Number(e.target.value))} disabled={!selectedFloor} className="w-full mt-1 p-2 border border-gray-300 rounded-lg disabled:bg-gray-200">
                            <option value="">Select Room</option>
                            {availableRoomsOnFloor.map(room => <option key={room.id} value={room.id}>{room.room_number}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="numberOfGuests" className="block text-sm font-medium text-gray-700">Number of Guests</label>
                        <input type="number" id="numberOfGuests" value={numberOfGuests} min="1" onChange={e => setNumberOfGuests(Number(e.target.value))} className="w-full mt-1 p-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>
                 <div className="mt-4">
                    <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">Special Requests</label>
                    <textarea id="specialRequests" value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={3} className="w-full mt-1 p-2 border border-gray-300 rounded-lg"></textarea>
                </div>
            </fieldset>
            
            {/* Rate */}
            <fieldset className="p-4 border rounded-lg">
                <legend className="text-lg font-medium text-gray-800 px-2">Rate</legend>
                 <div className="flex items-center gap-4 mb-4">
                    <label><input type="radio" name="rateType" value="auto" checked={rateType === 'auto'} onChange={() => setRateType('auto')} className="mr-2" />Auto</label>
                    <label><input type="radio" name="rateType" value="manual" checked={rateType === 'manual'} onChange={() => setRateType('manual')} className="mr-2" />Manual</label>
                </div>
                <input type="number" value={rate} onChange={e => setRate(Number(e.target.value))} disabled={rateType === 'auto'} className="w-full mt-1 p-2 border border-gray-300 rounded-lg disabled:bg-gray-200" />
            </fieldset>

          </form>

          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100">Cancel</button>
              <button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300">{isSubmitting ? 'Saving...' : 'Save Booking'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


// --- MAIN PAGE COMPONENT ---
const BookPage: FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Assuming propertyId is static or comes from context/props
  const propertyId = 1; 

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bookingsData, roomsData, guestsData] = await Promise.all([
        getBookings(),
        getRooms(),
        getGuests()
      ]);
      setBookings(bookingsData);
      setRooms(roomsData);
      setGuests(guestsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      toast.error("Failed to load page data. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getGuestNameById = (guestId: number): string => {
    return guests.find(g => g.id === guestId)?.name || 'Unknown Guest';
  };
  
  const getRoomNumberById = (roomId: number): string => {
      return rooms.find(r => r.id === roomId)?.room_number || 'N/A';
  }

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
      return <div className="p-8 text-center">Loading bookings...</div>
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Bookings</h1>
          <button onClick={() => setIsFormOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Add New Booking</button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{getGuestNameById(booking.guest_id)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getRoomNumberById(booking.room_id)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">In: {new Date(booking.check_in).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">Out: {new Date(booking.check_out).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>{booking.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${booking.rate_applied}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <BookingForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onBookingCreated={fetchData}
        rooms={rooms}
        propertyId={propertyId}
      />
    </div>
  );
};

export default BookPage;
