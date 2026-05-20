import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaBed, FaCalendarCheck, FaChartLine } from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({ rooms: 0, activeBookings: 0, todayIncome: 0 });

  useEffect(() => {
    // In a real app, you'd fetch real stats from a dashboard endpoint.
    // For now, we just fetch from our existing endpoints.
    const fetchStats = async () => {
      try {
        const [roomsRes, bookingsRes, reportsRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/bookings'),
          api.get('/reports/daily-bookings')
        ]);
        
        const activeBookings = bookingsRes.data.filter(b => new Date(b.checkOutDate) >= new Date()).length;
        
        setStats({
          rooms: roomsRes.data.length,
          activeBookings: activeBookings,
          todayIncome: reportsRes.data.bookings.reduce((acc, b) => acc + b.totalAmount, 0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-4 rounded-full bg-blue-100 text-blue-600 mr-4">
            <FaBed size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold">Total Rooms</p>
            <p className="text-2xl font-bold text-gray-800">{stats.rooms}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-4 rounded-full bg-green-100 text-green-600 mr-4">
            <FaCalendarCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold">Active Bookings</p>
            <p className="text-2xl font-bold text-gray-800">{stats.activeBookings}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-4 rounded-full bg-indigo-100 text-indigo-600 mr-4">
            <FaChartLine size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold">Today's Revenue Expected</p>
            <p className="text-2xl font-bold text-gray-800">${stats.todayIncome}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
