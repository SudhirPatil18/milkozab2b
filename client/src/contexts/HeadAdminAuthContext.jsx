import React, { createContext, useContext, useState, useEffect } from 'react';

const HeadAdminAuthContext = createContext();

export const useHeadAdminAuth = () => {
    const context = useContext(HeadAdminAuthContext);
    if (!context) {
        throw new Error('useHeadAdminAuth must be used within a HeadAdminAuthProvider');
    }
    return context;
};

export const HeadAdminAuthProvider = ({ children }) => {
    const [headAdmin, setHeadAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing headAdmin session
        const token = localStorage.getItem('headAdminToken');
        const headAdminData = localStorage.getItem('headAdminData');
        
        if (token && headAdminData) {
            try {
                setHeadAdmin(JSON.parse(headAdminData));
            } catch (error) {
                console.error('Error parsing headAdmin data:', error);
                localStorage.removeItem('headAdminToken');
                localStorage.removeItem('headAdminData');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const response = await fetch('https://api.milkoza.in/api/headadmin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            
            // Store headAdmin data and token
            localStorage.setItem('headAdminToken', data.token);
            localStorage.setItem('headAdminData', JSON.stringify(data.headAdmin));
            setHeadAdmin(data.headAdmin);
            
            return { success: true, data };
        } catch (error) {
            console.error('HeadAdmin login error:', error);
            return { success: false, error: error.message };
        }
    };

    const register = async (headAdminData) => {
        try {
            const response = await fetch('https://api.milkoza.in/api/headadmin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(headAdminData),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('HeadAdmin registration error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            const token = localStorage.getItem('headAdminToken');
            if (token) {
                await fetch('https://api.milkoza.in/api/headadmin/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        } catch (error) {
            console.error('HeadAdmin logout error:', error);
        } finally {
            // Clear local storage regardless of API call success
            localStorage.removeItem('headAdminToken');
            localStorage.removeItem('headAdminData');
            setHeadAdmin(null);
        }
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('headAdminToken');
        return !!token && !!headAdmin;
    };

    const getAuthHeaders = () => {
        const token = localStorage.getItem('headAdminToken');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        };
    };

    const value = {
        headAdmin,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
        getAuthHeaders,
    };

    return (
        <HeadAdminAuthContext.Provider value={value}>
            {children}
        </HeadAdminAuthContext.Provider>
    );
};
