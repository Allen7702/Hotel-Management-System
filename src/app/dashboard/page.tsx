/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { getRooms, getBookings } from '@/services/api';
import { toast } from 'react-toastify';
import Card from '@/components/ui/Card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet";
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  Calendar,
  MapPin,
  User
} from "lucide-react";
import router from 'next/router';
import MaintenanceForm from '@/components/forms/MaintenanceForm';
import CheckInForm from '@/components/forms/CheckInForm';
import { BookingForm } from '@/components/forms/BookingForm';

interface Room {
  id: number;
  room_number: string;
  floor: number;
  room_type_id: number;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Dirty';
  features: Record<string, any>;
  property_id: number;
  last_cleaned: string;
}

interface Booking {
  id: number;
  guest_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  status: 'Active' | 'Completed' | 'Cancelled';
  source: string;
  rate_applied: number;
  property_id: number;
}


export default function Dashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduledCheckIns, setScheduledCheckIns] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(0);
  const [checkOuts, setCheckOuts] = useState(0);
  const [availableRooms, setAvailableRooms] = useState(0);
  const [isBookingSheetOpen, setIsBookingSheetOpen] = useState(false);
  const [isMaintenanceSheetOpen, setIsMaintenanceSheetOpen] = useState(false);
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsData, bookingsData] = await Promise.all([getRooms(), getBookings()]);
      setRooms(roomsData);
      setBookings(bookingsData);

      const today = new Date().toISOString().split('T')[0];
      const scheduledCheckInsCount = bookingsData.filter((b) => {
        const checkIn = new Date(b.check_in).toISOString().split('T')[0];
        return b.status === 'Active' && checkIn >= today;
      }).length;
      setScheduledCheckIns(scheduledCheckInsCount);

      const checkedInTodayCount = bookingsData.filter((b) => {
        const checkIn = new Date(b.check_in).toISOString().split('T')[0];
        const room = roomsData.find((r) => r.id === b.room_id);
        return b.status === 'Active' && checkIn === today && room?.status === 'Occupied';
      }).length;
      setCheckedInToday(checkedInTodayCount);

      setCheckOuts(bookingsData.filter((b) => b.check_out === today && b.status === 'Active').length);
      setAvailableRooms(roomsData.filter((r) => r.status === 'Available').length);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold secondary-color">Dashboard</h1>
        <p className="text-gray-400 mt-1 mb-4">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card
          title="Scheduled Check-ins"
          value={scheduledCheckIns}
          description="Today & Future"
          icon={
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
          }
        />
        <Card
          title="Checked-in Today"
          value={checkedInToday}
          description="New Arrivals"
          icon={
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          }
        />
        <Card
          title="Check-outs"
          value={checkOuts}
          description="Today"
          icon={
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          }
        />
        <Card
          title="Available Rooms"
          value={availableRooms}
          description="Today"
          icon={
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className='bg-white p-4 rounded-lg shadow transition-shadow'>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 primary-color" />
          <h2 className='text-xl font-medium text-gray-700 '>Quick Actions</h2>
        </div>
        <div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Sheet open={isBookingSheetOpen} onOpenChange={setIsBookingSheetOpen}>
              <SheetTrigger asChild>
                <div className="p-4 rounded-lg bg-green-100 hover:bg-green-200 transition-all cursor-pointer">
                  <h3 className="font-semibold text-foreground">New Check-in</h3>
                  <p className="text-sm text-muted-foreground mt-1">Process guest arrival</p>
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>New Guest Check-in</SheetTitle>
                  <SheetDescription>Create a new booking and check in the guest.</SheetDescription>
                </SheetHeader>
                <div className="mt-6 bg-white">
                  {/* <CheckInForm onClose={() => setShowCheckInForm(false)} /> */}
                  <BookingForm onSuccess={() => setIsBookingSheetOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <Sheet open={isMaintenanceSheetOpen} onOpenChange={setIsMaintenanceSheetOpen}>
              <SheetTrigger asChild>
                <div className="p-4 rounded-lg bg-gradient-to-br  bg-amber-100 transition-all cursor-pointer">
                  <h3 className="font-semibold text-foreground">Room Maintenance</h3>
                  <p className="text-sm text-muted-foreground mt-1">Report maintenance issues</p>
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>New Maintenance Request</SheetTitle>
                  <SheetDescription>Report a maintenance issue or schedule service.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <MaintenanceForm onClose={() => setShowMaintenanceForm(false)} />
                  {/* <MaintenanceForm onSuccess={() => setIsMaintenanceSheetOpen(false)} /> */}
                </div>
              </SheetContent>
            </Sheet>

            <div
              className="p-4 rounded-lg bg-blue-100  hover:bg-blue-200 transition-all cursor-pointer"
              onClick={() => router.push('/reports')}
            >
              <h3 className="font-semibold text-foreground">Generate Report</h3>
              <p className="text-sm text-muted-foreground mt-1">Daily occupancy report</p>
            </div>

            <div
              className="p-4 rounded-lg bg-purple-100  hover:bg-purple-200 transition-all cursor-pointer"
              onClick={() => router.push('/bookings')}
            >
              <h3 className="font-semibold text-foreground">Manage Bookings</h3>
              <p className="text-sm text-muted-foreground mt-1">View and edit reservations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-4 border rounded bg-green-100 cursor-pointer hover:bg-green-200 transition-colors"
            onClick={() => setShowCheckInForm(true)}
          >
            <h3 className="font-medium text-center">New Check-in</h3>
            <p className="text-sm text-center text-gray-600">Process guest arrival</p>
          </div>
          <div
            className="p-4 border rounded bg-amber-100 cursor-pointer hover:bg-amber-200 transition-colors"
            onClick={() => setShowMaintenanceForm(true)}
          >
            <h3 className="font-medium text-center">Room Maintenance</h3>
            <p className="text-sm text-center text-gray-600">Report maintenance issues</p>
          </div>
          <div
            className="p-4 border rounded bg-blue-100 cursor-pointer hover:bg-blue-200 transition-colors"
            onClick={() => router.push('/reports')}
          >
            <h3 className="font-medium text-center">Generate Report</h3>
            <p className="text-sm text-center text-gray-600">Daily occupancy report</p>
          </div>
          <div
            className="p-4 border rounded bg-purple-100 cursor-pointer hover:bg-purple-200 transition-colors"
            onClick={() => router.push('/bookings')}
          >
            <h3 className="font-medium text-center">Manage Bookings</h3>
            <p className="text-sm text-center text-gray-600">View and edit reservations</p>
          </div>
        </div>
      </div>

      {/* Check-in Form Popup */}
      {showCheckInForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setShowCheckInForm(false)}
            >
              ✕
            </button>
            <CheckInForm onClose={() => setShowCheckInForm(false)} />
          </div>
        </div>
      )}

      {/* Maintenance Form Popup */}
      {showMaintenanceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-white w-1/3 h-full p-6 shadow-lg transform transition-transform duration-300 ease-in-out translate-x-0">
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
              onClick={() => setShowMaintenanceForm(false)}
            >
              ✕
            </button>
            <MaintenanceForm onClose={() => setShowMaintenanceForm(false)} />
          </div>
        </div>
      )}

      {/* Rooms Grid by Floor */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-xl font-medium text-gray-700 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          Room Status Overview
        </h2>
        <div className="flex gap-4 text-sm flex-row space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-300"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-300"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-300"></div>
            <span>Cleaning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-300"></div>
            <span>Out of Service</span>
          </div>
        </div>
        {rooms.length > 0 ? (
          <>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">1st Floor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {rooms
                .filter((room) => room.floor === 1)
                .slice(0, 6)
                .map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded ${room.status === 'Occupied' ? 'bg-red-300' : room.status === 'Available' ? 'bg-green-100' : room.status === 'Maintenance' || room.status === 'Dirty' ? 'bg-yellow-100' : ''} hover:shadow-md transition-shadow`}
                  >
                    <p className="font-medium">Room {room.room_number}</p>
                    {/* <p className="text-sm text-gray-600">Status: {room.status}</p> */}
                    <p className="text-xs text-gray-500">{room.features?.size === 'small' ? 'Small Room' : ''}</p>
                  </div>
                ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">2nd Floor</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {rooms
                .filter((room) => room.floor === 2)
                .slice(0, 7)
                .map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded ${room.status === 'Occupied' ? 'bg-red-100' : room.status === 'Available' ? 'bg-green-100' : room.status === 'Maintenance' || room.status === 'Dirty' ? 'bg-yellow-100' : ''} hover:shadow-md transition-shadow`}
                  >
                    <p className="font-medium">Room {room.room_number}</p>
                    {/* <p className="text-sm text-gray-600">Status: {room.status}</p> */}
                    <p className="text-xs text-gray-500">{room.features?.size === 'small' ? 'Small Room' : ''}</p>
                  </div>
                ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">3rd Floor </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {rooms
                .filter((room) => room.floor === 3)
                .slice(0, 7)
                .map((room) => (
                  <div
                    key={room.id}
                    className={`p-4 border rounded ${room.status === 'Occupied' ? 'bg-red-100' : room.status === 'Available' ? 'bg-green-100' : room.status === 'Maintenance' || room.status === 'Dirty' ? 'bg-yellow-100' : ''} hover:shadow-md transition-shadow`}
                  >
                    <p className="font-medium">Room {room.room_number}</p>
                    {/* <p className="text-sm text-gray-600">Status: {room.status}</p> */}
                    <p className="text-xs text-gray-500">{room.features?.size === 'small' ? 'Small Room' : ''}</p>
                  </div>
                ))}
            </div>
          </>
        ) : (
          <p className="text-gray-600">No rooms available</p>
        )}
      </div>
    </div>
  );
}