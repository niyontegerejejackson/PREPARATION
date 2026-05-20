import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBed, FaCalendarCheck, FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';

const ClientLayout = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/client/dashboard', icon: <FaHome /> },
    { name: 'Browse Rooms', path: '/client/rooms', icon: <FaBed /> },
    { name: 'My Bookings', path: '/client/bookings', icon: <FaCalendarCheck /> },
    { name: 'Profile', path: '/client/profile', icon: <FaUser /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-indigo-900 text-white shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <FaBed className="text-indigo-400 text-2xl mr-2" />
                <span className="font-bold text-xl tracking-wider">HotelPro</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname.startsWith(item.path)
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon}
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-indigo-200">
                <FaUser />
                <span className="text-sm">{user?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-indigo-800 p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none transition-colors"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} HotelPro Rwanda Ltd. All rights reserved.
      </footer>
    </div>
  );
};

export default ClientLayout;
