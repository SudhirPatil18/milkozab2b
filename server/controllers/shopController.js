import Shop from "../models/shopModel.js";
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

// @desc    Register shop
// @route   POST /api/shop/register
// @access  Public
export const registerShop = async (req, res) => {
    try {
        const { name, phoneNumber, password, confirmPassword } = req.body;

        // Input validation
        if (!name || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                code: 'MISSING_FIELDS'
            });
        }

        // Trim and validate inputs
        const trimmedName = name.trim();
        const trimmedPhone = phoneNumber.trim();

        if (trimmedName.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Shop name must be at least 2 characters long',
                code: 'INVALID_NAME'
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

        // Check if shop already exists
        const existingShop = await Shop.findOne({ phoneNumber: trimmedPhone });
        if (existingShop) {
            return res.status(409).json({
                success: false,
                message: 'Shop with this phone number already exists',
                code: 'SHOP_EXISTS'
            });
        }

        // Create shop
        const shop = await Shop.create({
            name: trimmedName,
            phoneNumber: trimmedPhone,
            password
        });

        // Generate token
        const token = generateToken(shop._id);

        res.status(201).json({
            success: true,
            message: 'Shop registered successfully',
            data: {
                shop: {
                    id: shop._id,
                    name: shop.name,
                    phoneNumber: shop.phoneNumber,
                    isActive: shop.isActive,
                    isVerified: shop.isVerified,
                    createdAt: shop.createdAt
                },
                token
            }
        });

    } catch (error) {
        console.error('Shop registration error:', error);
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'Shop with this phone number already exists',
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

// @desc    Login shop
// @route   POST /api/shop/login
// @access  Public
export const loginShop = async (req, res) => {
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

        // Find shop by phone number
        const shop = await Shop.findOne({ phoneNumber: trimmedPhone }).select('+password');
        
        if (!shop) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Check if shop is active
        if (!shop.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked by admin. Please contact admin for assistance.',
                code: 'ACCOUNT_BLOCKED'
            });
        }

        // Check password
        const isPasswordValid = await shop.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid phone number or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Update last login
        await shop.updateLastLogin();

        // Generate token
        const token = generateToken(shop._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                shop: {
                    id: shop._id,
                    name: shop.name,
                    phoneNumber: shop.phoneNumber,
                    isActive: shop.isActive,
                    isVerified: shop.isVerified,
                    lastLogin: shop.lastLogin
                },
                token
            }
        });

    } catch (error) {
        console.error('Shop login error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Get shop profile
// @route   GET /api/shop/profile
// @access  Private (Shop only)
export const getShopProfile = async (req, res) => {
    try {
        const shop = await Shop.findById(req.user.id);
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop profile not found',
                code: 'SHOP_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                shop: {
                    id: shop._id,
                    name: shop.name,
                    phoneNumber: shop.phoneNumber,
                    address: shop.address,
                    businessType: shop.businessType,
                    isActive: shop.isActive,
                    isVerified: shop.isVerified,
                    profileImage: shop.profileImage,
                    lastLogin: shop.lastLogin,
                    createdAt: shop.createdAt,
                    updatedAt: shop.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get shop profile error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid shop ID format',
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

// @desc    Update shop profile
// @route   PUT /api/shop/profile
// @access  Private (Shop only)
export const updateShopProfile = async (req, res) => {
    try {
        const { name, address, businessType } = req.body;
        const shopId = req.user.id;

        // Input validation
        if (!name && !address && !businessType) {
            return res.status(400).json({
                success: false,
                message: 'At least one field is required to update',
                code: 'NO_FIELDS_TO_UPDATE'
            });
        }

        const updateData = {};
        
        if (name) {
            const trimmedName = name.trim();
            if (trimmedName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: 'Shop name must be at least 2 characters long',
                    code: 'INVALID_NAME'
                });
            }
            updateData.name = trimmedName;
        }

        if (address) {
            updateData.address = address;
        }

        if (businessType) {
            const validTypes = ['grocery', 'dairy', 'general', 'specialty'];
            if (!validTypes.includes(businessType)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid business type',
                    code: 'INVALID_BUSINESS_TYPE'
                });
            }
            updateData.businessType = businessType;
        }

        const shop = await Shop.findByIdAndUpdate(
            shopId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                shop: {
                    id: shop._id,
                    name: shop.name,
                    phoneNumber: shop.phoneNumber,
                    address: shop.address,
                    businessType: shop.businessType,
                    isActive: shop.isActive,
                    isVerified: shop.isVerified,
                    updatedAt: shop.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Update shop profile error:', error);
        
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

// @desc    Change shop password
// @route   PUT /api/shop/change-password
// @access  Private (Shop only)
export const changeShopPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const shopId = req.user.id;

        // Input validation
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'All password fields are required',
                code: 'MISSING_FIELDS'
            });
        }

        const passwordValidation = validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: passwordValidation.message,
                code: 'INVALID_PASSWORD'
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match',
                code: 'PASSWORD_MISMATCH'
            });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password must be different from current password',
                code: 'SAME_PASSWORD'
            });
        }

        // Get shop with password
        const shop = await Shop.findById(shopId).select('+password');
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: 'Shop not found',
                code: 'SHOP_NOT_FOUND'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await shop.comparePassword(currentPassword);
        
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
                code: 'INVALID_CURRENT_PASSWORD'
            });
        }

        // Update password
        shop.password = newPassword;
        await shop.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change shop password error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password',
            code: 'INTERNAL_ERROR'
        });
    }
};

// @desc    Logout shop
// @route   POST /api/shop/logout
// @access  Private (Shop only)
export const logoutShop = async (req, res) => {
    try {
        // In a more sophisticated setup, you might want to blacklist the token
        // For now, we'll just return a success message
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Shop logout error:', error);
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout',
            code: 'INTERNAL_ERROR'
        });
    }
};
