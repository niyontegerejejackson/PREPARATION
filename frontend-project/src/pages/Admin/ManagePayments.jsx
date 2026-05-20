import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ booking: '', amountPaid: '' });

  const fetchData = async () => {
    try {
      const [payRes, bookRes] = await Promise.all([
        api.get('/payments'),
        api.get('/bookings')
      ]);
      setPayments(payRes.data);
      // Only show Approved bookings that are not fully paid
      setBookings(bookRes.data.filter(b => b.bookingStatus === 'Approved' && b.paymentStatus !== 'Paid'));
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', formData);
      toast.success('Payment recorded successfully');
      setShowModal(false);
      fetchData();
      setFormData({ booking: '', amountPaid: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error recording payment');
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Manage Payments</h2>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Record Payment</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map(payment => (
              <tr key={payment._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment._id.substring(18)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Room {payment.booking?.room?.roomNumber} <br/>
                  <span className="text-xs">({payment.booking?.user?.username})</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">${payment.amountPaid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.receivedBy?.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Record Payment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required className="w-full border p-2 rounded" value={formData.booking} onChange={e => setFormData({...formData, booking: e.target.value})}>
                <option value="">Select Booking</option>
                {bookings.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.user?.username} - Room {b.room?.roomNumber} (Total: ${b.totalAmount})
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Amount Paid" required className="w-full border p-2 rounded" value={formData.amountPaid} onChange={e => setFormData({...formData, amountPaid: e.target.value})} />
              <div className="flex space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-200 py-2 rounded">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePayments;
