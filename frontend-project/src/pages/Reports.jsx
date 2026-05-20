import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  const [guestBill, setGuestBill] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [activeTab, setActiveTab] = useState('guestBill');

  useEffect(() => {
    // Fetch bookings for the dropdown
    api.get('/bookings').then(res => setBookings(res.data)).catch(console.error);
  }, []);

  const fetchGuestBill = async () => {
    if (!selectedBooking) return alert('Select a booking first');
    try {
      const res = await api.get(`/reports/guest-bill/${selectedBooking}`);
      setGuestBill(res.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching guest bill');
    }
  };

  const fetchDailyReport = async () => {
    try {
      const res = await api.get('/reports/daily-bookings');
      setDailyReport(res.data);
    } catch (error) {
      console.error(error);
      alert('Error fetching daily report');
    }
  };

  useEffect(() => {
    if (activeTab === 'dailyReport') {
      fetchDailyReport();
    }
  }, [activeTab]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Reports</h2>

      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('guestBill')}
            className={`${activeTab === 'guestBill' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Guest Bill
          </button>
          <button
            onClick={() => setActiveTab('dailyReport')}
            className={`${activeTab === 'dailyReport' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Daily Room Booking Report
          </button>
        </nav>
      </div>

      {activeTab === 'guestBill' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex space-x-4 mb-6">
            <select
              value={selectedBooking}
              onChange={(e) => setSelectedBooking(e.target.value)}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a Booking</option>
              {bookings.map(b => (
                <option key={b._id} value={b._id}>
                  {b.guest?.fullName} - Room {b.room?.roomNumber} ({new Date(b.checkInDate).toLocaleDateString()})
                </option>
              ))}
            </select>
            <button onClick={fetchGuestBill} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Generate Bill
            </button>
          </div>

          {guestBill && (
            <div className="border border-gray-200 rounded p-6 print:border-none">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold uppercase">HotelPro Rwanda Ltd</h2>
                <p className="text-gray-600">Guest Bill</p>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-2">Guest Details</h4>
                  <p><strong>Name:</strong> {guestBill.booking.guest.fullName}</p>
                  <p><strong>Phone:</strong> {guestBill.booking.guest.phone}</p>
                  <p><strong>Email:</strong> {guestBill.booking.guest.email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-700 border-b pb-2 mb-2">Booking Details</h4>
                  <p><strong>Room:</strong> {guestBill.booking.room.roomNumber} ({guestBill.booking.room.roomType})</p>
                  <p><strong>Check-In:</strong> {new Date(guestBill.booking.checkInDate).toLocaleDateString()}</p>
                  <p><strong>Check-Out:</strong> {new Date(guestBill.booking.checkOutDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> {guestBill.booking.paymentStatus}</p>
                </div>
              </div>

              <h4 className="font-bold text-gray-700 border-b pb-2 mb-4">Payment History</h4>
              <table className="min-w-full divide-y divide-gray-200 mb-8">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Received By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {guestBill.payments.map(p => (
                    <tr key={p._id}>
                      <td className="py-2">{new Date(p.paymentDate).toLocaleDateString()}</td>
                      <td className="py-2">${p.amountPaid}</td>
                      <td className="py-2">{p.receivedBy.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-bold">Total Amount:</span>
                    <span>${guestBill.summary.totalAmount}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-bold">Total Paid:</span>
                    <span className="text-green-600">${guestBill.summary.totalPaid}</span>
                  </div>
                  <div className="flex justify-between py-2 text-lg font-bold">
                    <span>Balance Due:</span>
                    <span className={guestBill.summary.balance > 0 ? 'text-red-600' : 'text-gray-800'}>
                      ${guestBill.summary.balance}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded print:hidden">
                  Print Bill
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dailyReport' && dailyReport && (
        <div className="bg-white p-6 rounded-lg shadow-md">
           <div className="text-center mb-8">
            <h2 className="text-2xl font-bold uppercase">HotelPro Rwanda Ltd</h2>
            <p className="text-gray-600">Daily Room Booking Report - {dailyReport.date}</p>
          </div>

          <div className="mb-6 flex space-x-8">
            <div className="bg-indigo-50 p-4 rounded-lg flex-1">
              <p className="text-sm text-indigo-600 font-semibold uppercase">Total Bookings Today</p>
              <p className="text-3xl font-bold text-indigo-900">{dailyReport.totalBookings}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex-1">
              <p className="text-sm text-green-600 font-semibold uppercase">Expected Revenue</p>
              <p className="text-3xl font-bold text-green-900">
                ${dailyReport.bookings.reduce((acc, b) => acc + b.totalAmount, 0)}
              </p>
            </div>
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dailyReport.bookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.guest?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.room?.roomNumber} ({booking.room?.roomType})</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">${booking.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{booking.paymentStatus}</td>
                </tr>
              ))}
              {dailyReport.bookings.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">No bookings made today.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-8 text-center print:hidden">
            <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded">
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
