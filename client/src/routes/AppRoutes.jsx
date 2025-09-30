// client/src/routes/AppRoutes.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all page components
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Gallery from '../pages/Gallery';
import Contact from '../pages/Contact'; // Assuming you have this page
import NotFound from '../pages/NotFound';

// Import Layouts
import MainLayout from '../Layout/MainLayout'; // Import the new MainLayout
import UserLayout from '../Layout/UserLayout';
import AdminLayout from '../Layout/AdminLayout';

// Import protected route components
import UserProtected from '../utils/UserProtected';
import AdminRouteProtected from '../utils/AdminRouteProtected';

// Import components specific to protected routes
import Profile from '../user/Profile'; // Adjust path if Profile moves to pages/user/Profile
import AdminDashboard from '../Admin/AdminDashboard';


function AppRoutes() {
    return (
        <Router>
            <Routes>
                {/*
                    Main Layout for public pages (with Header and Footer)
                    All child routes within this <Route> will render inside MainLayout's <Outlet>
                */}
                <Route element={<MainLayout />}>
                    <Route index element={<Home />} /> {/* Renders at '/' */}
                    <Route path='/home' element={<Home />} /> {/* Optional: if you prefer '/home' instead of just '/' */}
                    <Route path='/about' element={<About />} />
                    <Route path='/services' element={<Services />} />
                    <Route path='/gallery' element={<Gallery />} />
                    <Route path='/contact' element={<Contact />} /> {/* Assuming you have this page */}
                    <Route path='*' element={<NotFound />} /> {/* Catch-all for any unmatched public routes */}
                </Route>

                {/*
                    User Protected Routes (with UserLayout)
                    These will have their own layout, separate from MainLayout's Header/Footer
                */}
                <Route path='/user' element={<UserProtected><UserLayout/></UserProtected>}>
                    {/* If /user itself should show a component, add an index route here */}
                    {/* <Route index element={<UserOverviewPage />} /> */}
                    <Route path='profile' element={<Profile/>} />
                    {/* Add other user-specific routes here, e.g., /user/settings, /user/orders */}
                </Route>

                {/*
                    Admin Protected Routes (with AdminLayout)
                    These will have their own layout, separate from MainLayout's Header/Footer
                */}
                <Route path='/admin' element={<AdminLayout/>}>
                    {/* If /admin itself should show a component, add an index route here */}
                    {/* <Route index element={<AdminHomePage />} /> */}
                    <Route path='dashboard' element={<AdminDashboard/>} />
                    {/* Add other admin-specific routes here, e.g., /admin/users, /admin/products */}
                </Route>

                {/*
                    You could also add routes here that have NO layout at all,
                    e.g., a dedicated login/signup page that is full-screen without header/footer.
                    <Route path="/login" element={<LoginPage />} />
                */}

            </Routes>
        </Router>
    );
}

export default AppRoutes;