import React, { useState, useEffect } from 'react';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ManageProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    shortDescription: '',
    category: '',
    quantity: 0.5,
    unit: ''
  });
  const [editSelectedFile, setEditSelectedFile] = useState(null);
  const [editSelectedSubimageFile, setEditSelectedSubimageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editSubimagePreviewUrl, setEditSubimagePreviewUrl] = useState('');

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Admin authentication required. Please login as admin.');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        category: categoryFilter
      });

      const response = await fetch(`https://api.milkoza.in/api/products/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.totalPages);
        setTotalProducts(data.totalProducts);
      } else {
        toast.error(data.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.milkoza.in/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch units for dropdown
  const fetchUnits = async () => {
    try {
      const response = await fetch('https://api.milkoza.in/api/units');
      const data = await response.json();
      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, categoryFilter]);

  useEffect(() => {
    fetchCategories();
    fetchUnits();
  }, []);

  // Handle edit product
  const handleEditProduct = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required. Please login as admin.');
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', editFormData.name);
      formDataToSend.append('price', editFormData.price);
      formDataToSend.append('originalPrice', editFormData.originalPrice);
      formDataToSend.append('shortDescription', editFormData.shortDescription);
      formDataToSend.append('category', editFormData.category);
      formDataToSend.append('quantity', editFormData.quantity);
      formDataToSend.append('unit', editFormData.unit);
      if (editSelectedFile) {
        formDataToSend.append('photo', editSelectedFile);
      }
      if (editSelectedSubimageFile) {
        formDataToSend.append('subimage', editSelectedSubimageFile);
      }

      const response = await fetch(`https://api.milkoza.in/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setProducts(products.map(product => 
          product._id === editingProduct._id ? data.data : product
        ));
        setShowEditForm(false);
        setEditingProduct(null);
        setEditFormData({
          name: '',
          price: '',
          originalPrice: '',
          shortDescription: '',
          category: '',
          quantity: 0.5,
          unit: ''
        });
        setEditSelectedFile(null);
        setEditSelectedSubimageFile(null);
        setEditPreviewUrl('');
        setEditSubimagePreviewUrl('');
        toast.success('Product updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || 'Error updating product');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || '',
      shortDescription: product.shortDescription,
      category: product.category._id,
      quantity: product.quantity,
      unit: product.unit._id
    });
    setEditSelectedFile(null);
    setEditSelectedSubimageFile(null);
    setEditPreviewUrl('');
    setEditSubimagePreviewUrl('');
    setShowEditForm(true);
  };

  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit file selection
  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditSelectedFile(file);
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
    }
  };

  // Handle edit subimage file selection
  const handleEditSubimageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditSelectedSubimageFile(file);
      const url = URL.createObjectURL(file);
      setEditSubimagePreviewUrl(url);
    }
  };

  // Handle edit quantity increment
  const handleEditQuantityIncrement = () => {
    setEditFormData(prev => ({
      ...prev,
      quantity: Math.min(100, prev.quantity + 1)
    }));
  };

  // Handle edit quantity decrement
  const handleEditQuantityDecrement = () => {
    setEditFormData(prev => ({
      ...prev,
      quantity: Math.max(0.5, prev.quantity - 1)
    }));
  };

  // Handle edit quantity manual input
  const handleEditQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 100) {
      setEditFormData(prev => ({
        ...prev,
        quantity: value
      }));
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (id, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`https://api.milkoza.in/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setProducts(products.filter(product => product._id !== id));
        toast.success('Product deleted successfully!');
      } else {
        toast.error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Error deleting product');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle category filter
  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <p className="text-gray-600">View and manage all products</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <div className="relative">
              <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={handleCategoryFilter}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold">{totalProducts}</span> products
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-lg font-medium">No products found</p>
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
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img
                              src={product.photo.startsWith('http') ? product.photo : `https://api.milkoza.in${product.photo}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center hidden">
                              <span className="text-xs">📦</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{product.shortDescription}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity} {product.unit?.symbol || 'kg'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(product)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id, product.name)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                          >
                            <TrashIcon className="h-4 w-4" />
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
              {products.map((product) => (
                <div key={product._id} className="border-b border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.photo.startsWith('http') ? product.photo : `https://api.milkoza.in${product.photo}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center hidden">
                        <span className="text-sm">📦</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.shortDescription}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-900">{formatPrice(product.price)}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                          )}
                          <div className="text-xs text-gray-500 mt-1">Qty: {product.quantity} {product.unit?.symbol || 'kg'}</div>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product._id, product.name)}
                          className="text-red-600 hover:text-red-900 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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

      {/* Edit Product Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Product</h3>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  setEditingProduct(null);
                  setEditFormData({
                    name: '',
                    price: '',
                    originalPrice: '',
                    shortDescription: '',
                    category: '',
                    quantity: 0.5
                  });
                  setEditSelectedFile(null);
                  setEditPreviewUrl('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter product name"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={editFormData.price}
                    onChange={handleEditInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter price"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={editFormData.originalPrice}
                    onChange={handleEditInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter original price"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleEditQuantityDecrement}
                      disabled={editFormData.quantity <= 0.5}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      name="quantity"
                      value={editFormData.quantity}
                      onChange={handleEditQuantityChange}
                      min="0.5"
                      max="100"
                      step="0.5"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
                      placeholder="0.5"
                    />
                    <button
                      type="button"
                      onClick={handleEditQuantityIncrement}
                      disabled={editFormData.quantity >= 100}
                      className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Range: 0.5 - 100</p>
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={editFormData.unit}
                    onChange={handleEditInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select a unit</option>
                    {units.map((unit) => (
                      <option key={unit._id} value={unit._id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image {!editSelectedFile && '(Optional - keep current image)'}
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditFileChange}
                      className="hidden"
                      id="edit-image-upload"
                    />
                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                      <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {editSelectedFile ? editSelectedFile.name : 'Click to upload new image'}
                      </p>
                    </label>
                  </div>
                  {editPreviewUrl && (
                    <div className="mt-4">
                      <img
                        src={editPreviewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {!editPreviewUrl && editingProduct && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Current image:</p>
                      <img
                        src={editingProduct.photo.startsWith('http') ? editingProduct.photo : `https://api.milkoza.in${editingProduct.photo}`}
                        alt={editingProduct.name}
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Sub Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Image (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditSubimageFileChange}
                      className="hidden"
                      id="edit-subimage-upload"
                    />
                    <label htmlFor="edit-subimage-upload" className="cursor-pointer">
                      <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {editSelectedSubimageFile ? editSelectedSubimageFile.name : 'Click to upload sub image'}
                      </p>
                    </label>
                  </div>
                  {editSubimagePreviewUrl && (
                    <div className="mt-4">
                      <img
                        src={editSubimagePreviewUrl}
                        alt="Sub Image Preview"
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  {!editSubimagePreviewUrl && editingProduct?.subimage && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">Current sub image:</p>
                      <img
                        src={editingProduct.subimage.startsWith('http') ? editingProduct.subimage : `https://api.milkoza.in${editingProduct.subimage}`}
                        alt={`${editingProduct.name} sub image`}
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  name="shortDescription"
                  value={editFormData.shortDescription}
                  onChange={handleEditInputChange}
                  required
                  rows={4}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter product description"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editFormData.shortDescription.length}/500 characters
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingProduct(null);
                    setEditFormData({
                      name: '',
                      price: '',
                      originalPrice: '',
                      shortDescription: '',
                      category: '',
                      quantity: 0.5,
                      unit: ''
                    });
                    setEditSelectedFile(null);
                    setEditSelectedSubimageFile(null);
                    setEditPreviewUrl('');
                    setEditSubimagePreviewUrl('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <PencilSquareIcon className="w-4 h-4" />
                      <span>Update Product</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageProduct;
