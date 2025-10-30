import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/AdminLayout';
import { API_URLS } from '../../constants';

const AdminSettings = () => {
  const [settings, setSettings] = useState({ BusinessWhatsAppNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ BusinessWhatsAppNumber: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const router = useRouter();
  const { currentUser } = useAuth();

  // Check admin role on component mount
  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  // Fetch settings from PHP API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URLS.BaseURL}settings.php`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setSettings(result.data);
          setFormData(result.data);
        } else {
          setSettings({ BusinessWhatsAppNumber: '' });
          setFormData({ BusinessWhatsAppNumber: '' });
          console.error('Failed to fetch settings:', result.message);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load settings');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate WhatsApp number
      if (!/^\d{10,15}$/.test(formData.BusinessWhatsAppNumber)) {
        throw new Error('Please enter a valid WhatsApp number (10-15 digits)');
      }

      const response = await fetch(`${API_URLS.BaseURL}settings.php`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSettings(formData);
        setIsEditing(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(settings);
    setIsEditing(false);
    setError('');
  };

  const confirmReset = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleReset = async () => {
    try {
      const response = await fetch(`${API_URLS.BaseURL}settings.php`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setSettings({ BusinessWhatsAppNumber: '' });
        setFormData({ BusinessWhatsAppNumber: '' });
        setIsDeleteConfirmOpen(false);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError('Failed to reset settings');
      console.error(err);
    }
  };

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  if (loading && !settings.BusinessWhatsAppNumber) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8" style={{ backgroundColor: 'white' }}>
        {/* Back Button */}
        <button
          onClick={() => router.push('/admin/AdminDashboard')}
          className="flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm font-medium">Back to Admin Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Business Settings</h1>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-lg font-medium text-gray-900">Current Settings</h2>
                </div>

                <div className="grid grid-cols-1 gap-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Business Number</label>
                    <div className="mt-1 text-sm text-gray-900 p-2 bg-gray-50 rounded-md">
                      {settings.BusinessWhatsAppNumber || 'Not set'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={confirmReset}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Reset
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="space-y-6">
                  <div className="border-b border-gray-200 pb-4">
                    <h2 className="text-lg font-medium text-gray-900">Edit Settings</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-y-4">
                    <div>
                      <label htmlFor="BusinessWhatsAppNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp Business Number *
                      </label>
                      <input
                        type="tel"
                        id="BusinessWhatsAppNumber"
                        name="BusinessWhatsAppNumber"
                        value={formData.BusinessWhatsAppNumber}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10,15}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter 10-15 digit WhatsApp number"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Include country code but omit '+' or '00' (e.g., 919952322484)
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </>
                      ) : 'Save Settings'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-lg font-medium text-gray-900">WhatsApp Integration Guide</h2>
            </div>
            <div className="mt-4 space-y-4 text-sm text-gray-700">
              <p>1. Enter your business WhatsApp number above (with country code but without '+' or '00').</p>
              <p>2. Customers will be able to click a WhatsApp button to message this number directly.</p>
              <p>3. Ensure your WhatsApp business account is properly set up to receive messages.</p>
              <p>4. Example format: 91123456789 (India country code + number)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Confirm Reset
                </h2>
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to reset the WhatsApp number? This will remove the current setting.
              </p>

              <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminSettings;