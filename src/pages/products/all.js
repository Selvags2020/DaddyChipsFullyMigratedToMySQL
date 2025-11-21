import { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { CartContext } from '../../context/CartContext';
import InfiniteScroll from 'react-infinite-scroll-component';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove'; 
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Skeleton,
  TextField,
  InputAdornment,
  Paper,
  Autocomplete,
  Chip,
  IconButton,
  Drawer,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { getDeviceType } from '../../utils/deviceDetection';
import { generateOrderNumber } from '../../utils/orderUtils';
import { API_URLS } from '../../constants'

// API Configuration
const API_BASE_URL = API_URLS.BaseURL

// API Service functions
const apiService = {
  // Categories API
  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/categories.php`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  // Products API
  async getProducts() {
    const response = await fetch(`${API_BASE_URL}/products.php`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return data.success ? data.data : [];
  },

  async getProductsByCategory(categoryId) {
    const response = await fetch(`${API_BASE_URL}/products.php`);
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    const products = data.success ? data.data : [];
    
    if (categoryId === 'all') return products;
    return products.filter(product => product.category_id === categoryId);
  },

  // Orders API
  async createOrder(orderData) {
     
    const response = await fetch(`${API_BASE_URL}/orders.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
   
    if (!response.ok) throw new Error('Failed to create order');
    const data = await response.json();
    return data;
  },

  // Settings API (you'll need to create this)
 async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings.php`);
    if (!response.ok) {
      throw new Error('Failed to fetch settings');
    }
    return await response.json();
  }
};
// Styled components (unchanged)
const BlinkingButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  padding: '12px 16px',
  borderRadius: '50px',
  backgroundColor: '#0c6bdb',
  color: theme.palette.common.white,
  fontWeight: 'bold',
  boxShadow: theme.shadows[4],
  zIndex: theme.zIndex.speedDial,
  transition: 'all 0.3s ease',
  animation: '$blink 2s ease-in-out 3',
  '&:hover': {
    backgroundColor: "#0c6bdb",
    transform: 'scale(1.05)'
  },
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '@keyframes blink': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.7 },
    '100%': { opacity: 1 }
  }
}));

const CategoryName = styled(Typography)(({ theme, selected }) => ({
  mt: 1,
  px: 1.5,
  py: 0.5,
  borderRadius: '12px',
  background: selected
    ? theme.palette.primary.main
    : 'white',
  color: selected
    ? theme.palette.common.white
    : theme.palette.text.primary,
  fontWeight: selected ? 'bold' : 600,
  fontSize: '0.7rem',
  boxShadow: selected
    ? '0 2px 6px rgba(0,0,0,0.08)'
    : '0 1px 2px rgba(0,0,0,0.04)',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  letterSpacing: 0.1,
  border: selected
    ? `1px solid ${theme.palette.primary.dark}`
    : '1px solid white',
  '&:hover': {
    background: selected
      ? theme.palette.primary.dark
      : 'white',
  },
  textTransform: 'capitalize',
}));

const CategoryImage = styled('img')({
  width: '40px',
  height: '40px',
  objectFit: 'cover',
  borderRadius: '50%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid transparent',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
  backgroundColor: '#fff',
  padding: '0px',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.10)',
  },
});

const NoMoreResults = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px dashed ${theme.palette.divider}`,
  textAlign: 'center',
}));

const ProductCardStyled = styled(Card)(({ theme, isMobile }) => ({
  height: isMobile ? '280px' : '320px',
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.2s ease-in-out',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: '8px',
  overflow: 'hidden',
  width: isMobile ? '150px' : '220px',
  margin: '0 auto',
  '&:hover': {
    boxShadow: theme.shadows[2],
    borderColor: theme.palette.primary.main,
  },
}));

const ProductMediaStyled = styled(CardMedia)(({ isMobile }) => ({
  height: isMobile ? '100px' : '150px',
  width: '100%',
  objectFit: 'cover',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: '#f5f5f5',
}));

const PriceContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '1px',
  margin: '1px 0',
});

const OriginalPrice = styled(Typography)({
  textDecoration: 'line-through',
  color: 'text.secondary',
  fontSize: '0.7rem',
});

const OfferPrice = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  fontWeight: 'bold',
  fontSize: '0.8rem',
}));

const StockStatus = styled(Typography)(({ instock }) => ({
  color: instock === 'true' ? 'green' : 'red',
  fontWeight: 'bold',
  fontSize: '0.7rem',
}));

const ProductsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  backgroundColor: 'inherit',
  marginBottom: theme.spacing(2),
  marginTop: 0
}));

const SearchAndCategoriesContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar + 1,
  backgroundColor: 'white',
  padding: theme.spacing(0, 0),
  borderBottom: `0px solid ${theme.palette.divider}`,
  boxShadow: theme.shadows[0],
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(0,0),
}));

const CategoriesContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
  overflowX: 'auto',
  padding: '0px 0',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    gap: '1px',
  }
}));

const ProductsGrid = styled(Box)(({ theme, isMobile }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: isMobile ? theme.spacing(1) : theme.spacing(2),
  padding: isMobile ? '4px 0' : 0,
  justifyContent: 'flex-start',
}));

const FloatingCartButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: '16px',
  left: '16px',
  right: '16px',
  padding: '12px',
  borderRadius: '8px',
  backgroundColor: '#0c6bdb',
  color: theme.palette.common.white,
  fontWeight: 'bold',
  boxShadow: theme.shadows[4],
  zIndex: theme.zIndex.speedDial,
  '&:hover': {
    backgroundColor: theme.palette.success.dark,
  },
}));

const CartDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '85%',
    maxWidth: '400px',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
  },
}));

const CartItemImage = styled(Avatar)({
  width: 80,
  height: 80,
  marginRight: 16,
});

const RoundIconButton = styled(IconButton)(({ theme }) => ({
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  padding: 0,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: theme.palette.grey[200],
  '&:hover': {
    backgroundColor: theme.palette.grey[300],
  },
}));

const ScrollableProductsContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  paddingTop: 0,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '10px',
    '&:hover': {
      background: '#555',
    },
  },
}));

const MainContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: 'white',
});

const NarrowSearchBox = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    width: '450px',
  },
  '& .MuiAutocomplete-root': {
    width: '100%',
  },
  '& .MuiAutocomplete-paper': {
    width: '300px',
    [theme.breakpoints.down('sm')]: {
      width: '250px',
    },
  },
}));

export default function ProductPage() {
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const containerRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [allProductNames, setAllProductNames] = useState([]);
  const [allProductTags, setAllProductTags] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [mobileInputOpen, setMobileInputOpen] = useState(false);
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [popupMsg, setPopupMsg] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [businessWhatsAppNumber, setBusinessWhatsAppNumber] = useState('');

  // All category data
  const allCategory = {
  category_id: 'all',
  category_name: 'All',
  img_url: 'https://daddychips.co.in/DaddyChipsAPI/uploads/all.png'
};

  // Calculate total items in cart
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate total amount
  const totalAmount = cart.reduce((sum, item) => sum + (item.offer_price || item.standard_price) * item.quantity, 0);

  // Get business WhatsApp number from API
  useEffect(() => {
    const fetchBusinessNumber = async () => {
      try {
        const settings = await apiService.getSettings();
         const whatsappNumber = String(settings.data?.BusinessWhatsAppNumber || '').trim();
        setBusinessWhatsAppNumber(whatsappNumber);
      } catch (error) {
        console.error('Error fetching business WhatsApp number:', error);
      }
    };

    fetchBusinessNumber();
  }, []);

  // Generate cart details message
  const generateCartMessage = (orderNumber = '') => {
    let message = "Hello, I'm interested in these products:\n\n";
    
    cart.forEach(item => {
      message += `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.offer_price || item.standard_price) * item.quantity}\n`;
    });
    
    message += `\nTotal Amount: ₹${totalAmount}\n\n`;
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
        order_received_date_time: new Date().toISOString()
      };

      const result = await apiService.createOrder(orderDetails);

    
      
      if (result.success) {
        return { success: true, orderNumber };
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

          clearCart();
          const message = generateCartMessage(orderNumber);
          window.open(`https://wa.me/${String(businessWhatsAppNumber).trim()}?text=${encodeURIComponent(message)}`, '_blank');
        
        // if (success) {
        //   // Then open WhatsApp
        
        // } else {
        //   setSnackbarMessage('Failed to save order. Please try again.');
        //   setSnackbarSeverity('error');
        //   setSnackbarOpen(true);
        // }
      } catch (error) {
        console.error('Error processing order:', error);
        setSnackbarMessage('Error processing order. Please try again.' + error);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      // On desktop or mobile without WhatsApp
       setMobileInputOpen(true);
      // const { success, orderNumber } = await saveOrderToMySQL('');
      // if (success) {
      //   setPopupMsg(`Please install WhatsApp mobile app and send this information to ${businessWhatsAppNumber}:\n\n${generateCartMessage(orderNumber)}`);
      //   setPopupOpen(false);
      //   // Prompt for mobile number
      //   setMobileInputOpen(true);
      // } else {
      //   setSnackbarMessage('Failed to save order. Please try again.');
      //   setSnackbarSeverity('error');
      //   setSnackbarOpen(true);
      // }
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

  // Fetch all product names and tags for search suggestions
  const fetchAllProductData = useCallback(async () => {
    try {
      const productsData = await apiService.getProducts();
      
      const names = new Set();
      const tags = new Set();
      
      productsData.forEach(product => {
        if (product.name) names.add(product.name);
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tags.add(tag));
        }
      });
      
      setAllProductNames(Array.from(names));
      setAllProductTags(Array.from(tags));
    } catch (error) {
      console.error("Error fetching product data for suggestions: ", error);
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      const categoriesList = await apiService.getCategories();
      
      // Add "All" category at the beginning
      setCategories([allCategory, ...categoriesList]);
    } catch (error) {
      console.error("Error fetching categories: ", error);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  // Fetch all products from API
  const fetchAllProducts = useCallback(async () => {
    try {
      setIsFetching(true);
      setProductLoading(true);

      const productsData = await apiService.getProducts();
      
      // Map API response to match expected format
      const formattedProducts = productsData.map(product => ({
        id: product.product_id,
        ...product,
        categoryDetails: categories.find(cat => cat.category_id === product.category_id) || {}
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      setHasMore(false);
    } catch (error) {
      console.error("Error fetching all products: ", error);
    } finally {
      setIsFetching(false);
      setProductLoading(false);
      setLoading(false);
    }
  }, [categories]);

  // Fetch products based on selected category
  const fetchProductsByCategory = useCallback(async (categoryId) => {
    try {
      setIsFetching(true);
      setProductLoading(true);

      const productsData = await apiService.getProductsByCategory(categoryId);
      
      // Map API response to match expected format
      const formattedProducts = productsData.map(product => ({
        id: product.product_id,
        ...product
      }));

      setProducts(formattedProducts);
      setFilteredProducts(formattedProducts);
      setHasMore(false);
    } catch (error) {
      console.error("Error fetching products by category: ", error);
    } finally {
      setIsFetching(false);
      setProductLoading(false);
      setLoading(false);
    }
  }, []);

  // Filter products by search query
  const filterProductsBySearch = (productsToFilter, query) => {
    if (!query) return productsToFilter;
    
    const lowerCaseQuery = query.toLowerCase();
    return productsToFilter.filter(product => {
      return (
        product.name.toLowerCase().includes(lowerCaseQuery) ||
        (product.description && product.description.toLowerCase().includes(lowerCaseQuery)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    });
  };

  // Generate search suggestions
  const generateSearchSuggestions = (inputValue) => {
    const input = inputValue.toLowerCase();
    const suggestions = [];
    
    // Add matching product names
    allProductNames.forEach(name => {
      if (name.toLowerCase().includes(input)) {
        suggestions.push({ type: 'Product', value: name });
      }
    });
    
    // Add matching tags
    allProductTags.forEach(tag => {
      if (tag.toLowerCase().includes(input)) {
        suggestions.push({ type: 'Tag', value: tag });
      }
    });
    
    return suggestions.slice(0, 5);
  };

  // Handle search input change
  const handleSearchChange = (e, newValue) => {
    const query = typeof newValue === 'string' ? newValue : newValue?.value || '';
    setSearchQuery(query);
    
    if (query) {
      const filtered = filterProductsBySearch(products, query);
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery('');
    
    if (categoryId === 'all') {
      fetchAllProducts();
    } else {
      fetchProductsByCategory(categoryId);
    }
  };

  // Use context for quantity change
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  // Toggle cart drawer
  const toggleCartDrawer = (open) => () => {
    setCartOpen(open);
  };

  // Handle add to cart
  const handleAddToCart = (product) => {
    addToCart(product, 1);
    setSnackbarMessage(`${product.name} added to cart`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // Fetch categories and product data on mount
  useEffect(() => {
    fetchCategories();
    fetchAllProductData();
  }, [fetchCategories, fetchAllProductData]);

  // Fetch products when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllProducts();
    }
  }, [categories, fetchAllProducts]);

  // Update search suggestions when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchSuggestions(generateSearchSuggestions(searchQuery));
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  // Product Card Component
  const ProductCard = ({ product }) => {
    const { cart, addToCart, updateQuantity } = useContext(CartContext);
    const inStock = product.stock_quantity > 0;
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
      addToCart(product, 1);
    };

    const handleIncrease = () => {
      updateQuantity(product.id, quantity + 1);
    };

    const handleDecrease = () => {
      updateQuantity(product.id, quantity - 1);
    };

    return (
      <ProductCardStyled isMobile={isMobile} id={`product-${product.id}`}>
        <ProductMediaStyled
          isMobile={isMobile}
          image={product.product_image || '/placeholder-image.jpg'}
          title={product.name}
        />
        <CardContent sx={{ 
          flexGrow: 1, 
          p: 1,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Typography gutterBottom variant="subtitle2" component="h3" noWrap>
            {product.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ 
            mb: 0.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '0.7rem'
          }}>
            {product.description}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <PriceContainer>
              {product.offer_price < product.standard_price && (
                <OriginalPrice>
                  ₹{product.standard_price}
                </OriginalPrice>
              )}
              <OfferPrice>
                ₹{product.offer_price  || product.standard_price  || '0.00'}
              </OfferPrice>
            </PriceContainer>
            
            <StockStatus instock={inStock.toString()}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </StockStatus>
            
            {inStock && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 0.5 
              }}>
                {quantity > 0 ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={handleDecrease}
                      sx={{
                        backgroundColor: "orange",
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        p: 0.5
                      }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ 
                      mx: 1, 
                      minWidth: '24px', 
                      textAlign: 'center' 
                    }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={handleIncrease}
                      sx={{
                        backgroundColor: "orange",
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: '4px',
                        p: 0.5
                      }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleAddToCart}
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Add to Cart
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </CardContent>
      </ProductCardStyled>
    );
  };

  return (
    <MainContainer>
      {/* Fixed Header with Search and Categories */}
      <SearchAndCategoriesContainer>
        <Container maxWidth="lg">
          {/* Search Row */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: theme.spacing(1, 0)
          }}>
            <NarrowSearchBox>
              <Autocomplete
                freeSolo
                fullWidth
                options={searchSuggestions}
                groupBy={(option) => option.type}
                getOptionLabel={(option) => typeof option === 'string' ? option : option.value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Search..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                )}
                PaperComponent={({ children }) => (
                  <Paper style={{ 
                    width: '300px',
                    [theme.breakpoints.down('sm')]: {
                      width: '250px',
                    }
                  }}>
                    {children}
                  </Paper>
                )}
                value={searchQuery}
                onChange={(event, newValue) => handleSearchChange(event, newValue)}
                onInputChange={(event, newInputValue) => {
                  setSearchQuery(newInputValue);
                }}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip 
                        label={option.type} 
                        size="small" 
                        sx={{ 
                          mr: 1, 
                          fontSize: '0.6rem',
                          height: '20px',
                          backgroundColor: option.type === 'Product' ? '#e3f2fd' : '#e8f5e9'
                        }} 
                      />
                      {option.value}
                    </Box>
                  </li>
                )}
              />
            </NarrowSearchBox>
          </Box>

          {/* Categories Row */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: theme.spacing(1, 0)
          }}>
            {!categoryLoading && (
              <CategoriesContainer>
                {categories.map(category => {
                  const isSelected = selectedCategory === category.category_id;
                  return (
                    <Box
                      key={category.category_id}
                      sx={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        minWidth: '70px',
                        cursor: 'pointer',
                        px: 0.5,
                        marginBottom: '4px',
                      }}
                      onClick={() => handleCategorySelect(category.category_id)}
                    >
                      <Box sx={{
                        position: 'relative',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: -4,
                          left: -4,
                          right: -4,
                          bottom: -4,
                          borderRadius: '50%',
                          backgroundColor: isSelected ? theme.palette.primary.light : 'transparent',
                          opacity: isSelected ? 0.3 : 0,
                          transition: 'opacity 0.2s ease'
                        }
                      }}>
                        <CategoryImage
                          src={category.img_url}
                          alt={category.category_name}
                        />
                      </Box>
                      <CategoryName 
                        selected={isSelected}
                        variant="caption"
                      >
                        {category.category_name}
                      </CategoryName>
                    </Box>
                  );
                })}
              </CategoriesContainer>
            )}
          </Box>
        </Container>
      </SearchAndCategoriesContainer>

      {/* Scrollable Products Section */}
      <ScrollableProductsContainer>
        <Container maxWidth="lg" ref={containerRef}>
          <ProductsContainer elevation={1} className="pb-0">
            {searchQuery && (
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                {filteredProducts.length > 0 
                  ? `Search Results for "${searchQuery}"` 
                  : `No products found for "${searchQuery}"`}
              </Typography>
            )}

            {productLoading ? (
              <ProductsGrid isMobile={isMobile}>
                {Array.from(new Array(isMobile ? 4 : 8)).map((_, index) => (
                  <ProductCardStyled key={index} isMobile={isMobile}>
                    <Skeleton variant="rectangular" height={isMobile ? '100px' : '150px'} />
                    <CardContent sx={{ p: 1 }}>
                      <Skeleton width="80%" height={20} />
                      <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
                      <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                      <Skeleton width="80%" height={32} sx={{ mt: 1 }} />
                    </CardContent>
                  </ProductCardStyled>
                ))}
              </ProductsGrid>
            ) : (
              <ProductsGrid isMobile={isMobile}>
                {filteredProducts.map(product => (
                  <Box key={product.id} sx={{ 
                    flex: isMobile ? '0 0 calc(50% - 8px)' : '0 0 calc(25% - 16px)',
                    maxWidth: isMobile ? 'calc(50% - 8px)' : 'calc(25% - 16px)',
                  }}>
                    <ProductCard product={product} />
                  </Box>
                ))}
              </ProductsGrid>
            )}

            {!productLoading && filteredProducts.length === 0 && (
              <NoMoreResults>
                <Typography variant="subtitle1" gutterBottom>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try a different search or category
                </Typography>
              </NoMoreResults>
            )}
          </ProductsContainer>
        </Container>
      </ScrollableProductsContainer>

      {/* Mobile Floating Cart Button */}
      {isMobile && totalItems > 0 && (
        <FloatingCartButton 
          onClick={toggleCartDrawer(true)}
          startIcon={
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartIcon />
            </Badge>
          }
        >
          View Cart
        </FloatingCartButton>
      )}

      {/* Desktop Floating Cart Button */}
      {!isMobile && totalItems > 0 && (
        <BlinkingButton 
          onClick={toggleCartDrawer(true)}
          startIcon={
            <Badge badgeContent={totalItems} color="error">
              <ShoppingCartIcon />
            </Badge>
          }
          onAnimationEnd={() => {
            const button = document.querySelector('.MuiButton-root[class*="BlinkingButton"]');
            if (button) {
              button.style.animation = 'none';
            }
          }}
        >
          View Cart ({totalItems})
        </BlinkingButton>
      )}

      {/* Cart Drawer */}
      <CartDrawer
        anchor="right"
        open={cartOpen}
        onClose={toggleCartDrawer(false)}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Your Shopping Cart</Typography>
          <IconButton onClick={toggleCartDrawer(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider />
        
        {cart.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ width: 96, height: 96, mx: 'auto', mb: 2, color: 'text.secondary' }}>
              <ShoppingCartIcon sx={{ width: '100%', height: '100%' }} />
            </Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Your cart is empty</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Start shopping to add items to your cart</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={toggleCartDrawer(false)}
              sx={{ backgroundColor: '#b45309', '&:hover': { backgroundColor: '#92400e' } }}
            >
              Continue Shopping
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
              <List>
                {cart.map((item) => (
                  <ListItem key={item.id} sx={{ py: 3, px: 0 }}>
                    <ListItemAvatar>
                      <CartItemImage
                        src={item.product_image}
                        alt={item.name}
                        variant="square"
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            ₹{(item.offer_price || item.standard_price) * item.quantity}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1}}>
                            <RoundIconButton 
                              size="small" 
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            >
                              -
                            </RoundIconButton>
                            <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                            <RoundIconButton 
                              size="small" 
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            >
                              +
                            </RoundIconButton>
                            <Button 
                              size="small" 
                              onClick={() => removeFromCart(item.id)}
                              sx={{ ml: 'auto', color: '#b45309' }}
                            >
                              Remove
                            </Button>
                          </Box>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box sx={{ mt: 'auto' }}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography>To be calculated</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Total</Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleGetQuote}
                sx={{ 
                  mb: 2,
                  backgroundColor: '#b45309',
                  '&:hover': { backgroundColor: '#92400e' },
                  py: 1.5
                }}
                startIcon={<WhatsAppIcon />}
              >
                {isMobile ? 'Order via WhatsApp' : 'Get Quote'}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={toggleCartDrawer(false)}
                sx={{ mb: 2, py: 1.5 }}
              >
                Continue Shopping
              </Button>

              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={clearCart}
                sx={{ color: '#b45309' }}
              >
                Clear Cart
              </Button>
            </Box>
          </>
        )}
      </CartDrawer>

      {/* WhatsApp Info Dialog */}
      <Dialog open={popupOpen} onClose={() => setPopupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', color: '#b45309' }}>WhatsApp Order Info</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 2 }}>
            {popupMsg}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setPopupOpen(false)} 
            variant="contained" 
            sx={{ 
              backgroundColor: '#b45309', 
              '&:hover': { backgroundColor: '#92400e' } 
            }}
          >
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
    </MainContainer>
  );
}