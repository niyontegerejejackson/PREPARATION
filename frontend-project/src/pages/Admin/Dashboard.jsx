import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaBed, FaDoorOpen, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
  const [data, setData] = useState({ stats: null, chartData: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/reports/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  if (!data.stats) return <div>Loading dashboard...</div>;

  const statCards = [
    { title: 'Total Rooms', value: data.stats.totalRooms, icon: <FaBed />, color: 'text-blue-500', bg: 'bg-blue-100' },
    { title: 'Available Rooms', value: data.stats.availableRooms, icon: <FaDoorOpen />, color: 'text-green-500', bg: 'bg-green-100' },
    { title: 'Occupied Rooms', value: data.stats.occupiedRooms, icon: <FaDoorOpen />, color: 'text-red-500', bg: 'bg-red-100' },
    { title: 'Total Revenue', value: `$${data.stats.totalRevenue}`, icon: <FaMoneyBillWave />, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
            <div className={`p-4 rounded-full ${stat.bg} ${stat.color} text-2xl mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Monthly Revenue Analytics</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
