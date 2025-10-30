import { API_URLS } from '../constants';

export const generateOrderNumber = async () => {
  try {
    const response = await fetch(`${API_URLS.BaseURL}orders.php?generate-order-number=true`, {
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
      return result.order_number; // Returns "0001", "0002", etc.
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error generating order number:', error);
    // Fallback to timestamp if counter fails
    const timestamp = Date.now().toString().slice(-6);
    return `ORD-${timestamp}`;
  }
};