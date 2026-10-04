import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: Record<string, string>;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, details, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
  };

  return (
    <div className={`p-4 rounded-lg border flex gap-3 text-sm ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {details && Object.keys(details).length > 0 && (
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs opacity-90">
            {Object.entries(details).map(([field, err]) => (
              <li key={field}>
                <span className="font-semibold capitalize">{field}</span>: {err}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onClose && (
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold ml-2">
          ✕
        </button>
      )}
    </div>
  );
};
