import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../../components/common/Alert';
import { Star, Mail, Lock, LogIn, ShieldAlert, ArrowLeft } from 'lucide-react';


export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Check if current entered email or context is an admin
  // The Admin login interface must not display the Forgot Password link
  const isAdminEmail = email.trim().toLowerCase() === 'admin@shopscore.com' || email.trim().toLowerCase().includes('admin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      // Redirect dynamically based on role
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'STORE_OWNER') {
        navigate('/owner');
      } else {
        navigate('/stores');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid email or password. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-green-600 text-white p-3 rounded-2xl shadow-md">
            <Star className="w-8 h-8 fill-current" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          Welcome to ShopScore
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to access your account dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm rounded-xl border border-gray-200 sm:px-10">
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} onClose={() => setError(null)} />
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {/* Admin must not have a Forgot Password option. Only show for non-admin email */}
                {!isAdminEmail && (
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-medium text-green-600 hover:text-green-700 hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins for evaluators */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Quick Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@shopscore.com', 'ChangeMe@123')}
                className="px-2 py-1.5 text-xs font-medium border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded text-center transition"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('owner@shopscore.com', 'Owner@12345')}
                className="px-2 py-1.5 text-xs font-medium border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded text-center transition"
              >
                Store Owner
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill('alice.shopper@example.com', 'User@12345')}
                className="px-2 py-1.5 text-xs font-medium border border-green-200 text-green-700 bg-green-50 hover:bg-green-100 rounded text-center transition"
              >
                Normal User
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
              Sign up as a customer
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Information Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 leading-6">Password Recovery</h3>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  Password recovery is managed by the administrator. Please contact the admin to reset your password.
                </p>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-500">
                  <p className="font-medium text-gray-700 mb-1">Administrative Support Contact</p>
                  <p>Email: <span className="font-mono text-purple-700">admin@shopscore.com</span></p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="inline-flex items-center px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg shadow-sm transition"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

