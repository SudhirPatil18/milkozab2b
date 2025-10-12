import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ShoppingBagIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    dateRange: 'all',
    status: 'all',
    customerName: ''
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  const fetchOrders = async (filterParams = {}) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filterParams.dateRange && filterParams.dateRange !== 'all') {
        queryParams.append('dateRange', filterParams.dateRange);
      }
      if (filterParams.customerName) {
        queryParams.append('customerName', filterParams.customerName);
      }
      if (filterParams.status && filterParams.status !== 'all') {
        queryParams.append('status', filterParams.status);
      }
      
      const url = `http://localhost:7000/api/orders/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const ordersData = Array.isArray(data.data?.orders) ? data.data.orders : 
                          Array.isArray(data.data) ? data.data : [];
        setOrders(ordersData);
      } else {
        setError('Failed to fetch orders');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'confirmed':
        return 'text-blue-600 bg-blue-100';
      case 'preparing':
        return 'text-orange-600 bg-orange-100';
      case 'out_for_delivery':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'preparing':
        return <ShoppingBagIcon className="w-4 h-4" />;
      case 'out_for_delivery':
        return <TruckIcon className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:7000/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        ));
        
        toast.success(`Order status updated to ${newStatus}`, {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });

        // If status is completed, redirect to success page
        if (newStatus === 'delivered') {
          window.location.href = `/admin/order-success/${orderId}`;
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDownloadReceipt = async (orderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:7000/api/orders/admin/${orderId}/receipt`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `order-${orderId}-receipt.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Receipt downloaded successfully!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        toast.error('Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    setFilters(newFilters);
    fetchOrders(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Orders</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBagIcon className="w-24 h-24 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Found</h2>
          <p className="text-gray-600 mb-8">There are no orders to manage yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 relative">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and track all orders</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Simple Filter Bar */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Customer Name Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <input
                type="text"
                placeholder="Search by customer name..."
                value={filters.customerName}
                onChange={(e) => handleFilterChange('customerName', e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Orders List with Detailed Cards */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Order Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <ShoppingBagIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-1 capitalize">{order.orderStatus.replace('_', ' ')}</span>
                    </span>
                    <span className="text-lg font-bold text-green-600">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2">
                    <h4 className="text-md font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={item.product?.photo?.startsWith('http') ? item.product.photo : `http://localhost:7000${item.product?.photo}`}
                              alt={item.product?.name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {item.product?.name || 'Unknown Product'}
                            </h5>
                            <p className="text-xs text-gray-500">
                              Category: {item.product?.category?.name || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Unit: {item.product?.unit?.symbol || 'kg'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.quantity} × {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Customer & Address Info */}
                  <div className="lg:col-span-1">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 text-green-600" />
                      Customer & Delivery Details
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900">Customer Information</h5>
                        <div className="text-sm text-gray-600 mt-1">
                          <p className="font-medium">{order.deliveryAddress?.fullName || 'N/A'}</p>
                          <p>{order.deliveryAddress?.mobileNumber || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900">Delivery Address</h5>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>{order.deliveryAddress?.flatHouseNo || 'N/A'}</p>
                          <p>{order.deliveryAddress?.areaStreet || 'N/A'}</p>
                          <p>{order.deliveryAddress?.city || 'N/A'}, {order.deliveryAddress?.state || 'N/A'} - {order.deliveryAddress?.pincode || 'N/A'}</p>
                          {order.deliveryAddress?.landmark && (
                            <p className="text-gray-500">Landmark: {order.deliveryAddress.landmark}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-semibold text-gray-900">Payment Information</h5>
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Mode: {order.paymentMode}</p>
                          <p>Status: <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                          </span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        Items: {order.items?.length || 0} | Total: {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Download Receipt */}
                      <button
                        onClick={() => handleDownloadReceipt(order._id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Download Receipt"
                      >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-2" />
                        Download Receipt
                      </button>

                      {/* Status Update Dropdown */}
                      <div className="relative status-dropdown-container">
                        <button
                          onClick={() => setShowStatusDropdown(showStatusDropdown === order._id ? null : order._id)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Update Status
                          <ChevronDownIcon className="w-4 h-4 ml-2" />
                        </button>

                        {showStatusDropdown === order._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200 transform translate-y-0 max-h-64 overflow-y-auto">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'pending');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Pending
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'confirmed');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Confirmed
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'preparing');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Preparing
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'out_for_delivery');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Out for Delivery
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'delivered');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Delivered
                              </button>
                              <button
                                onClick={() => {
                                  handleStatusUpdate(order._id, 'cancelled');
                                  setShowStatusDropdown(null);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                              >
                                Mark as Cancelled
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
