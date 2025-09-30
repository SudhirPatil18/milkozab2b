// client/src/Layout/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; // Assuming Header.jsx is in the same Layout folder
import Footer from './Footer'; // Assuming Footer.jsx is in the same Layout folder

const MainLayout = () => {
    return (
        // flex-col and min-h-screen ensure the footer sticks to the bottom
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header /> {/* Your global Header */}

            {/* Main content area, grows to fill available space */}
            <main className="flex-grow">
                {/*
                    The Outlet renders the child routes defined under MainLayout in AppRoutes.jsx.
                    For example, Home, About, Services, Gallery, Contact, NotFound.
                */}
                <Outlet />
            </main>

            <Footer /> {/* Your global Footer */}
        </div>
    );
};

export default MainLayout;