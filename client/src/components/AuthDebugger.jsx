import React from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AuthDebugger = () => {
    const { admin, token, loading, isAuthenticated } = useAdminAuth();
    
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-sm">
            <h3 className="font-bold mb-2">Auth Debug Info</h3>
            <div className="space-y-1">
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Authenticated: {isAuthenticated() ? 'Yes' : 'No'}</div>
                <div>Admin: {admin ? admin.name : 'None'}</div>
                <div>Token: {token ? 'Present' : 'None'}</div>
                <div>LocalStorage Admin: {localStorage.getItem('adminInfo') ? 'Present' : 'None'}</div>
                <div>LocalStorage Token: {localStorage.getItem('adminToken') ? 'Present' : 'None'}</div>
            </div>
        </div>
    );
};

export default AuthDebugger;
