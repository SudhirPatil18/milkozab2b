import mongoose from 'mongoose';
import Unit from '../models/unitModel.js';
import connectDB from '../db/connectiondb.js';

const units = [
    { name: 'Kilogram', symbol: 'kg' },
    { name: 'Gram', symbol: 'g' },
    { name: 'Liter', symbol: 'L' },
    { name: 'Milliliter', symbol: 'ml' },
    { name: 'Piece', symbol: 'pcs' },
    { name: 'Dozen', symbol: 'doz' },
    { name: 'Pound', symbol: 'lb' },
    { name: 'Ounce', symbol: 'oz' },
    { name: 'Gallon', symbol: 'gal' },
    { name: 'Quart', symbol: 'qt' },
    { name: 'Pint', symbol: 'pt' },
    { name: 'Cup', symbol: 'cup' },
    { name: 'Tablespoon', symbol: 'tbsp' },
    { name: 'Teaspoon', symbol: 'tsp' },
    { name: 'Box', symbol: 'box' },
    { name: 'Pack', symbol: 'pack' },
    { name: 'Bottle', symbol: 'bottle' },
    { name: 'Can', symbol: 'can' },
    { name: 'Bag', symbol: 'bag' },
    { name: 'Jar', symbol: 'jar' }
];

const seedUnits = async () => {
    try {
        await connectDB();
        
        // Clear existing units
        await Unit.deleteMany({});
        console.log('Cleared existing units');
        
        // Insert new units
        const createdUnits = await Unit.insertMany(units);
        console.log(`Created ${createdUnits.length} units`);
        
        // List all created units
        createdUnits.forEach(unit => {
            console.log(`- ${unit.name} (${unit.symbol})`);
        });
        
        console.log('Units seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding units:', error);
        process.exit(1);
    }
};

seedUnits();
