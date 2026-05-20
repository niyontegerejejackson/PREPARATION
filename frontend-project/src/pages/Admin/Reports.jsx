import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { 
  FaFileInvoiceDollar, 
  FaChartLine, 
  FaMoneyBillWave, 
  FaExclamationTriangle, 
  FaUsers, 
  FaDownload, 
  FaPrint, 
  FaBed 
} from 'react-icons/fa';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('billing');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState('');
  
  // Data states
  const [guestBill, setGuestBill] = useState(null);
  const [dailyIncome, setDailyIncome] = useState(null);
  const [pendingPayments, setPendingPayments] = useState(null);
  const [customerTransactions, setCustomerTransactions] = useState([]);
  const [roomStats, setRoomStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchBookings();
    fetchRoomStats();
  }, []);

  // Fetch all bookings for the selector
  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings');
    }
  };

  // Fetch Room Stats
  const fetchRoomStats = async () => {
    try {
      const { data } = await api.get('/reports/room-stats');
      setRoomStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Generate Guest Bill
  const handleGenerateGuestBill = async () => {
    if (!selectedBooking) return toast.error('Please select a booking');
    setLoading(true);
    try {
      const { data } = await api.get(`/reports/guest-bill/${selectedBooking}`);
      setGuestBill(data);
      toast.success('Guest bill generated successfully');
    } catch (err) {
      toast.error('Failed to generate guest bill');
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch Daily Income
  const fetchDailyIncome = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/daily-income');
      setDailyIncome(data);
    } catch (err) {
      toast.error('Failed to load daily income');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Pending Payments (Loans)
  const fetchPendingPayments = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/pending-payments');
      setPendingPayments(data);
    } catch (err) {
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  // 4. Fetch Customer Transactions
  const fetchCustomerTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/customer-transactions');
      setCustomerTransactions(data);
    } catch (err) {
      toast.error('Failed to load customer transactions');
    } finally {
      setLoading(false);
    }
  };

  // Load active tab data
  useEffect(() => {
    if (activeTab === 'income') {
      fetchDailyIncome();
    } else if (activeTab === 'pending') {
      fetchPendingPayments();
    } else if (activeTab === 'customer') {
      fetchCustomerTransactions();
    } else if (activeTab === 'rooms') {
      fetchRoomStats();
    }
  }, [activeTab]);

  // Robust Blob CSV Exporter
  const exportToCSV = (headers, rows, filename) => {
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val === null || val === undefined ? '' : val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${filename} exported!`);
  };

  // CSV Exporters for each tab
  const handleExportIncome = () => {
    if (!dailyIncome || !dailyIncome.payments.length) return toast.error('No daily income data to export');
    const headers = ['Payment Date', 'Guest', 'Email', 'Room Number', 'Room Type', 'Amount Paid', 'Received By'];
    const rows = dailyIncome.payments.map(p => [
      new Date(p.paymentDate).toLocaleString(),
      p.booking?.user?.username || 'N/A',
      p.booking?.user?.email || 'N/A',
      p.booking?.room?.roomNumber || 'N/A',
      p.booking?.room?.roomType || 'N/A',
      p.amountPaid,
      p.receivedBy?.username || 'System'
    ]);
    exportToCSV(headers, rows, `daily_income_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportPending = () => {
    if (!pendingPayments || !pendingPayments.bookings.length) return toast.error('No pending payments to export');
    const headers = ['Booking ID', 'Guest', 'Email', 'Room Number', 'Room Type', 'Total Cost', 'Total Paid', 'Outstanding Balance'];
    const rows = pendingPayments.bookings.map(b => [
      b.bookingId,
      b.user?.username || 'N/A',
      b.user?.email || 'N/A',
      b.room?.roomNumber || 'N/A',
      b.room?.roomType || 'N/A',
      b.totalAmount,
      b.totalPaid,
      b.balance
    ]);
    exportToCSV(headers, rows, `outstanding_loans_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportTransactions = () => {
    if (!customerTransactions.length) return toast.error('No transaction records to export');
    const headers = ['Booking ID', 'Guest', 'Room Number', 'Check In', 'Check Out', 'Total Cost', 'Amount Paid', 'Remaining Loan'];
    const rows = customerTransactions.map(t => [
      t.bookingId,
      t.user?.username || 'N/A',
      t.room?.roomNumber || 'N/A',
      new Date(t.checkInDate).toLocaleDateString(),
      new Date(t.checkOutDate).toLocaleDateString(),
      t.totalAmount,
      t.totalPaid,
      t.balance
    ]);
    exportToCSV(headers, rows, 'customer_transaction_history.csv');
  };

  // Recharts Prep
  const pieColors = ['#10B981', '#3B82F6', '#EF4444']; // Available, Occupied, Maintenance
  const getRoomPieData = () => {
    if (!roomStats) return [];
    return [
      { name: 'Available', value: roomStats.availableRooms },
      { name: 'Occupied', value: roomStats.occupiedRooms },
      { name: 'Maintenance', value: roomStats.maintenanceRooms },
    ].filter(item => item.value > 0);
  };

  return (
    <div className="space-y-6">
      {/* Upper Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'billing' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaFileInvoiceDollar className="mr-2" /> Guest Billing
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'income' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaMoneyBillWave className="mr-2" /> Daily Income
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'pending' 
              ? 'bg-rose-600 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaExclamationTriangle className="mr-2" /> Outstanding Loans
        </button>
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'customer' 
              ? 'bg-violet-600 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaUsers className="mr-2" /> Customer Transactions
        </button>
        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'rooms' 
              ? 'bg-sky-600 text-white shadow-md' 
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FaBed className="mr-2" /> Room Statistics
        </button>
      </div>

      {/* Tabs Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {loading && <div className="text-center py-12 text-slate-500">Retrieving Report Analytics...</div>}

        {!loading && activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="print:hidden">
              <h2 className="text-xl font-bold text-slate-800 mb-2">Guest Invoice Builder</h2>
              <p className="text-sm text-slate-500 mb-6">Select an active or past guest booking to generate a full print-ready guest invoice.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
                <select 
                  className="flex-1 border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" 
                  value={selectedBooking} 
                  onChange={e => setSelectedBooking(e.target.value)}
                >
                  <option value="">Select a Booking</option>
                  {bookings.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.user?.username} (Room {b.room?.roomNumber}) - Status: {b.bookingStatus}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={handleGenerateGuestBill} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
                >
                  Generate Invoice
                </button>
              </div>
            </div>

            {guestBill && (
              <div className="border border-slate-200 rounded-xl p-8 bg-white max-w-4xl mx-auto print-container shadow-lg" id="printableBill">
                {/* Invoice Header */}
                <div className="border-b border-slate-200 pb-6 mb-6 flex justify-between items-start flex-col sm:flex-row gap-4">
                  <div>
                    <h2 className="text-3xl font-extrabold text-indigo-900 leading-tight">HOTELPRO RWANDA LTD</h2>
                    <p className="text-slate-500 mt-1 font-medium">123 KG Ave, Kigali City</p>
                    <p className="text-slate-400 text-xs mt-0.5">Tel: +250 788 000 000 | info@hotelpro.rw</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <h3 className="text-2xl font-bold text-slate-700">INVOICE BILL</h3>
                    <p className="text-sm text-slate-500 mt-1">Invoice ID: <span className="font-mono text-xs">{guestBill.booking._id}</span></p>
                    <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                {/* Guest & Room Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wide text-xs mb-2">Guest Information</h4>
                    <p className="font-semibold text-slate-800 text-base">{guestBill.booking.user?.username}</p>
                    <p className="text-slate-500">{guestBill.booking.user?.email}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold text-slate-700 uppercase tracking-wide text-xs mb-2">Reservation Details</h4>
                    <p><span className="font-medium text-slate-500">Room:</span> <span className="font-semibold text-slate-800">#{guestBill.booking.room?.roomNumber}</span> ({guestBill.booking.room?.roomType})</p>
                    <p><span className="font-medium text-slate-500">Check-In:</span> {new Date(guestBill.booking.checkInDate).toLocaleString()}</p>
                    <p><span className="font-medium text-slate-500">Check-Out:</span> {new Date(guestBill.booking.checkOutDate).toLocaleString()}</p>
                  </div>
                </div>

                {/* Billing Summary Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm mb-6 border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-200 text-slate-600 font-semibold bg-slate-50">
                        <th className="p-3 text-left">Description</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-3 text-slate-700">Room Accommodation Total ({guestBill.booking.room?.roomType})</td>
                        <td className="p-3 text-right font-semibold text-slate-800">${guestBill.summary.totalAmount.toFixed(2)}</td>
                      </tr>
                      {guestBill.payments.map((p, i) => (
                        <tr key={i}>
                          <td className="p-3 text-emerald-600 italic">
                            Payment Ref ({p._id?.substring(18)}) on {new Date(p.paymentDate).toLocaleDateString()} via {p.paymentMethod}
                          </td>
                          <td className="p-3 text-right font-semibold text-emerald-600">-${p.amountPaid.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t-2 border-slate-200">
                        <td className="p-3 text-right text-slate-700">Total Payments Made</td>
                        <td className="p-3 text-right text-emerald-600">${guestBill.summary.totalPaid.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-slate-100 font-extrabold text-base">
                        <td className="p-3 text-right text-slate-800">Remaining Balance Due (Loan)</td>
                        <td className={`p-3 text-right ${guestBill.summary.balance > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          ${guestBill.summary.balance.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-200 pt-6 flex justify-between items-center flex-wrap gap-4">
                  <div className="text-xs text-slate-400">
                    Thank you for choosing HotelPro! Unpaid balances are recorded as active pending loans.
                  </div>
                  <button 
                    onClick={() => window.print()} 
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md print:hidden cursor-pointer"
                  >
                    <FaPrint /> Print Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'income' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Daily Income Statement</h2>
                <p className="text-sm text-slate-500">Payments collected and processed globally today.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportIncome} 
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaDownload /> Export CSV
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>

            {dailyIncome && (
              <div className="space-y-6 print-container">
                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Income Today</span>
                    <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">${dailyIncome.totalIncome.toFixed(2)}</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Transactions Recorded</span>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{dailyIncome.payments.length}</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Statement Date</span>
                    <h3 className="text-xl font-bold text-slate-800 mt-3">{new Date().toDateString()}</h3>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-4">Time</th>
                        <th className="p-4">Guest</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Received By</th>
                        <th className="p-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {dailyIncome.payments.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No payments received today yet.</td>
                        </tr>
                      ) : (
                        dailyIncome.payments.map(p => (
                          <tr key={p._id} className="hover:bg-slate-50">
                            <td className="p-4 font-mono text-xs">{new Date(p.paymentDate).toLocaleTimeString()}</td>
                            <td className="p-4 font-medium text-slate-900">{p.booking?.user?.username || 'Guest'}</td>
                            <td className="p-4">Room #{p.booking?.room?.roomNumber || 'N/A'} ({p.booking?.room?.roomType || 'N/A'})</td>
                            <td className="p-4"><span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded font-medium">{p.paymentMethod}</span></td>
                            <td className="p-4 font-medium">{p.receivedBy?.username || 'System'}</td>
                            <td className="p-4 text-right font-bold text-emerald-600">${p.amountPaid.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Pending Balances & Loans</h2>
                <p className="text-sm text-slate-500">Unpaid balances for bookings blocked from final checkout.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportPending} 
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaDownload /> Export CSV
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>

            {pendingPayments && (
              <div className="space-y-6 print-container">
                {/* Grand Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                    <span className="text-xs font-semibold text-rose-500 uppercase tracking-wide">Total Active Loans</span>
                    <h3 className="text-3xl font-extrabold text-rose-600 mt-2">${pendingPayments.totalPendingAmount.toFixed(2)}</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Guests Indebted</span>
                    <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{pendingPayments.count}</h3>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Security Control status</span>
                    <h3 className="text-base font-semibold text-rose-600 mt-3.5 flex items-center">
                      <FaExclamationTriangle className="mr-1.5" /> Checkout Locked
                    </h3>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-4">Guest</th>
                        <th className="p-4">Room</th>
                        <th className="p-4">Check Out Date</th>
                        <th className="p-4 text-right">Total Cost</th>
                        <th className="p-4 text-right">Total Paid</th>
                        <th className="p-4 text-right">Loan Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {pendingPayments.bookings.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No outstanding customer balances found. Excellent!</td>
                        </tr>
                      ) : (
                        pendingPayments.bookings.map((b, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4">
                              <div className="font-semibold text-slate-900">{b.user?.username || 'Guest'}</div>
                              <div className="text-xs text-slate-400">{b.user?.email || ''}</div>
                            </td>
                            <td className="p-4">Room #{b.room?.roomNumber} ({b.room?.roomType})</td>
                            <td className="p-4 font-mono text-xs">{new Date(b.checkOutDate).toLocaleString()}</td>
                            <td className="p-4 text-right font-semibold">${b.totalAmount.toFixed(2)}</td>
                            <td className="p-4 text-right font-medium text-emerald-600">${b.totalPaid.toFixed(2)}</td>
                            <td className="p-4 text-right font-bold text-rose-600">${b.balance.toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && activeTab === 'customer' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Customer Transaction History</h2>
                <p className="text-sm text-slate-500">Chronological history of reservations, invoice costs, and balances by guest.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportTransactions} 
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaDownload /> Export CSV
                </button>
                <button 
                  onClick={() => window.print()} 
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
                >
                  <FaPrint /> Print Report
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-xl print-container">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-4">Guest</th>
                    <th className="p-4">Room</th>
                    <th className="p-4">Stay Dates</th>
                    <th className="p-4 text-right">Total Invoice</th>
                    <th className="p-4 text-right">Total Payments</th>
                    <th className="p-4 text-right">Pending Loan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {customerTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-400 font-medium">No bookings or transactions recorded.</td>
                    </tr>
                  ) : (
                    customerTransactions.map((t, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-900">{t.user?.username || 'Guest'}</td>
                        <td className="p-4">Room #{t.room?.roomNumber || 'N/A'} ({t.room?.roomType || 'N/A'})</td>
                        <td className="p-4 font-mono text-xs">
                          {new Date(t.checkInDate).toLocaleDateString()} - {new Date(t.checkOutDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right font-medium">${t.totalAmount.toFixed(2)}</td>
                        <td className="p-4 text-right font-semibold text-emerald-600">${t.totalPaid.toFixed(2)}</td>
                        <td className="p-4 text-right font-bold text-slate-900">
                          {t.balance > 0 ? (
                            <span className="text-rose-600">${t.balance.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-500">$0.00</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && activeTab === 'rooms' && roomStats && (
          <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Room Occupancy & Maintenance Metrics</h2>
                <p className="text-sm text-slate-500">Live breakdown of hotel capacity, active cleanups, and utilization.</p>
              </div>
              <button 
                onClick={() => window.print()} 
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer"
              >
                <FaPrint /> Print Metrics
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center print-container">
              {/* Summary Cards */}
              <div className="space-y-4">
                <div className="bg-sky-50 p-6 rounded-xl border border-sky-100">
                  <span className="text-xs font-semibold text-sky-600 uppercase tracking-wide">Live Occupancy Rate</span>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <h3 className="text-4xl font-extrabold text-sky-700">{roomStats.occupancyRate}%</h3>
                    <span className="text-sm font-medium text-slate-500">of {roomStats.totalRooms} rooms occupied</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-sky-200 h-2.5 rounded-full mt-4">
                    <div 
                      className="bg-sky-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${roomStats.occupancyRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-600 block uppercase">Available</span>
                    <h4 className="text-2xl font-bold text-emerald-700 mt-1">{roomStats.availableRooms}</h4>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                    <span className="text-xs font-semibold text-blue-600 block uppercase">Occupied</span>
                    <h4 className="text-2xl font-bold text-blue-700 mt-1">{roomStats.occupiedRooms}</h4>
                  </div>
                  <div className="bg-rose-50 p-4 rounded-xl text-center border border-rose-100">
                    <span className="text-xs font-semibold text-rose-600 block uppercase">Maintenance</span>
                    <h4 className="text-2xl font-bold text-rose-700 mt-1">{roomStats.maintenanceRooms}</h4>
                  </div>
                </div>
              </div>

              {/* Recharts Pie Chart */}
              <div className="h-64 flex justify-center items-center bg-slate-50 rounded-xl p-4 border border-slate-100 print:hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getRoomPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getRoomPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} Rooms`, 'Status']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;
