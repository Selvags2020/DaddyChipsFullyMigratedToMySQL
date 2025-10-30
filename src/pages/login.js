import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { database } from '../lib/firebase';
import AdminLayout from '../components/AdminLayout'
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';

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

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // 1. First authenticate with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Now access the specific user's data (more secure than reading all users)
    const userRef = ref(database, `users/${user.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();

      console.log(userData)
      
      if (!userData.isActive) {
        throw new Error('Your account is inactive. Please contact support.');
      }

      // Store minimal user data

      const userObj = {
        uid: user.uid,
        email: user.email,
        role: userData.address?.Role,
        name: userData.fullName
      };
      localStorage.setItem('currentUser', JSON.stringify(userObj));
      setCurrentUser(userObj);

      

      // Redirect based on role
      const redirectPath = userData.address?.Role === 'Admin' 
        ? '/admin/AdminDashboard'
        : '/dashboard';
     router.push(redirectPath);
    } else {
      throw new Error('User data not found');
    }
  } catch (err) {
    console.error("Login error:", err);
    
    // Handle specific Firebase auth errors
    let errorMessage = 'Login failed. Please try again.';
    
    switch (err.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address format';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        errorMessage = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Too many failed attempts. Account temporarily locked';
        break;
      case 'PERMISSION_DENIED':
        errorMessage = 'You do not have permission to access this resource';
        break;
      default:
        errorMessage = err.message || 'Login failed. Please try again.';
    }
    
    setError(errorMessage);
    setLoading(false);
  }
};
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      let errorMessage = 'Failed to send reset email';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
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