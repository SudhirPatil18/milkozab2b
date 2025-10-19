import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import HeadAdminHeader from './HeadAdminHeader';
import HeadAdminSidebar from './HeadAdminSidebar';

function HeadAdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar (visible on md screens, toggled on sm) */}
            <HeadAdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <HeadAdminHeader toggleSidebar={toggleSidebar} />

                {/* Page content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default HeadAdminLayout;
