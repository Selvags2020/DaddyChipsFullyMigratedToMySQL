import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/AdminLayout';
import { useApi } from '../../utils/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({ BusinessWhatsAppNumber: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ BusinessWhatsAppNumber: '' });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  const router = useRouter();
  const { currentUser } = useAuth();
  const api = useApi();

  // Check admin role on component mount
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'Admin') {
      router.push('/Unauthorized');
    }
  }, [currentUser, router]);

  // Fetch settings from PHP API using the API service
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');

      // FIXED: Remove BaseURL concatenation since api service handles it
      const response = await api.get('settings.php');

      if (response.success) {
        setSettings(response.data);
        setFormData(response.data);
      } else {
        setSettings({ BusinessWhatsAppNumber: '' });
        setFormData({ BusinessWhatsAppNumber: '' });
        setError(response.message || 'Failed to load settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message || 'Failed to load settings');
      setSettings({ BusinessWhatsAppNumber: '' });
      setFormData({ BusinessWhatsAppNumber: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
      // Validate WhatsApp number (allow empty for reset, but if provided must be valid)
      if (formData.BusinessWhatsAppNumber && !/^\d{10,15}$/.test(formData.BusinessWhatsAppNumber)) {
        throw new Error('Please enter a valid WhatsApp number (10-15 digits)');
      }

      // FIXED: Remove BaseURL prefix since api service adds it
      const response = await api.put('settings.php', formData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save settings');
      }

      setSettings(formData);
      setIsEditing(false);
      
      // Show success message
      setError('Settings updated successfully!');
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
      setLoading(true);
      // FIXED: Remove BaseURL prefix
      const response = await api.delete('settings.php');

      if (!response.success) {
        throw new Error(response.message || 'Failed to reset settings');
      }

      setSettings({ BusinessWhatsAppNumber: '' });
      setFormData({ BusinessWhatsAppNumber: '' });
      setIsDeleteConfirmOpen(false);
      
      // Show success message
      setError('Settings reset successfully!');
    } catch (err) {
      setError(err.message || 'Failed to reset settings');
      console.error(err);
    } finally {
      setLoading(false);
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
          <span className="ml-3 text-gray-600">Loading settings...</span>
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
          <div className={`p-4 mb-6 rounded-md ${error.includes('success') ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
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
                    <p className="mt-1 text-xs text-gray-500">
                      This number will be used for WhatsApp integration throughout the application
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
                    disabled={loading}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {loading ? 'Loading...' : 'Edit Settings'}
                  </button>
                  <button
                    onClick={confirmReset}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center transition-colors duration-200"
                    disabled={loading || !settings.BusinessWhatsAppNumber}
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
                        WhatsApp Business Number
                      </label>
                      <input
                        type="tel"
                        id="BusinessWhatsAppNumber"
                        name="BusinessWhatsAppNumber"
                        value={formData.BusinessWhatsAppNumber}
                        onChange={handleInputChange}
                        pattern="[0-9]{10,15}"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                        placeholder="Enter 10-15 digit WhatsApp number (optional)"
                        disabled={loading}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Include country code but omit '+' or '00' (e.g., 919952322484). Leave empty to remove the number.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">1</span>
                <p>Enter your business WhatsApp number above (with country code but without '+' or '00')</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">2</span>
                <p>Customers will be able to click a WhatsApp button to message this number directly</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">3</span>
                <p>Ensure your WhatsApp business account is properly set up to receive messages</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">4</span>
                <p>Example format: 919876543210 (India country code 91 + 9876543210)</p>
              </div>
              <div className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium mr-3 mt-0.5 flex-shrink-0">5</span>
                <p>Leave the field empty and save to remove the WhatsApp number integration</p>
              </div>
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
                  className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-700 mb-6">
                Are you sure you want to reset the WhatsApp number? This will remove the current setting and disable WhatsApp integration.
              </p>

              <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                >
                  Reset Settings
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