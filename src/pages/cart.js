import { useContext, useState, useEffect } from 'react';
import Link from 'next/link';
import { CartContext } from '../context/CartContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getDeviceType } from '../utils/deviceDetection';
import { generateOrderNumber } from '../utils/orderUtils';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// API Configuration
const API_BASE_URL = 'http://localhost/DaddyChipsAPI';

// API Service functions
const apiService = {
  // Orders API
  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create order: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    return data;
  },

  // Settings API
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return await response.json();
  }
};

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const [isMobile, setIsMobile] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mobileInputOpen, setMobileInputOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [popupMsg, setPopupMsg] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [businessWhatsAppNumber, setBusinessWhatsAppNumber] = useState('');
  const router = useRouter();

  // Check if user is on mobile device and get business WhatsApp number
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    // Get business WhatsApp number from API
    const fetchBusinessNumber = async () => {
      try {
        const settings = await apiService.getSettings();
        setBusinessWhatsAppNumber(settings.data?.BusinessWhatsAppNumber || '');
      } catch (error) {
        console.error('Error fetching business WhatsApp number:', error);
      }
    };

    fetchBusinessNumber();

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Calculate total amount - ensure prices are numbers
  const totalAmount = cart.reduce((sum, item) => {
    const price = item.offer_price || item.standard_price;
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    return sum + (numericPrice * item.quantity);
  }, 0);

  // Generate cart details message
  const generateCartMessage = (orderNumber = '') => {
    let message = "Hello, I'm interested in these products:\n\n";
    
    cart.forEach(item => {
      const price = item.offer_price || item.standard_price;
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      message += `- ${item.name} (Qty: ${item.quantity}) - ₹${(numericPrice * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\n`;
    if (orderNumber) {
      message += `Order #: ${orderNumber}\n\n`;
    }
    message += "Please confirm availability and provide payment details.";
    
    return message;
  };

  // Validate mobile number
  const validateMobileNumber = (number) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(number);
  };

  // Save order to MySQL via API
  const saveOrderToMySQL = async (customerMobile) => {
    try {
      const orderNumber = await generateOrderNumber();
      
      const orderDetails = {
        order_number: orderNumber,
        order_details: generateCartMessage(orderNumber),
        status: 'New',
        remarks: '',
        customer_mobile_number: customerMobile,
        order_source: getDeviceType(),
        created_by: 'customer',
        cart_items: cart.map(item => ({
          id: item.id,
          name: item.name,
          category_id: item.category_id,
          category_name: item.category_name,
          quantity: item.quantity,
          standard_price: typeof item.standard_price === 'string' ? parseFloat(item.standard_price) : item.standard_price,
          offer_price: item.offer_price ? (typeof item.offer_price === 'string' ? parseFloat(item.offer_price) : item.offer_price) : null,
          product_image: item.product_image || ''
        }))
      };

      const result = await apiService.createOrder(orderDetails);
      
      if (result.success) {
        return { success: true, orderNumber: result.order_number || orderNumber };
      } else {
        throw new Error(result.message || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      return { success: false, orderNumber: null, error: error.message };
    }
  };

  // Handle get quote button click
  const handleGetQuote = async () => {
    if (cart.length === 0) {
      setSnackbarMessage('Your cart is empty');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    // Check if we have WhatsApp number
    if (!businessWhatsAppNumber) {
      setSnackbarMessage('Unable to process order. Please try again later.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    if (isMobile) {
      // On mobile with WhatsApp - proceed directly
      try {
        // First save the order
        const { success, orderNumber } = await saveOrderToMySQL('');
        
        if (success) {
          // Then open WhatsApp
          clearCart();
         
          const message = generateCartMessage(orderNumber);
          window.open(`https://wa.me/${businessWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
        } else {
          setSnackbarMessage('Failed to save order. Please try again.');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
      } catch (error) {
        console.error('Error processing order:', error);
        setSnackbarMessage('Error processing order. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      // On desktop or mobile without WhatsApp - prompt for mobile number
      setMobileInputOpen(true);
    }
  };

  // Handle mobile number submission
  const handleMobileNumberSubmit = async () => {
    if (!validateMobileNumber(mobileNumber)) {
      setMobileNumberError('Please enter a valid 10-digit mobile number');
      return;
    }

    setMobileNumberError('');
    
    try {
      const { success, orderNumber } = await saveOrderToMySQL(mobileNumber);
      
      if (success) {
        setSnackbarMessage(`Your order #${orderNumber} has been submitted. The vendor will contact you shortly.`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        setMobileInputOpen(false);
        clearCart();
      } else {
        setSnackbarMessage('Failed to save order. Please try again.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error processing order:', error);
      setSnackbarMessage('Error processing order. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Head>
        <title>Your Cart | Daddy Chips</title>
        <meta name="description" content="Review your cart items and get a quote" />
      </Head>

      {/* WhatsApp Info Dialog */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#b45309' }}>WhatsApp Order Info</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {popupMsg}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopupOpen(false)} color="primary" variant="contained" sx={{ bgcolor: '#b45309', '&:hover': { bgcolor: '#92400e' } }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mobile Number Input Dialog */}
      <Dialog open={mobileInputOpen} onClose={() => setMobileInputOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#b45309' }}>Enter Your Mobile Number</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please enter your mobile number so we can contact you about your order.
          </Typography>
          <TextField
            fullWidth
            label="Mobile Number"
            variant="outlined"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            error={!!mobileNumberError}
            helperText={mobileNumberError}
            inputProps={{ maxLength: 10 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMobileInputOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleMobileNumberSubmit} 
            color="primary" 
            variant="contained" 
            sx={{ bgcolor: '#b45309', '&:hover': { bgcolor: '#92400e' } }}
          >
            Submit Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
          
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h2 className="mt-4 text-xl font-medium text-gray-900">Your cart is empty</h2>
              <p className="mt-2 text-gray-500">Start shopping to add items to your cart</p>
              <Link href="/products/all" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {cart.map((item) => {
                      const price = item.offer_price || item.standard_price;
                      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
                      
                      return (
                        <li key={item.id} className="p-4 sm:p-6">
                          <div className="flex flex-col sm:flex-row">
                            {/* Product Image */}
                            <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.name}
                                  className="w-full h-full object-cover object-center"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                  <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                                <p className="ml-4 text-lg font-medium text-gray-900">
                                  ₹{(numericPrice * item.quantity).toFixed(2)}
                                </p>
                              </div>

                              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>

                              <div className="mt-4 flex items-center justify-between">
                                {/* Quantity Controls */}
                                <div className="flex items-center">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                                    disabled={item.quantity <= 1}
                                  >
                                    <span className="sr-only">Decrease quantity</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="mx-2 text-gray-700">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="p-1 border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50"
                                  >
                                    <span className="sr-only">Increase quantity</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                  </button>
                                </div>

                                {/* Remove button */}
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-sm font-medium text-amber-600 hover:text-amber-500"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">To be calculated</span>
                    </div>

                    <div className="border-t border-gray-200 pt-4 flex justify-between">
                      <span className="text-base font-medium text-gray-900">Total</span>
                      <span className="text-base font-medium text-gray-900">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <button
                      onClick={handleGetQuote}
                      className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700"
                    >
                      {isMobile ? 'Order via WhatsApp' : 'Get Quote'}
                      <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </button>

                    <Link href="/products/all" className="w-full flex justify-center items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Continue Shopping
                    </Link>

                    <button
                      onClick={clearCart}
                      className="w-full text-center text-sm font-medium text-amber-600 hover:text-amber-500"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}