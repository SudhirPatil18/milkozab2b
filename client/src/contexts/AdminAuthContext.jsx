import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // API base URL
    const API_BASE_URL = 'http://localhost:7000/api';

    // Check if admin is logged in on app start
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const storedAdmin = localStorage.getItem('adminInfo');
                const storedToken = localStorage.getItem('adminToken');
                
                if (storedAdmin && storedToken) {
                    setAdmin(JSON.parse(storedAdmin));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Error checking admin auth status:', error);
                // Clear invalid data
                localStorage.removeItem('adminInfo');
                localStorage.removeItem('adminToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Login admin
    const login = async (credentials) => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store admin data and token
            const { admin: adminData, token: authToken } = data.data;
            localStorage.setItem('adminInfo', JSON.stringify(adminData));
            localStorage.setItem('adminToken', authToken);
            
            setAdmin(adminData);
            setToken(authToken);
            
            toast.success(data.message || 'Login successful!');
            return { success: true, data: adminData };

        } catch (error) {
            console.error('Admin login error:', error);
            toast.error(error.message || 'Login failed. Please check your credentials.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Logout admin
    const logout = async () => {
        try {
            // Call logout API if token exists
            if (token) {
                await fetch(`${API_BASE_URL}/admin/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Admin logout API error:', error);
            // Continue with logout even if API call fails
        } finally {
            // Clear local storage and state
            localStorage.removeItem('adminInfo');
            localStorage.removeItem('adminToken');
            setAdmin(null);
            setToken(null);
            toast.success('Logged out successfully');
        }
    };

    // Update admin profile
    const updateProfile = async (profileData) => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/admin/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Profile update failed');
            }

            // Update local admin data
            const updatedAdmin = data.data.admin;
            localStorage.setItem('adminInfo', JSON.stringify(updatedAdmin));
            setAdmin(updatedAdmin);
            
            toast.success('Profile updated successfully!');
            return { success: true, data: updatedAdmin };

        } catch (error) {
            console.error('Profile update error:', error);
            toast.error(error.message || 'Profile update failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/admin/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Password change failed');
            }

            toast.success('Password changed successfully!');
            return { success: true };

        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Password change failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Get admin profile
    const getProfile = async () => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/admin/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch profile');
            }

            // Update local admin data
            const updatedAdmin = data.data.admin;
            localStorage.setItem('adminInfo', JSON.stringify(updatedAdmin));
            setAdmin(updatedAdmin);
            
            return { success: true, data: updatedAdmin };

        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: error.message };
        }
    };

    // Check if admin is authenticated
    const isAuthenticated = () => {
        return admin && token;
    };

    const value = {
        admin,
        token,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        getProfile,
        isAuthenticated,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};
