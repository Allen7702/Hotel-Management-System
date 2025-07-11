import BookingForm from "@/components/BookingForm";
import BookingList from "@/components/BookingList";
import GuestList from "@/components/guestList";
import InvoiceViewer from "@/components/InvoiceViewer";
import Login from "@/components/Login/Login";
import MaintenanceList from "@/components/MaintenanceList";
import RoomList from "@/components/RoomList";
import UserList from "@/components/UserList";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { setupAxiosInterceptors } from "@/services/api";



export default function Home() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

function MainContent() {
  const { user, token, logout } = useAuth();

  setupAxiosInterceptors(token);
  if (!user) {
    return (
      <div className="max-h-screen bg-gray-100 flex items-center justify-center text-black">
        <Login />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-500 p-4 text-white">
        <div className="max-w-4xl mx-auto flex justify-between">
          <h1 className="text-xl font-bold">HMS Frontend</h1>
          {user && (
            <div className="flex items-center space-x-4">
              <span>{user.username} ({user.role})</span>
              <button onClick={logout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
      <main className="max-w-4xl mx-auto p-4 text-black">
        <>
          {user.role === 'Manager' && <UserList />}
          <RoomList />
          {['Receptionist', 'Manager'].includes(user.role) &&  <>
                   <BookingForm />
                   <BookingList />
                   <GuestList />
                   <MaintenanceList />
                    <InvoiceViewer />
                 </>}
        </>
      </main>
    </div>
  );
}