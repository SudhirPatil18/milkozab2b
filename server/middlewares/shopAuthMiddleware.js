import jwt from 'jsonwebtoken';
import Shop from '../models/shopModel.js';

// Protect shop routes - verify JWT token for shop only
export const shopProtect = async (req, res, next) => {
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
            
            // Get shop from token
            const shop = await Shop.findById(decoded.id);
            
            if (!shop) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is valid but shop no longer exists',
                    code: 'SHOP_NOT_FOUND'
                });
            }

            // Check if shop is active
            if (!shop.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.',
                    code: 'ACCOUNT_DEACTIVATED'
                });
            }

            // Add shop info to request object
            req.user = {
                id: shop._id,
                name: shop.name,
                phoneNumber: shop.phoneNumber,
                isActive: shop.isActive,
                isVerified: shop.isVerified
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
        console.error('Shop authentication middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            code: 'INTERNAL_ERROR'
        });
    }
};

// Optional shop authentication - doesn't fail if no token
export const optionalShopAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token, continue without authentication
        if (!token) {
            req.user = null;
            return next();
        }

        // Validate JWT_SECRET configuration
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured in environment variables');
            req.user = null;
            return next();
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get shop from token
            const shop = await Shop.findById(decoded.id);
            
            if (shop && shop.isActive) {
                req.user = {
                    id: shop._id,
                    name: shop.name,
                    phoneNumber: shop.phoneNumber,
                    isActive: shop.isActive,
                    isVerified: shop.isVerified
                };
            } else {
                req.user = null;
            }
            
            next();
        } catch (jwtError) {
            // If token is invalid, continue without authentication
            req.user = null;
            next();
        }
    } catch (error) {
        console.error('Optional shop authentication middleware error:', error);
        req.user = null;
        next();
    }
};
