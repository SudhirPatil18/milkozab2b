import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ShopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Shop name is required'],
        trim: true,
        minlength: [2, 'Shop name must be at least 2 characters long'],
        maxlength: [100, 'Shop name must be less than 100 characters']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    address: {
        street: {
            type: String,
            trim: true,
            maxlength: [200, 'Street address must be less than 200 characters']
        },
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'City name must be less than 50 characters']
        },
        state: {
            type: String,
            trim: true,
            maxlength: [50, 'State name must be less than 50 characters']
        },
        pincode: {
            type: String,
            trim: true,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        }
    },
    businessType: {
        type: String,
        enum: ['grocery', 'dairy', 'general', 'specialty'],
        default: 'grocery'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    profileImage: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
ShopSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
ShopSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
ShopSchema.methods.toJSON = function() {
    const shop = this.toObject();
    delete shop.password;
    return shop;
};

// Update last login
ShopSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

const Shop = mongoose.model("Shop", ShopSchema);
export default Shop;
