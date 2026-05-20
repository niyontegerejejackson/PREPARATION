import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  const selectedRoomId = watch('room');
  const selectedCheckIn = watch('checkInDate');
  const selectedCheckOut = watch('checkOutDate');

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate total amount automatically
  useEffect(() => {
    if (selectedRoomId && selectedCheckIn && selectedCheckOut) {
      const room = rooms.find(r => r._id === selectedRoomId);
      if (room) {
        const inDate = new Date(selectedCheckIn);
        const outDate = new Date(selectedCheckOut);
        const timeDiff = outDate.getTime() - inDate.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        if (nights > 0) {
          setValue('totalAmount', nights * room.pricePerNight);
        }
      }
    }
  }, [selectedRoomId, selectedCheckIn, selectedCheckOut, rooms, setValue]);

  const fetchData = async () => {
    try {
      const [bookingsRes, roomsRes, guestsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms'),
        api.get('/guests')
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
      setGuests(guestsRes.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/bookings/${editingId}`, data);
      } else {
        await api.post('/bookings', data);
      }
      closeForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving booking');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.delete(`/bookings/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting booking');
      }
    }
  };

  const handleEdit = (booking) => {
    setEditingId(booking._id);
    setValue('guest', booking.guest._id);
    setValue('room', booking.room._id);
    setValue('checkInDate', booking.checkInDate.split('T')[0]);
    setValue('checkOutDate', booking.checkOutDate.split('T')[0]);
    setValue('totalAmount', booking.totalAmount);
    setValue('paymentStatus', booking.paymentStatus);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Bookings Management</h2>
        <button
          onClick={showForm ? closeForm : () => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'New Booking'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Booking' : 'Add Booking'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Guest</label>
                  <select {...register('guest', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md">
                    <option value="">Select Guest</option>
                    {guests.map(g => <option key={g._id} value={g._id}>{g.fullName} ({g.phone})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Room</label>
                  <select {...register('room', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md">
                    <option value="">Select Room</option>
                    {rooms.filter(r => r.status === 'Available').map(r => 
                      <option key={r._id} value={r._id}>{r.roomNumber} - {r.roomType} (${r.pricePerNight})</option>
                    )}
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Check-In Date</label>
              <input type="date" {...register('checkInDate', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Check-Out Date</label>
              <input type="date" {...register('checkOutDate', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Total Amount</label>
              <input type="number" readOnly {...register('totalAmount', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100" />
            </div>
            
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                <select {...register('paymentStatus')} className="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            )}

            <div className="md:col-span-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                {editingId ? 'Update Booking' : 'Save Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">{booking.guest?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.room?.roomNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${booking.totalAmount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    booking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(booking)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(booking._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Bookings;
