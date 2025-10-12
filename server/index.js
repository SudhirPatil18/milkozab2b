import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './db/connectiondb.js';

import categoryRoute from './routes/categoryRoutes.js';
import adminRoute from './routes/adminRoutes.js';
import shopRoute from './routes/shopRoutes.js';
import productRoute from './routes/productRoutes.js';
import unitRoute from './routes/unitRoutes.js';
import cartRoute from './routes/cartRoutes.js';
import orderRoute from './routes/orderRoutes.js';
import addressRoute from './routes/addressRoutes.js';

// ✅ Properly resolve .env path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

console.log("Loaded .env from:", path.join(__dirname, '.env'));
console.log("Mongo URI:", process.env.MONGO_URI); // debug

const app = express();
const PORT = process.env.PORT || 7000;

// Connect MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/categories', categoryRoute);
app.use('/api/admin', adminRoute);
app.use('/api/shop', shopRoute);
app.use('/api/products', productRoute);
app.use('/api/units', unitRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/addresses', addressRoute);

// Test Routes
app.get('/', (req, res) => res.send('API is running'));
app.get('/api/test', (req, res) => res.json({ message: 'Server is working!' }));

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
