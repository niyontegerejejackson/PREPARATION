import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const RoomSearch = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingData, setBookingData] = useState(null);

  const fetchRooms = async () => {
    try {
      // Fetch only available rooms
      const { data } = await api.get('/rooms?available=true');
      setRooms(data);
    } catch (err) {
      toast.error('Failed to load rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const checkIn = new Date(bookingData.checkInDate);
      const checkOut = new Date(bookingData.checkOutDate);
      const diffTime = Math.abs(checkOut - checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      const totalAmount = diffDays * bookingData.room.pricePerNight;

      await api.post('/bookings', {
        room: bookingData.room._id,
        checkInDate: bookingData.checkInDate,
        checkOutDate: bookingData.checkOutDate,
        totalAmount
      });

      toast.success('Room booked successfully! Awaiting admin approval.');
      setBookingData(null);
      fetchRooms(); // Refresh available rooms
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    }
  };

  const filteredRooms = rooms.filter(r => 
    r.roomType.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.pricePerNight.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800">Available Rooms</h2>
        <input 
          type="text" 
          placeholder="Search by type or price..." 
          className="px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <motion.div 
            key={room._id} 
            whileHover={{ y: -5 }}
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: `url(http://localhost:5000${room.image})` }}
            />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">{room.roomType}</h3>
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-semibold">Available</span>
              </div>
              <p className="text-sm text-slate-500 mb-4 flex-1">{room.description}</p>
              <div className="flex justify-between items-center border-t pt-4 mt-auto">
                <span className="text-lg font-bold text-indigo-600">${room.pricePerNight} <span className="text-sm text-slate-500 font-normal">/night</span></span>
                <button 
                  onClick={() => setBookingData({ room, checkInDate: '', checkOutDate: '' })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredRooms.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            No rooms available matching your search.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold mb-4">Book {bookingData.room.roomType}</h3>
            <p className="text-slate-500 mb-6">${bookingData.room.pricePerNight} per night</p>
            <form onSubmit={handleBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-in Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full px-3 py-2 border rounded-md"
                  value={bookingData.checkInDate}
                  onChange={e => setBookingData({...bookingData, checkInDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Check-out Date</label>
                <input 
                  type="date" 
                  required 
                  className="w-full px-3 py-2 border rounded-md"
                  value={bookingData.checkOutDate}
                  onChange={e => setBookingData({...bookingData, checkOutDate: e.target.value})}
                  min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setBookingData(null)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-md hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSearch;
