import Admin from "../models/adminModel.js";
import Shop from "../models/shopModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import Category from "../models/categoryModel.js";
import jwt from "jsonwebtoken";

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Validation helper
const validatePhoneNumber = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phoneNumber);
};

// Validation helper for password strength
const validatePassword = (password) => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (password.length > 128) {
        return { isValid: false, message: 'Password must be less than 128 characters' };
    }
    return { isValid: true };
};

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public
export const registerAdmin = async (req, res) => {
    try {
        const { name, address, phoneNumber, password, confirmPassword } = req.body;

        // Input validation
        if (!name || !address || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Trim and validate inputs
        const trimmedName = name.trim();
        const trimmedAddress = address.trim();
        const trimmedPhone = phoneNumber.trim();

        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Name must be at least 2 characters long',
                code: 'INVALID_NAME'
            });
        }

        if (trimmedAddress.length < 5) {
            return res.status(400).json({
                success: false,
                message: 'Address must be at least 5 characters long',
                code: 'INVALID_ADDRESS'
            });
        }

        if (!validatePhoneNumber(trimmedPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number',
                code: 'INVALID_PHONE'
            });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message,
                code: 'INVALID_PASSWORD'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
                code: 'PASSWORD_MISMATCH'
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ phoneNumber: trimmedPhone });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this phone number already exists',
                code: 'ADMIN_EXISTS'
            });
        }

        // Create admin
        const admin = await Admin.create({
            name: trimmedName,
            address: trimmedAddress,
            phoneNumber: trimmedPhone,
            password
        });

        // Generate token
        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    address: admin.address,
                    phoneNumber: admin.phoneNumber,
                    isActive: admin.isActive,
                    createdAt: admin.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this phone number already exists',
                code: 'DUPLICATE_PHONE'
            });
        }

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
                code: 'VALIDATION_ERROR'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        // Input validation
        if (!phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and password are required',
                code: 'MISSING_CREDENTIALS'
            });
        }

        const trimmedPhone = phoneNumber.trim();

        if (!validatePhoneNumber(trimmedPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid 10-digit phone number',
                code: 'INVALID_PHONE'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
                code: 'INVALID_PASSWORD'
            });
        }

        // Find admin by phone number
        const admin = await Admin.findOne({ phoneNumber: trimmedPhone }).select('+password');
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
                code: 'INVALID_CREDENTIALS'
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

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Generate token
        const token = generateToken(admin._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    address: admin.address,
                    phoneNumber: admin.phoneNumber,
                    isActive: admin.isActive,
                    lastLogin: new Date()
                },
                token
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin only)
export const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin profile not found',
                code: 'ADMIN_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    address: admin.address,
                    phoneNumber: admin.phoneNumber,
                    isActive: admin.isActive,
                    createdAt: admin.createdAt,
                    updatedAt: admin.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get admin profile error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid admin ID format',
                code: 'INVALID_ID'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin only)
export const updateAdminProfile = async (req, res) => {
    try {
        const { name, address } = req.body;
        const adminId = req.user.id;

        // Input validation
        if (!name && !address) {
            return res.status(400).json({
                success: false,
                message: 'At least one field (name or address) is required to update',
                code: 'NO_FIELDS_TO_UPDATE'
            });
        }

        const updateData = {};
        
        if (name) {
            const trimmedName = name.trim();
            if (trimmedName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be at least 2 characters long',
                    code: 'INVALID_NAME'
                });
            }
            updateData.name = trimmedName;
        }

        if (address) {
            const trimmedAddress = address.trim();
            if (trimmedAddress.length < 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Address must be at least 5 characters long',
                    code: 'INVALID_ADDRESS'
                });
            }
            updateData.address = trimmedAddress;
        }

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found',
                code: 'ADMIN_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    address: admin.address,
                    phoneNumber: admin.phoneNumber,
                    isActive: admin.isActive,
                    updatedAt: admin.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Update admin profile error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
                code: 'VALIDATION_ERROR'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Get all shops
// @route   GET /api/admin/shops
// @access  Private (Admin only)
export const getAllShops = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
        
        // Build query
        let query = {};
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { 'address.state': { $regex: search, $options: 'i' } }
            ];
        }
        
        // Status filter
        if (status === 'active') {
            query.isActive = true;
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }
        
        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get shops with pagination
        const shops = await Shop.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        // Get total count for pagination
        const totalShops = await Shop.countDocuments(query);
        const totalPages = Math.ceil(totalShops / parseInt(limit));
        
        res.status(200).json({
            success: true,
            message: 'Shops retrieved successfully',
            data: {
                shops,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalShops,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1
                }
            }
        });

    } catch (error) {
        console.error('Get all shops error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching shops',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Get shop by ID
// @route   GET /api/admin/shops/:id
// @access  Private (Admin only)
export const getShopById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const shop = await Shop.findById(id).select('-password');
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Shop retrieved successfully',
            data: { shop }
        });

    } catch (error) {
        console.error('Get shop by ID error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format',
                code: 'INVALID_ID'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching shop',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Block/Unblock shop
// @route   PUT /api/admin/shops/:id/block
// @access  Private (Admin only)
export const toggleShopBlock = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value',
                code: 'INVALID_STATUS'
            });
        }
        
        const shop = await Shop.findByIdAndUpdate(
            id,
            { isActive },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Shop ${isActive ? 'unblocked' : 'blocked'} successfully`,
            data: { shop }
        });

    } catch (error) {
        console.error('Toggle shop block error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format',
                code: 'INVALID_ID'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating shop status',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Verify/Unverify shop
// @route   PUT /api/admin/shops/:id/verify
// @access  Private (Admin only)
export const toggleShopVerification = async (req, res) => {
    try {
        const { id } = req.params;
        const { isVerified } = req.body;
        
        if (typeof isVerified !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isVerified must be a boolean value',
                code: 'INVALID_STATUS'
            });
        }
        
        const shop = await Shop.findByIdAndUpdate(
            id,
            { isVerified },
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Shop ${isVerified ? 'verified' : 'unverified'} successfully`,
            data: { shop }
        });

    } catch (error) {
        console.error('Toggle shop verification error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format',
                code: 'INVALID_ID'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating shop verification',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Delete shop
// @route   DELETE /api/admin/shops/:id
// @access  Private (Admin only)
export const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        
        const shop = await Shop.findByIdAndDelete(id);
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Shop deleted successfully'
        });

    } catch (error) {
        console.error('Delete shop error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format',
                code: 'INVALID_ID'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while deleting shop',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
export const getDashboardStats = async (req, res) => {
    try {
        // Get counts for all entities
        const [
            totalShops,
            activeShops,
            totalProducts,
            totalOrders,
            totalCategories,
            totalRevenue,
            recentOrders,
            topProducts
        ] = await Promise.all([
            Shop.countDocuments(),
            Shop.countDocuments({ status: 'active' }),
            Product.countDocuments(),
            Order.countDocuments(),
            Category.countDocuments(),
            Order.aggregate([
                { $match: { orderStatus: 'delivered' } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.find()
                .populate('user', 'name')
                .populate('items.product', 'name price')
                .sort({ createdAt: -1 })
                .limit(5),
            Product.find()
                .sort({ sales: -1 })
                .limit(5)
                .select('name price sales')
        ]);

        // Calculate revenue
        const revenue = totalRevenue && totalRevenue.length > 0 ? totalRevenue[0].total : 0;

        // Get order status counts
        const orderStatusCounts = await Order.aggregate([
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate growth percentages (simplified - in real app, compare with previous period)
        const stats = {
            totalShops,
            activeShops,
            totalProducts,
            totalOrders,
            totalCategories,
            totalRevenue: revenue,
            pendingOrders: orderStatusCounts.find(s => s._id === 'pending')?.count || 0,
            completedOrders: orderStatusCounts.find(s => s._id === 'delivered')?.count || 0,
            processingOrders: orderStatusCounts.find(s => s._id === 'preparing')?.count || 0,
            revenueGrowth: Math.random() * 20, // This would be calculated from historical data
            orderGrowth: Math.random() * 15,
            shopGrowth: Math.random() * 25,
            productGrowth: Math.random() * 10
        };

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: {
                stats,
                recentOrders,
                topProducts
            }
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching dashboard statistics',
            code: 'INTERNAL_ERROR'
        });
    }
};
