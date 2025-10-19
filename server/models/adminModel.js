import mongoose from "mongoose";
import bcrypt from "bcrypt";

const AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    // Detailed address for delivery purposes
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
            minlength: [5, 'Street address must be at least 5 characters long']
        },
        area: {
            type: String,
            required: [true, 'Area/Locality is required'],
            trim: true,
            minlength: [2, 'Area must be at least 2 characters long']
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            minlength: [2, 'City must be at least 2 characters long']
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
            minlength: [2, 'State must be at least 2 characters long']
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            trim: true,
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        },
        landmark: {
            type: String,
            trim: true,
            maxlength: [100, 'Landmark must be less than 100 characters']
        },
        fullAddress: {
            type: String,
            required: [true, 'Full address is required'],
            trim: true,
            minlength: [10, 'Full address must be at least 10 characters long']
        }
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    // Aadhaar card details
    aadhaarNumber: {
        type: String,
        required: [true, 'Aadhaar number is required'],
        unique: true,
        trim: true,
        match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhaar number']
    },
    aadhaarFrontImage: {
        type: String,
        required: [true, 'Aadhaar front image is required']
    },
    aadhaarBackImage: {
        type: String,
        required: [true, 'Aadhaar back image is required']
    },
    // Profile photo
    profilePhoto: {
        type: String,
        required: [true, 'Profile photo is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HeadAdmin',
        default: null
    },
    blockedAt: {
        type: Date,
        default: null
    },
    blockedReason: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Hash password before saving
AdminSchema.pre('save', async function(next) {
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
AdminSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
AdminSchema.methods.toJSON = function() {
    const admin = this.toObject();
    delete admin.password;
    return admin;
};

const Admin = mongoose.model("Admin", AdminSchema);
export default Admin;
