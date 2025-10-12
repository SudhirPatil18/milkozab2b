import Address from '../models/addressModel.js';

// @desc    Get user's addresses
// @route   GET /api/addresses
// @access  Private (Shop user only)
export const getUserAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ 
            user: req.user.id, 
            isActive: true 
        }).sort({ isDefault: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: addresses
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching addresses',
            error: error.message
        });
    }
};

// @desc    Create new address
// @route   POST /api/addresses
// @access  Private (Shop user only)
export const createAddress = async (req, res) => {
    try {
        const { fullName, mobileNumber, flatHouseNo, areaStreet, city, state, pincode, landmark, isDefault } = req.body;

        // Validate required fields
        if (!fullName || !mobileNumber || !flatHouseNo || !areaStreet || !city || !state || !pincode) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided'
            });
        }

        const address = await Address.create({
            user: req.user.id,
            fullName,
            mobileNumber,
            flatHouseNo,
            areaStreet,
            city,
            state,
            pincode,
            landmark,
            isDefault: isDefault || false
        });

        res.status(201).json({
            success: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating address',
            error: error.message
        });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private (Shop user only)
export const updateAddress = async (req, res) => {
    try {
        const { fullName, mobileNumber, flatHouseNo, areaStreet, city, state, pincode, landmark, isDefault } = req.body;

        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            {
                fullName,
                mobileNumber,
                flatHouseNo,
                areaStreet,
                city,
                state,
                pincode,
                landmark,
                isDefault
            },
            { new: true, runValidators: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating address',
            error: error.message
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private (Shop user only)
export const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isActive: false },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting address',
            error: error.message
        });
    }
};

// @desc    Set default address
// @route   PUT /api/addresses/:id/default
// @access  Private (Shop user only)
export const setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isDefault: true },
            { new: true }
        );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Default address updated successfully',
            data: address
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error setting default address',
            error: error.message
        });
    }
};
