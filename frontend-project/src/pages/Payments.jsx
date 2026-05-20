import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchData = async () => {
    try {
      const [paymentsRes, bookingsRes] = await Promise.all([
        api.get('/payments'),
        api.get('/bookings')
      ]);
      setPayments(paymentsRes.data);
      setBookings(bookingsRes.data.filter(b => b.paymentStatus !== 'Paid'));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editingId) {
        await api.put(`/payments/${editingId}`, data);
      } else {
        await api.post('/payments', data);
      }
      closeForm();
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving payment');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await api.delete(`/payments/${id}`);
        fetchData();
      } catch (error) {
        alert('Error deleting payment');
      }
    }
  };

  const handleEdit = (payment) => {
    setEditingId(payment._id);
    setValue('amountPaid', payment.amountPaid);
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
        <h2 className="text-2xl font-bold text-gray-800">Payments Management</h2>
        <button
          onClick={showForm ? closeForm : () => setShowForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Record Payment'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Edit Payment Amount' : 'Add Payment'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!editingId && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Select Booking</label>
                <select {...register('booking', { required: true })} className="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="">Select a pending booking</option>
                  {bookings.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.guest?.fullName} - Room {b.room?.roomNumber} (Total: ${b.totalAmount})
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Paid</label>
              <input type="number" {...register('amountPaid', { required: true, min: 1 })} className="mt-1 block w-full px-3 py-2 border rounded-md" />
            </div>

            <div className="md:col-span-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                {editingId ? 'Update Payment' : 'Save Payment'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.booking?.guest?.fullName} (Room {payment.booking?.room?.roomNumber})
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">${payment.amountPaid}</td>
                <td className="px-6 py-4 whitespace-nowrap">{payment.receivedBy?.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(payment)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button onClick={() => handleDelete(payment._id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
