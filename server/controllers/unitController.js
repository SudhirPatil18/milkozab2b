import Unit from '../models/unitModel.js';

// @desc    Get all units
// @route   GET /api/units
// @access  Public
export const getAllUnits = async (req, res) => {
    try {
        const units = await Unit.find({ isActive: true })
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: units.length,
            data: units
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching units',
            error: error.message
        });
    }
};

// @desc    Get all units (Admin view - including inactive)
// @route   GET /api/admin/units
// @access  Private (Admin only)
export const getAllUnitsAdmin = async (req, res) => {
    try {
        const units = await Unit.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: units.length,
            data: units
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching units',
            error: error.message
        });
    }
};

// @desc    Get single unit
// @route   GET /api/units/:id
// @access  Public
export const getUnitById = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        res.status(200).json({
            success: true,
            data: unit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching unit',
            error: error.message
        });
    }
};

// @desc    Create new unit
// @route   POST /api/units
// @access  Private (Admin only)
export const createUnit = async (req, res) => {
    try {
        const { name, symbol } = req.body;

        // Input validation
        if (!name || !symbol) {
            return res.status(400).json({
                success: false,
                message: 'Unit name and symbol are required'
            });
        }

        // Check if unit already exists
        const existingUnit = await Unit.findOne({
            $or: [
                { name: { $regex: new RegExp(`^${name}$`, 'i') } },
                { symbol: { $regex: new RegExp(`^${symbol}$`, 'i') } }
            ]
        });

        if (existingUnit) {
            return res.status(400).json({
                success: false,
                message: 'Unit with this name or symbol already exists'
            });
        }

        const unit = await Unit.create({
            name: name.trim(),
            symbol: symbol.trim()
        });

        res.status(201).json({
            success: true,
            message: 'Unit created successfully',
            data: unit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating unit',
            error: error.message
        });
    }
};

// @desc    Update unit
// @route   PUT /api/units/:id
// @access  Private (Admin only)
export const updateUnit = async (req, res) => {
    try {
        const { name, symbol, isActive } = req.body;

        // Check if unit exists
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        // Check if another unit with same name or symbol exists
        if (name || symbol) {
            const existingUnit = await Unit.findOne({
                _id: { $ne: req.params.id },
                $or: [
                    name ? { name: { $regex: new RegExp(`^${name}$`, 'i') } } : {},
                    symbol ? { symbol: { $regex: new RegExp(`^${symbol}$`, 'i') } } : {}
                ]
            });

            if (existingUnit) {
                return res.status(400).json({
                    success: false,
                    message: 'Another unit with this name or symbol already exists'
                });
            }
        }

        const updatedUnit = await Unit.findByIdAndUpdate(
            req.params.id,
            {
                name: name ? name.trim() : unit.name,
                symbol: symbol ? symbol.trim() : unit.symbol,
                isActive: isActive !== undefined ? isActive : unit.isActive
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Unit updated successfully',
            data: updatedUnit
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating unit',
            error: error.message
        });
    }
};

// @desc    Delete unit
// @route   DELETE /api/units/:id
// @access  Private (Admin only)
export const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        await Unit.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Unit deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting unit',
            error: error.message
        });
    }
};
