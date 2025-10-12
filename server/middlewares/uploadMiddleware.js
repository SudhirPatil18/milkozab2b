import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Determine upload directory based on the field name and route
        let uploadDir;
        if (req.baseUrl.includes('/products')) {
            uploadDir = path.join(__dirname, '../uploads/products');
        } else if (req.baseUrl.includes('/categories')) {
            uploadDir = path.join(__dirname, '../uploads/categories');
        } else {
            uploadDir = path.join(__dirname, '../uploads');
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let prefix = '';
        if (req.baseUrl.includes('/products')) {
            prefix = file.fieldname === 'subimage' ? 'subimage-' : 'product-';
        } else if (req.baseUrl.includes('/categories')) {
            prefix = 'category-';
        } else {
            prefix = 'upload-';
        }
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Middleware for single file upload
const uploadSingle = upload.single('photo');

// Middleware for multiple files upload
const uploadMultiple = upload.array('photos', 5);

// Middleware for product files (photo and subimage)
const uploadProductFiles = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'subimage', maxCount: 1 }
]);

export {
    uploadSingle,
    uploadMultiple,
    uploadProductFiles,
    upload
};
