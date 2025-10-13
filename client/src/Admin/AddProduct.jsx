import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUnitManager, setShowUnitManager] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', symbol: '' });
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    shortDescription: '',
    category: '',
    quantity: 0.5,
    unit: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedSubimageFile, setSelectedSubimageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [subimagePreviewUrl, setSubimagePreviewUrl] = useState('');

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.milkoza.in/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error fetching categories');
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
      toast.error('Error fetching units');
    }
  };

  // Add new unit
  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!newUnit.name || !newUnit.symbol) {
      toast.error('Please fill in both name and symbol');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }

    try {
      const response = await fetch('https://api.milkoza.in/api/units', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUnit)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Unit added successfully!');
        setNewUnit({ name: '', symbol: '' });
        fetchUnits();
      } else {
        toast.error(data.message || 'Failed to add unit');
      }
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error('Error adding unit');
    }
  };

  // Delete unit
  const handleDeleteUnit = async (unitId, unitName) => {
    if (!window.confirm(`Are you sure you want to delete "${unitName}"?`)) {
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required');
      return;
    }

    try {
      const response = await fetch(`https://api.milkoza.in/api/units/${unitId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Unit deleted successfully!');
        fetchUnits();
      } else {
        toast.error(data.message || 'Failed to delete unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      toast.error('Error deleting unit');
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchUnits();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle quantity increment
  const handleQuantityIncrement = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.min(100, prev.quantity + 1)
    }));
  };

  // Handle quantity decrement
  const handleQuantityDecrement = () => {
    setFormData(prev => ({
      ...prev,
      quantity: Math.max(0.5, prev.quantity - 1)
    }));
  };

  // Handle quantity manual input
  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0.5 && value <= 100) {
      setFormData(prev => ({
        ...prev,
        quantity: value
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Handle subimage file selection
  const handleSubimageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedSubimageFile(file);
      const url = URL.createObjectURL(file);
      setSubimagePreviewUrl(url);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast.error('Please select a product image');
      return;
    }
    
    const token = localStorage.getItem('adminToken');
    if (!token) {
      toast.error('Admin authentication required. Please login as admin.');
      return;
    }
    
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('shortDescription', formData.shortDescription);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('photo', selectedFile);
      if (selectedSubimageFile) {
        formDataToSend.append('subimage', selectedSubimageFile);
      }


      const response = await fetch('https://api.milkoza.in/api/products', {
        method: 'POST',
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
        toast.success('Product added successfully!');
        // Reset form
        setFormData({
          name: '',
          price: '',
          originalPrice: '',
          shortDescription: '',
          category: '',
          quantity: 0.5,
          unit: ''
        });
        setSelectedFile(null);
        setSelectedSubimageFile(null);
        setPreviewUrl('');
        setSubimagePreviewUrl('');
      } else {
        toast.error(data.message || 'Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.message || 'Error adding product');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <PlusIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            <p className="text-gray-600">Create a new product with details and image</p>
          </div>
        </div>
      </div>

      {/* Manage Units Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manage Units</h2>
              <p className="text-gray-600">Add and manage product units</p>
            </div>
          </div>
          <button
            onClick={() => setShowUnitManager(!showUnitManager)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{showUnitManager ? 'Hide' : 'Manage'} Units</span>
          </button>
        </div>

        {showUnitManager && (
          <div className="space-y-6">
            {/* Add New Unit Form */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Unit</h3>
              <form onSubmit={handleAddUnit} className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Name
                  </label>
                  <input
                    type="text"
                    value={newUnit.name}
                    onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                    placeholder="e.g., Kilogram"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={newUnit.symbol}
                    onChange={(e) => setNewUnit({ ...newUnit, symbol: e.target.value })}
                    placeholder="e.g., kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Add Unit</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Units List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Units</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {units.map((unit) => (
                  <div key={unit._id} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{unit.symbol}</span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{unit.name}</div>
                        <div className="text-sm text-gray-500">{unit.symbol}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteUnit(unit._id, unit.name)}
                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                      title="Delete unit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
                value={formData.price}
                onChange={handleInputChange}
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
                value={formData.originalPrice}
                onChange={handleInputChange}
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
                value={formData.category}
                onChange={handleInputChange}
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
                  onClick={handleQuantityDecrement}
                  disabled={formData.quantity <= 0.5}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleQuantityChange}
                  min="0.5"
                  max="100"
                  step="0.5"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center"
                  placeholder="0.5"
                />
                <button
                  type="button"
                  onClick={handleQuantityIncrement}
                  disabled={formData.quantity >= 100}
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
                value={formData.unit}
                onChange={handleInputChange}
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
                Product Image *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedFile ? selectedFile.name : 'Click to upload image'}
                  </p>
                </label>
              </div>
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
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
                  onChange={handleSubimageFileChange}
                  className="hidden"
                  id="subimage-upload"
                />
                <label htmlFor="subimage-upload" className="cursor-pointer">
                  <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {selectedSubimageFile ? selectedSubimageFile.name : 'Click to upload sub image'}
                  </p>
                </label>
              </div>
              {subimagePreviewUrl && (
                <div className="mt-4">
                  <img
                    src={subimagePreviewUrl}
                    alt="Sub Image Preview"
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
              value={formData.shortDescription}
              onChange={handleInputChange}
              required
              rows={4}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter product description"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.shortDescription.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  price: '',
                  originalPrice: '',
                  shortDescription: '',
                  category: '',
                  quantity: 0.5,
                  unit: ''
                });
                setSelectedFile(null);
                setSelectedSubimageFile(null);
                setPreviewUrl('');
                setSubimagePreviewUrl('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;
