import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { FaDatabase, FaPlus, FaTrash, FaUndo, FaDownload, FaToggleOn, FaToggleOff, FaSlidersH } from 'react-icons/fa';

const Settings = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [preventUnpaidCheckout, setPreventUnpaidCheckout] = useState(true);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/backup');
      setBackups(data);
    } catch (err) {
      toast.error('Failed to load backup list');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const { data } = await api.post('/backup');
      toast.success(data.message || 'Database backup created successfully!');
      fetchBackups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create database backup');
    } finally {
      setCreating(false);
    }
  };

  const handleRestoreBackup = async (fileName) => {
    const confirm = window.confirm(`WARNING: Restoring will overwrite the current database collections with the state from "${fileName}". Are you sure you want to proceed?`);
    if (!confirm) return;

    setLoading(true);
    try {
      const { data } = await api.post('/backup/restore', { fileName });
      toast.success(data.message || 'Database state restored successfully!');
      // Force reload page to refresh context state since collections were replaced
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore database state');
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (fileName) => {
    const confirm = window.confirm(`Are you sure you want to permanently delete backup "${fileName}"?`);
    if (!confirm) return;

    try {
      await api.delete(`/backup/${fileName}`);
      toast.success('Backup deleted successfully');
      fetchBackups();
    } catch (err) {
      toast.error('Failed to delete backup file');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Policy and Config card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center">
          <FaSlidersH className="mr-2.5 text-indigo-600" /> Automation & Security Policies
        </h2>
        <p className="text-sm text-slate-500 mb-6">Manage business logic rules, guest flows, and payment validation policies.</p>

        <div className="divide-y divide-slate-100">
          <div className="py-4 flex justify-between items-center flex-wrap gap-4">
            <div className="max-w-xl">
              <h3 className="text-base font-semibold text-slate-800">Enforce Strict Unpaid Balance Block</h3>
              <p className="text-sm text-slate-500 mt-1">
                Prevent check-out automation and manual release if the guest outstanding loan balance is greater than zero. Leaves the room status as Occupied and notifies administrators.
              </p>
            </div>
            <button
              onClick={() => {
                setPreventUnpaidCheckout(!preventUnpaidCheckout);
                toast.success(`Strict balance check ${!preventUnpaidCheckout ? 'enabled' : 'disabled'}`);
              }}
              className="focus:outline-none cursor-pointer text-4xl"
            >
              {preventUnpaidCheckout ? (
                <FaToggleOn className="text-indigo-600" />
              ) : (
                <FaToggleOff className="text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Database Backups Card */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center">
              <FaDatabase className="mr-2.5 text-indigo-600" /> Database Backup & Recovery
            </h2>
            <p className="text-sm text-slate-500">Create, download, or restore complete JSON system snapshots containing users, rooms, bookings, and payments.</p>
          </div>
          <button
            onClick={handleCreateBackup}
            disabled={creating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md transition-colors cursor-pointer"
          >
            <FaPlus /> {creating ? 'Archiving Database...' : 'Create Backup Package'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500">Querying backup archives...</div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold">
                <tr>
                  <th className="p-4">Package ID</th>
                  <th className="p-4">Archive Date</th>
                  <th className="p-4 text-right">File Size</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {backups.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 font-medium">
                      No database backups found. Click "Create Backup Package" to generate one.
                    </td>
                  </tr>
                ) : (
                  backups.map((b) => (
                    <tr key={b.fileName} className="hover:bg-slate-50">
                      <td className="p-4 font-mono text-xs font-semibold text-slate-900">{b.fileName}</td>
                      <td className="p-4">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="p-4 text-right font-medium">{formatBytes(b.size)}</td>
                      <td className="p-4">
                        <div className="flex justify-center items-center gap-2">
                          <a
                            href={`http://localhost:5000/uploads/backups/${b.fileName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded transition-all text-xs cursor-pointer"
                          >
                            <FaDownload /> Download
                          </a>
                          <button
                            onClick={() => handleRestoreBackup(b.fileName)}
                            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded transition-all text-xs cursor-pointer"
                          >
                            <FaUndo /> Restore
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(b.fileName)}
                            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold px-3 py-1.5 rounded transition-all text-xs cursor-pointer"
                          >
                            <FaTrash /> Delete
                          </button>
                        </div>
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

export default Settings;
