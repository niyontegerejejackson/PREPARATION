import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaHistory, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/audit-logs');
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  // Run filter logic on search or filter change
  useEffect(() => {
    let result = logs;

    // Search query
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(log => 
        log.details.toLowerCase().includes(q) || 
        log.action.toLowerCase().includes(q) ||
        (log.user && log.user.username.toLowerCase().includes(q)) ||
        (log.ipAddress && log.ipAddress.includes(q))
      );
    }

    // Action category
    if (actionFilter !== 'All') {
      result = result.filter(log => {
        if (actionFilter === 'Auth') return log.action.includes('LOGIN') || log.action.includes('REGISTER') || log.action.includes('LOGOUT');
        if (actionFilter === 'Room') return log.action.includes('ROOM');
        if (actionFilter === 'Booking') return log.action.includes('BOOKING') || log.action.includes('CHECKOUT');
        if (actionFilter === 'Backup') return log.action.includes('BACKUP');
        return log.action === actionFilter;
      });
    }

    setFilteredLogs(result);
  }, [search, actionFilter, logs]);

  // Blob CSV Exporter
  const handleExportCSV = () => {
    if (!filteredLogs.length) return toast.error('No logs available to export');
    
    const headers = ['Timestamp', 'Action', 'Triggered By', 'IP Address', 'Activity Details'];
    const rows = filteredLogs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.user ? `${log.user.username} (${log.user.email})` : 'System',
      log.ipAddress || 'N/A',
      log.details
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `security_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Security audit log exported!');
  };

  // Badge styler for action types
  const getActionBadgeClass = (action) => {
    if (action.includes('SUCCESS') || action.includes('RESTORED')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('FAILED') || action.includes('BLOCKED') || action.includes('DELETED')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (action.includes('ROOM') || action.includes('ADDED') || action.includes('UPDATED')) {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    if (action.includes('BACKUP')) {
      return 'bg-violet-100 text-violet-800 border-violet-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Title Panel */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center">
              <FaHistory className="mr-2.5 text-indigo-600" /> Security & Activity Audit Trail
            </h2>
            <p className="text-sm text-slate-500">Immutable chronological record of administrative actions, room modifications, backup activities, and security sessions.</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors cursor-pointer"
          >
            <FaDownload /> Export Audit CSV
          </button>
        </div>

        {/* Filter Bar */}
        <div className="mt-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <FaSearch className="absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, IP, actions, or details..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-slate-50"
            />
          </div>

          {/* Action category */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <FaFilter className="text-slate-400 text-sm hidden sm:inline" />
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full md:w-48 border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Auth">Authentication Activities</option>
              <option value="Room">Room Customizations</option>
              <option value="Booking">Bookings & Checkout</option>
              <option value="Backup">Database Backups</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Querying security records...</div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Triggered By</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">
                      No security audit log items found matching the filter.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-slate-50 font-sans">
                      <td className="p-4 font-mono text-xs text-slate-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded text-xs font-semibold border ${getActionBadgeClass(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap font-medium text-slate-800">
                        {log.user ? log.user.username : <span className="text-slate-400 italic">System</span>}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-500">
                        {log.ipAddress || 'N/A'}
                      </td>
                      <td className="p-4 text-slate-600 max-w-md break-words font-medium">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
