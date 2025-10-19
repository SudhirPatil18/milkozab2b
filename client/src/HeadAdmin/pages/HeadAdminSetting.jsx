import React from 'react';
import { Cog6ToothIcon, UserIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

function HeadAdminSetting() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900">Head Admin Settings</h1>
                <p className="text-gray-600 mt-1">Manage your account and platform settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <UserIcon className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900">Profile Settings</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Update your personal information and preferences.</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Edit Profile
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <BellIcon className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Configure your notification preferences.</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Manage Notifications
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900">Security</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Manage your password and security settings.</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Security Settings
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <Cog6ToothIcon className="h-6 w-6 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900">Platform Settings</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Configure platform-wide settings and preferences.</p>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200">
                        Platform Config
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HeadAdminSetting;
