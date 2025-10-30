import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router'; 
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/AdminLayout';
import * as XLSX from 'xlsx';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  useMediaQuery,
  useTheme,
  Badge,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Collapse,
  Tooltip,
  Stack,
  styled,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ExitToApp as ExitToAppIcon,
  FiberNew as FiberNewIcon,
  LocalShipping as LocalShippingIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Done as DoneIcon,
  Receipt as ReceiptIcon,
  Schedule as ScheduleIcon,
  Source as SourceIcon,
  Edit as EditIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';

import { API_URLS } from '../../constants';

// Styled components
const AdminCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.5),
  borderRadius: '12px',
  boxShadow: theme.shadows[1],
  borderLeft: `4px solid ${status === 'New' ? theme.palette.success.main : theme.palette.info.main}`,
  width: '100%',
  height: '160px',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[3],
    cursor: 'pointer'
  }
}));

const AdminHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  height: '64px',
  position: 'sticky',
  top: 0,
  zIndex: theme.zIndex.appBar
}));

const AdminContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    marginLeft: '0 !important'
  }
}));

const StatusChip = styled(Chip)(({ theme, status, active }) => ({
  fontWeight: 'bold',
  fontSize: '0.7rem',
  backgroundColor: status === 'New' 
    ? active ? theme.palette.success.dark : theme.palette.success.light 
    : status === 'Delivered'
      ? active ? theme.palette.info.dark : theme.palette.info.light
      : active ? theme.palette.primary.dark : theme.palette.primary.light,
  color: theme.palette.common.white,
  height: '28px',
  '&:hover': {
    backgroundColor: status === 'New' 
      ? theme.palette.success.dark 
      : status === 'Delivered'
        ? theme.palette.info.dark
        : theme.palette.primary.dark
  }
}));

const MenuListItem = styled(ListItem)(({ theme }) => ({
  '&:hover': {
    cursor: 'pointer',
    backgroundColor: theme.palette.action.hover
  },
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  minHeight: '48px',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5)
  }
}));

const DetailItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.text.secondary
  }
}));

export default function AdminDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerCollapsed, setDrawerCollapsed] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);
  const [markDeliveredOpen, setMarkDeliveredOpen] = useState(false);
  const [editOrderOpen, setEditOrderOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_mobile_number: '',
    order_details: '',
    order_source: ''
  });
  const [filter, setFilter] = useState('New');
  const [orderCounts, setOrderCounts] = useState({ total: 0, new: 0, delivered: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { currentUser } = useAuth();
  const router = useRouter();

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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

  // Fetch orders from PHP API
  const fetchOrders = useCallback(async (currentFilter = 'New') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URLS.BaseURL}orders.php?filter=${currentFilter}`, {
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
        setAllOrders(result.data);
        setFilteredOrders(result.data);
        setOrderCounts(result.counts || { total: 0, new: 0, delivered: 0 });
      } else {
        setAllOrders([]);
        setFilteredOrders([]);
        console.error('Failed to fetch orders:', result.message);
      }
    } catch (error) {
      console.error("Error fetching orders: ", error);
      setAllOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply filter to orders
  useEffect(() => {
    fetchOrders(filter);
  }, [filter, fetchOrders]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Export to Excel - FIXED VERSION
  const exportToExcel = async () => {
    setExportLoading(true);
    try {
      console.log('Starting export with filter:', filter);
      
      // First fetch the data from the API
      const response = await fetch(`${API_URLS.BaseURL}orders.php?filter=${filter}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      console.log('Export response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Convert the fetched data to Excel
        await convertToExcelAndDownload(result.data, filter);
        showSnackbar('Excel export completed successfully!', 'success');
      } else {
        throw new Error(result.message || 'No data available for export');
      }
    } catch (error) {
      console.error('Export failed:', error);
      showSnackbar(`Export failed: ${error.message}`, 'error');
    } finally {
      setExportLoading(false);
    }
  };

  const convertToExcelAndDownload = (orders, currentFilter) => {
    return new Promise((resolve) => {
      try {
        // Prepare data for Excel
        const dataToExport = orders.map(order => ({
          'Order ID': order.order_id || 'N/A',
          'Order Number': order.order_number || 'N/A',
          'Status': order.status || 'N/A',
          'Customer Mobile': order.customer_mobile_number || 'N/A',
          'Order Details': order.order_details || 'N/A',
          'Order Source': order.order_source || 'N/A',
          'Created At': order.created_at ? formatDateForExcel(order.created_at) : 'N/A',
          'Remarks': order.remarks || 'N/A',
          'Order Received Date': order.order_received_date_time ? formatDateForExcel(order.order_received_date_time) : 'N/A'
        }));

        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
        
        // Auto-size columns
        const colWidths = [
          { wch: 20 }, // Order ID
          { wch: 15 }, // Order Number
          { wch: 10 }, // Status
          { wch: 15 }, // Customer Mobile
          { wch: 50 }, // Order Details
          { wch: 15 }, // Order Source
          { wch: 20 }, // Created At
          { wch: 20 }, // Remarks
          { wch: 20 }  // Order Received Date
        ];
        worksheet['!cols'] = colWidths;
        
        // Add some basic styling through cell styles
        if (worksheet['!ref']) {
          const range = XLSX.utils.decode_range(worksheet['!ref']);
          
          // Style header row (make it bold)
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!worksheet[cellAddress].s) {
              worksheet[cellAddress].s = {};
            }
            worksheet[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "4472C4" } },
              alignment: { horizontal: "center" }
            };
          }
        }
        
        // Generate filename
        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `Orders_${currentFilter}_${timestamp}.xlsx`;
        
        // Download the file
        XLSX.writeFile(workbook, filename);
        resolve();
        
      } catch (error) {
        console.error('Error converting to Excel:', error);
        throw new Error('Failed to create Excel file');
      }
    });
  };

  // Format date for Excel (simpler format)
  const formatDateForExcel = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };

  // Handle drawer toggle for mobile
  const handleMobileDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle drawer collapse/expand for desktop
  const handleDrawerCollapse = () => {
    setDrawerCollapsed(!drawerCollapsed);
  };

  // Handle menu click
  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === 'orders') {
      router.push('/admin/AdminDashboard');
    } else if (menu === 'products') {
      router.push('/admin/AdminProducts');  
    } else if (menu === 'categories') {
      router.push('/admin/AdminCategories');
    } else if (menu === 'settings') {
      router.push('/admin/AdminSettings');
    }
    if (isMobile) setMobileOpen(false);
  };

  // Open order details dialog
  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setOrderDetailsOpen(true);
  };

  // Close order details dialog
  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
  };

  // Open mark as delivered dialog
  const handleOpenMarkDelivered = (order) => {
    setSelectedOrder(order);
    setRemarks('');
    setRemarksError(false);
    setMarkDeliveredOpen(true);
  };

  // Close mark as delivered dialog
  const handleCloseMarkDelivered = () => {
    setMarkDeliveredOpen(false);
  };

  // Open edit order dialog
  const handleOpenEditOrder = (order) => {
    setSelectedOrder(order);
    setEditForm({
      customer_mobile_number: order.customer_mobile_number || '',
      order_details: order.order_details || '',
      order_source: order.order_source || ''
    });
    setEditOrderOpen(true);
  };

  // Close edit order dialog
  const handleCloseEditOrder = () => {
    setEditOrderOpen(false);
  };

  // Handle edit form changes
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    if (e.target.value.trim()) {
      setRemarksError(false);
    }
  };

  // Mark order as delivered
  const handleMarkDelivered = async () => {
    if (!remarks.trim()) {
      setRemarksError(true);
      return;
    }

    try {
      const response = await fetch(`${API_URLS.BaseURL}orders.php?id=${selectedOrder.order_id}&action=deliver`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          remarks: remarks.trim(),
          created_by: currentUser?.fullName || 'Admin'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar('Order marked as delivered successfully!', 'success');
        // Refresh orders
        await fetchOrders(filter);
        handleCloseMarkDelivered();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error updating order: ", error);
      showSnackbar(`Failed to mark order as delivered: ${error.message}`, 'error');
    }
  };

  // Save edited order
  const handleSaveEditOrder = async () => {
    try {
      const response = await fetch(`${API_URLS.BaseURL}orders.php?id=${selectedOrder.order_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        showSnackbar('Order updated successfully!', 'success');
        // Refresh orders
        await fetchOrders(filter);
        handleCloseEditOrder();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error updating order: ", error);
      showSnackbar(`Failed to update order: ${error.message}`, 'error');
    }
  };

  // Drawer content
  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Collapse in={!drawerCollapsed} orientation="horizontal">
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
            Admin Dashboard
          </Typography>
        </Collapse>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        <MenuListItem 
          button 
          selected={activeMenu === 'orders'}
          onClick={() => handleMenuClick('orders')}
          sx={{ 
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
            minHeight: '48px'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerCollapsed ? 'auto' : '56px',
            justifyContent: 'center'
          }}>
            <Badge badgeContent={orderCounts.new} color="error">
              <ShoppingCartIcon color={activeMenu === 'orders' ? 'primary' : 'inherit'} />
            </Badge>
          </ListItemIcon>
          <Collapse in={!drawerCollapsed} orientation="horizontal">
            <ListItemText primary="Orders" />
          </Collapse>
        </MenuListItem>
        <MenuListItem 
          button 
          selected={activeMenu === 'products'}
          onClick={() => handleMenuClick('products')}
          sx={{ 
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
            minHeight: '48px'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerCollapsed ? 'auto' : '56px',
            justifyContent: 'center'
          }}>
            <CategoryIcon color={activeMenu === 'products' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <Collapse in={!drawerCollapsed} orientation="horizontal">
            <ListItemText primary="Products" />
          </Collapse>
        </MenuListItem>
        <MenuListItem 
          button 
          selected={activeMenu === 'categories'}
          onClick={() => handleMenuClick('categories')}
          sx={{ 
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
            minHeight: '48px'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerCollapsed ? 'auto' : '56px',
            justifyContent: 'center'
          }}>
            <CategoryIcon color={activeMenu === 'categories' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <Collapse in={!drawerCollapsed} orientation="horizontal">
            <ListItemText primary="Categories" />
          </Collapse>
        </MenuListItem>
        <MenuListItem 
          button 
          selected={activeMenu === 'settings'}
          onClick={() => handleMenuClick('settings')}
          sx={{ 
            justifyContent: drawerCollapsed ? 'center' : 'flex-start',
            minHeight: '48px'
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: drawerCollapsed ? 'auto' : '56px',
            justifyContent: 'center'
          }}>
            <SettingsIcon color={activeMenu === 'settings' ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <Collapse in={!drawerCollapsed} orientation="horizontal">
            <ListItemText primary="Settings" />
          </Collapse>
        </MenuListItem>
      </List>
      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          fullWidth 
          variant="outlined" 
          startIcon={<ExitToAppIcon />}
          sx={{ color: theme.palette.error.main }}
          onClick={isMobile ? handleMobileDrawerToggle : handleDrawerCollapse}
        >
          {!drawerCollapsed && 'Collapse Menu'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleMobileDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerCollapsed ? 56 : 240,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerCollapsed ? 56 : 240,
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          }
        }}
      >
        {drawer}
      </Drawer>
      
      <Box sx={{ 
        flexGrow: 1,
        marginLeft: isMobile ? 0 : drawerCollapsed ? '56px' : '240px',
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}>
        {/* Header */}
        <AdminHeader>
          {isMobile ? (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerCollapse}
              sx={{ mr: 2 }}
            >
              {drawerCollapsed ? <MenuIcon /> : <ExpandLessIcon />}
            </IconButton>
          )}
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {activeMenu === 'orders' && 'Order Management'}
            {activeMenu === 'products' && 'Product Management'}
            {activeMenu === 'categories' && 'Category Management'}
            {activeMenu === 'settings' && 'Settings'}
            {activeMenu === 'dashboard' && 'Dashboard Overview'}
          </Typography>
        </AdminHeader>
        
        {/* Main Content */}
        <AdminContent>
          {activeMenu === 'orders' && (
            <>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 2,
                gap: 1
              }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  Recent Orders
                </Typography>
                <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <StatusChip 
                    status="New" 
                    active={filter === 'New'}
                    onClick={() => setFilter('New')}
                    icon={<FiberNewIcon fontSize="small" />} 
                    label={`New (${orderCounts.new})`} 
                  />
                  <StatusChip 
                    status="Delivered" 
                    active={filter === 'Delivered'}
                    onClick={() => setFilter('Delivered')}
                    icon={<LocalShippingIcon fontSize="small" />} 
                    label={`Delivered (${orderCounts.delivered})`} 
                  />
                  <StatusChip 
                    status="All" 
                    active={filter === 'All'}
                    onClick={() => setFilter('All')}
                    icon={<ShoppingCartIcon fontSize="small" />} 
                    label={`All (${orderCounts.total})`} 
                  />
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={exportLoading ? <CircularProgress size={16} /> : <FileDownloadIcon />}
                    onClick={exportToExcel}
                    disabled={exportLoading}
                    size="small"
                  >
                    {exportLoading ? 'Exporting...' : 'Export'}
                  </Button>
                </Stack>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {filter === 'New' && filteredOrders.length > 0 ? 
                  "All new orders are displayed here" : 
                  filter === 'Delivered' && filteredOrders.length > 0 ?
                  "Last two days delivered orders are displayed here" :
                  filter === 'All' && filteredOrders.length > 0 ?
                  "All orders (New and last two days delivered) are displayed here" :
                  "No orders available for the selected filter"}
              </Typography>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                  <CircularProgress />
                  <Typography sx={{ ml: 2 }}>Loading orders...</Typography>
                </Box>
              ) : filteredOrders.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>No orders found</Typography>
                  <Typography variant="body1" color="text.secondary">
                    There are no orders matching the current filter
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { 
                    xs: '1fr', 
                    sm: 'repeat(auto-fill, minmax(240px, 1fr))', 
                    md: 'repeat(auto-fill, minmax(220px, 1fr))',
                    lg: 'repeat(auto-fill, minmax(200px, 1fr))'
                  }, 
                  gap: 1.5,
                  paddingRight: { xs: 1, sm: 0 }
                }}>
                  {filteredOrders.map((order) => (
                    <AdminCard key={order.order_id} status={order.status}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Order #{order.order_number}
                        </Typography>
                        <StatusChip status={order.status} label={order.status} size="small" />
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <PhoneIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {order.customer_mobile_number || 'No contact'}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AccessTimeIcon color="action" sx={{ mr: 0.5, fontSize: '1rem' }} />
                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                      
                      {order.status === 'Delivered' && order.remarks && (
                        <Typography variant="body2" sx={{ mb: 0.5, fontStyle: 'italic', fontSize: '0.75rem' }}>
                          <strong>Remarks:</strong> {order.remarks}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
                        <Tooltip title="View order details">
                          <IconButton 
                            size="small"
                            sx={{ mr: 0.5 }}
                            onClick={() => handleOpenOrderDetails(order)}
                          >
                            <InfoIcon color="info" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit order">
                          <IconButton 
                            size="small"
                            sx={{ mr: 0.5 }}
                            onClick={() => handleOpenEditOrder(order)}
                          >
                            <EditIcon color="action" fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {order.status === 'New' && (
                          <Tooltip title="Mark as delivered">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleOpenMarkDelivered(order)}
                            >
                              <DoneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </AdminCard>
                  ))}
                </Box>
              )}
            </>
          )}
        </AdminContent>
      </Box>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon color="info" sx={{ mr: 1 }} />
            <Typography variant="h6">Order #{selectedOrder?.order_id} Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <DetailItem>
              <ReceiptIcon />
              <Typography variant="body1">
                <strong>Order Number:</strong> {selectedOrder?.order_number || 'N/A'}
              </Typography>
            </DetailItem>
            <DetailItem>
              <ScheduleIcon />
              <Typography variant="body1">
                <strong>Order Received:</strong> {selectedOrder?.order_received_date_time ? formatDate(selectedOrder.order_received_date_time) : 'N/A'}
              </Typography>
            </DetailItem>
            <DetailItem>
              <SourceIcon />
              <Typography variant="body1">
                <strong>Order Source:</strong> {selectedOrder?.order_source || 'N/A'}
              </Typography>
            </DetailItem>
            <DetailItem>
              <PhoneIcon />
              <Typography variant="body1">
                <strong>Contact:</strong> {selectedOrder?.customer_mobile_number || 'N/A'}
              </Typography>
            </DetailItem>
            <DetailItem>
              <AccessTimeIcon />
              <Typography variant="body1">
                <strong>Created At:</strong> {selectedOrder?.created_at ? formatDate(selectedOrder.created_at) : 'N/A'}
              </Typography>
            </DetailItem>
            {selectedOrder?.status === 'Delivered' && selectedOrder?.remarks && (
              <DetailItem>
                <InfoIcon />
                <Typography variant="body1">
                  <strong>Remarks:</strong> {selectedOrder.remarks}
                </Typography>
              </DetailItem>
            )}
          </Box>
          
          <Typography variant="h6" sx={{ mb: 1 }}>Order Items:</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {selectedOrder?.order_details || 'No order details available'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark as Delivered Dialog */}
      <Dialog
        open={markDeliveredOpen}
        onClose={handleCloseMarkDelivered}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="h6">Mark Order #{selectedOrder?.order_id} as Delivered</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please add remarks before marking this order as delivered:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            label="Remarks"
            value={remarks}
            onChange={handleRemarksChange}
            error={remarksError}
            helperText={remarksError ? "Remarks are required" : ""}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarkDelivered} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleMarkDelivered} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Confirm Delivery
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog
        open={editOrderOpen}
        onClose={handleCloseEditOrder}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EditIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">Edit Order #{selectedOrder?.order_id}</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Customer Mobile Number"
              name="customer_mobile_number"
              value={editForm.customer_mobile_number}
              onChange={handleEditFormChange}
            />
            <TextField
              fullWidth
              margin="normal"
              variant="outlined"
              label="Order Source"
              name="order_source"
              value={editForm.order_source}
              onChange={handleEditFormChange}
            />
            <TextField
              fullWidth
              margin="normal"
              multiline
              rows={4}
              variant="outlined"
              label="Order Details"
              name="order_details"
              value={editForm.order_details}
              onChange={handleEditFormChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditOrder} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSaveEditOrder} 
            variant="contained" 
            color="primary"
            startIcon={<CheckCircleIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}