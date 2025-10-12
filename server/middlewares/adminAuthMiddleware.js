import jwt from 'jsonwebtoken';
import Admin from '../models/adminModel.js';

// Protect admin routes - verify JWT token for admin only
export const adminProtect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Make sure token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                code: 'NO_TOKEN'
            });
        }

        // Validate JWT_SECRET configuration
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured in environment variables');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error - JWT_SECRET not found',
                code: 'CONFIG_ERROR'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get admin from token
            const admin = await Admin.findById(decoded.id);
            
            if (!admin) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is valid but admin no longer exists',
                    code: 'ADMIN_NOT_FOUND'
                });
            }

            // Check if admin is active
            if (!admin.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.',
                    code: 'ACCOUNT_DEACTIVATED'
                });
            }

            // Add admin info to request object
            req.user = {
                id: admin._id,
                name: admin.name,
                phoneNumber: admin.phoneNumber,
                isActive: admin.isActive
            };
            
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token has expired. Please login again.',
                    code: 'TOKEN_EXPIRED'
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.',
                    code: 'INVALID_TOKEN'
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'Token verification failed',
                code: 'TOKEN_VERIFICATION_FAILED'
            });
        }
    } catch (error) {
        console.error('Admin authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            code: 'INTERNAL_ERROR'
        });
    }
};
