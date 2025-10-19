import React from 'react';
import { XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

function BlockedAccountModal({ admin, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                        <XCircleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Account Blocked
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-4">
                        Your account has been blocked by HeadAdmin. Please contact HeadAdmin for assistance.
                    </p>

                    {admin?.blockedReason && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                            <div className="flex">
                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                <div className="ml-3">
                                    <h4 className="text-sm font-medium text-yellow-800">Reason:</h4>
                                    <p className="text-sm text-yellow-700 mt-1">{admin.blockedReason}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {admin?.blockedBy && (
                        <div className="text-xs text-gray-500 mb-4">
                            Blocked by: {admin.blockedBy.name || 'HeadAdmin'}
                            {admin.blockedAt && (
                                <span className="block">
                                    On: {new Date(admin.blockedAt).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={onClose}
                            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                        >
                            Close
                        </button>
                        <p className="text-xs text-gray-500">
                            Contact HeadAdmin to resolve this issue
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlockedAccountModal;
