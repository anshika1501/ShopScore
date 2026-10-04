import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { User, Mail, Lock, MapPin, UserPlus, Check, X } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Live validation helpers
  const nameLength = formData.name.trim().length;
  const isNameValid = nameLength >= 20 && nameLength <= 60;

  const passwordLength = formData.password.length;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(formData.password);
  const isPasswordValid = passwordLength >= 8 && passwordLength <= 16 && hasUppercase && hasSpecial;

  const addressLength = formData.address.length;
  const isAddressValid = addressLength <= 400;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Client-side guard before sending
    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters long.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must meet all complexity requirements.');
      return;
    }

    if (!isAddressValid) {
      setError('Address cannot exceed 400 characters.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim() || undefined,
      });
      navigate('/stores');
    } catch (err: any) {
      const responseData = err.response?.data;
      setError(responseData?.message || 'Registration failed. Please check the form.');
      if (responseData?.details) {
        setFieldErrors(responseData.details);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Create Customer Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign up to browse and rate local registered stores
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200 sm:px-10">
          {error && (
            <div className="mb-6">
              <Alert
                type="error"
                message={error}
                details={fieldErrors}
                onClose={() => setError(null)}
              />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <span className={`text-xs ${isNameValid ? 'text-green-600' : 'text-gray-400'}`}>
                  {nameLength}/60 chars (min 20)
                </span>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Christopher Alexander Davis"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm ${
                    formData.name && !isNameValid
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be between 20 and 60 characters inclusive.
              </p>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm ${
                    formData.password && !isPasswordValid
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-green-500 focus:border-green-500'
                  }`}
                />
              </div>

              {/* Real-time password criteria list */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <span className={`flex items-center gap-1 ${passwordLength >= 8 && passwordLength <= 16 ? 'text-green-600' : 'text-gray-400'}`}>
                  {passwordLength >= 8 && passwordLength <= 16 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  8–16 characters ({passwordLength})
                </span>
                <span className={`flex items-center gap-1 ${hasUppercase ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  1 Uppercase letter
                </span>
                <span className={`flex items-center gap-1 col-span-2 ${hasSpecial ? 'text-green-600' : 'text-gray-400'}`}>
                  {hasSpecial ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  1 Special character (!@#$%^&*)
                </span>
              </div>
            </div>

            {/* Address */}
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                <span className={`text-xs ${isAddressValid ? 'text-gray-400' : 'text-red-500'}`}>
                  {addressLength}/400 max
                </span>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute top-3 left-3 flex items-center pointer-events-none text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your street address, city, and state"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isNameValid || !isPasswordValid || !isAddressValid}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              {loading ? 'Creating Account...' : 'Register as Customer'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
