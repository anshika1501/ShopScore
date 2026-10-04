import React from 'react';
import { Shield } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2.5 bg-purple-50 text-purple-700 rounded-lg">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Administrator Portal</h1>
          <p className="text-sm text-gray-500">Manage users, stores, and platform performance</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Admin portal management interfaces will be populated in Stage 8.</p>
      </div>
    </div>
  );
};
