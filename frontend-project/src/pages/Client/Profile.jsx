import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Username</label>
          <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
            {user?.username}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Email Address</label>
          <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
            {user?.email || 'N/A'}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Role</label>
          <div className="mt-1 p-3 bg-slate-50 rounded-md border border-slate-200">
            {user?.role}
          </div>
        </div>
        
        <div className="pt-4 border-t border-slate-200 mt-6">
          <p className="text-sm text-slate-500">
            To change your password, please log out and use the "Forgot Password" feature.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
