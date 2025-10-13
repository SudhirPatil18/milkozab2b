import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    // API base URL
    const API_BASE_URL = 'https://api.milkoza.in/api';

    // Check if user is logged in on app start
    useEffect(() => {
        const checkAuthStatus = () => {
            try {
                const storedUser = localStorage.getItem('shopUser');
                const storedToken = localStorage.getItem('shopToken');
                
                if (storedUser && storedToken) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
                // Clear invalid data
                localStorage.removeItem('shopUser');
                localStorage.removeItem('shopToken');
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // Register shop
    const register = async (userData) => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/shop/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Store user data and token
            const { shop, token: authToken } = data.data;
            localStorage.setItem('shopUser', JSON.stringify(shop));
            localStorage.setItem('shopToken', authToken);
            
            setUser(shop);
            setToken(authToken);
            
            toast.success(data.message || 'Registration successful!');
            return { success: true, data: shop };

        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.message || 'Registration failed. Please try again.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Login shop
    const login = async (credentials) => {
        try {
            setLoading(true);
            
            const response = await fetch(`${API_BASE_URL}/shop/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error codes
                if (data.code === 'ACCOUNT_BLOCKED') {
                    throw new Error('Your account has been blocked by admin. Please contact admin for assistance.');
                }
                throw new Error(data.message || 'Login failed');
            }

            // Store user data and token
            const { shop, token: authToken } = data.data;
            localStorage.setItem('shopUser', JSON.stringify(shop));
            localStorage.setItem('shopToken', authToken);
            
            setUser(shop);
            setToken(authToken);
            
            toast.success(data.message || 'Login successful!');
            return { success: true, data: shop };

        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed. Please check your credentials.');
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Logout shop
    const logout = async () => {
        try {
            // Call logout API if token exists
            if (token) {
                await fetch(`${API_BASE_URL}/shop/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with logout even if API call fails
        } finally {
            // Clear local storage and state
            localStorage.removeItem('shopUser');
            localStorage.removeItem('shopToken');
            setUser(null);
            setToken(null);
            toast.success('Logged out successfully');
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/shop/profile`, {
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

            // Update local user data
            const updatedUser = { ...user, ...data.data.shop };
            localStorage.setItem('shopUser', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            toast.success(data.message || 'Profile updated successfully!');
            return { success: true, data: updatedUser };

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

            const response = await fetch(`${API_BASE_URL}/shop/change-password`, {
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

            toast.success(data.message || 'Password changed successfully!');
            return { success: true };

        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.message || 'Password change failed. Please try again.');
            return { success: false, error: error.message };
        }
    };

    // Get user profile
    const getProfile = async () => {
        try {
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${API_BASE_URL}/shop/profile`, {
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

            // Update local user data
            const updatedUser = data.data.shop;
            localStorage.setItem('shopUser', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            return { success: true, data: updatedUser };

        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: error.message };
        }
    };

    // Check if user is authenticated
    const isAuthenticated = () => {
        return user && token;
    };

    // Check if user is verified
    const isVerified = () => {
        return user && user.isVerified;
    };

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        getProfile,
        isAuthenticated,
        isVerified,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
