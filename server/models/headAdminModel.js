import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const headAdminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    role: {
        type: String,
        default: 'HeadAdmin',
        enum: ['HeadAdmin', 'SuperAdmin']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    permissions: {
        manageAdmins: { type: Boolean, default: true },
        manageShops: { type: Boolean, default: true },
        manageOrders: { type: Boolean, default: true },
        managePayments: { type: Boolean, default: true },
        viewAnalytics: { type: Boolean, default: true },
        systemSettings: { type: Boolean, default: true }
    }
}, {
    timestamps: true
});

// Hash password before saving
headAdminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
headAdminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
headAdminSchema.methods.toJSON = function() {
    const headAdminObject = this.toObject();
    delete headAdminObject.password;
    return headAdminObject;
};

export default mongoose.model('HeadAdmin', headAdminSchema);
