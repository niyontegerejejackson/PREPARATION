import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ roomNumber: '', roomType: 'Single', pricePerNight: '', description: '', status: 'Available' });
  const [imageFile, setImageFile] = useState(null);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (err) {
      toast.error('Failed to load rooms');
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imagePath = '/uploads/default-room.jpg';
      
      // Upload image first if present
      if (imageFile) {
        const form = new FormData();
        form.append('image', imageFile);
        const uploadRes = await api.post('/rooms/upload', form, { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imagePath = uploadRes.data;
      }

      await api.post('/rooms', {
        ...formData,
        image: imagePath
      });

      toast.success('Room added successfully');
      setShowModal(false);
      fetchRooms();
      setFormData({ roomNumber: '', roomType: 'Single', pricePerNight: '', description: '', status: 'Available' });
      setImageFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding room');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Delete this room?')) {
      try {
        await api.delete(`/rooms/${id}`);
        toast.success('Room deleted');
        fetchRooms();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Rooms</h2>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add New Room</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {rooms.map(room => (
          <div key={room._id} className="border rounded-lg overflow-hidden relative group">
            <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(http://localhost:5000${room.image})` }} />
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">Room {room.roomNumber}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${room.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{room.status}</span>
              </div>
              <p className="text-slate-500 text-sm mb-2">{room.roomType} &bull; ${room.pricePerNight}/night</p>
              <button onClick={() => handleDelete(room._id)} className="text-red-500 text-sm hover:underline">Delete Room</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Room</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Room Number" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, roomNumber: e.target.value})} />
              <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, roomType: e.target.value})}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
              </select>
              <input type="number" placeholder="Price Per Night" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, pricePerNight: e.target.value})} />
              <textarea placeholder="Description" required className="w-full border p-2 rounded" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              <input type="file" accept="image/*" className="w-full border p-2 rounded" onChange={e => setImageFile(e.target.files[0])} />
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;
