import React from 'react';
import { 
    UserGroupIcon, 
    BuildingStorefrontIcon, 
    CreditCardIcon, 
    ClipboardDocumentListIcon,
    ChartBarIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

function HeadAdminDashboard() {
    // Mock data - replace with actual data from your API
    const stats = [
        { name: 'Total Admins', value: '12', icon: UserGroupIcon, change: '+2', changeType: 'positive' },
        { name: 'Active Shops', value: '45', icon: BuildingStorefrontIcon, change: '+5', changeType: 'positive' },
        { name: 'Pending Payments', value: '8', icon: CreditCardIcon, change: '-2', changeType: 'negative' },
        { name: 'Total Orders', value: '1,234', icon: ClipboardDocumentListIcon, change: '+12%', changeType: 'positive' },
    ];

    const recentActivities = [
        { id: 1, action: 'New admin registered', user: 'John Doe', time: '2 hours ago', type: 'admin' },
        { id: 2, action: 'Shop approved', user: 'Fresh Market', time: '4 hours ago', type: 'shop' },
        { id: 3, action: 'Payment processed', user: 'Grocery Store', time: '6 hours ago', type: 'payment' },
        { id: 4, action: 'Order completed', user: 'SuperMart', time: '8 hours ago', type: 'order' },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Head Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your platform.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <stat.icon className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-4 flex-1">
                                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                stat.changeType === 'positive' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts and Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Placeholder */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Overview</h3>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500">Chart will be implemented here</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activities */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-4">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    activity.type === 'admin' ? 'bg-purple-500' :
                                    activity.type === 'shop' ? 'bg-blue-500' :
                                    activity.type === 'payment' ? 'bg-green-500' : 'bg-orange-500'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">{activity.action}</p>
                                    <p className="text-sm text-gray-500">{activity.user}</p>
                                    <p className="text-xs text-gray-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeadAdminDashboard;
