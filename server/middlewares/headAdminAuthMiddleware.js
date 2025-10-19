import jwt from 'jsonwebtoken';
import HeadAdmin from '../models/headAdminModel.js';

const headAdminAuthMiddleware = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get HeadAdmin from token
            const headAdmin = await HeadAdmin.findById(decoded.id);

            if (!headAdmin) {
                return res.status(401).json({
                    success: false,
                    message: 'Token is not valid. HeadAdmin not found.'
                });
            }

            // Check if HeadAdmin is active
            if (!headAdmin.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated.'
                });
            }

            // Add HeadAdmin info to request object
            req.headAdmin = {
                id: headAdmin._id,
                username: headAdmin.username,
                role: headAdmin.role,
                permissions: headAdmin.permissions
            };

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid.'
            });
        }
    } catch (error) {
        console.error('HeadAdmin auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error in authentication'
        });
    }
};

export default headAdminAuthMiddleware;
