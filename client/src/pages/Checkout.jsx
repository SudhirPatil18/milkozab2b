import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  PlusIcon,
  CheckIcon,
  CreditCardIcon,
  BanknotesIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: user?.name || '',
    mobileNumber: user?.phoneNumber || '',
    flatHouseNo: '',
    areaStreet: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  // Fetch addresses when user is logged in
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Show address form only for new users with no addresses
  useEffect(() => {
    if (addresses.length === 0 && user && !loadingAddresses) {
      setShowAddressForm(true);
    } else if (addresses.length > 0) {
      setShowAddressForm(false);
    }
  }, [addresses.length, user, loadingAddresses]);

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch('https://api.milkoza.in/api/addresses', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.data);
        
        // Set default address as selected
        const defaultAddress = data.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  // Calculate total manually to ensure accuracy
  const calculatedTotal = items.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const calculatedItems = items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch('https://api.milkoza.in/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newAddress,
          isDefault: addresses.length === 0
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newAddressData = data.data;
        
        setAddresses([...addresses, newAddressData]);
        setSelectedAddress(newAddressData);
        setShowAddressForm(false);
        setNewAddress({
          fullName: user?.name || '',
          mobileNumber: user?.phoneNumber || '',
          flatHouseNo: '',
          areaStreet: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        });
        
        toast.success('Address added successfully!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setNewAddress({
      fullName: address.fullName,
      mobileNumber: address.mobileNumber,
      flatHouseNo: address.flatHouseNo,
      areaStreet: address.areaStreet,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || ''
    });
    setShowAddressForm(true);
  };

  const handleAddNewAddress = () => {
    setEditingAddress(null);
    setNewAddress({
      fullName: user?.name || '',
      mobileNumber: user?.phoneNumber || '',
      flatHouseNo: '',
      areaStreet: '',
      city: '',
      state: '',
      pincode: '',
      landmark: ''
    });
    setShowAddressForm(true);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('shopToken');
      
      const response = await fetch(`https://api.milkoza.in/api/addresses/${editingAddress._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        const updatedAddress = data.data;
        
        setAddresses(addresses.map(addr => 
          addr._id === editingAddress._id ? updatedAddress : addr
        ));
        
        if (selectedAddress?._id === editingAddress._id) {
          setSelectedAddress(updatedAddress);
        }
        
        setShowAddressForm(false);
        setEditingAddress(null);
        setNewAddress({
          fullName: user?.name || '',
          mobileNumber: user?.phoneNumber || '',
          flatHouseNo: '',
          areaStreet: '',
          city: '',
          state: '',
          pincode: '',
          landmark: ''
        });
        
        toast.success('Address updated successfully!', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
          },
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update address');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address. Please try again.');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    
    if (!paymentMode) {
      alert('Please select a payment mode');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('shopToken');
      
      // Prepare order data
      const orderData = {
        items: items.map(item => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price // Price at the time of order
        })),
        deliveryAddress: selectedAddress,
        paymentMode,
        totalAmount: calculatedTotal,
        notes: ''
      };

      const response = await fetch('https://api.milkoza.in/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Order created:', data);
        
        // Clear cart and redirect to success page
        clearCart();
        navigate('/order-success');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const deliveryCharges = 0; // Free delivery
  const finalAmount = totalPrice + deliveryCharges;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/cart" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Delivery Address</h2>
                    <p className="text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>
                {addresses.length > 0 && (
                  <button
                    onClick={handleAddNewAddress}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* Loading State */}
              {loadingAddresses && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading addresses...</p>
                </div>
              )}

              {/* Address List - Show by default for existing users */}
              {addresses.length > 0 && !showAddressForm && !loadingAddresses && (
                <div className="space-y-3">
                  <h3 className="text-md font-semibold text-gray-800 mb-3">Select Delivery Address</h3>
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddress?._id === address._id
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedAddress(address)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedAddress?._id === address._id}
                            onChange={() => setSelectedAddress(address)}
                            className="mt-1 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium text-gray-900">{address.fullName}</span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600">{address.mobileNumber}</span>
                              {address.isDefault && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.flatHouseNo}, {address.areaStreet}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            {address.landmark && (
                              <p className="text-sm text-gray-500 mt-1">
                                Landmark: {address.landmark}
                              </p>
                            )}
                          </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            title="Edit address"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          {selectedAddress?._id === address._id && (
                            <CheckIcon className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add New Address Button within the list */}
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={handleAddNewAddress}
                      className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 rounded-lg transition-colors duration-200"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      <span>Add New Address</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Form */}
              {showAddressForm && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingAddress ? 'Edit Address' : (addresses.length === 0 ? 'Add Your Address' : 'Add New Address')}
                    </h3>
                    {addresses.length > 0 && (
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                        }}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        ← Back to Address List
                      </button>
                    )}
                  </div>
                  
                  <form onSubmit={editingAddress ? handleUpdateAddress : handleAddressSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Number *
                        </label>
                        <input
                          type="tel"
                          value={newAddress.mobileNumber}
                          onChange={(e) => setNewAddress({...newAddress, mobileNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Flat, House No., Building, Company, Apartment *
                      </label>
                      <input
                        type="text"
                        value={newAddress.flatHouseNo}
                        onChange={(e) => setNewAddress({...newAddress, flatHouseNo: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Flat 101, Green Park Apartments"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Area, Street, Sector, Village *
                      </label>
                      <input
                        type="text"
                        value={newAddress.areaStreet}
                        onChange={(e) => setNewAddress({...newAddress, areaStreet: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Sector 15, Near Metro Station"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({...newAddress, landmark: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., Near Central Mall"
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                      >
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddressForm(false);
                          setEditingAddress(null);
                          setNewAddress({
                            fullName: user?.name || '',
                            mobileNumber: user?.phoneNumber || '',
                            flatHouseNo: '',
                            areaStreet: '',
                            city: '',
                            state: '',
                            pincode: '',
                            landmark: ''
                          });
                        }}
                        className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* First Order Message */}
              {addresses.length === 0 && !showAddressForm && (
                <div className="text-center py-8">
                  <MapPinIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Please add your delivery address
                  </h3>
                  <p className="text-gray-600 mb-4">
                    We need your address to deliver your order
                  </p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    Add Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Mode Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Payment Mode</h2>
                  <p className="text-gray-600">Choose your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="cod"
                    checked={paymentMode === 'cod'}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                    <div>
                      <div className="font-medium text-gray-900">Cash on Delivery (COD)</div>
                      <div className="text-sm text-gray-500">Pay when your order arrives</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-green-300 transition-colors">
                  <input
                    type="radio"
                    name="paymentMode"
                    value="online"
                    checked={paymentMode === 'online'}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div className="ml-3 flex items-center space-x-3">
                    <CreditCardIcon className="w-6 h-6 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-500">Pay securely with cards, UPI, or wallets</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4">
                {items.map((item, index) => (
                  <div key={item.id || `${item.product._id}_${index}`} className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.photo?.startsWith('http') ? item.product.photo : `https://api.milkoza.in${item.product.photo}`}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} • {item.product.unit?.symbol || 'kg'}
                      </p>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items ({calculatedItems})</span>
                  <span className="font-medium text-gray-900">{formatPrice(calculatedTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery</span>
                  <span className="font-medium text-green-600">
                    {deliveryCharges === 0 ? 'Free' : formatPrice(deliveryCharges)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(calculatedTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={!selectedAddress || !paymentMode || isLoading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                You will be redirected to complete your order
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
