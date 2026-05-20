import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBed, FaCalendarCheck, FaMoneyBillWave, FaChartBar, FaSignOutAlt, FaHome, FaBell, FaHistory, FaCog } from 'react-icons/fa';

const AdminLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaHome /> },
    { name: 'Rooms', path: '/admin/rooms', icon: <FaBed /> },
    { name: 'Bookings', path: '/admin/bookings', icon: <FaCalendarCheck /> },
    { name: 'Payments', path: '/admin/payments', icon: <FaMoneyBillWave /> },
    { name: 'Reports', path: '/admin/reports', icon: <FaChartBar /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <FaBell /> },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <FaHistory /> },
    { name: 'Settings', path: '/admin/settings', icon: <FaCog /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-10 print:hidden">
        <div className="p-6 text-2xl font-bold border-b border-slate-800 flex items-center">
          <FaBed className="mr-3 text-indigo-400" /> HotelPro
        </div>
        <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">
          Admin Panel
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 transition-all ${
                    location.pathname.startsWith(item.path) 
                    ? 'bg-indigo-600 text-white border-r-4 border-indigo-400' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="mb-2 text-sm text-slate-300 px-2">Welcome, {user?.username}</div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800 rounded transition-colors"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-0 print:hidden">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {location.pathname.split('/').pop() || 'Dashboard'}
          </h1>
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
              Admin
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
