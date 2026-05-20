import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBed, FaCalendarAlt, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

const ClientDashboard = () => {
  const { user } = useContext(AuthContext);

  const cards = [
    { title: 'Browse Rooms', desc: 'Find your perfect stay', icon: <FaBed />, link: '/client/rooms', color: 'bg-indigo-500' },
    { title: 'My Bookings', desc: 'View or manage your reservations', icon: <FaCalendarAlt />, link: '/client/bookings', color: 'bg-emerald-500' },
    { title: 'My Profile', desc: 'Update your account details', icon: <FaUser />, link: '/client/profile', color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.username}!</h1>
        <p className="text-slate-500 mt-2">Manage your hotel reservations and profile from your dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className={`${card.color} h-2`}></div>
            <div className="p-6">
              <div className={`w-12 h-12 rounded-full ${card.color} bg-opacity-10 flex items-center justify-center text-2xl ${card.color.replace('bg-', 'text-')} mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
              <p className="text-slate-500 mb-4">{card.desc}</p>
              <Link to={card.link} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                Go to {card.title} &rarr;
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClientDashboard;
