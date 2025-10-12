import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

function ManageShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);
  const [actionLoading, setActionLoading] = useState({});

  const API_BASE_URL = 'http://localhost:7000/api';

  // Get admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Fetch shops data
  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Admin authentication required');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter
      });

      const response = await fetch(`${API_BASE_URL}/admin/shops?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch shops');
      }

      setShops(data.data.shops);
      setTotalPages(data.data.pagination.totalPages);
      setTotalShops(data.data.pagination.totalShops);

    } catch (error) {
      console.error('Error fetching shops:', error);
      toast.error(error.message || 'Failed to fetch shops');
    } finally {
      setLoading(false);
    }
  };

  // Toggle shop block status
  const toggleShopBlock = async (shopId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [shopId]: true }));
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/admin/shops/${shopId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop status');
      }

      toast.success(data.message);
      fetchShops(); // Refresh the list

    } catch (error) {
      console.error('Error updating shop status:', error);
      toast.error(error.message || 'Failed to update shop status');
    } finally {
      setActionLoading(prev => ({ ...prev, [shopId]: false }));
    }
  };

  // Toggle shop verification
  const toggleShopVerification = async (shopId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [shopId]: true }));
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/admin/shops/${shopId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isVerified: !currentStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shop verification');
      }

      toast.success(data.message);
      fetchShops(); // Refresh the list

    } catch (error) {
      console.error('Error updating shop verification:', error);
      toast.error(error.message || 'Failed to update shop verification');
    } finally {
      setActionLoading(prev => ({ ...prev, [shopId]: false }));
    }
  };

  // Delete shop
  const deleteShop = async (shopId, shopName) => {
    if (!window.confirm(`Are you sure you want to delete "${shopName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [shopId]: true }));
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/admin/shops/${shopId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete shop');
      }

      toast.success(data.message);
      fetchShops(); // Refresh the list

    } catch (error) {
      console.error('Error deleting shop:', error);
      toast.error(error.message || 'Failed to delete shop');
    } finally {
      setActionLoading(prev => ({ ...prev, [shopId]: false }));
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (isActive, isVerified) => {
    if (!isActive) return 'bg-red-100 text-red-800';
    if (!isVerified) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get status text
  const getStatusText = (isActive, isVerified) => {
    if (!isActive) return 'Blocked';
    if (!isVerified) return 'Pending Verification';
    return 'Active';
  };

  useEffect(() => {
    fetchShops();
  }, [currentPage, searchTerm, statusFilter]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Shops</h1>
        <p className="text-gray-600">View and manage all registered shops</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Shops
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, city..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Shops</option>
              <option value="active">Active</option>
              <option value="inactive">Blocked</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{totalShops}</span> shops
            </div>
          </div>
        </div>
      </div>

      {/* Shops Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading shops...</p>
            </div>
          </div>
        ) : shops.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg font-medium">No shops found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Shop Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shops.map((shop) => (
                    <tr key={shop._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {shop.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{shop.name}</div>
                            <div className="text-sm text-gray-500">{shop.businessType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{shop.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {shop.address?.street && (
                            <div>{shop.address.street}</div>
                          )}
                          {shop.address?.city && shop.address?.state && (
                            <div>{shop.address.city}, {shop.address.state}</div>
                          )}
                          {shop.address?.pincode && (
                            <div>{shop.address.pincode}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(shop.isActive, shop.isVerified)}`}>
                          {getStatusText(shop.isActive, shop.isVerified)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(shop.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {/* Block/Unblock Button */}
                          <button
                            onClick={() => toggleShopBlock(shop._id, shop.isActive)}
                            disabled={actionLoading[shop._id]}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              shop.isActive
                                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading[shop._id] ? '...' : shop.isActive ? 'Block' : 'Unblock'}
                          </button>

                          {/* Verify/Unverify Button */}
                          <button
                            onClick={() => toggleShopVerification(shop._id, shop.isVerified)}
                            disabled={actionLoading[shop._id]}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                              shop.isVerified
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            } disabled:opacity-50`}
                          >
                            {actionLoading[shop._id] ? '...' : shop.isVerified ? 'Unverify' : 'Verify'}
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteShop(shop._id, shop.name)}
                            disabled={actionLoading[shop._id]}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {shops.map((shop) => (
                <div key={shop._id} className="border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {shop.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{shop.name}</h3>
                        <p className="text-sm text-gray-500">{shop.phoneNumber}</p>
                        <p className="text-xs text-gray-400">{shop.businessType}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(shop.isActive, shop.isVerified)}`}>
                      {getStatusText(shop.isActive, shop.isVerified)}
                    </span>
                  </div>
                  
                  {shop.address && (
                    <div className="mt-2 text-sm text-gray-600">
                      {shop.address.street && <div>{shop.address.street}</div>}
                      {shop.address.city && shop.address.state && (
                        <div>{shop.address.city}, {shop.address.state}</div>
                      )}
                      {shop.address.pincode && <div>{shop.address.pincode}</div>}
                    </div>
                  )}
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleShopBlock(shop._id, shop.isActive)}
                      disabled={actionLoading[shop._id]}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        shop.isActive
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      } disabled:opacity-50`}
                    >
                      {actionLoading[shop._id] ? '...' : shop.isActive ? 'Block' : 'Unblock'}
                    </button>

                    <button
                      onClick={() => toggleShopVerification(shop._id, shop.isVerified)}
                      disabled={actionLoading[shop._id]}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        shop.isVerified
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      } disabled:opacity-50`}
                    >
                      {actionLoading[shop._id] ? '...' : shop.isVerified ? 'Unverify' : 'Verify'}
                    </button>

                    <button
                      onClick={() => deleteShop(shop._id, shop.name)}
                      disabled={actionLoading[shop._id]}
                      className="px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Registered: {formatDate(shop.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageShops;
