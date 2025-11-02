import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/AdminLayout';
import { API_URLS } from '../../constants';
import { useApi } from '../../utils/api';

const AdminCategories = () => {
  const api = useApi();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { currentUser } = useAuth();

  // Form initial states
  const initialFormState = {
    category_name: '',
    is_active: true,
    img_url: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  // Check admin role on component mount
  useEffect(() => {
    console.log(currentUser)
    if (!currentUser || currentUser.role !== 'Admin') {
      router.push('/Unauthorized');
    }
  }, [currentUser, router]);

  // Fetch categories from PHP API
const fetchCategories = async (search = '') => {
  try {
    setLoading(true);
    setError('');

    // FIXED: Remove BaseURL concatenation since api service handles it
    const url = search ? `categories.php?search=${encodeURIComponent(search)}` : 'categories.php';
    const response = await api.get(url);

    if (response.success) {
      const categoriesArray = response.data.map(category => ({
        id: category.category_id,
        ...category
      }));
      setCategories(categoriesArray);
    } else {
      setCategories([]);
      setError(response.message || 'Failed to load categories');
    }
  } catch (err) {
    console.error('Error fetching categories:', err);
    setError(err.message || 'Failed to load categories');
    setCategories([]);
  } finally {
    setLoading(false);
  }
};

  // Fetch categories on component mount and when search changes
  useEffect(() => {
    fetchCategories(searchTerm);
  }, [searchTerm]);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload({ target: { files: e.dataTransfer.files } });
    }
  };

  // Handle image upload with comprehensive validation
  const handleImageUpload = async (e) => {
    setError('');
    setUploadProgress(0);
    setUploading(true);

    const file = e.target.files?.[0];
    if (!file) {
      setError('No file selected');
      setUploading(false);
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, or WEBP');
      setUploading(false);
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      setUploading(false);
      return;
    }

    // Validate image dimensions
    const img = new Image();
    img.onload = () => {
      const minWidth = 300;
      const minHeight = 300;
      if (img.width < minWidth || img.height < minHeight) {
        setError(`Image must be at least ${minWidth}x${minHeight} pixels`);
        setUploading(false);
        return;
      }

      // All validations passed
      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(5);
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, img_url: e.target.result }));
        setUploadProgress(100);
        setUploading(false);
      };
      reader.onerror = () => {
        setError('Failed to read image file');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    };
    img.onerror = () => {
      setError('Invalid image file');
      setUploading(false);
    };
    img.src = URL.createObjectURL(file);
  };

  // Upload image to PHP API using the API service
  const uploadImageToPHP = async () => {
    if (!imageFile) return formData.img_url;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      // Use the API service's upload method
      const response = await api.upload('upload.php', formData, {
        // Optional: Add progress tracking for upload
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to upload image to server');
      }

      setUploadProgress(100);
      return response.imageUrl || response.url; // Adjust based on your API response
    } catch (err) {
      console.error('Error uploading to PHP API:', err);
      throw new Error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  // Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    let imageUrl = formData.img_url;

    // Upload new image if selected
    if (imageFile) {
      imageUrl = await uploadImageToPHP();
    }

    const categoryData = {
      category_name: formData.category_name,
      img_url: imageUrl,
      is_active: Boolean(formData.is_active),
      created_by: currentUser?.name || currentUser?.email || 'Admin'
    };

    let response;
    if (currentCategory) {
      // Update existing category - FIXED: Remove BaseURL prefix since api service adds it
      response = await api.put(`categories.php?id=${currentCategory.id}`, categoryData);
    } else {
      // Create new category - FIXED: Remove BaseURL prefix
      response = await api.post('categories.php', categoryData);
    }

    if (!response.success) {
      throw new Error(response.message || 'Failed to save category');
    }

    // Refresh categories list
    await fetchCategories(searchTerm);

    // Reset form
    setFormData(initialFormState);
    setImageFile(null);
    setCurrentCategory(null);
    setIsModalOpen(false);
    setUploadProgress(0);
    
    // Show success message
    setError('Category saved successfully!');
  } catch (err) {
    console.error("Error saving category:", err);
    setError(err.message || 'Failed to save category');
  } finally {
    setLoading(false);
  }
};

  // Edit category
  const handleEdit = (category) => {
    setCurrentCategory(category);
    setFormData({
      category_name: category.category_name,
      is_active: category.is_active,
      img_url: category.img_url
    });
    setImageFile(null); // Reset image file when editing
    setIsModalOpen(true);
  };

  // Delete category
const handleDelete = async () => {
  try {
    setLoading(true);
    // FIXED: Remove BaseURL prefix
    const response = await api.delete(`categories.php?id=${categoryToDelete}`);

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete category');
    }

    // Refresh categories list
    await fetchCategories(searchTerm);
    
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
    setError('Category deleted successfully!');
  } catch (err) {
    setError(err.message || 'Failed to delete category');
    console.error(err);
  } finally {
    setLoading(false);
  }
};

  // Open delete confirmation
  const confirmDelete = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsDeleteConfirmOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
    setFormData(initialFormState);
    setImageFile(null);
    setUploadProgress(0);
    setUploading(false);
    setDragActive(false);
    setError('');
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.category_id && category.category_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!currentUser || currentUser.role !== 'Admin') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-600">Loading categories...</span>
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
          <h1 className="text-2xl font-bold text-gray-800">Categories Management</h1>

          <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
            {/* Search Box */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center justify-center md:justify-start transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {loading ? 'Loading...' : 'Add Category'}
            </button>
          </div>
        </div>

        {error && (
          <div className={`p-4 mb-6 rounded-md ${error.includes('success') ? 'bg-green-100 border-l-4 border-green-500 text-green-700' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
            <p>{error}</p>
          </div>
        )}

        {/* Categories Table */}
        <div className="shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              {/* Table Headers */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={category.img_url || '/placeholder-category.png'}
                          alt={category.category_name}
                          onError={(e) => {
                            e.target.src = '/placeholder-category.png';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{category.category_name}</div>
                      <div className="text-sm text-gray-500">{category.category_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.created_by}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded"
                        title="Edit"
                        disabled={loading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(category.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded"
                        title="Delete"
                        disabled={loading}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredCategories.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No categories found matching your search' : 'No categories found'}
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-2 my-4 max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {currentCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                    disabled={uploading || loading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {/* Image Upload */}
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Image *</label>
                      <div
                        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors duration-200 ${dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'} ${uploading ? 'opacity-50' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        {formData.img_url ? (
                          <div className="flex flex-col items-center">
                            <img
                              src={formData.img_url}
                              alt="Preview"
                              className="h-32 w-32 object-contain mx-auto mb-4 rounded-md"
                            />
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                              <label className={`cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                Change Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, img_url: '' });
                                  setImageFile(null);
                                }}
                                className={`py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={uploading}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div className="flex flex-col sm:flex-row text-sm text-gray-600 justify-center items-center">
                              <label className={`relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <span>Upload a file</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="sr-only"
                                  disabled={uploading}
                                />
                              </label>
                              <p className="sm:pl-1 pt-1 sm:pt-0">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                          </div>
                        )}
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Category Details */}
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="category_name" className="block text-sm font-medium text-gray-700 mb-1">
                          Category Name *
                        </label>
                        <input
                          type="text"
                          id="category_name"
                          name="category_name"
                          value={formData.category_name}
                          onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                          disabled={uploading}
                          placeholder="Enter category name"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
                          disabled={uploading}
                        />
                        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                          Active Category
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                      disabled={uploading || loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || uploading || !formData.category_name || !formData.img_url}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${(loading || uploading || !formData.category_name || !formData.img_url) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Saving...' : (currentCategory ? 'Update Category' : 'Save Category')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-2">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Delete
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
                  Are you sure you want to delete this category? This action cannot be undone.
                </p>

                <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminCategories;