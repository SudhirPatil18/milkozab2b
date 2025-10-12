import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Category from '../models/categoryModel.js';
import Admin from '../models/adminModel.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find or create an admin user
    let admin = await Admin.findOne();
    if (!admin) {
      console.log('No admin found. Please create an admin first.');
      process.exit(1);
    }

    // Sample categories
    const categories = [
      {
        name: 'Dairy',
        photo: '/uploads/categories/dairy.jpg',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Bakery',
        photo: '/uploads/categories/bakery.jpg',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Beverages',
        photo: '/uploads/categories/beverages.jpg',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Snacks',
        photo: '/uploads/categories/snacks.jpg',
        isActive: true,
        createdBy: admin._id
      },
      {
        name: 'Fruits',
        photo: '/uploads/categories/fruits.jpg',
        isActive: true,
        createdBy: admin._id
      }
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
