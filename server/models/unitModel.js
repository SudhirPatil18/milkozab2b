import mongoose from 'mongoose';

const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Unit name is required'],
        trim: true,
        unique: true,
        maxlength: [20, 'Unit name cannot exceed 20 characters']
    },
    symbol: {
        type: String,
        required: [true, 'Unit symbol is required'],
        trim: true,
        unique: true,
        maxlength: [10, 'Unit symbol cannot exceed 10 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for better performance
unitSchema.index({ name: 1 });
unitSchema.index({ symbol: 1 });
unitSchema.index({ isActive: 1 });

const Unit = mongoose.model('Unit', unitSchema);

export default Unit;
