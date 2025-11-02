import { apiService } from '../utils/api';

// Public API service for endpoints that don't require authentication
export const publicApiService = {
  // Get public categories (no auth required)
  getCategories: async (search = '') => {
    const url = search ? `public/categories.php?search=${encodeURIComponent(search)}` : 'public/categories.php';
    return apiService.get(url, { requireAuth: false });
  },

  // Get products for public (no auth required)
  getProducts: async (categoryId = null) => {
    const url = categoryId ? `public/products.php?category_id=${categoryId}` : 'public/products.php';
    return apiService.get(url, { requireAuth: false });
  },

  // Submit contact form (no auth required)
  submitContact: async (contactData) => {
    return apiService.post('public/contact.php', contactData, { requireAuth: false });
  },

  // Get blog posts (no auth required)
  getBlogPosts: async () => {
    return apiService.get('public/blog.php', { requireAuth: false });
  }
};