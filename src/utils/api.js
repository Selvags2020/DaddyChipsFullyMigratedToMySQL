class ApiService {
  constructor() {
    this.baseURL = require('../constants').API_URLS.BaseURL;
  }

  // Get auth token from storage
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    }
    return null;
  }

  // Make authenticated GET request
  async get(url, options = {}) { 
    return this.makeRequest(url, 'GET', null, options);
  }

  // Make authenticated POST request
  async post(url, data = {}, options = {}) {
    return this.makeRequest(url, 'POST', data, options);
  }

  // Make authenticated PUT request
  async put(url, data = {}, options = {}) {
    return this.makeRequest(url, 'PUT', data, options);
  }

  // Make authenticated DELETE request
  async delete(url, options = {}) {
    return this.makeRequest(url, 'DELETE', null, options);
  }

  // Special method for file uploads (FormData)
  async upload(url, formData, options = {}) {
    const token = this.getToken();
    
    const headers = {
      // Don't set Content-Type for FormData - browser will set it with boundary
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers,
        body: formData,
        ...options,
      });

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Generic request method
  async makeRequest(url, method, data = null, options = {}) {
    const token = this.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      method,
      headers,
      ...options,
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    try {
      // Use the baseURL for all requests
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
      
      const response = await fetch(fullUrl, config);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle API response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    // Handle non-JSON responses
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      
      // If it's a successful response but not JSON, return as text
      if (response.ok) {
        return { success: true, data: text };
      }
      
      throw new Error(`Invalid response format: ${text}`);
    }

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          sessionStorage.removeItem('authToken');
          localStorage.removeItem('currentUser');
        }
        throw new Error('Authentication failed. Please login again.');
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  }

  // Handle errors
  handleError(error) {
    console.error('API call failed:', error);
    
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      return new Error('Cannot connect to server. Please check your internet connection and make sure the PHP server is running.');
    }
    
    return error;
  }
}

export const apiService = new ApiService();
export function useApi() {
  return apiService;
}