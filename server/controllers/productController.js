import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getAllProducts = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        // Build query
        let query = { isActive: true };
        
        // Filter by category if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find(query)
            .populate('category', 'name photo')
            .populate('unit', 'name symbol')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalProducts = await Product.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name photo')
            .populate('createdBy', 'name email');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
export const createProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, shortDescription, category, quantity, unit } = req.body;
        

        // Input validation
        if (!name || !price || !shortDescription || !category || !quantity || !unit) {
            return res.status(400).json({
                success: false,
                message: 'Product name, price, short description, category, quantity, and unit are required'
            });
        }

        // Validate category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({
                success: false,
                message: 'Selected category does not exist'
            });
        }

        // Validate unit exists
        const Unit = (await import('../models/unitModel.js')).default;
        const unitExists = await Unit.findById(unit);
        if (!unitExists) {
            return res.status(400).json({
                success: false,
                message: 'Selected unit does not exist'
            });
        }

        // Handle file upload
        let photo = '';
        let subimage = '';
        
        // Check for main photo
        if (req.files && req.files.photo && req.files.photo[0]) {
            photo = `/uploads/products/${req.files.photo[0].filename}`;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Product photo is required'
            });
        }

        // Handle subimage upload if provided
        if (req.files && req.files.subimage && req.files.subimage[0]) {
            subimage = `/uploads/products/${req.files.subimage[0].filename}`;
        }

        const product = await Product.create({
            name,
            photo,
            subimage,
            price: parseFloat(price),
            originalPrice: originalPrice ? parseFloat(originalPrice) : null,
            shortDescription,
            quantity: parseFloat(quantity),
            unit,
            category,
            createdBy: req.user.id
        });

        const populatedProduct = await Product.findById(product._id)
            .populate('category', 'name photo')
            .populate('unit', 'name symbol')
            .populate('createdBy', 'name email');

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: populatedProduct
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
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
export const updateProduct = async (req, res) => {
    try {
        const { name, price, originalPrice, shortDescription, category, quantity, unit, isActive } = req.body;

        // Check if product exists
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Validate category if provided
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected category does not exist'
                });
            }
        }

        // Validate unit if provided
        if (unit) {
            const Unit = (await import('../models/unitModel.js')).default;
            const unitExists = await Unit.findById(unit);
            if (!unitExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Selected unit does not exist'
                });
            }
        }

        // Handle file upload
        let photo = product.photo; // Keep existing photo if no new file
        let subimage = product.subimage; // Keep existing subimage if no new file
        
        // Handle main photo update
        if (req.files && req.files.photo && req.files.photo[0]) {
            // Delete old photo if it exists
            if (product.photo && product.photo.startsWith('/uploads/')) {
                const oldPhotoPath = path.join(__dirname, '..', product.photo);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }
            photo = `/uploads/products/${req.files.photo[0].filename}`;
        }

        // Handle subimage upload if provided
        if (req.files && req.files.subimage && req.files.subimage[0]) {
            // Delete old subimage if it exists
            if (product.subimage && product.subimage.startsWith('/uploads/')) {
                const oldSubimagePath = path.join(__dirname, '..', product.subimage);
                if (fs.existsSync(oldSubimagePath)) {
                    fs.unlinkSync(oldSubimagePath);
                }
            }
            subimage = `/uploads/products/${req.files.subimage[0].filename}`;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { 
                name, 
                photo, 
                subimage,
                price: price ? parseFloat(price) : product.price,
                originalPrice: originalPrice ? parseFloat(originalPrice) : product.originalPrice,
                shortDescription, 
                quantity: quantity ? parseFloat(quantity) : product.quantity,
                unit: unit || product.unit,
                category: category || product.category,
                isActive: isActive !== undefined ? isActive : product.isActive
            },
            { new: true, runValidators: true }
        ).populate('category', 'name photo')
         .populate('unit', 'name symbol')
         .populate('createdBy', 'name email');

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
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
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Delete photo file if it exists
        if (product.photo && product.photo.startsWith('/uploads/')) {
            const photoPath = path.join(__dirname, '..', product.photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// @desc    Get all products (Admin view - including inactive)
// @route   GET /api/admin/products
// @access  Private (Admin only)
export const getAllProductsAdmin = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        
        // Build query
        let query = {};
        
        // Filter by category if provided
        if (category && category !== 'all') {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find(query)
            .populate('category', 'name photo')
            .populate('unit', 'name symbol')
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const totalProducts = await Product.countDocuments(query);
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        
        // Validate category exists
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const products = await Product.find({ 
            category: categoryId, 
            isActive: true 
        })
        .populate('category', 'name photo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
        
        const totalProducts = await Product.countDocuments({ 
            category: categoryId, 
            isActive: true 
        });
        
        res.status(200).json({
            success: true,
            count: products.length,
            totalProducts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            category: {
                id: category._id,
                name: category.name,
                photo: category.photo
            },
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category',
            error: error.message
        });
    }
};
