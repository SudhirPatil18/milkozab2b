import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Shop user only)
export const createOrder = async (req, res) => {
    try {
        const { items, deliveryAddress, paymentMode, notes } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order items are required'
            });
        }

        if (!deliveryAddress) {
            return res.status(400).json({
                success: false,
                message: 'Delivery address is required'
            });
        }

        if (!paymentMode) {
            return res.status(400).json({
                success: false,
                message: 'Payment mode is required'
            });
        }

        // Validate and calculate totals
        let itemTotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: `Product with ID ${item.productId} not found`
                });
            }

            const itemPrice = product.price * item.quantity;
            itemTotal += itemPrice;

            orderItems.push({
                product: item.productId,
                quantity: item.quantity,
                price: product.price
            });
        }

        const deliveryCharges = 0; // Free delivery
        const totalAmount = itemTotal + deliveryCharges;

        // Generate order number
        const orderCount = await Order.countDocuments();
        const orderNumber = `MILKOZA${String(orderCount + 1).padStart(6, '0')}`;

        // Get admin from the first product
        const firstProduct = await Product.findById(items[0].productId);
        if (!firstProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Create order
        const order = await Order.create({
            orderNumber,
            user: req.user.id,
            admin: firstProduct.createdBy,
            items: orderItems,
            deliveryAddress,
            paymentMode,
            itemTotal,
            deliveryCharges,
            totalAmount,
            notes: notes || ''
        });

        // Populate product details
        const populatedOrder = await Order.findById(order._id)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            })
            .populate('user', 'name email phoneNumber');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: populatedOrder
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating order',
            error: error.message
        });
    }
};

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private (Shop user only)
export const getUserOrders = async (req, res) => {
    try {
        console.log('getUserOrders called for user:', req.user.id);
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        let query = { user: req.user.id };
        if (status) {
            query.orderStatus = status;
        }
        
        console.log('Query for orders:', query);

        const orders = await Order.find(query)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);
        
        console.log('Found orders:', orders.length);
        console.log('Total orders:', totalOrders);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNext: page * limit < totalOrders,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private (Shop user only)
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        })
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            })
            .populate('user', 'name email phoneNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching order',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Shop user only)
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus } = req.body;

        if (!orderStatus) {
            return res.status(400).json({
                success: false,
                message: 'Order status is required'
            });
        }

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { orderStatus },
            { new: true }
        )
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Shop user only)
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (order.orderStatus === 'delivered' || order.orderStatus === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled'
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling order',
            error: error.message
        });
    }
};

// @desc    Get all orders for admin
// @route   GET /api/orders/admin
// @access  Private (Admin only)
export const getAllOrdersAdmin = async (req, res) => {
    try {
        console.log('getAllOrdersAdmin called by admin:', req.user?.id);
        const { 
            page = 1, 
            limit = 10, 
            status, 
            dateRange, 
            customerName
        } = req.query;
        const skip = (page - 1) * limit;

        let query = { admin: req.user.id };
        
        // Status filter
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        
        // Date range filters
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate, endDate;
            
            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                    break;
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 6);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                    break;
            }
            
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = startDate;
                if (endDate) query.createdAt.$lte = endDate;
            }
        }
        
        // Customer name filter
        if (customerName) {
            query['deliveryAddress.fullName'] = { $regex: customerName, $options: 'i' };
        }
        
        console.log('Admin query for orders:', query);

        const orders = await Order.find(query)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            })
            .populate('user', 'name email phoneNumber')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(query);
        
        console.log('Found orders for admin:', orders.length);
        console.log('Total orders:', totalOrders);

        res.status(200).json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalOrders / limit),
                    totalOrders,
                    hasNext: page * limit < totalOrders,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
export const updateOrderStatusAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
            });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order belongs to the admin
        if (order.admin.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You can only update orders for your products'
            });
        }

        order.orderStatus = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// @desc    Generate order receipt PDF
// @route   GET /api/orders/:id/receipt
// @access  Private (Admin only)
export const generateOrderReceipt = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)
            .populate({
                path: 'items.product',
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'unit', select: 'name symbol' }
                ]
            })
            .populate('user', 'name email phoneNumber');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // For now, return a simple text receipt
        // In production, you would use a PDF library like puppeteer or jsPDF
        const receipt = `
MILKOZA B2B - ORDER RECEIPT
============================

Order Number: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleDateString('en-IN')}
Customer: ${order.deliveryAddress?.fullName}
Phone: ${order.deliveryAddress?.mobileNumber}

Items:
${order.items.map(item => 
  `- ${item.product?.name || 'Unknown Product'} x${item.quantity} @ ${item.price} = ${item.price * item.quantity}`
).join('\n')}

Total: ${order.totalAmount}
Payment Mode: ${order.paymentMode}
Status: ${order.orderStatus}

Delivery Address:
${order.deliveryAddress?.flatHouseNo}, ${order.deliveryAddress?.areaStreet}
${order.deliveryAddress?.city}, ${order.deliveryAddress?.state} - ${order.deliveryAddress?.pincode}

Thank you for your business!
        `;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="order-${order.orderNumber}-receipt.txt"`);
        res.send(receipt);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error generating receipt',
            error: error.message
        });
    }
};
