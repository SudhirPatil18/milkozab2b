import React, { useState, useEffect } from 'react';
import { 
    ClipboardDocumentListIcon, 
    ChartBarIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

function HeadAdminOrderManagement() {
    // Mock data for demonstration
    const [orders] = useState([
        {
            _id: '1',
            orderNumber: 'ORD-001',
            customer: { name: 'John Doe', email: 'john@example.com' },
            totalAmount: 125.50,
            status: 'delivered',
            createdAt: '2024-01-15T10:30:00Z'
        },
        {
            _id: '2',
            orderNumber: 'ORD-002',
            customer: { name: 'Jane Smith', email: 'jane@example.com' },
            totalAmount: 89.99,
            status: 'pending',
            createdAt: '2024-01-16T14:20:00Z'
        },
        {
            _id: '3',
            orderNumber: 'ORD-003',
            customer: { name: 'Mike Johnson', email: 'mike@example.com' },
            totalAmount: 200.00,
            status: 'cancelled',
            createdAt: '2024-01-17T09:15:00Z'
        },
        {
            _id: '4',
            orderNumber: 'ORD-004',
            customer: { name: 'Sarah Wilson', email: 'sarah@example.com' },
            totalAmount: 75.25,
            status: 'delivered',
            createdAt: '2024-01-18T16:45:00Z'
        },
        {
            _id: '5',
            orderNumber: 'ORD-005',
            customer: { name: 'David Brown', email: 'david@example.com' },
            totalAmount: 150.75,
            status: 'pending',
            createdAt: '2024-01-19T11:30:00Z'
        }
    ]);

    const [statistics] = useState({
        totalOrders: 5,
        completedOrders: 2,
        cancelledOrders: 1,
        pendingOrders: 2
    });

    const [loading] = useState(false);
    const [error] = useState(null);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'processing': return 'bg-purple-100 text-purple-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600 mt-1">Overview of all platform orders</p>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ChartBarIcon className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.totalOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.completedOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircleIcon className="h-8 w-8 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Cancelled</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.cancelledOrders}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <ClockIcon className="h-8 w-8 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-semibold text-gray-900">{statistics.pendingOrders}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Orders ({orders.length})</h3>
                </div>
                
                {orders.length === 0 ? (
                    <div className="p-6 text-center">
                        <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-600">There are no orders to display at the moment.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {orders.slice(0, 10).map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{order.orderNumber || order._id.slice(-8)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                                            <div className="text-sm text-gray-500">{order.customer?.email || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            ${order.totalAmount?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default HeadAdminOrderManagement;
