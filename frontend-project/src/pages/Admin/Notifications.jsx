import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaBell, FaCheck } from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center"><FaBell className="mr-3 text-indigo-500"/> Notifications</h2>
      
      <div className="space-y-4">
        {notifications.map(notif => (
          <div key={notif._id} className={`p-4 rounded-lg border flex justify-between items-center ${notif.isRead ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50 border-indigo-200'}`}>
            <div>
              <p className={`text-sm ${notif.isRead ? 'text-slate-600' : 'text-indigo-900 font-semibold'}`}>{notif.message}</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
            </div>
            {!notif.isRead && (
              <button 
                onClick={() => markAsRead(notif._id)}
                className="text-indigo-600 hover:text-indigo-800 p-2 rounded-full hover:bg-indigo-100 transition"
                title="Mark as read"
              >
                <FaCheck />
              </button>
            )}
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-8 text-slate-500">No notifications.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
