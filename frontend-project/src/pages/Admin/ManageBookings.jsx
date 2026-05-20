import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({ userId: '', room: '', checkInDate: '', checkOutDate: '' });

  const fetchData = async () => {
    try {
      const [bookRes, clientRes, roomRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/auth/clients'),
        api.get('/rooms?available=true')
      ]);
      setBookings(bookRes.data);
      setClients(clientRes.data);
      setRooms(roomRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBooking = async (e) => {
    e.preventDefault();
    try {
      const selectedRoom = rooms.find(r => r._id === formData.room);
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const totalAmount = diffDays * selectedRoom.pricePerNight;

      await api.post('/bookings', { ...formData, totalAmount });
      toast.success('Booking added successfully');
      setShowModal(false);
      fetchData();
      setFormData({ userId: '', room: '', checkInDate: '', checkOutDate: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add booking');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { bookingStatus: status });
      toast.success(`Booking ${status}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update booking status');
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this booking? This will release the associated room.')) {
      try {
        await api.delete(`/bookings/${id}`);
        toast.success('Booking deleted successfully');
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete booking');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Bookings</h2>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Booking</button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.user?.username} <br/><span className="text-xs text-gray-500">{booking.user?.email}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Room {booking.room?.roomNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${booking.bookingStatus === 'Approved' ? 'bg-green-100 text-green-800' : 
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {booking.bookingStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {booking.bookingStatus === 'Pending' && (
                    <>
                      <button onClick={() => handleUpdateStatus(booking._id, 'Approved')} className="text-green-600 hover:text-green-900">Approve</button>
                      <button onClick={() => handleUpdateStatus(booking._id, 'Cancelled')} className="text-red-600 hover:text-red-900">Cancel</button>
                    </>
                  )}
                  <button onClick={() => handleDeleteBooking(booking._id)} className="text-rose-600 hover:text-rose-900 font-semibold focus:outline-none focus:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Booking on Behalf of Client</h3>
            <form onSubmit={handleAddBooking} className="space-y-4">
              <select required className="w-full border p-2 rounded" value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})}>
                <option value="">Select Client</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.username} ({c.email})</option>
                ))}
              </select>
              <select required className="w-full border p-2 rounded" value={formData.room} onChange={e => setFormData({...formData, room: e.target.value})}>
                <option value="">Select Available Room</option>
                {rooms.map(r => (
                  <option key={r._id} value={r._id}>Room {r.roomNumber} - ${r.pricePerNight}/night</option>
                ))}
              </select>
              <div>
                <label className="block text-sm text-slate-600">Check-in Date</label>
                <input type="date" required className="w-full border p-2 rounded" value={formData.checkInDate} min={new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, checkInDate: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-slate-600">Check-out Date</label>
                <input type="date" required className="w-full border p-2 rounded" value={formData.checkOutDate} min={formData.checkInDate || new Date().toISOString().split('T')[0]} onChange={e => setFormData({...formData, checkOutDate: e.target.value})} />
              </div>
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
