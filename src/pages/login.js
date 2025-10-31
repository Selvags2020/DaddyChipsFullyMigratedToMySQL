import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

import { API_URLS } from '../constants'

const API_BASE_URL = API_URLS.BaseURL;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const testServerConnection = async () => {
    try {
      const testResponse = await fetch(`${API_BASE_URL}login.php`, {
        method: 'OPTIONS'
      });
      return testResponse.ok;
    } catch (error) {
      console.error('Server connection test failed:', error);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Testing server connection...');
      const isServerReady = await testServerConnection();
      
      if (!isServerReady) {
        throw new Error('Cannot connect to server. Please make sure your PHP server (XAMPP/WAMP) is running.');
      }

      console.log('Attempting login with:', { email });
      
      const response = await fetch(`${API_BASE_URL}login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        // Remove credentials for now to simplify
      });

      console.log('Response received, status:', response.status);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned invalid response. Please check the PHP configuration.');
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        // Store user data in localStorage and context
        const userObj = {
          uid: data.user.uid,
          email: data.user.email,
          role: data.user.role,
          name: data.user.name,
          last_login: data.user.last_login
        };
        
        localStorage.setItem('currentUser', JSON.stringify(userObj));
        setCurrentUser(userObj);

        // Redirect based on role
        const redirectPath = data.user.role === 'Admin' 
          ? '/admin/AdminDashboard'
          : '/dashboard';
        
        console.log('Login successful, redirecting to:', redirectPath);
        router.push(redirectPath);
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (err) {
      console.error("Login error details:", err);
      
      let errorMessage = 'Login failed. Please try again.';
      
      // Handle specific error cases
      if (err.message.includes('Cannot connect to server')) {
        errorMessage = err.message;
      } else if (err.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message.includes('account is inactive')) {
        errorMessage = 'Your account is inactive. Please contact support.';
      } else if (err.message.includes('temporarily locked')) {
        errorMessage = 'Account temporarily locked. Try again later.';
      } else if (err.message.includes('Failed to fetch') || err.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please make sure your PHP server (XAMPP/WAMP) is running on localhost.';
      } else if (err.message.includes('invalid response')) {
        errorMessage = 'Server configuration error. Please check PHP setup.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component (handlePasswordReset and JSX remains the same)
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}login.php/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setResetSent(true);
      } else {
        throw new Error(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      let errorMessage = 'Failed to send reset email';
      
      if (err.message.includes('Network Error') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check if the PHP server is running.';
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-900">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-emerald-800">
          Please sign in to your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10 border border-emerald-100">
          {showForgotPassword ? (
            <form className="space-y-6" onSubmit={handlePasswordReset}>
              <div>
                <h3 className="text-lg font-medium text-emerald-900 mb-4">Reset Password</h3>
                <p className="text-sm text-emerald-800 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-emerald-800">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="reset-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm placeholder-emerald-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-800 text-sm rounded-md">
                    {error}
                  </div>
                )}

                {resetSent && (
                  <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 text-sm rounded-md">
                    Password reset email sent. Please check your inbox.
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                      setError('');
                    }}
                    className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
                  >
                    Back to login
                  </button>
                  
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 bg-red-50 text-red-800 text-sm rounded-md">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-emerald-800">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm placeholder-emerald-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-emerald-800">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-emerald-300 rounded-md shadow-sm placeholder-emerald-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-emerald-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="font-medium text-emerald-700 hover:text-emerald-600"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-emerald-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-emerald-600">
                  Need help?{' '}
                  <a href="mailto:support@example.com" className="font-medium text-emerald-700 hover:text-emerald-600">
                    Contact support
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}