import { Store } from 'lucide-react';

export const StoresPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Explore Stores</h1>
          <p className="text-sm text-gray-500">Discover and rate registered stores across your neighborhood</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-800">Store Discovery Ready</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
          Store discovery and rating controls are being initialized in Stage 7.
        </p>
      </div>
    </div>
  );
};
