import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBed, FaUser, FaCalendarCheck, FaMoneyBillWave, FaChartBar, FaSignOutAlt, FaHome } from 'react-icons/fa';

const Layout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> },
    { name: 'Rooms', path: '/rooms', icon: <FaBed /> },
    { name: 'Guests', path: '/guests', icon: <FaUser /> },
    { name: 'Bookings', path: '/bookings', icon: <FaCalendarCheck /> },
    { name: 'Payments', path: '/payments', icon: <FaMoneyBillWave /> },
    { name: 'Reports', path: '/reports', icon: <FaChartBar /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-800">
          HotelPro
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-6 py-3 hover:bg-indigo-800 transition-colors ${
                    location.pathname === item.path ? 'bg-indigo-800 border-l-4 border-white' : ''
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-4 border-t border-indigo-800">
          <div className="mb-2 text-sm text-indigo-300">Logged in as {user?.username}</div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-left bg-indigo-800 hover:bg-indigo-700 rounded transition-colors"
          >
            <FaSignOutAlt className="mr-3" /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-8">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.substring(1) || 'Dashboard'}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
