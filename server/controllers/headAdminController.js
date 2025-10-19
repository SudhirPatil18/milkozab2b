import HeadAdmin from '../models/headAdminModel.js';
import Admin from '../models/adminModel.js';
import jwt from 'jsonwebtoken';
import Order from '../models/orderModel.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register HeadAdmin
// @route   POST /api/headadmin/register
// @access  Public
const registerHeadAdmin = async (req, res) => {
    try {
        const { username, password, name, email, phoneNumber } = req.body;

        // Validation
        if (!username || !password || !name || !email || !phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if HeadAdmin already exists
        const existingHeadAdmin = await HeadAdmin.findOne({
            $or: [{ username }, { email }]
        });

        if (existingHeadAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Create new HeadAdmin
        const headAdmin = await HeadAdmin.create({
            username,
            password,
            name,
            email,
            phoneNumber
        });

        if (headAdmin) {
            const token = generateToken(headAdmin._id);
            
            res.status(201).json({
                success: true,
                message: 'HeadAdmin registered successfully',
                token,
                headAdmin: {
                    id: headAdmin._id,
                    username: headAdmin.username,
                    name: headAdmin.name,
                    email: headAdmin.email,
                    phoneNumber: headAdmin.phoneNumber,
                    role: headAdmin.role,
                    permissions: headAdmin.permissions
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid HeadAdmin data'
            });
        }
    } catch (error) {
        console.error('HeadAdmin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login HeadAdmin
// @route   POST /api/headadmin/login
// @access  Public
const loginHeadAdmin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find HeadAdmin by username
        const headAdmin = await HeadAdmin.findOne({ username });

        if (!headAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if HeadAdmin is active
        if (!headAdmin.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Check password
        const isPasswordValid = await headAdmin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        headAdmin.lastLogin = new Date();
        await headAdmin.save();

        // Generate token
        const token = generateToken(headAdmin._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            headAdmin: {
                id: headAdmin._id,
                username: headAdmin.username,
                name: headAdmin.name,
                email: headAdmin.email,
                phoneNumber: headAdmin.phoneNumber,
                role: headAdmin.role,
                permissions: headAdmin.permissions,
                lastLogin: headAdmin.lastLogin
            }
        });
    } catch (error) {
        console.error('HeadAdmin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Logout HeadAdmin
// @route   POST /api/headadmin/logout
// @access  Private
const logoutHeadAdmin = async (req, res) => {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        // For now, we'll just send a success response
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('HeadAdmin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

// @desc    Get HeadAdmin Profile
// @route   GET /api/headadmin/profile
// @access  Private
const getHeadAdminProfile = async (req, res) => {
    try {
        const headAdmin = await HeadAdmin.findById(req.headAdmin.id);

        if (!headAdmin) {
            return res.status(404).json({
                success: false,
                message: 'HeadAdmin not found'
            });
        }

        res.status(200).json({
            success: true,
            headAdmin: {
                id: headAdmin._id,
                username: headAdmin.username,
                name: headAdmin.name,
                email: headAdmin.email,
                phoneNumber: headAdmin.phoneNumber,
                role: headAdmin.role,
                permissions: headAdmin.permissions,
                lastLogin: headAdmin.lastLogin,
                createdAt: headAdmin.createdAt
            }
        });
    } catch (error) {
        console.error('Get HeadAdmin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update HeadAdmin Profile
// @route   PUT /api/headadmin/profile
// @access  Private
const updateHeadAdminProfile = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const headAdminId = req.headAdmin.id;

        // Check if email is already taken by another HeadAdmin
        if (email) {
            const existingHeadAdmin = await HeadAdmin.findOne({
                email,
                _id: { $ne: headAdminId }
            });

            if (existingHeadAdmin) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        const headAdmin = await HeadAdmin.findByIdAndUpdate(
            headAdminId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!headAdmin) {
            return res.status(404).json({
                success: false,
                message: 'HeadAdmin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            headAdmin: {
                id: headAdmin._id,
                username: headAdmin.username,
                name: headAdmin.name,
                email: headAdmin.email,
                phoneNumber: headAdmin.phoneNumber,
                role: headAdmin.role,
                permissions: headAdmin.permissions
            }
        });
    } catch (error) {
        console.error('Update HeadAdmin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get all orders for HeadAdmin
// @route   GET /api/headadmin/orders
// @access  Private
const getHeadAdminOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email phoneNumber')
            .populate('shop', 'name email phoneNumber')
            .populate('items.product', 'name price')
            .sort({ createdAt: -1 });

        // Calculate order statistics
        const totalOrders = orders.length;
        const completedOrders = orders.filter(order => order.status === 'delivered').length;
        const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
        const pendingOrders = orders.filter(order => order.status === 'pending').length;

        res.status(200).json({
            success: true,
            orders,
            statistics: {
                totalOrders,
                completedOrders,
                cancelledOrders,
                pendingOrders
            }
        });
    } catch (error) {
        console.error('Get HeadAdmin orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching orders'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/headadmin/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate('customer', 'name email')
         .populate('shop', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            order
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating order status'
        });
    }
};

// @desc    Get all admins for HeadAdmin
// @route   GET /api/headadmin/admins
// @access  Private
const getHeadAdminAdmins = async (req, res) => {
    try {
        const admins = await Admin.find()
            .select('-password')
            .populate('blockedBy', 'name username')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            admins
        });
    } catch (error) {
        console.error('Get HeadAdmin admins error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching admins'
        });
    }
};

// @desc    Block/Unblock admin
// @route   PUT /api/headadmin/admins/:id/block
// @access  Private
const blockUnblockAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { isBlocked, reason } = req.body;
        const headAdminId = req.headAdmin.id;

        const updateData = {
            isBlocked,
            blockedBy: isBlocked ? headAdminId : null,
            blockedAt: isBlocked ? new Date() : null,
            blockedReason: isBlocked ? reason : null
        };

        const admin = await Admin.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password')
         .populate('blockedBy', 'name username');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Admin ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            admin
        });
    } catch (error) {
        console.error('Block/Unblock admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating admin status'
        });
    }
};

// @desc    Verify admin
// @route   PUT /api/headadmin/admins/:id/verify
// @access  Private
const verifyAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;

        const admin = await Admin.findByIdAndUpdate(
            id,
            { isVerified },
            { new: true, runValidators: true }
        ).select('-password')
         .populate('blockedBy', 'name username');

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Admin ${isVerified ? 'verified' : 'unverified'} successfully`,
            admin
        });
    } catch (error) {
        console.error('Verify admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating admin verification'
        });
    }
};

// @desc    Delete admin
// @route   DELETE /api/headadmin/admins/:id
// @access  Private
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await Admin.findByIdAndDelete(id);

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Admin deleted successfully'
        });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting admin'
        });
    }
};

export {
    registerHeadAdmin,
    loginHeadAdmin,
    logoutHeadAdmin,
    getHeadAdminProfile,
    updateHeadAdminProfile,
    getHeadAdminOrders,
    updateOrderStatus,
    getHeadAdminAdmins,
    blockUnblockAdmin,
    verifyAdmin,
    deleteAdmin
};
