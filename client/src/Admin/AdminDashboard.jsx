import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  PlusIcon, 
  PencilSquareIcon, 
  BuildingStorefrontIcon, 
  ClipboardDocumentListIcon,
  TagIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  ShoppingCartIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  StarIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useAdminAuth } from '../contexts/AdminAuthContext'
import toast from 'react-hot-toast'

function AdminDashboard() {
  const navigate = useNavigate()
  const { admin, logout, isAuthenticated, loading } = useAdminAuth()
  
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentOrders: [],
    topProducts: [],
    notifications: [],
    revenueData: [],
    loading: true
  })

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true }))
        
        const token = localStorage.getItem('adminToken')
        if (!token) {
          throw new Error('No admin token found')
        }

        // Fetch dashboard statistics from the backend
        const dashboardResponse = await fetch('https://api.milkoza.in/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const dashboardData = await dashboardResponse.json()

        if (!dashboardData.success) {
          throw new Error(dashboardData.message || 'Failed to fetch dashboard data')
        }

        const { stats, recentOrders, topProducts } = dashboardData.data

        // Process recent orders
        const processedRecentOrders = recentOrders.map(order => ({
          id: order._id,
          shop: order.user?.name || 'Unknown Shop',
          amount: order.totalAmount || 0,
          status: order.orderStatus || 'pending',
          time: new Date(order.createdAt).toLocaleString(),
          items: order.items?.length || 0
        }))

        // Process top products
        const processedTopProducts = topProducts.map(product => ({
          name: product.name,
          sales: product.sales || 0,
          revenue: (product.price || 0) * (product.sales || 0),
          growth: Math.random() * 20 // This would come from analytics in a real system
        }))

        // Generate notifications based on real data
        const notifications = [
          ...(processedRecentOrders.length > 0 ? [{
            id: 1,
            type: 'order',
            message: `New order received from ${processedRecentOrders[0].shop}`,
            time: '5 min ago',
            priority: 'high'
          }] : []),
          ...(stats.activeShops > 0 ? [{
            id: 2,
            type: 'shop',
            message: `${stats.activeShops} active shops in the system`,
            time: '1 hour ago',
            priority: 'medium'
          }] : []),
          ...(stats.totalProducts > 0 ? [{
            id: 3,
            type: 'product',
            message: `${stats.totalProducts} products available`,
            time: '2 hours ago',
            priority: 'low'
          }] : []),
          {
            id: 4,
            type: 'system',
            message: 'Dashboard data refreshed successfully',
            time: 'Just now',
            priority: 'low'
          }
        ]

        setDashboardData({
          stats: {
            totalRevenue: stats?.totalRevenue || 0,
            totalOrders: stats?.totalOrders || 0,
            activeShops: stats?.activeShops || 0,
            totalProducts: stats?.totalProducts || 0,
            totalCategories: stats?.totalCategories || 0,
            revenueGrowth: stats?.revenueGrowth || 0,
            orderGrowth: stats?.orderGrowth || 0,
            shopGrowth: stats?.shopGrowth || 0,
            productGrowth: stats?.productGrowth || 0
          },
          recentOrders: processedRecentOrders || [],
          topProducts: processedTopProducts || [],
          notifications: notifications || [],
          loading: false
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast.error('Failed to load dashboard data')
        setDashboardData(prev => ({ ...prev, loading: false }))
      }
    }

    if (isAuthenticated()) {
      fetchDashboardData()
    }
  }, [isAuthenticated])

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/admin/login')
    }
  }, [loading, isAuthenticated, navigate])

  if (loading || dashboardData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'out_for_delivery': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return ClipboardDocumentListIcon
      case 'shop': return BuildingStorefrontIcon
      case 'product': return ShoppingCartIcon
      case 'payment': return CurrencyDollarIcon
      case 'system': return Cog6ToothIcon
      default: return BellIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your B2B platform.</p>
          </div>
          
          {/* Admin Info & Notifications */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <BellIcon className="h-6 w-6" />
                {dashboardData.notifications.filter(n => n.priority === 'high').length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dashboardData.notifications.filter(n => n.priority === 'high').length}
                  </span>
                )}
              </button>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Welcome, {admin?.name || 'Admin'}
              </p>
              <p className="text-sm text-gray-500">
                {admin?.phoneNumber || admin?.email || 'Administrator'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserCircleIcon className="h-8 w-8 text-blue-600" />
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.totalRevenue || 0)}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardData.stats.revenueGrowth || 0}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{(dashboardData.stats.totalOrders || 0).toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardData.stats.orderGrowth || 0}%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Shops</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.activeShops}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardData.stats.shopGrowth || 0}%</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{(dashboardData.stats.totalProducts || 0).toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{dashboardData.stats.productGrowth || 0}%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/add-product"
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <PlusIcon className="h-6 w-6" />
            <span className="font-medium">Add Product</span>
          </Link>
          <Link
            to="/admin/manage-products"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <PencilSquareIcon className="h-6 w-6" />
            <span className="font-medium">Manage Products</span>
          </Link>
          <Link
            to="/admin/manage-shops"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <BuildingStorefrontIcon className="h-6 w-6" />
            <span className="font-medium">Manage Shops</span>
          </Link>
          <Link
            to="/admin/order-requests"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <ClipboardDocumentListIcon className="h-6 w-6" />
            <span className="font-medium">Order Requests</span>
          </Link>
          <Link
            to="/admin/categories"
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <TagIcon className="h-6 w-6" />
            <span className="font-medium">Categories</span>
          </Link>
          <Link
            to="/admin/settings"
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-4 flex items-center space-x-3 transition-colors duration-200"
          >
            <Cog6ToothIcon className="h-6 w-6" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/order-requests" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {dashboardData.recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.shop} • {order.items} items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Products</h2>
          <div className="space-y-4">
            {dashboardData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-green-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(product.revenue)}</p>
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{product.growth}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Notifications</h2>
        <div className="space-y-3">
          {dashboardData.notifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type)
            return (
              <div key={notification.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className={`p-2 rounded-full ${notification.priority === 'high' ? 'bg-red-100' : notification.priority === 'medium' ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  <IconComponent className={`h-4 w-4 ${getPriorityColor(notification.priority)}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500">{notification.time}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`}></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
