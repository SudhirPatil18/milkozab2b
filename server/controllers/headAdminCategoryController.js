import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all categories (HeadAdmin view - including inactive)
// @route   GET /api/headadmin/categories
// @access  Private (HeadAdmin only)
const getAllCategoriesAdmin = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Create new category (HeadAdmin)
// @route   POST /api/headadmin/categories
// @access  Private (HeadAdmin only)
const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if category already exists
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Handle file upload
        let photo = '';
        if (req.file) {
            photo = `/uploads/categories/${req.file.filename}`;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Category image is required'
            });
        }

        const category = await Category.create({
            name,
            photo,
            createdBy: req.headAdmin.id  // Use req.headAdmin.id instead of req.user.id
        });

        const populatedCategory = await Category.findById(category._id)
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: populatedCategory
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
            message: 'Error creating category',
            error: error.message
        });
    }
};

// @desc    Update category (HeadAdmin)
// @route   PUT /api/headadmin/categories/:id
// @access  Private (HeadAdmin only)
const updateCategory = async (req, res) => {
    try {
        const { name, isActive } = req.body;

        // Check if category exists
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if name is being changed and if new name already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Handle file upload
        let photo = category.photo; // Keep existing photo if no new file
        if (req.file) {
            // Delete old photo if it exists
            if (category.photo && category.photo.startsWith('/uploads/')) {
                const oldPhotoPath = path.join(__dirname, '..', category.photo);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
            photo = `/uploads/categories/${req.file.filename}`;
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, photo, isActive },
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
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
            message: 'Error updating category',
            error: error.message
        });
    }
};

// @desc    Delete category (HeadAdmin)
// @route   DELETE /api/headadmin/categories/:id
// @access  Private (HeadAdmin only)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete photo file if it exists
        if (category.photo && category.photo.startsWith('/uploads/')) {
            const photoPath = path.join(__dirname, '..', category.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

export {
    getAllCategoriesAdmin,
    createCategory,
    updateCategory,
    deleteCategory
};
