'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, CalendarIcon, UserIcon, BuildingOfficeIcon, CurrencyDollarIcon, WrenchIcon, ChartBarIcon, CogIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
  { name: 'Bookings', path: '/bookings', icon: CalendarIcon },
  { name: 'Guests', path: '/guests', icon: UserIcon },
  { name: 'Rooms', path: '/rooms', icon: BuildingOfficeIcon },
  { name: 'Billings', path: '/billings', icon: CurrencyDollarIcon },
  { name: 'Housekeeping', path: '/housekeeping', icon: ShieldExclamationIcon },
  { name: 'Maintenance', path: '/maintenance', icon: WrenchIcon },
  { name: 'Reports', path: '/reports', icon: ChartBarIcon },
  { name: 'Settings', path: '/settings', icon: CogIcon },
];

const SideNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-800 text-white fixed">
      <div className="p-4 text-2xl font-bold">HMS</div>
      <nav className="flex-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`flex items-center p-4 hover:bg-gray-700 ${pathname === item.path ? 'bg-gray-700 border-l-4 border-blue-500' : ''}`}
          >
            <item.icon className="w-6 h-6 mr-2" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default SideNav;