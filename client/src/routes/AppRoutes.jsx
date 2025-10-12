// client/src/routes/AppRoutes.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import all page components
import Home from '../pages/Home';
import About from '../pages/About';
import Services from '../pages/Services';
import Contact from '../pages/Contact'; // Assuming you have this page
import Category from '../pages/Category';
import ProductDetails from '../pages/ProductDetails';
import NotFound from '../pages/NotFound';

// Import Layouts
import MainLayout from '../Layout/MainLayout'; // Import the new MainLayout
import ShopLayout from '../Layout/ShopLayout';
import AdminLayout from '../Layout/AdminLayout';

// Import protected route components
import UserProtected from '../utils/UserProtected';
import AdminRouteProtected from '../utils/AdminRouteProtected';

// Import components specific to protected routes
import Profile from '../shop/Profile';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderSuccess from '../pages/OrderSuccess';
import Wishlist from '../shop/Wishlist';
import OrderHistory from '../shop/OrderHistory';
import Setting from '../shop/Setting';
import ShopDashboard from '../shop/ShopDashboard';

// Import Admin components
import AdminDashboard from '../Admin/AdminDashboard';
import AddProduct from '../Admin/AddProduct';
import ManageProduct from '../Admin/ManageProduct';
import ManageShops from '../Admin/ManageShops';
import OrderRequest from '../Admin/OrderRequest';
import OrderManagement from '../Admin/OrderManagement';
import AdminOrderSuccess from '../Admin/OrderSuccess';
import AddAndManageCategory from '../Admin/AddAndManageCategory';
import AdminSetting from '../Admin/AdminSetting';

// Import Login components
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import AdminRegister from '../pages/AdminRegister';
import ShopLogin from '../pages/ShopLogin';
import ShopRegister from '../pages/ShopRegister';
import ShopProfile from '../shop/ShopProfile';


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
                    <Route path='/contact' element={<Contact />} /> {/* Assuming you have this page */}
                    <Route path='/category/:categoryId' element={<Category />} />
                    <Route path='/product/:id' element={<ProductDetails />} />
                    <Route path='/cart' element={<Cart />} />
                    <Route path='/checkout' element={<Checkout />} />
                    <Route path='/order-success' element={<OrderSuccess />} />
                    <Route path='*' element={<NotFound />} /> {/* Catch-all for any unmatched public routes */}
                </Route>

                {/* Shop/User Protected Routes (with ShopLayout) */}
                <Route path='/user' element={<ShopLayout/>}>
                    <Route index element={<ShopDashboard/>} />
                    <Route path='profile' element={<Profile/>} />
                    <Route path='cart' element={<Cart/>} />
                    <Route path='wishlist' element={<Wishlist/>} />
                    <Route path='order-history' element={<OrderHistory/>} />
                    <Route path='setting' element={<Setting/>} />
                    <Route path='dashboard' element={<ShopDashboard/>} />
                </Route>

                {/* Admin Protected Routes (with AdminLayout) */}
                <Route path='/admin' element={<AdminRouteProtected><AdminLayout/></AdminRouteProtected>}>
                    <Route index element={<AdminDashboard/>} />
                    <Route path='dashboard' element={<AdminDashboard/>} />
                    <Route path='add-product' element={<AddProduct/>} />
                    <Route path='manage-products' element={<ManageProduct/>} />
                    <Route path='manage-shops' element={<ManageShops/>} />
                    <Route path='order-requests' element={<OrderRequest/>} />
                    <Route path='order-management' element={<OrderManagement/>} />
                    <Route path='order-success/:orderId' element={<AdminOrderSuccess/>} />
                    <Route path='categories' element={<AddAndManageCategory/>} />
                    <Route path='settings' element={<AdminSetting/>} />
                </Route>

                <Route path='/login' element={<Login/>}/>
                <Route path='/admin/login' element={<AdminLogin />}/>
                <Route path='/admin/register' element={<AdminRegister />}/>
                <Route path='/shop-login' element={<ShopLogin/>}/>
                <Route path='/shop-register' element={<ShopRegister/>}/>
                <Route path='/shop/profile' element={<ShopProfile/>}/>
                <Route path='/shop/orders' element={<OrderHistory/>}/>

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