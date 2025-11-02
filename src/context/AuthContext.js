import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Get token from storage (priority: localStorage -> sessionStorage)
        const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');

        if (token && user) {
          setAuthToken(token);
          setCurrentUser(JSON.parse(user));
          console.log('Auth initialized from storage');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear corrupted storage
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Set auth token
  const setToken = (token) => {
    setAuthToken(token);
  };

  // Verify token with server
  const verifyToken = async () => {
    if (!authToken) return false;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ action: 'verify-token' })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success;
      }
      return false;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // Enhanced logout function
  const logout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    
    // Clear all storage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    
    console.log('User logged out and storage cleared');
  };

  const value = {
    currentUser,
    setCurrentUser,
    authToken,
    setAuthToken: setToken,
    loading,
    logout,
    verifyToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}