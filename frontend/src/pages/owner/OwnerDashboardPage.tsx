import React from 'react';
import { Store } from 'lucide-react';

export const OwnerDashboardPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg">
          <Store className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Owner Dashboard</h1>
          <p className="text-sm text-gray-500">Track customer ratings and reviews for your stores</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500">Store owner reviews interface will be populated in Stage 8.</p>
      </div>
    </div>
  );
};
