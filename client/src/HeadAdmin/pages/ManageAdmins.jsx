import React, { useState, useEffect } from 'react';
import { useHeadAdminAuth } from '../../contexts/HeadAdminAuthContext';
import { 
    UserGroupIcon, 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon,
    ShieldCheckIcon,
    ShieldExclamationIcon,
    XMarkIcon,
    CheckIcon,
    MapPinIcon,
    PhoneIcon,
    IdentificationIcon,
    PhotoIcon,
    DocumentIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

function ManageAdmins() {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const { getAuthHeaders } = useHeadAdminAuth();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('https://api.milkoza.in/api/headadmin/admins', {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAdmins(data.admins || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            setError('Failed to fetch admins');
            // Use mock data if API fails
            setAdmins([
                {
                    _id: '1',
                    name: 'John Doe',
                    phoneNumber: '+1234567890',
                    address: '123 Main St, City',
                    isActive: true,
                    isBlocked: false,
                    isVerified: true,
                    createdAt: '2024-01-15T10:30:00Z'
                },
                {
                    _id: '2',
                    name: 'Jane Smith',
                    phoneNumber: '+1234567891',
                    address: '456 Oak Ave, Town',
                    isActive: true,
                    isBlocked: true,
                    isVerified: false,
                    blockedReason: 'Violation of terms',
                    blockedBy: { name: 'Head Admin' },
                    blockedAt: '2024-01-20T14:20:00Z',
                    createdAt: '2024-01-20T14:20:00Z'
                },
                {
                    _id: '3',
                    name: 'Mike Johnson',
                    phoneNumber: '+1234567892',
                    address: '789 Pine Rd, Village',
                    isActive: true,
                    isBlocked: false,
                    isVerified: false,
                    createdAt: '2024-02-01T09:15:00Z'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleBlockAdmin = async (adminId, isBlocked, reason = '') => {
        try {
            const response = await fetch(`https://api.milkoza.in/api/headadmin/admins/${adminId}/block`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isBlocked, reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to update admin status');
            }

            const data = await response.json();
            toast.success(data.message);
            fetchAdmins();
        } catch (error) {
            console.error('Error updating admin status:', error);
            toast.error('Failed to update admin status');
        }
    };

    const handleVerifyAdmin = async (adminId, isVerified) => {
        try {
            const response = await fetch(`https://api.milkoza.in/api/headadmin/admins/${adminId}/verify`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ isVerified }),
            });

            if (!response.ok) {
                throw new Error('Failed to update admin verification');
            }

            const data = await response.json();
            toast.success(data.message);
            fetchAdmins();
        } catch (error) {
            console.error('Error updating admin verification:', error);
            toast.error('Failed to update admin verification');
        }
    };

    const handleDeleteAdmin = async (adminId) => {
        if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`https://api.milkoza.in/api/headadmin/admins/${adminId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });

            if (!response.ok) {
                throw new Error('Failed to delete admin');
            }

            const data = await response.json();
            toast.success(data.message);
            fetchAdmins();
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('Failed to delete admin');
        }
    };

    const openBlockModal = (admin) => {
        setSelectedAdmin(admin);
        setShowBlockModal(true);
    };

    const openDetailsModal = (admin) => {
        setSelectedAdmin(admin);
        setShowDetailsModal(true);
    };

    const getStatusBadge = (admin) => {
        if (admin.isBlocked) {
            return 'bg-red-100 text-red-800';
        } else if (admin.isVerified) {
            return 'bg-green-100 text-green-800';
        } else {
            return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (admin) => {
        if (admin.isBlocked) {
            return 'Blocked';
        } else if (admin.isVerified) {
            return 'Verified';
        } else {
            return 'Pending';
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
                    <p className="text-gray-600 mt-1">Manage all platform administrators</p>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading admins...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Admins</h1>
                        <p className="text-gray-600 mt-1">Manage all platform administrators</p>
                    </div>
                    <button 
                        onClick={fetchAdmins}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">All Admins ({admins.length})</h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Details</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact & Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documents</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {admins.map((admin) => (
                                <tr key={admin._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                                                {admin.profilePhoto ? (
                                                    <img 
                                                        src={`https://api.milkoza.in/uploads/admin/${admin.profilePhoto}`} 
                                                        alt="Profile" 
                                                        className="h-12 w-12 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center" style={{display: admin.profilePhoto ? 'none' : 'flex'}}>
                                                    <UserGroupIcon className="h-6 w-6 text-purple-600" />
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                                <div className="text-sm text-gray-500">ID: {admin._id.slice(-8)}</div>
                                                {admin.aadhaarNumber && (
                                                    <div className="text-xs text-gray-400">Aadhaar: {admin.aadhaarNumber}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900 flex items-center">
                                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            {admin.phoneNumber}
                                        </div>
                                        {admin.address && (
                                            <div className="text-sm text-gray-500 mt-1 flex items-start">
                                                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    {typeof admin.address === 'string' ? (
                                                        <span>{admin.address}</span>
                                                    ) : (
                                                        <div>
                                                            <div>{admin.address.street}</div>
                                                            <div>{admin.address.area}, {admin.address.city}</div>
                                                            <div>{admin.address.state} - {admin.address.pincode}</div>
                                                            {admin.address.landmark && (
                                                                <div className="text-xs text-gray-400">Near: {admin.address.landmark}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            {admin.profilePhoto && (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <PhotoIcon className="h-3 w-3 mr-1" />
                                                    Photo ✓
                                                </div>
                                            )}
                                            {admin.aadhaarFrontImage && admin.aadhaarBackImage && (
                                                <div className="flex items-center text-xs text-green-600">
                                                    <DocumentIcon className="h-3 w-3 mr-1" />
                                                    Aadhaar ✓
                                                </div>
                                            )}
                                            {admin.aadhaarNumber && (
                                                <div className="flex items-center text-xs text-blue-600">
                                                    <IdentificationIcon className="h-3 w-3 mr-1" />
                                                    Verified ID
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(admin)}`}>
                                            {getStatusText(admin)}
                                        </span>
                                        {admin.isBlocked && admin.blockedReason && (
                                            <div className="text-xs text-red-600 mt-1">
                                                Reason: {admin.blockedReason}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(admin.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button 
                                                onClick={() => openDetailsModal(admin)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="View Details"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </button>
                                            
                                            {!admin.isBlocked ? (
                                                <button 
                                                    onClick={() => openBlockModal(admin)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Block Admin"
                                                >
                                                    <ShieldExclamationIcon className="h-4 w-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleBlockAdmin(admin._id, false)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Unblock Admin"
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleVerifyAdmin(admin._id, !admin.isVerified)}
                                                className={`${admin.isVerified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}`}
                                                title={admin.isVerified ? 'Unverify Admin' : 'Verify Admin'}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleDeleteAdmin(admin._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete Admin"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Details Modal */}
            {showDetailsModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Admin Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Basic Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden">
                                            {selectedAdmin.profilePhoto ? (
                                                <img 
                                                    src={`https://api.milkoza.in/uploads/admin/${selectedAdmin.profilePhoto}`} 
                                                    alt="Profile" 
                                                    className="h-16 w-16 rounded-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                            ) : null}
                                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center" style={{display: selectedAdmin.profilePhoto ? 'none' : 'flex'}}>
                                                <UserGroupIcon className="h-8 w-8 text-purple-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-medium text-gray-900">{selectedAdmin.name}</div>
                                            <div className="text-sm text-gray-500">ID: {selectedAdmin._id}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center">
                                            <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm text-gray-900">{selectedAdmin.phoneNumber}</span>
                                        </div>
                                        {selectedAdmin.aadhaarNumber && (
                                            <div className="flex items-center">
                                                <IdentificationIcon className="h-4 w-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-900">{selectedAdmin.aadhaarNumber}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            {selectedAdmin.address && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Address Information
                                    </h4>
                                    {typeof selectedAdmin.address === 'string' ? (
                                        <p className="text-sm text-gray-700">{selectedAdmin.address}</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">Street Address</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.street}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">Area/Locality</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.area}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">City</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.city}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">State</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.state}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-700 mb-1">Pincode</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.pincode}</div>
                                            </div>
                                            {selectedAdmin.address.landmark && (
                                                <div>
                                                    <div className="text-sm font-medium text-gray-700 mb-1">Landmark</div>
                                                    <div className="text-sm text-gray-600">{selectedAdmin.address.landmark}</div>
                                                </div>
                                            )}
                                            <div className="md:col-span-2">
                                                <div className="text-sm font-medium text-gray-700 mb-1">Complete Address</div>
                                                <div className="text-sm text-gray-600">{selectedAdmin.address.fullAddress}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Document Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Documents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {selectedAdmin.profilePhoto && (
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Profile Photo</div>
                                            <img 
                                                src={`https://api.milkoza.in/uploads/admin/${selectedAdmin.profilePhoto}`} 
                                                alt="Profile" 
                                                className="h-24 w-24 rounded-lg object-cover mx-auto border border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center mx-auto border border-gray-200" style={{display: 'none'}}>
                                                <PhotoIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                    {selectedAdmin.aadhaarFrontImage && (
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Aadhaar Front</div>
                                            <img 
                                                src={`https://api.milkoza.in/uploads/admin/${selectedAdmin.aadhaarFrontImage}`} 
                                                alt="Aadhaar Front" 
                                                className="h-24 w-24 rounded-lg object-cover mx-auto border border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center mx-auto border border-gray-200" style={{display: 'none'}}>
                                                <DocumentIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                    {selectedAdmin.aadhaarBackImage && (
                                        <div className="text-center">
                                            <div className="text-sm font-medium text-gray-700 mb-2">Aadhaar Back</div>
                                            <img 
                                                src={`https://api.milkoza.in/uploads/admin/${selectedAdmin.aadhaarBackImage}`} 
                                                alt="Aadhaar Back" 
                                                className="h-24 w-24 rounded-lg object-cover mx-auto border border-gray-200"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center mx-auto border border-gray-200" style={{display: 'none'}}>
                                                <DocumentIcon className="h-8 w-8 text-gray-400" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Status Information</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Verification Status</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedAdmin)}`}>
                                            {getStatusText(selectedAdmin)}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Account Status</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedAdmin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {selectedAdmin.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Registration Date</div>
                                        <div className="text-sm text-gray-600">{new Date(selectedAdmin.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                {selectedAdmin.isBlocked && selectedAdmin.blockedReason && (
                                    <div className="mt-4">
                                        <div className="text-sm font-medium text-gray-700 mb-1">Block Reason</div>
                                        <div className="text-sm text-red-600">{selectedAdmin.blockedReason}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Block Admin Modal */}
            {showBlockModal && selectedAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Block Admin</h3>
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Are you sure you want to block <strong>{selectedAdmin.name}</strong>?
                            </p>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for blocking:
                            </label>
                            <textarea
                                value={blockReason}
                                onChange={(e) => setBlockReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                rows="3"
                                placeholder="Enter reason for blocking this admin..."
                            />
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    handleBlockAdmin(selectedAdmin._id, true, blockReason);
                                    setShowBlockModal(false);
                                    setBlockReason('');
                                }}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Block Admin
                            </button>
                            <button
                                onClick={() => {
                                    setShowBlockModal(false);
                                    setBlockReason('');
                                }}
                                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageAdmins;
